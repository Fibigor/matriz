package pt.matriz.identity;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.security.Principal;
import java.util.Locale;
import java.util.Map;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pt.matriz.common.ApiException;
import pt.matriz.common.ApiModels.UserView;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final IdentityService identities;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    private final SessionAuthenticationStrategy sessionAuthenticationStrategy;
    private final LoginThrottle loginThrottle;

    public AuthController(IdentityService identities, AuthenticationManager authenticationManager,
                          SecurityContextRepository securityContextRepository,
                          SessionAuthenticationStrategy sessionAuthenticationStrategy, LoginThrottle loginThrottle) {
        this.identities = identities;
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
        this.sessionAuthenticationStrategy = sessionAuthenticationStrategy;
        this.loginThrottle = loginThrottle;
    }

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of("headerName", token.getHeaderName(), "token", token.getToken());
    }

    @PostMapping("/login")
    public UserView login(@RequestBody LoginInput input, HttpServletRequest request, HttpServletResponse response) {
        if (input == null) throw new ApiException(400, "Email ou palavra-passe inválidos.");
        String email = input.email() == null ? "" : input.email().trim().toLowerCase(Locale.ROOT);
        String password = input.password() == null ? "" : input.password();
        if (email.isBlank() || email.length() > 254 || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
                || password.isEmpty() || password.length() > 200) {
            throw new ApiException(400, "Email ou palavra-passe inválidos.");
        }

        String address = request.getRemoteAddr() == null ? "unknown" : request.getRemoteAddr();
        long retryAfter = loginThrottle.retryAfterSeconds(email, address);
        if (retryAfter > 0) {
            response.setHeader("Retry-After", Long.toString(retryAfter));
            throw new ApiException(429, "Demasiadas tentativas de início de sessão. Tente novamente mais tarde.");
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(email, password));
        } catch (AuthenticationException error) {
            loginThrottle.recordFailure(email, address);
            throw new ApiException(401, "Email ou palavra-passe incorretos.");
        }

        loginThrottle.recordSuccess(email, address);
        sessionAuthenticationStrategy.onAuthentication(authentication, request, response);
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);
        return identities.current(authentication);
    }

    @GetMapping("/me")
    public UserView me(Principal principal) { return identities.current(principal); }

    public record LoginInput(String email, String password) {}
}
