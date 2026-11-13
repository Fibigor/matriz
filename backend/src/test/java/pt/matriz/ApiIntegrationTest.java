package pt.matriz;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
class ApiIntegrationTest {
    @Container
    static final PostgreSQLContainer DATABASE = new PostgreSQLContainer("postgres:17-alpine");

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", DATABASE::getJdbcUrl);
        registry.add("spring.datasource.username", DATABASE::getUsername);
        registry.add("spring.datasource.password", DATABASE::getPassword);
        registry.add("matriz.demo.enabled", () -> true);
    }

    @Autowired MockMvc api;
    @Autowired JsonMapper json;
    @Autowired JdbcTemplate db;
    @org.springframework.boot.test.web.server.LocalServerPort int port;

    MockHttpSession login(String name) throws Exception {
        MvcResult result = api.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(java.util.Map.of(
                                "email", name + "@example.invalid", "password", "Matriz-Demo-2026!"))))
                .andExpect(status().isOk()).andReturn();
        return (MockHttpSession) result.getRequest().getSession(false);
    }

    JsonNode body(MvcResult result) throws Exception { return json.readTree(result.getResponse().getContentAsString()); }

    JsonNode createProject(MockHttpSession session) throws Exception {
        return body(api.perform(post("/api/projects").session(session).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Integration\",\"description\":\"Persisted\"}"))
                .andExpect(status().isCreated()).andReturn());
    }

    @Test
    void jackson3PreservesStrictRequestsUnicodeDatesAndProblemDetails() throws Exception {
        MockHttpSession session = login("ana");
        for (String invalid : new String[]{
                "{\"name\":\"Rejected\",\"ownerId\":\"user-carla\"}",
                "{\"name\":{\"nested\":\"wrong type\"}}", "{\"name\":"}) {
            api.perform(post("/api/projects").session(session).with(csrf())
                            .contentType(MediaType.APPLICATION_JSON).content(invalid))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
                    .andExpect(jsonPath("$.type").value("about:blank"))
                    .andExpect(jsonPath("$.status").value(400))
                    .andExpect(jsonPath("$.detail").value("Formato do pedido inválido."))
                    .andExpect(jsonPath("$.properties").doesNotExist());
        }
        String name = "Á🚀".repeat(60);
        String description = "Descrição 🚀 com espaços  ";
        JsonNode project = body(api.perform(post("/api/projects").session(session).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(java.util.Map.of("name", name, "description", description))))
                .andExpect(status().isCreated()).andReturn());
        assertThat(project.get("name").asText()).isEqualTo(name);
        assertThat(project.get("description").asText()).isEqualTo(description);
        assertThat(project.get("createdAt").isTextual()).isTrue();
        assertThat(java.time.Instant.parse(project.get("createdAt").asText())).isNotNull();
        assertThat(db.queryForObject("SELECT name FROM project WHERE id=?", String.class,
                project.get("id").asText())).isEqualTo(name);
        api.perform(post("/api/projects").session(session).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(java.util.Map.of("name", name + "🚀"))))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.type").value("about:blank"))
                .andExpect(jsonPath("$.errors[0].field").value("name"))
                .andExpect(jsonPath("$.properties").doesNotExist());
        for (var response : new MvcResult[]{
                api.perform(get("/api/projects")).andExpect(status().isUnauthorized()).andReturn(),
                api.perform(post("/api/projects").session(session).contentType(MediaType.APPLICATION_JSON)
                        .content("{}")).andExpect(status().isForbidden()).andReturn()}) {
            assertThat(response.getResponse().getContentType()).isEqualTo("application/problem+json");
            JsonNode problem = json.readTree(response.getResponse().getContentAsByteArray());
            assertThat(problem.get("type").asText()).isEqualTo("about:blank");
            assertThat(problem.get("status").asInt()).isEqualTo(response.getResponse().getStatus());
            assertThat(problem.get("detail").asText()).isEqualTo(response.getResponse().getStatus() == 401
                    ? "É necessário acesso válido."
                    : "Operação recusada. Atualize a sessão e tente novamente.");
            assertThat(problem.has("properties")).isFalse();
        }
    }

    @Test
    void securityProblemWriterPreservesTransportIOException() {
        var failure = new java.io.IOException("Isolated response transport failure");
        var response = new org.springframework.mock.web.MockHttpServletResponse() {
            @Override public jakarta.servlet.ServletOutputStream getOutputStream() {
                return new jakarta.servlet.ServletOutputStream() {
                    @Override public boolean isReady() { return true; }
                    @Override public void setWriteListener(jakarta.servlet.WriteListener listener) { }
                    @Override public void write(int value) throws java.io.IOException { throw failure; }
                };
            }
        };
        assertThatThrownBy(() -> pt.matriz.common.ApiErrors.write(response, json, 401, "Acesso inválido."))
                .isSameAs(failure);
    }

    @Test
    void authenticationCsrfAndLogoutAreEnforced() throws Exception {
        api.perform(get("/api/projects")).andExpect(status().isUnauthorized());
        api.perform(get("/api/auth/login")).andExpect(status().isMethodNotAllowed());
        MockHttpSession session = login("ana");
        api.perform(get("/api/auth/me").session(session)).andExpect(jsonPath("$.id").value("user-ana"));
        assertThat(db.queryForObject("SELECT email FROM app_user WHERE id='user-ana'", String.class))
                .isEqualTo("ana@example.invalid");
        assertThat(db.queryForObject("SELECT password_hash IS NOT NULL FROM app_user WHERE id='user-ana'", Boolean.class)).isTrue();
        api.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"ana@example.invalid\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.detail").value("Email ou palavra-passe incorretos."));
        api.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"unknown@example.invalid\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.detail").value("Email ou palavra-passe incorretos."));
        api.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"ANA@EXAMPLE.INVALID\",\"password\":\"Matriz-Demo-2026!\"}"))
                .andExpect(status().isOk());
        api.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"ana@example.invalid\",\"password\":\"Matriz-Demo-2026!\"}"))
                .andExpect(status().isForbidden());
        for (int attempt = 0; attempt < 5; attempt++) {
            api.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                            .content("{\"email\":\"locked@example.invalid\",\"password\":\"wrong\"}"))
                    .andExpect(status().isUnauthorized());
        }
        api.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"locked@example.invalid\",\"password\":\"wrong\"}"))
                .andExpect(status().isTooManyRequests()).andExpect(header().exists("Retry-After"));
        db.update("UPDATE app_user SET active=false WHERE id='user-ana'");
        try {
            api.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                            .content("{\"email\":\"ana@example.invalid\",\"password\":\"Matriz-Demo-2026!\"}"))
                    .andExpect(status().isUnauthorized());
        } finally {
            db.update("UPDATE app_user SET active=true WHERE id='user-ana'");
        }
        api.perform(post("/api/projects").session(session).contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"No CSRF\"}"))
                .andExpect(status().isForbidden());
        api.perform(post("/api/auth/logout").session(session).with(csrf())).andExpect(status().isNoContent());
        api.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void deniesForeignIdentifiersAndManagerOperationsToMembers() throws Exception {
        MockHttpSession carla = login("carla");
        String base = "/api/projects/proj-alfa/tasks";
        String missing = api.perform(get("/api/projects/not-present/tasks").session(carla))
                .andExpect(status().isNotFound()).andReturn().getResponse().getContentAsString();
        String hidden = api.perform(get(base).session(carla))
                .andExpect(status().isNotFound()).andReturn().getResponse().getContentAsString();
        assertThat(json.readTree(hidden).get("detail")).isEqualTo(json.readTree(missing).get("detail"));
        api.perform(post(base).session(carla).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"Forbidden\"}"))
                .andExpect(status().isNotFound());
        MockHttpSession bruno = login("bruno");
        api.perform(put("/api/projects/proj-alfa").session(bruno).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Changed\",\"version\":1}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void createsAndReadsPersistedTaskAndRejectsInvalidInput() throws Exception {
        MockHttpSession session = login("ana");
        String project = createProject(session).get("id").asText();
        String path = "/api/projects/" + project + "/tasks";
        api.perform(post(path).session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"   \"}"))
                .andExpect(status().isUnprocessableEntity());
        JsonNode task = body(api.perform(post(path).session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"  Persistent task  \",\"priority\":\"HIGH\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.title").value("Persistent task"))
                .andExpect(jsonPath("$.status").value("TODO")).andExpect(jsonPath("$.assignees").isEmpty()).andReturn());
        api.perform(get(path + "/" + task.get("id").asText()).session(login("ana")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.priority").value("HIGH"));
        api.perform(get(path).session(session).param("status", "DONE"))
                .andExpect(jsonPath("$.items").isEmpty()).andExpect(jsonPath("$.pagination.totalItems").value(0))
                .andExpect(jsonPath("$.progress.total").value(1));
        api.perform(post(path).session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Valid\",\"authorId\":\"user-carla\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void taskCreationPersistsAndNonParticipantsCannotReadUpdateOrDeleteIt() throws Exception {
        MockHttpSession ana = login("ana");
        String project = createProject(ana).get("id").asText();
        String tasks = "/api/projects/" + project + "/tasks";

        JsonNode task = body(api.perform(post(tasks).session(ana).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Authorization boundary\",\"priority\":\"HIGH\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("TODO"))
                .andExpect(jsonPath("$.assignees").isEmpty())
                .andReturn());
        String taskPath = tasks + "/" + task.get("id").asText();

        api.perform(get(taskPath).session(login("ana")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Authorization boundary"))
                .andExpect(jsonPath("$.priority").value("HIGH"));

        MockHttpSession carla = login("carla");
        api.perform(get(taskPath).session(carla)).andExpect(status().isNotFound());
        api.perform(put(taskPath).session(carla).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Changed by outsider\",\"description\":\"\",\"status\":\"DONE\",\"priority\":\"LOW\",\"version\":1}"))
                .andExpect(status().isNotFound());
        api.perform(delete(taskPath).session(carla).with(csrf()).param("version", "1"))
                .andExpect(status().isNotFound());

        api.perform(get(taskPath).session(ana))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Authorization boundary"))
                .andExpect(jsonPath("$.status").value("TODO"))
                .andExpect(jsonPath("$.version").value(1));
    }

    @Test
    void validatesLimitsAndSupportsSearchPriorityAndMemberTaskCrud() throws Exception {
        MockHttpSession ana = login("ana"), bruno = login("bruno");
        String project = createProject(ana).get("id").asText();
        String root = "/api/projects/" + project;
        api.perform(put(root).session(ana).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(new pt.matriz.common.ApiModels.ProjectInput("A".repeat(120), "", 1L))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.version").value(2));
        api.perform(get("/api/projects").session(ana).param("search", "a".repeat(120)))
                .andExpect(jsonPath("$.items[0].id").value(project));
        api.perform(put(root).session(ana).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(new pt.matriz.common.ApiModels.ProjectInput("A".repeat(121), "", 2L))))
                .andExpect(status().isUnprocessableEntity());
        api.perform(delete(root).session(ana).with(csrf()))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.status").value(400));
        api.perform(post(root + "/members").session(ana).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"userId\":\"user-bruno\"}")).andExpect(status().isNoContent());
        String tasks = root + "/tasks";
        api.perform(post(tasks).session(ana).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(new pt.matriz.common.ApiModels.CreateTask("T".repeat(201), "", null))))
                .andExpect(status().isUnprocessableEntity());
        api.perform(post(tasks).session(ana).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(new pt.matriz.common.ApiModels.CreateTask("Valid", "D".repeat(2001), null))))
                .andExpect(status().isUnprocessableEntity());
        JsonNode task = body(api.perform(post(tasks).session(bruno).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(new pt.matriz.common.ApiModels.CreateTask("T".repeat(200), "D".repeat(2000), "LOW"))))
                .andExpect(status().isCreated()).andReturn());
        String path = tasks + "/" + task.get("id").asText();
        api.perform(put(path + "/assignments/user-carla").session(ana).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"version\":1}")).andExpect(status().isUnprocessableEntity());
        api.perform(post(path + "/comments").session(bruno).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"   \"}")).andExpect(status().isUnprocessableEntity());
        api.perform(put(path).session(bruno).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Completed\",\"status\":\"DONE\",\"priority\":\"HIGH\",\"version\":1}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.version").value(2));
        api.perform(get(tasks).session(ana).param("priority", "LOW"))
                .andExpect(jsonPath("$.items").isEmpty()).andExpect(jsonPath("$.progress.completedPercent").value(100));
        api.perform(get(tasks).session(ana).param("priority", "HIGH").param("status", "DONE"))
                .andExpect(jsonPath("$.items[0].id").value(task.get("id").asText()));
        api.perform(delete(path).session(bruno).with(csrf()).param("version", "2"))
                .andExpect(status().isNoContent());
        api.perform(delete(root).session(ana).with(csrf()).param("version", "2"))
                .andExpect(status().isNoContent());
    }

    @Test
    void assignmentsCommentsVersionsRevocationAndCascadeWorkTogether() throws Exception {
        MockHttpSession ana = login("ana"), bruno = login("bruno");
        String project = createProject(ana).get("id").asText();
        String projectPath = "/api/projects/" + project;
        api.perform(post(projectPath + "/members").session(ana).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"userId\":\"user-bruno\"}")).andExpect(status().isNoContent());
        JsonNode task = body(api.perform(post(projectPath + "/tasks").session(ana).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"Collaboration\"}")).andReturn());
        String path = projectPath + "/tasks/" + task.get("id").asText();
        api.perform(put(path + "/assignments/user-bruno").session(bruno).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"version\":1}")).andExpect(status().isForbidden());
        api.perform(put(path + "/assignments/user-bruno").session(ana).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"version\":1}")).andExpect(jsonPath("$.version").value(2));
        api.perform(put(path + "/assignments/user-ana").session(ana).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"version\":2}")).andExpect(jsonPath("$.assignees.length()").value(2));
        api.perform(put(path + "/assignments/user-ana").session(ana).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"version\":3}")).andExpect(jsonPath("$.version").value(3))
                .andExpect(jsonPath("$.assignees.length()").value(2));
        api.perform(put(path).session(ana).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Old\",\"status\":\"DONE\",\"priority\":\"LOW\",\"version\":1}"))
                .andExpect(status().isConflict());
        api.perform(post(path + "/comments").session(bruno).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"A comment\"}")).andExpect(status().isCreated())
                .andExpect(jsonPath("$.author.id").value("user-bruno")).andExpect(jsonPath("$.createdAt").isNotEmpty());
        api.perform(get(path + "/comments").session(ana)).andExpect(jsonPath("$.items.length()").value(1));
        api.perform(delete(projectPath + "/members/user-bruno").session(ana).with(csrf())).andExpect(status().isConflict());
        api.perform(delete(path + "/assignments/user-bruno").session(ana).with(csrf()).param("version", "3"))
                .andExpect(jsonPath("$.version").value(4));
        api.perform(delete(projectPath + "/members/user-bruno").session(ana).with(csrf())).andExpect(status().isNoContent());
        api.perform(get(path).session(bruno)).andExpect(status().isNotFound());
        api.perform(delete(projectPath).session(ana).with(csrf()).param("version", "1")).andExpect(status().isNoContent());
        api.perform(get(path).session(ana)).andExpect(status().isNotFound());
    }

    String taskRoot(MockHttpSession session) throws Exception {
        return "/api/projects/" + createProject(session).get("id").asText() + "/tasks";
    }

    JsonNode newTask(String root, MockHttpSession session, String fields) throws Exception {
        return body(api.perform(post(root).session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Task\"" + fields + "}")).andExpect(status().isCreated()).andReturn());
    }

    JsonNode readTask(String path, MockHttpSession session) throws Exception {
        return body(api.perform(get(path).session(session)).andExpect(status().isOk()).andReturn());
    }

    org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder editRequest(
            String path, MockHttpSession session, JsonNode before, String state, String extra) {
        return put(path).session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(
                "{\"title\":" + json.writeValueAsString(before.get("title").asText()) +
                ",\"description\":" + json.writeValueAsString(before.get("description").asText()) +
                ",\"priority\":\"" + before.get("priority").asText() + "\",\"status\":\"" + state +
                "\",\"version\":" + before.get("version").asLong() + extra + "}");
    }

    JsonNode edit(String path, MockHttpSession session, String state, String extra) throws Exception {
        return body(api.perform(editRequest(path, session, readTask(path, session), state, extra))
                .andExpect(status().isOk()).andReturn());
    }

    org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder linkRequest(
            String path, MockHttpSession session, String type, JsonNode task, JsonNode target) {
        return post(path + "/links").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("type", type, "targetTaskId", target.get("id").asText(),
                        "version", task.get("version").asLong(), "targetVersion", target.get("version").asLong())));
    }

    JsonNode link(String path, String otherPath, MockHttpSession session, String type) throws Exception {
        return body(api.perform(linkRequest(path, session, type, readTask(path, session), readTask(otherPath, session)))
                .andExpect(status().isCreated()).andReturn());
    }

    long eventCount(String path, MockHttpSession session) throws Exception {
        return body(api.perform(get(path + "/activity").session(session)).andExpect(status().isOk()).andReturn())
                .get("pagination").get("totalItems").asLong();
    }

    MockMultipartFile file(String name, String mime, byte[] bytes) { return new MockMultipartFile("files", name, mime, bytes); }
    MockMultipartFile textFile(String name) { return file(name, "text/plain", "Texto 🚀".getBytes(StandardCharsets.UTF_8)); }

    org.springframework.test.web.servlet.request.MockMultipartHttpServletRequestBuilder upload(
            String path, MockMultipartFile... files) {
        var request = multipart(path + "/attachments");
        for (var file : files) request.file(file);
        return request;
    }

    List<Integer> race(Callable<Integer> left, Callable<Integer> right) throws Exception {
        CountDownLatch ready = new CountDownLatch(2), start = new CountDownLatch(1);
        try (var pool = Executors.newFixedThreadPool(2)) {
            var a = pool.submit(() -> { ready.countDown(); assertThat(start.await(10, TimeUnit.SECONDS)).isTrue(); return left.call(); });
            var b = pool.submit(() -> { ready.countDown(); assertThat(start.await(10, TimeUnit.SECONDS)).isTrue(); return right.call(); });
            assertThat(ready.await(10, TimeUnit.SECONDS)).isTrue();
            start.countDown();
            return List.of(a.get(30, TimeUnit.SECONDS), b.get(30, TimeUnit.SECONDS));
        }
    }

    @Test
    void extensionsPreserveOmittedFieldsClearExplicitNullAndNeverInventActivity() throws Exception {
        MockHttpSession ana = login("ana");
        String root = taskRoot(ana);
        JsonNode task = newTask(root, ana, ",\"type\":\"BUG\",\"weight\":8");
        String path = root + "/" + task.get("id").asText();
        assertThat(task.get("key").asText()).matches("MAT-[1-9][0-9]*");
        assertThat(task.get("type").asText()).isEqualTo("BUG");
        assertThat(task.get("closeReason").isNull()).isTrue();
        JsonNode same = edit(path, ana, "TODO", "");
        assertThat(same.get("version").asLong()).isEqualTo(2);
        assertThat(same.get("type").asText()).isEqualTo("BUG");
        assertThat(same.get("weight").asInt()).isEqualTo(8);
        assertThat(eventCount(path, ana)).isEqualTo(1);
        api.perform(editRequest(path, ana, same, "TODO", ",\"type\":null")).andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errors[0].field").value("type"));
        JsonNode cleared = edit(path, ana, "TODO", ",\"weight\":null");
        assertThat(cleared.get("weight").isNull()).isTrue();
        assertThat(cleared.get("key")).isEqualTo(task.get("key"));
        api.perform(editRequest(path, ana, task, "TODO", ",\"weight\":5")).andExpect(status().isConflict());
        api.perform(get(path + "/activity").session(ana)).andExpect(status().isOk())
                .andExpect(jsonPath("$.items[1].type").value("TASK_UPDATED"))
                .andExpect(jsonPath("$.items[1].changes[0].field").value("weight"))
                .andExpect(jsonPath("$.items[1].changes[0].oldValue.kind").value("number"))
                .andExpect(jsonPath("$.items[1].changes[0].oldValue.value").value(8))
                .andExpect(jsonPath("$.items[1].changes[0].newValue.value").isEmpty());
        for (int weight : new int[]{1,2,3,5,8,13}) {
            assertThat(edit(path, ana, "TODO", ",\"weight\":" + weight).get("weight").asInt()).isEqualTo(weight);
        }
        for (String invalid : new String[]{",\"weight\":0", ",\"weight\":4", ",\"weight\":-1", ",\"type\":\"EPIC\""}) {
            api.perform(editRequest(path, ana, readTask(path, ana), "TODO", invalid)).andExpect(status().isUnprocessableEntity());
        }
        api.perform(post(root).session(ana).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Float\",\"weight\":1.5}")).andExpect(status().isBadRequest());
        api.perform(post(root).session(ana).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Forged\",\"key\":\"MAT-1\"}")).andExpect(status().isBadRequest());
        JsonNode defaults = newTask(root, ana, "");
        assertThat(defaults.get("type").asText()).isEqualTo("TASK");
        assertThat(defaults.get("weight").isNull()).isTrue();
        assertThat(defaults.get("key")).isNotEqualTo(task.get("key"));
        String unicode = "🚀".repeat(200), description = "🚀".repeat(2000);
        JsonNode unicodeTask = body(api.perform(post(root).session(ana).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("title", unicode, "description", description, "type", "IMPROVEMENT"))))
                .andExpect(status().isCreated()).andReturn());
        assertThat(unicodeTask.get("title").asText()).isEqualTo(unicode);
        assertThat(unicodeTask.get("description").asText()).isEqualTo(description);
    }

    @Test
    void closureReasonsReopeningAndProgressCountEveryDoneReason() throws Exception {
        MockHttpSession ana = login("ana");
        String root = taskRoot(ana);
        List<String> paths = new ArrayList<>();
        for (String reason : new String[]{"COMPLETED","CANCELLED","DUPLICATE","WONT_DO"}) {
            String path = root + "/" + newTask(root, ana, "").get("id").asText();
            paths.add(path);
            JsonNode done = edit(path, ana, "DONE", ",\"closeReason\":\"" + reason + "\"");
            assertThat(done.get("closeReason").asText()).isEqualTo(reason);
            assertThat(edit(path, ana, "DONE", "").get("closeReason").asText()).isEqualTo(reason);
        }
        api.perform(get(root).session(ana).param("pageSize", "1")).andExpect(jsonPath("$.progress.done").value(4))
                .andExpect(jsonPath("$.progress.completedPercent").value(100));
        String path = paths.getFirst();
        api.perform(editRequest(path, ana, readTask(path, ana), "IN_PROGRESS", ",\"closeReason\":\"COMPLETED\""))
                .andExpect(status().isUnprocessableEntity()).andExpect(jsonPath("$.errors[0].field").value("closeReason"));
        assertThat(edit(path, ana, "IN_PROGRESS", "").get("closeReason").isNull()).isTrue();
        JsonNode history = body(api.perform(get(path + "/activity").session(ana)).andReturn());
        assertThat(history.toString()).contains("\"field\":\"closeReason\"", "\"value\":\"COMPLETED\"");
        assertThat(edit(path, ana, "DONE", "").get("closeReason").isNull()).isTrue();
        assertThat(edit(path, ana, "DONE", ",\"closeReason\":null").get("closeReason").isNull()).isTrue();
        api.perform(editRequest(path, ana, readTask(path, ana), "DONE", ",\"closeReason\":\"OTHER\""))
                .andExpect(status().isUnprocessableEntity());
        edit(path, ana, "TODO", "");
        api.perform(get(root).session(ana)).andExpect(jsonPath("$.progress.done").value(3))
                .andExpect(jsonPath("$.progress.completedPercent").value(75));
    }

    @Test
    void linksAreIncidentCanonicalVersionedAndTypedWithoutDuplicateActivity() throws Exception {
        MockHttpSession ana = login("ana"), bruno = login("bruno");
        String root = taskRoot(ana), project = root.substring(0, root.length()-6);
        api.perform(post(project + "/members").session(ana).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"userId\":\"user-bruno\"}")).andExpect(status().isNoContent());
        String a = root + "/" + newTask(root, ana, "").get("id").asText();
        String b = root + "/" + newTask(root, ana, "").get("id").asText();
        JsonNode created = link(a, b, bruno, "RELATED");
        JsonNode relation = created.get("link");
        assertThat(relation.get("sourceTaskId").asText()).isLessThan(relation.get("targetTaskId").asText());
        assertThat(relation.get("sourceTask").get("version").asLong()).isEqualTo(2);
        assertThat(relation.get("createdBy").get("id").asText()).isEqualTo("user-bruno");
        api.perform(linkRequest(b, bruno, "RELATED", readTask(b, bruno), readTask(a, bruno)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.link.id").value(relation.get("id").asText()))
                .andExpect(jsonPath("$.task.version").value(2)).andExpect(jsonPath("$.otherTask.version").value(2));
        assertThat(eventCount(a, ana)).isEqualTo(2);
        link(a, b, ana, "DUPLICATES");
        link(b, a, ana, "DUPLICATES"); // directed duplicates are allowed, even reciprocal
        link(a, b, ana, "BLOCKS"); // types coexist
        api.perform(get(a + "/links").session(ana).param("pageSize", "2"))
                .andExpect(jsonPath("$.pagination.totalItems").value(4)).andExpect(jsonPath("$.items.length()").value(2));
        api.perform(get(b + "/links").session(ana).param("page", "3").param("pageSize", "2"))
                .andExpect(jsonPath("$.items").isEmpty());
        api.perform(get(a + "/links").session(ana).param("pageSize", "101")).andExpect(status().isBadRequest());
        JsonNode before = readTask(a, ana), other = readTask(b, ana);
        api.perform(delete(a + "/links/" + relation.get("id").asText()).session(bruno).with(csrf())
                .param("version", "1").param("targetVersion", other.get("version").asText())).andExpect(status().isConflict());
        api.perform(delete(b + "/links/" + relation.get("id").asText()).session(bruno).with(csrf())
                .param("version", other.get("version").asText()).param("targetVersion", before.get("version").asText()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.task.version").value(other.get("version").asInt()+1))
                .andExpect(jsonPath("$.otherTask.version").value(before.get("version").asInt()+1));
        api.perform(get(a + "/activity").session(ana)).andExpect(jsonPath("$.items[1].relation.otherTaskId").value(
                readTask(b, ana).get("id").asText()));
    }

    @Test
    void linkValidationHidesForeignTasksAndRejectsSelfCyclesAndStaleOtherVersion() throws Exception {
        MockHttpSession ana = login("ana"), carla = login("carla");
        String root = taskRoot(ana);
        String a = root + "/" + newTask(root, ana, "").get("id").asText();
        String b = root + "/" + newTask(root, ana, "").get("id").asText();
        String c = root + "/" + newTask(root, ana, "").get("id").asText();
        for (String type : new String[]{"RELATED","BLOCKS","DUPLICATES"}) api.perform(
                linkRequest(a, ana, type, readTask(a, ana), readTask(a, ana)))
                .andExpect(status().isUnprocessableEntity()).andExpect(jsonPath("$.errors[0].field").value("targetTaskId"));
        api.perform(linkRequest(a, ana, "OTHER", readTask(a, ana), readTask(b, ana))).andExpect(status().isUnprocessableEntity());
        JsonNode oldB = readTask(b, ana);
        edit(b, ana, "TODO", "");
        api.perform(linkRequest(a, ana, "RELATED", readTask(a, ana), oldB)).andExpect(status().isConflict());
        String foreignRoot = taskRoot(carla);
        JsonNode foreign = newTask(foreignRoot, carla, "");
        api.perform(linkRequest(a, ana, "RELATED", readTask(a, ana), foreign)).andExpect(status().isNotFound());
        api.perform(post(a + "/links").session(ana).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"type\":\"RELATED\",\"targetTaskId\":\"missing\",\"version\":1,\"targetVersion\":1}"))
                .andExpect(status().isNotFound());
        api.perform(get(a + "/links").session(carla)).andExpect(status().isNotFound());
        api.perform(linkRequest(a, carla, "RELATED", readTask(a, ana), readTask(b, ana))).andExpect(status().isNotFound());
        link(a, b, ana, "BLOCKS");
        link(b, c, ana, "BLOCKS");
        api.perform(linkRequest(c, ana, "BLOCKS", readTask(c, ana), readTask(a, ana)))
                .andExpect(status().isUnprocessableEntity()).andExpect(jsonPath("$.errors[0].field").value("targetTaskId"));
        api.perform(linkRequest(b, ana, "BLOCKS", readTask(b, ana), readTask(a, ana))).andExpect(status().isUnprocessableEntity());
        assertThat(eventCount(a, ana)).isEqualTo(2);
    }

    @Test
    void allDirectBlockersMustFinishAndReopeningAndLinkInsertionMaintainClosureInvariant() throws Exception {
        MockHttpSession ana = login("ana");
        String root = taskRoot(ana);
        String a = root + "/" + newTask(root, ana, "").get("id").asText();
        String b = root + "/" + newTask(root, ana, "").get("id").asText();
        String c = root + "/" + newTask(root, ana, "").get("id").asText();
        link(a, c, ana, "BLOCKS");
        link(b, c, ana, "BLOCKS");
        edit(c, ana, "IN_PROGRESS", ""); // starting and editing blocked work is allowed
        edit(a, ana, "DONE", ",\"closeReason\":\"CANCELLED\"");
        api.perform(editRequest(c, ana, readTask(c, ana), "DONE", "")).andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errors[0].field").value("status"));
        edit(b, ana, "DONE", "");
        edit(c, ana, "DONE", ",\"closeReason\":\"DUPLICATE\"");
        api.perform(editRequest(a, ana, readTask(a, ana), "TODO", "")).andExpect(status().isUnprocessableEntity());
        edit(a, ana, "DONE", ""); // editing a closed blocker is allowed
        String d = root + "/" + newTask(root, ana, "").get("id").asText();
        api.perform(linkRequest(d, ana, "BLOCKS", readTask(d, ana), readTask(c, ana)))
                .andExpect(status().isUnprocessableEntity()).andExpect(jsonPath("$.errors[0].field").value("targetTaskId"));
        link(d, c, ana, "RELATED"); // non-blocking types do not restrict closure
        edit(c, ana, "TODO", "");
        edit(a, ana, "TODO", "");
        JsonNode incident = body(api.perform(get(c + "/links").session(ana)).andReturn()).get("items");
        JsonNode block = null;
        for (JsonNode item : incident) if (item.get("sourceTaskId").asText().equals(readTask(a, ana).get("id").asText())) block = item;
        assertThat(block).isNotNull();
        api.perform(delete(c + "/links/" + block.get("id").asText()).session(ana).with(csrf())
                .param("version", readTask(c, ana).get("version").asText()).param("targetVersion", readTask(a, ana).get("version").asText()))
                .andExpect(status().isOk());
        edit(c, ana, "DONE", ""); // remaining blocker B is DONE
        api.perform(get(root).session(ana).param("status", "TODO")).andExpect(jsonPath("$.progress.done").value(2));
    }

    @Test
    void concurrentReverseLinksCannotCreateCyclesAndStaleDuplicateCannotBypassVersions() throws Exception {
        MockHttpSession ana = login("ana");
        String root = taskRoot(ana);
        JsonNode a = newTask(root, ana, ""), b = newTask(root, ana, "");
        String ap = root + "/" + a.get("id").asText(), bp = root + "/" + b.get("id").asText();
        List<Integer> results = race(
                () -> api.perform(linkRequest(ap, ana, "BLOCKS", a, b)).andReturn().getResponse().getStatus(),
                () -> api.perform(linkRequest(bp, ana, "BLOCKS", b, a)).andReturn().getResponse().getStatus());
        assertThat(results).containsExactlyInAnyOrder(201, 409);
        String source = results.getFirst() == 201 ? ap : bp, target = source.equals(ap) ? bp : ap;
        api.perform(linkRequest(target, ana, "BLOCKS", readTask(target, ana), readTask(source, ana)))
                .andExpect(status().isUnprocessableEntity());
        api.perform(linkRequest(ap, ana, "BLOCKS", a, b)).andExpect(status().isConflict());
        api.perform(linkRequest(source, ana, "BLOCKS", readTask(source, ana), readTask(target, ana)))
                .andExpect(status().isOk());
        assertThat(eventCount(ap, ana)).isEqualTo(2);
        assertThat(eventCount(bp, ana)).isEqualTo(2);
    }

    @Test
    void concurrentClosureAndReopeningNeverLeaveDoneDependentWithOpenBlocker() throws Exception {
        MockHttpSession ana = login("ana");
        String root = taskRoot(ana);
        String a = root + "/" + newTask(root, ana, "").get("id").asText();
        String b = root + "/" + newTask(root, ana, "").get("id").asText();
        edit(a, ana, "DONE", "");
        link(a, b, ana, "BLOCKS");
        JsonNode beforeA = readTask(a, ana), beforeB = readTask(b, ana);
        List<Integer> results = race(
                () -> api.perform(editRequest(a, ana, beforeA, "TODO", "")).andReturn().getResponse().getStatus(),
                () -> api.perform(editRequest(b, ana, beforeB, "DONE", "")).andReturn().getResponse().getStatus());
        assertThat(results).containsExactlyInAnyOrder(200, 422);
        JsonNode afterA = readTask(a, ana), afterB = readTask(b, ana);
        assertThat(!"DONE".equals(afterB.get("status").asText()) || "DONE".equals(afterA.get("status").asText())).isTrue();
    }

    @Test
    void attachmentMetadataDownloadsPermissionsAndRevocationAreServerControlled() throws Exception {
        MockHttpSession ana = login("ana"), bruno = login("bruno"), carla = login("carla");
        String root = taskRoot(ana), project = root.substring(0, root.length()-6);
        for (String user : List.of("user-bruno", "user-carla")) {
            api.perform(post(project + "/members").session(ana).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                    .content(json.writeValueAsString(Map.of("userId", user)))).andExpect(status().isNoContent());
        }
        String path = root + "/" + newTask(root, ana, "").get("id").asText();
        byte[] bytes = "Olá 🚀\n".getBytes(StandardCharsets.UTF_8);
        JsonNode uploaded = body(api.perform(upload(path, file("C:\\fakepath\\../nota\r\n🚀.txt", "text/plain", bytes))
                .session(bruno).with(csrf())).andExpect(status().isCreated())
                .andExpect(jsonPath("$.items[0].filename").value("nota🚀.txt"))
                .andExpect(jsonPath("$.items[0].canDelete").value(true)).andReturn()).get("items").get(0);
        String download = path + "/attachments/" + uploaded.get("id").asText();
        assertThat(uploaded.get("author").get("id").asText()).isEqualTo("user-bruno");
        assertThat(uploaded.get("commentId").isNull()).isTrue();
        assertThat(uploaded.has("data")).isFalse();
        assertThat(uploaded.has("bytes")).isFalse();
        api.perform(get(path + "/attachments").session(carla)).andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].canDelete").value(false));
        api.perform(get(download).session(carla)).andExpect(status().isOk()).andExpect(content().bytes(bytes))
                .andExpect(header().string("Content-Type", "text/plain"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.startsWith("attachment;")));
        api.perform(delete(download).session(carla).with(csrf())).andExpect(status().isForbidden());
        api.perform(delete(project + "/members/user-bruno").session(ana).with(csrf())).andExpect(status().isNoContent());
        api.perform(get(download).session(bruno)).andExpect(status().isNotFound());
        api.perform(get(path + "/attachments").session(bruno)).andExpect(status().isNotFound());
        api.perform(upload(path, textFile("revoked.txt")).session(bruno).with(csrf())).andExpect(status().isNotFound());
        api.perform(delete(download).session(bruno).with(csrf())).andExpect(status().isNotFound());
        api.perform(get(download)).andExpect(status().isUnauthorized());
        db.update("UPDATE app_user SET active=false WHERE id='user-carla'");
        try { api.perform(get(download).session(carla)).andExpect(status().isUnauthorized()); }
        finally { db.update("UPDATE app_user SET active=true WHERE id='user-carla'"); }
        api.perform(delete(download).session(ana).with(csrf())).andExpect(status().isNoContent());
        api.perform(get(download).session(ana)).andExpect(status().isNotFound());
        assertThat(readTask(path, ana).get("version").asLong()).isEqualTo(1);
        api.perform(get(path + "/activity").session(ana)).andExpect(jsonPath("$.items[1].type").value("ATTACHMENT_ADDED"))
                .andExpect(jsonPath("$.items[2].type").value("ATTACHMENT_REMOVED"))
                .andExpect(jsonPath("$.items[2].attachment.filename").value("nota🚀.txt"));
        JsonNode historical = body(api.perform(get(path + "/activity").session(ana)).andReturn());
        assertThat(historical.toString()).doesNotContain("Olá", "data", "bytes");
    }

    @Test
    void uploadsValidateWholeBatchesLimitsUnicodeNamesAndIndependentCommentBudgets() throws Exception {
        MockHttpSession ana = login("ana");
        String root = taskRoot(ana), path = root + "/" + newTask(root, ana, "").get("id").asText();
        api.perform(upload(path).session(ana).with(csrf())).andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errors[0].field").value("files"));
        api.perform(upload(path, textFile("no-csrf.txt")).session(ana)).andExpect(status().isForbidden());
        api.perform(post(path + "/attachments").session(ana).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnsupportedMediaType()).andExpect(content().contentTypeCompatibleWith("application/problem+json"));
        api.perform(upload(path, textFile("ok.txt"), file("bad.png", "image/png", "not a png".getBytes(StandardCharsets.UTF_8)))
                .session(ana).with(csrf())).andExpect(status().isUnprocessableEntity());
        api.perform(get(path + "/attachments").session(ana)).andExpect(jsonPath("$.items").isEmpty());
        assertThat(eventCount(path, ana)).isEqualTo(1);
        MockMultipartFile[] six = new MockMultipartFile[6];
        for (int i = 0; i < six.length; i++) six[i] = textFile("n" + i + ".txt");
        api.perform(upload(path, six).session(ana).with(csrf())).andExpect(status().isUnprocessableEntity());
        byte[] max = new byte[4*1024*1024];
        java.util.Arrays.fill(max, (byte)'a');
        JsonNode first = body(api.perform(upload(path, file("🚀".repeat(300) + ".txt", "text/plain", max))
                .session(ana).with(csrf())).andExpect(status().isCreated()).andReturn()).get("items").get(0);
        assertThat(first.get("filename").asText().codePointCount(0, first.get("filename").asText().length())).isEqualTo(255);
        assertThat(first.get("sizeBytes").asInt()).isEqualTo(max.length);
        api.perform(upload(path, file("large.txt", "text/plain", new byte[max.length+1])).session(ana).with(csrf()))
                .andExpect(status().isPayloadTooLarge()).andExpect(jsonPath("$.status").value(413));
        api.perform(upload(path, textFile("a.txt"), textFile("b.txt"), textFile("c.txt"), textFile("d.txt")).session(ana).with(csrf()))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.items.length()").value(4));
        api.perform(upload(path, textFile("full.txt")).session(ana).with(csrf())).andExpect(status().isUnprocessableEntity());
        MockMultipartFile comment = new MockMultipartFile("comment", "", "application/json", "{\"content\":\"Comentário\"}".getBytes(StandardCharsets.UTF_8));
        JsonNode added = body(api.perform(multipart(path + "/comments").file(comment)
                .file(textFile("1.txt")).file(textFile("2.txt")).file(textFile("3.txt")).file(textFile("4.txt")).file(textFile("5.txt"))
                .session(ana).with(csrf())).andExpect(status().isCreated()).andExpect(jsonPath("$.attachments.length()").value(5)).andReturn());
        api.perform(get(path + "/attachments").session(ana)).andExpect(jsonPath("$.items.length()").value(5)); // direct only
        api.perform(get(path + "/comments").session(ana)).andExpect(jsonPath("$.items[0].attachments.length()").value(5));
        String attachmentId = added.get("attachments").get(0).get("id").asText();
        api.perform(get(path + "/attachments/" + attachmentId).session(ana)).andExpect(status().isOk());
        api.perform(delete(path + "/attachments/" + attachmentId).session(ana).with(csrf())).andExpect(status().isNoContent());
        api.perform(get(path + "/comments").session(ana)).andExpect(jsonPath("$.items[0].attachments.length()").value(4));
        api.perform(post(path + "/comments/" + added.get("id").asText() + "/attachments").session(ana).with(csrf()))
                .andExpect(status().isNotFound());
        assertThat(readTask(path, ana).get("version").asLong()).isEqualTo(1);
        JsonNode history = body(api.perform(get(path + "/activity").session(ana).param("pageSize", "100")).andReturn());
        List<JsonNode> commentEvents = new ArrayList<>();
        for (JsonNode event : history.get("items")) if (event.get("type").asText().equals("COMMENT_ADDED")) commentEvents.add(event);
        assertThat(commentEvents).hasSize(1);
        assertThat(commentEvents.getFirst().get("commentId").asText()).isEqualTo(added.get("id").asText());
        assertThat(commentEvents.getFirst().get("attachments").size()).isEqualTo(5);
        assertThat(eventCount(path, ana)).isEqualTo(8); // create + 5 direct uploads + comment + removal
    }

    @Test
    void formatValidationAcceptsCanonicalTypesAndRejectsMimeConfusionAndActiveText() throws Exception {
        MockHttpSession ana = login("ana");
        String root = taskRoot(ana);
        byte[] png = java.util.Base64.getDecoder().decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aL1sAAAAASUVORK5CYII=");
        byte[] gif = java.util.Base64.getDecoder().decode("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
        var image = new java.awt.image.BufferedImage(1,1,java.awt.image.BufferedImage.TYPE_INT_RGB);
        var jpegOutput = new java.io.ByteArrayOutputStream();
        javax.imageio.ImageIO.write(image, "jpeg", jpegOutput);
        byte[] webp = new byte[]{'R','I','F','F',18,0,0,0,'W','E','B','P','V','P','8','L',5,0,0,0,0x2f,0,0,0,0,0};
        List<MockMultipartFile> valid = List.of(file("x.PNG", "image/png", png), file("x.jpeg", "image/jpeg", jpegOutput.toByteArray()),
                file("x.gif", "image/gif", gif), file("x.webp", "image/webp", webp),
                file("x.pdf", "application/pdf", "%PDF-1.7\ncontent\n%%EOF\n".getBytes(StandardCharsets.US_ASCII)),
                file("x.md", "text/markdown; charset=UTF-8", "# Cabeçalho 🚀".getBytes(StandardCharsets.UTF_8)));
        for (MockMultipartFile item : valid) {
            String path = root + "/" + newTask(root, ana, "").get("id").asText();
            api.perform(upload(path, item).session(ana).with(csrf())).andExpect(status().isCreated());
        }
        byte[] invalidWebp = webp.clone(); invalidWebp[4] = 12;
        byte[] invalidChunk = webp.clone(); invalidChunk[16] = 30;
        List<MockMultipartFile> invalid = List.of(
                file("empty.txt", "text/plain", new byte[0]), file("bad.png", "text/plain", png),
                file("bad.txt", "image/png", png), file("bad.svg", "image/svg+xml", "<svg/>".getBytes(StandardCharsets.UTF_8)),
                file("bad.txt", "text/plain", new byte[]{(byte)0xc3, (byte)0x28}),
                file("bad.txt", "text/plain", new byte[]{'a',0,'b'}),
                file("bad.md", "text/markdown", "<svg onload='x'/>".getBytes(StandardCharsets.UTF_8)),
                file("bad.txt", "text/plain", "<!DOCTYPE html><h1>active</h1>".getBytes(StandardCharsets.UTF_8)),
                file("bad.txt", "text/plain", "<h1>HTML fragment</h1>".getBytes(StandardCharsets.UTF_8)),
                file("bad.pdf", "application/pdf", "%PDF-1.7\nno trailer".getBytes(StandardCharsets.UTF_8)),
                file("bad.pdf", "application/pdf", "prefix%PDF-1.7\n%%EOF".getBytes(StandardCharsets.UTF_8)),
                file("bad.webp", "image/webp", invalidWebp), file("bad.webp", "image/webp", invalidChunk),
                file("bad.exe", "application/octet-stream", png),
                file("bad.jpg", "image/jpeg", png), file("bad.gif", "image/gif", png));
        String path = root + "/" + newTask(root, ana, "").get("id").asText();
        for (MockMultipartFile item : invalid) api.perform(upload(path, item).session(ana).with(csrf()))
                .andExpect(status().isUnprocessableEntity()).andExpect(jsonPath("$.errors[0].field").value("files"))
                .andExpect(content().contentTypeCompatibleWith("application/problem+json"));
        api.perform(get(path + "/attachments").session(ana)).andExpect(jsonPath("$.items").isEmpty());
        assertThat(eventCount(path, ana)).isEqualTo(1);
    }

    @Test
    void multipartCommentsRequireTextAndRollbackCommentFilesAndHistoryOnAnyFailure() throws Exception {
        MockHttpSession ana = login("ana");
        String root = taskRoot(ana), path = root + "/" + newTask(root, ana, "").get("id").asText();
        api.perform(multipart(path + "/comments").file(textFile("alone.txt")).session(ana).with(csrf()))
                .andExpect(status().isBadRequest());
        for (String content : List.of("", " ", "🚀".repeat(2001))) {
            api.perform(multipart(path + "/comments").file(new MockMultipartFile("comment", "", "application/json",
                    json.writeValueAsBytes(Map.of("content", content)))).file(textFile("ok.txt")).session(ana).with(csrf()))
                    .andExpect(status().isUnprocessableEntity()).andExpect(jsonPath("$.errors[0].field").value("content"));
        }
        for (String invalid : List.of("{", "{\"content\":\"Hi\",\"authorId\":\"user-carla\"}")) {
            api.perform(multipart(path + "/comments").file(new MockMultipartFile("comment", "", "application/json",
                    invalid.getBytes(StandardCharsets.UTF_8))).file(textFile("ok.txt")).session(ana).with(csrf()))
                    .andExpect(status().isBadRequest());
        }
        MockMultipartFile part = new MockMultipartFile("comment", "", "application/json", "{\"content\":\"Atomic\"}".getBytes(StandardCharsets.UTF_8));
        api.perform(multipart(path + "/comments").file(part).file(textFile("ok.txt"))
                .file(file("bad.pdf", "application/pdf", "wrong".getBytes(StandardCharsets.UTF_8))).session(ana).with(csrf()))
                .andExpect(status().isUnprocessableEntity());
        var tooMany = multipart(path + "/comments").file(part);
        for (int i = 0; i < 6; i++) tooMany.file(textFile(i + ".txt"));
        api.perform(tooMany.session(ana).with(csrf())).andExpect(status().isUnprocessableEntity());
        api.perform(get(path + "/comments").session(ana)).andExpect(jsonPath("$.pagination.totalItems").value(0));
        assertThat(db.queryForObject("SELECT count(*) FROM task_attachment WHERE task_id=?", Long.class,
                readTask(path, ana).get("id").asText())).isZero();
        assertThat(eventCount(path, ana)).isEqualTo(1);
        api.perform(multipart(path + "/comments").file(new MockMultipartFile("comment", "", "application/json",
                json.writeValueAsBytes(Map.of("content", "🚀".repeat(2000))))).session(ana).with(csrf()))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.attachments").isEmpty());
        api.perform(post(path + "/comments").session(ana).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"JSON still works\"}")).andExpect(status().isCreated()).andExpect(jsonPath("$.attachments").isEmpty());
        assertThat(readTask(path, ana).get("version").asLong()).isEqualTo(1);
        assertThat(eventCount(path, ana)).isEqualTo(3);
    }

    @Test
    void concurrentAttachmentBatchesAtTheLimitCannotOverfillAndFailuresAreAtomic() throws Exception {
        MockHttpSession ana = login("ana");
        String root = taskRoot(ana), path = root + "/" + newTask(root, ana, "").get("id").asText();
        api.perform(upload(path, textFile("1.txt"), textFile("2.txt"), textFile("3.txt"), textFile("4.txt"))
                .session(ana).with(csrf())).andExpect(status().isCreated());
        List<Integer> results = race(
                () -> api.perform(upload(path, textFile("left.txt")).session(ana).with(csrf())).andReturn().getResponse().getStatus(),
                () -> api.perform(upload(path, textFile("right.txt")).session(ana).with(csrf())).andReturn().getResponse().getStatus());
        assertThat(results).containsExactlyInAnyOrder(201,422);
        api.perform(get(path + "/attachments").session(ana)).andExpect(jsonPath("$.items.length()").value(5));
        assertThat(eventCount(path, ana)).isEqualTo(6);
        assertThat(readTask(path, ana).get("version").asInt()).isEqualTo(1);
    }

    @Test
    void activityUsesTypedChangesFlagsServerActorsAndStablePaginationWithoutCopyingText() throws Exception {
        MockHttpSession ana = login("ana"), bruno = login("bruno");
        String root = taskRoot(ana), project = root.substring(0, root.length()-6);
        api.perform(post(project + "/members").session(ana).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"userId\":\"user-bruno\"}")).andExpect(status().isNoContent());
        String path = root + "/" + newTask(root, ana, "").get("id").asText();
        api.perform(put(path).session(bruno).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""
                {"title":"Private new title","description":"Private new description","status":"DONE","priority":"HIGH",
                "type":"IMPROVEMENT","weight":13,"closeReason":"WONT_DO","version":1}
                """)).andExpect(status().isOk());
        api.perform(put(path + "/assignments/user-bruno").session(ana).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"version\":2}")).andExpect(status().isOk());
        api.perform(put(path + "/assignments/user-bruno").session(ana).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"version\":3}")).andExpect(status().isOk()).andExpect(jsonPath("$.version").value(3));
        api.perform(delete(path + "/assignments/user-bruno").session(ana).with(csrf()).param("version", "3"))
                .andExpect(status().isOk());
        api.perform(delete(path + "/assignments/user-bruno").session(ana).with(csrf()).param("version", "4"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.version").value(4));
        JsonNode all = body(api.perform(get(path + "/activity").session(ana).param("pageSize", "100"))
                .andExpect(status().isOk()).andReturn());
        assertThat(all.get("items").size()).isEqualTo(4);
        JsonNode updated = all.get("items").get(1);
        assertThat(updated.get("actor").get("id").asText()).isEqualTo("user-bruno");
        assertThat(updated.get("titleChanged").asBoolean()).isTrue();
        assertThat(updated.get("descriptionChanged").asBoolean()).isTrue();
        assertThat(updated.get("changes").size()).isEqualTo(5);
        assertThat(updated.toString()).contains("\"kind\":\"text\"", "\"kind\":\"number\"");
        JsonNode assigned = all.get("items").get(2).get("changes").get(0);
        assertThat(assigned.get("field").asText()).isEqualTo("assignees");
        assertThat(assigned.get("oldValue").get("kind").asText()).isEqualTo("userIds");
        assertThat(assigned.get("oldValue").get("userIds").isEmpty()).isTrue();
        assertThat(assigned.get("newValue").get("userIds").get(0).asText()).isEqualTo("user-bruno");
        assertThat(all.toString()).doesNotContain("Private new title", "Private new description");
        List<String> order = new ArrayList<>();
        for (int page = 1; page <= 4; page++) {
            JsonNode item = body(api.perform(get(path + "/activity").session(bruno).param("page", String.valueOf(page))
                    .param("pageSize", "1")).andExpect(status().isOk()).andReturn()).get("items").get(0);
            assertThat(item).isEqualTo(all.get("items").get(page-1));
            order.add(item.get("createdAt").asText() + item.get("id").asText());
            assertThat(java.time.Instant.parse(item.get("createdAt").asText())).isBeforeOrEqualTo(java.time.Instant.now());
        }
        assertThat(order).isSorted();
        api.perform(get(path + "/activity").session(ana).param("page", "5").param("pageSize", "1"))
                .andExpect(jsonPath("$.items").isEmpty()).andExpect(jsonPath("$.pagination.totalItems").value(4));
        api.perform(get(path + "/activity").session(ana).param("page", "0")).andExpect(status().isBadRequest());
        api.perform(post(path + "/activity").session(ana).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isMethodNotAllowed());
        api.perform(delete(project + "/members/user-bruno").session(ana).with(csrf())).andExpect(status().isNoContent());
        api.perform(get(path + "/activity").session(bruno)).andExpect(status().isNotFound());
        api.perform(get(path + "/activity").session(ana)).andExpect(jsonPath("$.items[1].actor.id").value("user-bruno"));
    }

    @Test
    void deletingTaskUnblocksSurvivorsRecordsRemovedLinksAndCascadesAllOwnedData() throws Exception {
        MockHttpSession ana = login("ana");
        String root = taskRoot(ana), project = root.substring(0, root.length()-6);
        String a = root + "/" + newTask(root, ana, "").get("id").asText();
        String b = root + "/" + newTask(root, ana, "").get("id").asText();
        JsonNode relation = link(a, b, ana, "BLOCKS").get("link");
        String id = readTask(a, ana).get("id").asText(), otherId = readTask(b, ana).get("id").asText();
        api.perform(upload(a, textFile("direct.txt")).session(ana).with(csrf())).andExpect(status().isCreated());
        api.perform(multipart(a + "/comments").file(new MockMultipartFile("comment", "", "application/json",
                "{\"content\":\"Owned comment\"}".getBytes(StandardCharsets.UTF_8))).file(textFile("comment.txt"))
                .session(ana).with(csrf())).andExpect(status().isCreated());
        long survivorVersion = readTask(b, ana).get("version").asLong();
        api.perform(delete(a).session(ana).with(csrf()).param("version", "1")).andExpect(status().isConflict());
        api.perform(delete(a).session(ana).with(csrf()).param("version", readTask(a, ana).get("version").asText()))
                .andExpect(status().isNoContent());
        assertThat(readTask(b, ana).get("status").asText()).isEqualTo("TODO");
        assertThat(readTask(b, ana).get("version").asLong()).isEqualTo(survivorVersion);
        for (String table : List.of("task_comment", "task_attachment", "task_assignment", "task_activity")) {
            assertThat(db.queryForObject("SELECT count(*) FROM " + table + " WHERE task_id=?", Long.class, id)).isZero();
        }
        api.perform(get(b + "/links").session(ana)).andExpect(jsonPath("$.items").isEmpty());
        api.perform(get(b + "/activity").session(ana))
                .andExpect(jsonPath("$.items[2].type").value("LINK_REMOVED"))
                .andExpect(jsonPath("$.items[2].relation.id").value(relation.get("id").asText()))
                .andExpect(jsonPath("$.items[2].relation.otherTaskId").value(id))
                .andExpect(jsonPath("$.items[2].relation.otherTaskKey").value(relation.get("sourceTask").get("key").asText()));
        edit(b, ana, "DONE", "");
        api.perform(delete(project).session(ana).with(csrf()).param("version", "1")).andExpect(status().isNoContent());
        assertThat(db.queryForObject("SELECT count(*) FROM task_activity WHERE task_id=?", Long.class, otherId)).isZero();
        assertThat(db.queryForObject("SELECT count(*) FROM task_link WHERE project_id=?",
                Long.class, project.substring(project.lastIndexOf('/')+1))).isZero();
    }

    @Test
    void projectDeletionCascadesLinksAttachmentsCommentsAndActivityAndCompositeFkProtectsCommentScope() throws Exception {
        MockHttpSession ana = login("ana");
        String root = taskRoot(ana), project = root.substring(0, root.length()-6);
        String a = root + "/" + newTask(root, ana, "").get("id").asText();
        String b = root + "/" + newTask(root, ana, "").get("id").asText();
        link(a, b, ana, "RELATED");
        JsonNode comment = body(api.perform(multipart(a + "/comments").file(new MockMultipartFile("comment", "", "application/json",
                "{\"content\":\"Owned\"}".getBytes(StandardCharsets.UTF_8))).file(textFile("owned.txt")).session(ana).with(csrf()))
                .andExpect(status().isCreated()).andReturn());
        String attachmentId = comment.get("attachments").get(0).get("id").asText();
        assertThatThrownBy(() -> db.update("UPDATE task_attachment SET task_id=? WHERE id=?",
                readTask(b, ana).get("id").asText(), attachmentId)).isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
        api.perform(delete(project).session(ana).with(csrf()).param("version", "1")).andExpect(status().isNoContent());
        assertThat(db.queryForObject("SELECT count(*) FROM task_attachment WHERE id=?", Long.class, attachmentId)).isZero();
        assertThat(db.queryForObject("SELECT count(*) FROM task_comment WHERE id=?", Long.class, comment.get("id").asText())).isZero();
        api.perform(get(a + "/activity").session(ana)).andExpect(status().isNotFound());
        api.perform(get(a + "/attachments/" + attachmentId).session(ana)).andExpect(status().isNotFound());
    }

    @Test
    void concurrentAddingBlockerAndClosingTargetCannotViolateDoneInvariant() throws Exception {
        MockHttpSession ana = login("ana");
        String root = taskRoot(ana);
        JsonNode a = newTask(root, ana, ""), b = newTask(root, ana, "");
        String ap = root + "/" + a.get("id").asText(), bp = root + "/" + b.get("id").asText();
        List<Integer> results = race(
                () -> api.perform(linkRequest(ap, ana, "BLOCKS", a, b)).andReturn().getResponse().getStatus(),
                () -> api.perform(editRequest(bp, ana, b, "DONE", "")).andReturn().getResponse().getStatus());
        assertThat(results.stream().filter(code -> code == 200 || code == 201).count()).isEqualTo(1);
        assertThat(results.stream().filter(code -> code == 409).count()).isEqualTo(1);
        JsonNode links = body(api.perform(get(bp + "/links").session(ana)).andReturn()).get("items");
        assertThat(!"DONE".equals(readTask(bp, ana).get("status").asText()) || links.isEmpty()).isTrue();
        if (links.isEmpty()) api.perform(linkRequest(ap, ana, "BLOCKS", readTask(ap, ana), readTask(bp, ana)))
                .andExpect(status().isUnprocessableEntity());
        else api.perform(editRequest(bp, ana, readTask(bp, ana), "DONE", "")).andExpect(status().isUnprocessableEntity());
    }

    @Test
    void populatedV3MigrationAssignsDeterministicGlobalKeysWithoutChangingDatesVersionsOrInventingHistory() {
        String schema = "migration_" + java.util.UUID.randomUUID().toString().replace("-", "");
        var source = new org.springframework.jdbc.datasource.DriverManagerDataSource(
                DATABASE.getJdbcUrl() + "&currentSchema=" + schema, DATABASE.getUsername(), DATABASE.getPassword());
        var flyway3 = org.flywaydb.core.Flyway.configure().dataSource(source).schemas(schema).defaultSchema(schema).target("3").load();
        flyway3.migrate();
        JdbcTemplate isolated = new JdbcTemplate(source);
        new org.springframework.transaction.support.TransactionTemplate(
                new org.springframework.jdbc.datasource.DataSourceTransactionManager(source)).executeWithoutResult(tx -> {
            isolated.update("INSERT INTO app_user(id,username,display_name) VALUES ('migration-user','migration-user','Test')");
            for (String project : List.of("p1","p2")) {
                isolated.update("INSERT INTO project(id,name,owner_user_id) VALUES (?,?,'migration-user')", project, project);
                isolated.update("INSERT INTO participation(project_id,user_id) VALUES (?,'migration-user')", project);
            }
            // Deliberately insert out of chronological/ID order, across projects, including tied creation dates.
            isolated.update("""
                    INSERT INTO task(id,project_id,title,status,version,created_at,updated_at) VALUES
                    ('z','p1','Z','DONE',7,'2020-01-02T00:00:00Z','2020-01-03T00:00:00Z'),
                    ('b','p2','B','IN_PROGRESS',5,'2020-01-01T00:00:00Z','2020-01-04T00:00:00Z'),
                    ('a','p1','A','TODO',3,'2020-01-01T00:00:00Z','2020-01-05T00:00:00Z')
                    """);
        });
        var before = isolated.queryForList("SELECT id,project_id,title,status,version,created_at,updated_at FROM task ORDER BY id");
        var flyway4 = org.flywaydb.core.Flyway.configure().dataSource(source).schemas(schema).defaultSchema(schema).load();
        assertThat(flyway4.migrate().migrationsExecuted).isEqualTo(1);
        assertThat(isolated.queryForList("SELECT id,project_id,title,status,version,created_at,updated_at FROM task ORDER BY id")).isEqualTo(before);
        assertThat(isolated.queryForList("SELECT task_key FROM task ORDER BY created_at,id", String.class))
                .containsExactly("MAT-1", "MAT-2", "MAT-3");
        assertThat(isolated.queryForList("SELECT type FROM task", String.class)).containsOnly("TASK");
        assertThat(isolated.queryForObject("SELECT count(*) FROM task WHERE weight IS NOT NULL OR close_reason IS NOT NULL", Long.class)).isZero();
        assertThat(isolated.queryForObject("SELECT count(*) FROM task_activity", Long.class)).isZero();
        isolated.update("INSERT INTO task(id,project_id,title) VALUES ('next','p2','Next')");
        assertThat(isolated.queryForObject("SELECT task_key FROM task WHERE id='next'", String.class)).isEqualTo("MAT-4");
        assertThat(flyway4.migrate().migrationsExecuted).isZero();
        assertThatThrownBy(() -> isolated.update("UPDATE task SET task_key='MAT-1' WHERE id='next'"))
                .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
    }

    @Test
    void realServletMultipartLimitsReturnJsonProblemsAndDoNotPersistOversizedUploads() throws Exception {
        var cookies = new java.net.CookieManager(null, java.net.CookiePolicy.ACCEPT_ALL);
        try (var client = java.net.http.HttpClient.newBuilder().cookieHandler(cookies)
                .connectTimeout(java.time.Duration.ofSeconds(10)).build()) {
            String origin = "http://127.0.0.1:" + port;
            var csrfResponse = client.send(java.net.http.HttpRequest.newBuilder(java.net.URI.create(origin + "/api/auth/csrf"))
                    .GET().build(), java.net.http.HttpResponse.BodyHandlers.ofString());
            assertThat(csrfResponse.statusCode()).isEqualTo(200);
            String token = json.readTree(csrfResponse.body()).get("token").asText();
            var login = client.send(java.net.http.HttpRequest.newBuilder(java.net.URI.create(origin + "/api/auth/login"))
                    .header("Content-Type", "application/json").header("X-CSRF-TOKEN", token)
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(
                            "{\"email\":\"ana@example.invalid\",\"password\":\"Matriz-Demo-2026!\"}")).build(),
                    java.net.http.HttpResponse.BodyHandlers.ofString());
            assertThat(login.statusCode()).isEqualTo(200);
            token = json.readTree(client.send(java.net.http.HttpRequest.newBuilder(java.net.URI.create(origin + "/api/auth/csrf"))
                    .GET().build(), java.net.http.HttpResponse.BodyHandlers.ofString()).body()).get("token").asText();
            MockHttpSession ana = login("ana");
            String root = taskRoot(ana), path = root + "/" + newTask(root, ana, "").get("id").asText();
            // MockMvc does not run the multipart parser. Exercise the real isolated embedded servlet.
            for (int[] shape : List.of(new int[]{1, 4*1024*1024+1}, new int[]{6, 4*1024*1024})) {
                var bytes = new java.io.ByteArrayOutputStream();
                for (int i = 0; i < shape[0]; i++) {
                    bytes.write(("--tasks-boundary\r\nContent-Disposition: form-data; name=\"files\"; filename=\"" + i +
                            ".txt\"\r\nContent-Type: text/plain\r\n\r\n").getBytes(StandardCharsets.US_ASCII));
                    bytes.write(new byte[shape[1]]);
                    bytes.write("\r\n".getBytes(StandardCharsets.US_ASCII));
                }
                bytes.write("--tasks-boundary--\r\n".getBytes(StandardCharsets.US_ASCII));
                var response = client.send(java.net.http.HttpRequest.newBuilder(java.net.URI.create(origin + path + "/attachments"))
                        .timeout(java.time.Duration.ofSeconds(30)).header("X-CSRF-TOKEN", token)
                        .header("Content-Type", "multipart/form-data; boundary=tasks-boundary")
                        .POST(java.net.http.HttpRequest.BodyPublishers.ofByteArray(bytes.toByteArray())).build(),
                        java.net.http.HttpResponse.BodyHandlers.ofString());
                assertThat(response.statusCode()).isEqualTo(413);
                assertThat(response.headers().firstValue("Content-Type").orElse("")).startsWith("application/problem+json");
                assertThat(json.readTree(response.body()).get("type").asText()).isEqualTo("about:blank");
                assertThat(json.readTree(response.body()).get("status").asInt()).isEqualTo(413);
            }
            api.perform(get(path + "/attachments").session(ana)).andExpect(jsonPath("$.items").isEmpty());
            assertThat(eventCount(path, ana)).isEqualTo(1);
        }
    }

    @Test
    void disjointConcurrentEdgesStillCannotCloseALongerCycleUnderTheProjectLock() throws Exception {
        MockHttpSession ana = login("ana");
        String root = taskRoot(ana);
        String a = root + "/" + newTask(root, ana, "").get("id").asText();
        String b = root + "/" + newTask(root, ana, "").get("id").asText();
        String c = root + "/" + newTask(root, ana, "").get("id").asText();
        String d = root + "/" + newTask(root, ana, "").get("id").asText();
        link(b, c, ana, "BLOCKS");
        link(d, a, ana, "BLOCKS");
        JsonNode aa = readTask(a, ana), bb = readTask(b, ana), cc = readTask(c, ana), dd = readTask(d, ana);
        List<Integer> results = race(
                () -> api.perform(linkRequest(a, ana, "BLOCKS", aa, bb)).andReturn().getResponse().getStatus(),
                () -> api.perform(linkRequest(c, ana, "BLOCKS", cc, dd)).andReturn().getResponse().getStatus());
        assertThat(results).containsExactlyInAnyOrder(201,422); // no shared endpoint versions: graph validation must serialize
    }

    @Test
    void databaseFailureRollsBackTaskVersionsBothLinkEndpointsFilesCommentsAndAllHistory() throws Exception {
        MockHttpSession ana = login("ana");
        String root = taskRoot(ana);
        JsonNode a = newTask(root, ana, ""), b = newTask(root, ana, "");
        String path = root + "/" + a.get("id").asText(), other = root + "/" + b.get("id").asText();
        // A real database constraint, not mocked persistence, causes failure at the final activity write.
        db.execute("ALTER TABLE task_activity ADD CONSTRAINT test_activity_failure CHECK (task_id <> '" +
                a.get("id").asText() + "') NOT VALID");
        try {
            api.perform(editRequest(path, ana, a, "DONE", "")).andExpect(status().isServiceUnavailable());
            api.perform(upload(path, textFile("rollback.txt")).session(ana).with(csrf())).andExpect(status().isServiceUnavailable());
            api.perform(multipart(path + "/comments").file(new MockMultipartFile("comment", "", "application/json",
                    "{\"content\":\"Rollback\"}".getBytes(StandardCharsets.UTF_8))).file(textFile("rollback.txt"))
                    .session(ana).with(csrf())).andExpect(status().isServiceUnavailable());
            api.perform(linkRequest(other, ana, "RELATED", b, a)).andExpect(status().isServiceUnavailable());
            assertThat(readTask(path, ana)).isEqualTo(a);
            assertThat(readTask(other, ana)).isEqualTo(b);
            api.perform(get(path + "/attachments").session(ana)).andExpect(jsonPath("$.items").isEmpty());
            api.perform(get(path + "/comments").session(ana)).andExpect(jsonPath("$.items").isEmpty());
            api.perform(get(path + "/links").session(ana)).andExpect(jsonPath("$.items").isEmpty());
            assertThat(eventCount(path, ana)).isEqualTo(1);
            assertThat(eventCount(other, ana)).isEqualTo(1);
        } finally {
            db.execute("ALTER TABLE task_activity DROP CONSTRAINT test_activity_failure");
        }
    }

    @Test
    void nestedResourcesCannotBeReadOrRemovedThroughUnrelatedTaskPathsAndAuthorCanDelete() throws Exception {
        MockHttpSession ana = login("ana");
        String root = taskRoot(ana);
        String a = root + "/" + newTask(root, ana, "").get("id").asText();
        String b = root + "/" + newTask(root, ana, "").get("id").asText();
        String c = root + "/" + newTask(root, ana, "").get("id").asText();
        JsonNode relation = link(a, b, ana, "RELATED").get("link");
        String linkId = relation.get("id").asText();
        api.perform(delete(c + "/links/" + linkId).session(ana).with(csrf())
                .param("version", readTask(c, ana).get("version").asText()).param("targetVersion", "2"))
                .andExpect(status().isNotFound());
        api.perform(delete(a + "/links/" + linkId).session(ana).with(csrf()).param("version", "2"))
                .andExpect(status().isBadRequest());
        api.perform(post(a + "/links").session(ana).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("type", "RELATED", "targetTaskId", readTask(b, ana).get("id").asText(),
                        "version", 2, "targetVersion", 0)))).andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errors[0].field").value("targetVersion"));
        String attachmentId = body(api.perform(upload(a, textFile("author.txt")).session(ana).with(csrf()))
                .andExpect(status().isCreated()).andReturn()).get("items").get(0).get("id").asText();
        api.perform(get(c + "/attachments/" + attachmentId).session(ana)).andExpect(status().isNotFound());
        api.perform(delete(c + "/attachments/" + attachmentId).session(ana).with(csrf())).andExpect(status().isNotFound());
        api.perform(delete(a + "/attachments/" + attachmentId).session(ana).with(csrf())).andExpect(status().isNoContent());
        api.perform(multipart(a + "/comments").file(new MockMultipartFile("comment", "", "text/plain",
                "{\"content\":\"Wrong media\"}".getBytes(StandardCharsets.UTF_8))).session(ana).with(csrf()))
                .andExpect(status().isUnsupportedMediaType());
        api.perform(editRequest(a, ana, readTask(a, ana), "TODO", ",\"typePresent\":false"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void uploadWaitingForProjectLockRechecksParticipationAfterConcurrentRevocation() throws Exception {
        MockHttpSession ana = login("ana"), bruno = login("bruno");
        String root = taskRoot(ana), project = root.substring(0, root.length()-6);
        String projectId = project.substring(project.lastIndexOf('/')+1);
        api.perform(post(project + "/members").session(ana).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"userId\":\"user-bruno\"}")).andExpect(status().isNoContent());
        String path = root + "/" + newTask(root, ana, "").get("id").asText();
        CountDownLatch locked = new CountDownLatch(1);
        try (var pool = Executors.newFixedThreadPool(2)) {
            var removal = pool.submit(() -> {
                new org.springframework.transaction.support.TransactionTemplate(
                        new org.springframework.jdbc.datasource.DataSourceTransactionManager(db.getDataSource())).executeWithoutResult(tx -> {
                    db.queryForObject("SELECT id FROM project WHERE id=? FOR UPDATE", String.class, projectId);
                    db.update("DELETE FROM participation WHERE project_id=? AND user_id='user-bruno'", projectId);
                    locked.countDown();
                    long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(10);
                    boolean waiting = false;
                    while (System.nanoTime() < deadline) {
                        db.execute("SELECT pg_stat_clear_snapshot()");
                        waiting = Boolean.TRUE.equals(db.queryForObject("""
                                SELECT EXISTS(SELECT 1 FROM pg_stat_activity
                                WHERE datname=current_database() AND wait_event_type='Lock' AND query LIKE '%FOR UPDATE OF p%')
                                """, Boolean.class));
                        if (waiting) break;
                        try { Thread.sleep(20); }
                        catch (InterruptedException error) { Thread.currentThread().interrupt(); throw new IllegalStateException(error); }
                    }
                    assertThat(waiting).as("upload actually waited behind revocation on the existing project lock").isTrue();
                });
                return true;
            });
            assertThat(locked.await(10, TimeUnit.SECONDS)).isTrue();
            var write = pool.submit(() -> api.perform(upload(path, textFile("revoked-race.txt")).session(bruno).with(csrf()))
                    .andReturn().getResponse().getStatus());
            assertThat(removal.get(15, TimeUnit.SECONDS)).isTrue();
            assertThat(write.get(15, TimeUnit.SECONDS)).isEqualTo(404);
        }
        api.perform(get(path + "/attachments").session(ana)).andExpect(jsonPath("$.items").isEmpty());
        assertThat(eventCount(path, ana)).isEqualTo(1);
    }
}
