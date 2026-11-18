package pt.matriz.identity;

import java.security.Principal;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.matriz.common.ApiException;
import pt.matriz.common.ApiModels.UserView;
import pt.matriz.common.Inputs;
import pt.matriz.common.Emails;

@Service
public class IdentityService {
    private final JdbcTemplate db;
    private final PasswordEncoder passwords;

    public IdentityService(JdbcTemplate db, PasswordEncoder passwords) {
        this.db = db;
        this.passwords = passwords;
    }

    @Transactional
    public void register(String displayName, String email, String password) {
        String name = Inputs.title(displayName, 120, "displayName");
        String normalizedEmail = Emails.normalize(email);
        if (!Emails.valid(normalizedEmail)) {
            throw Inputs.invalid("email", "Indique um email válido com até 254 caracteres.");
        }
        int length = password == null ? 0 : password.codePointCount(0, password.length());
        if (length < 6) throw Inputs.invalid("password", "Mínimo de 6 caracteres");
        if (length > 200) throw Inputs.invalid("password", "Palavra-passe demasiado longa");
        String id = UUID.randomUUID().toString();
        // Target only V3's email index: other integrity/database failures must propagate.
        int inserted = db.update("""
                INSERT INTO app_user (id, username, display_name, email, password_hash, active)
                VALUES (?, ?, ?, ?, ?, true)
                ON CONFLICT (lower(email)) WHERE email IS NOT NULL DO NOTHING
                """, id, "registered-" + id, name, normalizedEmail, passwords.encode(password));
        if (inserted == 0) throw new ApiException(409, "Já existe uma conta com este email.", "email");
    }

    public UserView current(Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            throw new ApiException(401, "É necessário acesso válido.");
        }
        return db.query("SELECT id, display_name FROM app_user WHERE id = ? AND active",
                (rs, row) -> new UserView(rs.getString("id"), rs.getString("display_name")), principal.getName())
                .stream().findFirst().orElseThrow(() -> new ApiException(401, "É necessário acesso válido."));
    }
}
