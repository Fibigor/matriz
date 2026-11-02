package pt.matriz.identity;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
import pt.matriz.common.ApiErrors;

@Configuration
public class SecurityConfig {
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
    SecurityFilterChain security(HttpSecurity http, ObjectMapper mapper,
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
