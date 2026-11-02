package pt.matriz.identity;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class DatabaseUserDetailsService implements UserDetailsService {
    private final JdbcTemplate db;
    private final String unusablePasswordHash;

    public DatabaseUserDetailsService(JdbcTemplate db, PasswordEncoder passwords) {
        this.db = db;
        this.unusablePasswordHash = passwords.encode("not-a-real-user-password");
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return db.query("""
                        SELECT id, password_hash, active
                        FROM app_user
                        WHERE lower(email) = lower(?)
                        """,
                (rs, row) -> {
                    String passwordHash = rs.getString("password_hash");
                    return User.withUsername(rs.getString("id"))
                            .password(passwordHash == null ? unusablePasswordHash : passwordHash)
                            .disabled(!rs.getBoolean("active") || passwordHash == null)
                            .authorities("ROLE_USER")
                            .build();
                }, email)
                .stream().findFirst()
                .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
    }
}
