package pt.matriz.identity;

import tools.jackson.databind.json.JsonMapper;
import java.util.List;
import org.springframework.boot.actuate.endpoint.Access;
import org.springframework.boot.actuate.endpoint.EndpointAccessResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.scrypt.SCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.session.CompositeSessionAuthenticationStrategy;
import org.springframework.security.web.authentication.session.ChangeSessionIdAuthenticationStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.csrf.CsrfAuthenticationStrategy;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.util.matcher.RequestMatcher;
import pt.matriz.common.ApiErrors;

@Configuration
public class SecurityConfig {
    // Fail closed even if endpoint exposure properties are accidentally broadened.
    @Bean EndpointAccessResolver operationalEndpointAccess(Environment environment) {
        return (id, defaultAccess) -> environment.acceptsProfiles(Profiles.of("observability"))
                && List.of("health", "metrics").contains(id.toString()) ? Access.READ_ONLY : Access.NONE;
    }

    @Bean
    @Order(1)
    @Profile("observability")
    SecurityFilterChain managementSecurity(HttpSecurity http, JsonMapper mapper,
                                           SecurityContextRepository securityContextRepository,
                                           CsrfTokenRepository csrfTokenRepository) throws Exception {
        RequestMatcher managementGet = request -> "GET".equals(request.getMethod());
        RequestMatcher health = request -> managementGet.matches(request)
                && List.of("/actuator/health", "/actuator/health/liveness", "/actuator/health/readiness")
                .contains(request.getRequestURI());
        RequestMatcher metrics = request -> managementGet.matches(request)
                && (request.getRequestURI().equals("/actuator/metrics")
                || request.getRequestURI().startsWith("/actuator/metrics/jvm.")
                || request.getRequestURI().equals("/actuator/metrics/http.server.requests"));
        return http
                .securityMatcher("/actuator", "/actuator/**")
                .csrf(csrf -> csrf.csrfTokenRepository(csrfTokenRepository)
                        .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
                .securityContext(context -> context.securityContextRepository(securityContextRepository))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.NEVER))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(health).permitAll()
                        .requestMatchers(metrics).authenticated()
                        .anyRequest().denyAll())
                .requestCache(cache -> cache.disable())
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint((request, response, exception) ->
                                ApiErrors.write(response, mapper, 401, "É necessário acesso válido."))
                        .accessDeniedHandler((request, response, exception) ->
                                ApiErrors.write(response, mapper, 403, "Operação recusada. Atualize a sessão e tente novamente.")))
                .build();
    }

    @Bean PasswordEncoder passwordEncoder() {
        return SCryptPasswordEncoder.defaultsForSpringSecurity_v5_8();
    }

    @Bean AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean CsrfTokenRepository csrfTokenRepository() {
        return new HttpSessionCsrfTokenRepository();
    }

    @Bean SessionAuthenticationStrategy sessionAuthenticationStrategy(CsrfTokenRepository csrfTokenRepository) {
        return new CompositeSessionAuthenticationStrategy(List.of(
                new ChangeSessionIdAuthenticationStrategy(),
                new CsrfAuthenticationStrategy(csrfTokenRepository)));
    }

    @Bean
    SecurityFilterChain security(HttpSecurity http, JsonMapper mapper,
                                 SecurityContextRepository securityContextRepository,
                                 CsrfTokenRepository csrfTokenRepository) throws Exception {
        return http
                .csrf(csrf -> csrf.csrfTokenRepository(csrfTokenRepository)
                        .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
                .securityContext(context -> context.securityContextRepository(securityContextRepository))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/csrf", "/api/auth/login").permitAll()
                        .requestMatchers("/api/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/", "/index.html", "/assets/**", "/favicon.ico").permitAll()
                        .anyRequest().denyAll())
                .logout(logout -> logout.logoutUrl("/api/auth/logout")
                        .invalidateHttpSession(true).deleteCookies("JSESSIONID")
                        .logoutSuccessHandler((request, response, authentication) -> response.setStatus(204)))
                .requestCache(cache -> cache.disable())
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint((request, response, exception) ->
                                ApiErrors.write(response, mapper, 401, "É necessário acesso válido."))
                        .accessDeniedHandler((request, response, exception) ->
                                ApiErrors.write(response, mapper, 403, "Operação recusada. Atualize a sessão e tente novamente.")))
                .build();
    }
}
