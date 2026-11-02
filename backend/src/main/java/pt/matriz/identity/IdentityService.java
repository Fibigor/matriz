package pt.matriz.identity;

import java.security.Principal;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import pt.matriz.common.ApiException;
import pt.matriz.common.ApiModels.UserView;

@Service
public class IdentityService {
    private final JdbcTemplate db;

    public IdentityService(JdbcTemplate db) { this.db = db; }

    public UserView current(Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            throw new ApiException(401, "É necessário acesso válido.");
        }
        return db.query("SELECT id, display_name FROM app_user WHERE id = ? AND active",
                (rs, row) -> new UserView(rs.getString("id"), rs.getString("display_name")), principal.getName())
                .stream().findFirst().orElseThrow(() -> new ApiException(401, "É necessário acesso válido."));
    }
}
