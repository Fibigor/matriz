package pt.matriz;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.endpoint.Access;
import org.springframework.boot.actuate.endpoint.EndpointAccessResolver;
import org.springframework.boot.actuate.endpoint.EndpointId;
import org.springframework.boot.jdbc.health.DataSourceHealthIndicator;
import org.springframework.boot.actuate.endpoint.web.WebEndpointsSupplier;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.MapPropertySource;
import org.springframework.jdbc.datasource.AbstractDataSource;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        classes = {MatrizApplication.class, ObservabilityIntegrationTest.DatabaseProbeConfiguration.class},
        properties = {"management.endpoints.web.exposure.include=*",
                "logging.level.org.springframework.boot.jdbc.health.DataSourceHealthIndicator=ERROR"})
@ActiveProfiles("observability")
@Testcontainers
class ObservabilityIntegrationTest {
    @Container
    static final PostgreSQLContainer DATABASE = new PostgreSQLContainer("postgres:17-alpine");

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", DATABASE::getJdbcUrl);
        registry.add("spring.datasource.username", DATABASE::getUsername);
        registry.add("spring.datasource.password", DATABASE::getPassword);
        registry.add("matriz.demo.enabled", () -> true);
    }

    @LocalServerPort int appPort;
    @Autowired JsonMapper json;
    @Autowired AtomicBoolean blockProbeConnection;
    @Autowired ConfigurableApplicationContext application;

    HttpClient anonymous() {
        return HttpClient.newBuilder().build();
    }

    HttpResponse<String> get(HttpClient client, int port, String path) throws Exception {
        return client.send(HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path))
                .GET().build(), HttpResponse.BodyHandlers.ofString());
    }

    HttpResponse<String> post(HttpClient client, int port, String path, String body, String token) throws Exception {
        var request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path))
                .header("Content-Type", "application/json");
        if (token != null) request.header("X-CSRF-TOKEN", token);
        return client.send(request.POST(HttpRequest.BodyPublishers.ofString(body)).build(),
                HttpResponse.BodyHandlers.ofString());
    }

    void minimalHealth(String path, int expectedCode, String status) throws Exception {
        var response = get(anonymous(), appPort, path);
        assertThat(response.statusCode()).isEqualTo(expectedCode);
        String groups = path.equals("/actuator/health") ? ",\"groups\":[\"liveness\",\"readiness\"]" : "";
        assertThat(json.readTree(response.body())).isEqualTo(json.readTree("{\"status\":\"" + status + "\"" + groups + "}"));
        assertThat(response.headers().allValues("Set-Cookie")).isEmpty();
    }

    @Test
    void healthIsAnonymousMinimalOnApplicationPortWithoutSession() throws Exception {
        assertThat(application.getEnvironment().getProperty("management.server.port")).isNull();
        assertThat(application.getEnvironment().getProperty("local.management.port", Integer.class)).isEqualTo(appPort);
        assertThat(application.getBean(WebEndpointsSupplier.class).getEndpoints())
                .extracting(endpoint -> endpoint.getEndpointId().toString())
                .containsExactlyInAnyOrder("health", "metrics");
        for (String path : new String[]{"/actuator/health", "/actuator/health/liveness", "/actuator/health/readiness"}) {
            minimalHealth(path, 200, "UP");
        }
        assertThat(get(anonymous(), appPort, "/livez").statusCode()).isIn(401, 403, 404);
        assertThat(get(anonymous(), appPort, "/readyz").statusCode()).isIn(401, 403, 404);
        assertThat(get(anonymous(), appPort, "/api/projects").statusCode()).isEqualTo(401);
    }

    @Test
    void readinessIncludesRealDatabaseProbeButLivenessDoesNot() throws Exception {
        minimalHealth("/actuator/health/readiness", 200, "UP");
        // Only the real JDBC health indicator's acquisition is blocked, not application persistence
        // or another database. This is distinct evidence from stopping a PostgreSQL server.
        blockProbeConnection.set(true);
        try {
            minimalHealth("/actuator/health/readiness", 503, "DOWN");
            minimalHealth("/actuator/health/liveness", 200, "UP");
        } finally {
            blockProbeConnection.set(false);
        }
        minimalHealth("/actuator/health/readiness", 200, "UP");
    }

    @Test
    void metricsRequireRealLocalSessionAndSensitiveEndpointsStayUnavailable() throws Exception {
        var cookies = new CookieManager(null, CookiePolicy.ACCEPT_ALL);
        var client = HttpClient.newBuilder().cookieHandler(cookies).build();
        for (String path : new String[]{"/actuator/metrics", "/actuator/metrics/jvm.memory.used",
                "/actuator/metrics/http.server.requests"}) {
            var response = get(anonymous(), appPort, path);
            assertThat(response.statusCode()).isEqualTo(401);
            assertThat(response.headers().allValues("Set-Cookie")).isEmpty();
        }
        String loginBody = "{\"email\":\"ana@example.invalid\",\"password\":\"Matriz-Demo-2026!\"}";
        assertThat(post(client, appPort, "/api/auth/login", loginBody, null).statusCode()).isEqualTo(403);
        JsonNode csrf = json.readTree(get(client, appPort, "/api/auth/csrf").body());
        assertThat(post(client, appPort, "/api/auth/login", loginBody, csrf.get("token").asText()).statusCode()).isEqualTo(200);
        assertThat(get(client, appPort, "/api/auth/me").statusCode()).isEqualTo(200);
        for (String path : new String[]{"/actuator", "/actuator/env", "/actuator/configprops",
                "/actuator/heapdump", "/actuator/loggers", "/actuator/threaddump", "/actuator/mappings",
                "/actuator/health/db", "/actuator/metrics/system.cpu.usage"}) {
            assertThat(get(client, appPort, path).statusCode()).isEqualTo(403);
        }
        assertThat(post(client, appPort, "/api/projects", "{\"name\":\"No CSRF\"}", null).statusCode()).isEqualTo(403);
        // A real cookie jar, not MockHttpSession/security test authentication.
        assertThat(cookies.get(URI.create("http://127.0.0.1:" + appPort + "/actuator/metrics"),
                Map.of()).containsKey("Cookie")).isTrue();
        var metrics = get(client, appPort, "/actuator/metrics");
        assertThat(metrics.statusCode()).as("Actuator must recognize the existing local authenticated session").isEqualTo(200);
        assertThat(json.readTree(metrics.body()).get("names")).isNotEmpty();
        assertThat(json.readTree(metrics.body()).get("names")).allSatisfy(name ->
                assertThat(name.asText()).matches("jvm\\..*|http\\.server\\.requests"));
        for (String name : new String[]{"jvm.memory.used", "http.server.requests"}) {
            var metric = get(client, appPort, "/actuator/metrics/" + name);
            assertThat(metric.statusCode()).isEqualTo(200);
            assertThat(json.readTree(metric.body()).get("name").asText()).isEqualTo(name);
            assertThat(json.readTree(metric.body()).get("measurements")).isNotEmpty();
        }
        csrf = json.readTree(get(client, appPort, "/api/auth/csrf").body());
        assertThat(post(client, appPort, "/actuator/health", "{}", csrf.get("token").asText())
                .statusCode()).isEqualTo(403);
        assertThat(post(client, appPort, "/actuator/metrics", "{}", csrf.get("token").asText())
                .statusCode()).isEqualTo(403);
        assertThat(post(client, appPort, "/api/auth/logout", "{}", null).statusCode()).isEqualTo(403);
        assertThat(post(client, appPort, "/api/auth/logout", "{}", csrf.get("token").asText())
                .statusCode()).isEqualTo(204);
        assertThat(get(client, appPort, "/actuator/metrics").statusCode()).isEqualTo(401);
    }

    @Test
    void defaultProfileDisablesOperationalEndpointsEvenIfExposureIsBroadened() throws Exception {
        try (ConfigurableApplicationContext context = new SpringApplicationBuilder(MatrizApplication.class)
                .initializers(application -> application.getEnvironment().getPropertySources().addFirst(
                        new MapPropertySource("isolated-test-database", Map.of("spring.datasource.url", DATABASE.getJdbcUrl(),
                        "spring.datasource.username", DATABASE.getUsername(),
                        "spring.datasource.password", DATABASE.getPassword(),
                        "matriz.demo.enabled", "false"))))
                .run("--spring.profiles.active=default", "--server.port=0",
                        "--management.endpoints.web.exposure.include=*")) {
            int port = context.getEnvironment().getProperty("local.server.port", Integer.class);
            assertThat(context.getEnvironment().getProperty("local.management.port", Integer.class)).isEqualTo(port);
            var access = context.getBean(EndpointAccessResolver.class);
            for (String id : new String[]{"health", "metrics", "env", "heapdump"}) {
                assertThat(access.accessFor(EndpointId.of(id), Access.UNRESTRICTED)).isEqualTo(Access.NONE);
                assertThat(get(anonymous(), port, "/actuator/" + id).statusCode()).isIn(401, 403, 404);
            }
            for (String id : new String[]{"hEalth", "mEtrics", "loggers", "shutdown", "custom"}) {
                for (Access fallback : Access.values()) {
                    assertThat(access.accessFor(EndpointId.of(id), fallback)).isEqualTo(Access.NONE);
                }
            }
            // Boot may retain internal health beans; NONE must remove every operational
            // endpoint from the HTTP supplier, not merely hide it behind Spring Security.
            assertThat(context.getBean(WebEndpointsSupplier.class).getEndpoints()).isEmpty();
        }
    }

    @Test
    void observabilityResolverOnlyAllowsHealthAndMetricsRegardlessOfFallbackOrCase() {
        var access = application.getBean(EndpointAccessResolver.class);
        for (Access fallback : Access.values()) {
            for (String id : new String[]{"health", "metrics"}) {
                assertThat(access.accessFor(EndpointId.of(id), fallback)).isEqualTo(Access.READ_ONLY);
            }
            for (String id : new String[]{"hEalth", "mEtrics", "env", "heapdump", "loggers", "shutdown", "custom"}) {
                assertThat(access.accessFor(EndpointId.of(id), fallback)).isEqualTo(Access.NONE);
            }
        }
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class DatabaseProbeConfiguration {
        @Bean AtomicBoolean blockProbeConnection() { return new AtomicBoolean(); }

        @Bean FilterRegistrationBean<jakarta.servlet.Filter> anonymousHealthSessionCheck() {
            var registration = new FilterRegistrationBean<jakarta.servlet.Filter>();
            registration.setFilter((request, response, chain) -> {
                chain.doFilter(request, response);
                var http = (jakarta.servlet.http.HttpServletRequest) request;
                if ("GET".equals(http.getMethod()) && http.getCookies() == null) {
                    assertThat(http.getSession(false)).as("Anonymous health must not create a session").isNull();
                }
            });
            registration.addUrlPatterns("/actuator/health", "/actuator/health/*");
            registration.setOrder(Integer.MIN_VALUE);
            return registration;
        }

        @Bean DataSourceHealthIndicator dbHealthIndicator(DataSource dataSource, AtomicBoolean blockProbeConnection) {
            return new DataSourceHealthIndicator(new AbstractDataSource() {
                @Override public Connection getConnection() throws SQLException {
                    if (blockProbeConnection.get()) throw new SQLException("Isolated health probe connection blocked");
                    return dataSource.getConnection();
                }
                @Override public Connection getConnection(String username, String password) throws SQLException {
                    if (blockProbeConnection.get()) throw new SQLException("Isolated health probe connection blocked");
                    return dataSource.getConnection(username, password);
                }
            });
        }
    }
}
