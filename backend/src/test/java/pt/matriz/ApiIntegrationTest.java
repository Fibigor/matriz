package pt.matriz;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.http.MediaType;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class ApiIntegrationTest {
    @Container
    static final PostgreSQLContainer<?> DATABASE = new PostgreSQLContainer<>("postgres:17-alpine");

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", DATABASE::getJdbcUrl);
        registry.add("spring.datasource.username", DATABASE::getUsername);
        registry.add("spring.datasource.password", DATABASE::getPassword);
        registry.add("matriz.demo.enabled", () -> true);
    }

    @Autowired MockMvc api;
    @Autowired ObjectMapper json;
    @Autowired JdbcTemplate db;

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
}
