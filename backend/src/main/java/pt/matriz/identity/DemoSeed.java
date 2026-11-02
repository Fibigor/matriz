package pt.matriz.identity;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@ConditionalOnProperty(name = "matriz.demo.enabled", havingValue = "true")
public class DemoSeed implements ApplicationRunner {
    private final JdbcTemplate db;
    private final PasswordEncoder passwords;

    public DemoSeed(JdbcTemplate db, PasswordEncoder passwords) {
        this.db = db;
        this.passwords = passwords;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments arguments) {
        // A transaction-scoped lock makes simultaneous demo startups safe without resetting existing data.
        db.execute("SELECT pg_advisory_xact_lock(73429031)");
        boolean alreadySeeded = Boolean.TRUE.equals(db.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM app_user WHERE id='user-ana')", Boolean.class));
        for (String[] user : new String[][]{
                {"ana", "Ana", "ana@example.invalid"},
                {"bruno", "Bruno", "bruno@example.invalid"},
                {"carla", "Carla", "carla@example.invalid"}}) {
            db.update("""
                    INSERT INTO app_user(id,username,display_name,email,password_hash)
                    VALUES (?,?,?,?,?)
                    ON CONFLICT (id) DO UPDATE SET
                      email = COALESCE(app_user.email, EXCLUDED.email),
                      password_hash = COALESCE(app_user.password_hash, EXCLUDED.password_hash)
                    """, "user-" + user[0], user[0], user[1], user[2], passwords.encode("Matriz-Demo-2026!"));
        }
        if (alreadySeeded) return;
        db.update("INSERT INTO project(id,name,description,owner_user_id) VALUES ('proj-alfa','Alfa','Preparação do MVP da Matriz','user-ana')");
        db.update("INSERT INTO participation(project_id,user_id) VALUES ('proj-alfa','user-ana'),('proj-alfa','user-bruno')");
        db.update("INSERT INTO project(id,name,description,owner_user_id) VALUES ('proj-beta','Beta','Projeto privado de Carla','user-carla')");
        db.update("INSERT INTO participation(project_id,user_id) VALUES ('proj-beta','user-carla')");
        String[] titles = {"Definir âmbito", "Rever requisitos", "Desenhar modelo", "Preparar contrato", "Validar protótipo"};
        String[] statuses = {"DONE", "DONE", "IN_PROGRESS", "TODO", "TODO"};
        for (int i = 0; i < titles.length; i++) {
            db.update("INSERT INTO task(id,project_id,title,status) VALUES (?,'proj-alfa',?,?)",
                    "task-0" + (i + 1), titles[i], statuses[i]);
        }
        db.update("INSERT INTO task_assignment(task_id,project_id,user_id) VALUES ('task-01','proj-alfa','user-ana'),('task-01','proj-alfa','user-bruno')");
    }
}
