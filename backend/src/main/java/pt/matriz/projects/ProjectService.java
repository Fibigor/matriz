package pt.matriz.projects;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import pt.matriz.common.ApiException;
import pt.matriz.common.Emails;
import pt.matriz.common.Inputs;
import static pt.matriz.common.ApiModels.*;

@Service
public class ProjectService {
    private final JdbcTemplate db;

    public ProjectService(JdbcTemplate db) { this.db = db; }

    public record Access(String id, String ownerUserId) {}

    public Access access(String projectId, String userId, boolean manager, boolean lock) {
        List<Access> found = db.query("""
                SELECT p.id, p.owner_user_id FROM project p
                JOIN participation m ON m.project_id=p.id
                WHERE p.id=? AND m.user_id=?
                """ + (lock ? " FOR UPDATE OF p" : ""),
                (rs, row) -> new Access(rs.getString("id"), rs.getString("owner_user_id")), projectId, userId);
        Access result = found.stream().findFirst().orElseThrow(ApiException::notFound);
        if (manager && !result.ownerUserId().equals(userId)) throw new ApiException(403, "Só o gestor pode realizar esta operação.");
        return result;
    }

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public ProjectPage list(String userId, String search, int page, int size) {
        Inputs.page(page, size);
        String term = search == null ? "" : search;
        String where = " FROM project p JOIN participation m ON m.project_id=p.id WHERE m.user_id=? AND strpos(lower(p.name),lower(?))>0";
        long total = db.queryForObject("SELECT count(*)" + where, Long.class, userId, term);
        List<ProjectView> items = db.query("SELECT p.*" + where + " ORDER BY p.created_at,p.id LIMIT ? OFFSET ?",
                (rs, row) -> project(rs, userId), userId, term, size, Inputs.offset(page, size));
        return new ProjectPage(items, Inputs.pagination(page, size, total));
    }

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public ProjectView get(String id, String userId) {
        access(id, userId, false, false);
        return db.query("SELECT * FROM project WHERE id=?", (rs, row) -> project(rs, userId), id).getFirst();
    }

    @Transactional
    public ProjectView create(String userId, ProjectInput input) {
        if (input.version() != null) throw Inputs.invalid("version", "Não enviar versão na criação.");
        String name = Inputs.title(input.name(), 120, "name");
        String description = Inputs.description(input.description());
        String id = UUID.randomUUID().toString();
        db.update("INSERT INTO project(id,name,description,owner_user_id) VALUES (?,?,?,?)", id, name, description, userId);
        db.update("INSERT INTO participation(project_id,user_id) VALUES (?,?)", id, userId);
        return get(id, userId);
    }

    @Transactional
    public ProjectView update(String id, String userId, ProjectInput input) {
        access(id, userId, true, true);
        String name = Inputs.title(input.name(), 120, "name");
        String description = Inputs.description(input.description());
        if (db.update("UPDATE project SET name=?,description=?,version=version+1 WHERE id=? AND version=?",
                name, description, id, Inputs.version(input.version())) == 0) throw stale();
        return get(id, userId);
    }

    @Transactional
    public void delete(String id, String userId, long version) {
        access(id, userId, true, true);
        // Assignments must be removed before participants; both paths also cascade from the project.
        if (currentVersion(id) != version) throw stale();
        db.update("DELETE FROM task_assignment WHERE project_id=?", id);
        db.update("DELETE FROM project WHERE id=?", id);
    }

    @Transactional(readOnly = true)
    public List<MemberView> members(String id, String userId) {
        access(id, userId, false, false);
        return db.query("""
                SELECT u.id,u.display_name,u.active, p.owner_user_id
                FROM participation m JOIN app_user u ON u.id=m.user_id JOIN project p ON p.id=m.project_id
                WHERE p.id=? ORDER BY u.display_name,u.id
                """, (rs, row) -> new MemberView(rs.getString("id"), rs.getString("display_name"), rs.getBoolean("active"),
                rs.getString("id").equals(rs.getString("owner_user_id")) ? "MANAGER" : "MEMBER"), id);
    }

    @Transactional
    public void addMember(String id, String userId, MemberInput input) {
        access(id, userId, false, true);
        // The locking join may have seen participation before waiting. Use fresh
        // READ_COMMITTED snapshots after the project lock, only for this operation.
        access(id, userId, true, false);
        if (!Boolean.TRUE.equals(db.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM app_user WHERE id=? AND active)", Boolean.class, userId))) {
            throw new ApiException(401, "É necessário acesso válido.");
        }
        if (input == null || input.emailPresent() == input.userIdPresent()) {
            throw Inputs.invalid("email", "Indique exatamente um critério: email ou userId.");
        }
        boolean byEmail = input.emailPresent();
        String field = byEmail ? "email" : "userId";
        String criterion = byEmail ? Emails.normalize(input.email()) : input.userId();
        if (byEmail && !Emails.valid(criterion)) {
            throw Inputs.invalid("email", "Indique um email válido com até 254 caracteres.");
        }
        if (!byEmail && (criterion == null || criterion.isBlank())) {
            throw Inputs.invalid("userId", "Conta não elegível.");
        }
        // FOR SHARE (not KEY SHARE) serializes active-state updates through the
        // insert/commit. Equality and the legacy ID remain exact, never a search.
        String target = db.query("SELECT id FROM app_user WHERE "
                        + (byEmail ? "lower(email)=?" : "id=?") + " AND active FOR SHARE",
                (rs, row) -> rs.getString("id"), criterion)
                .stream().findFirst().orElseThrow(() -> Inputs.invalid(field, "Conta não elegível."));
        db.update("""
                INSERT INTO participation(project_id,user_id) VALUES (?,?)
                ON CONFLICT (project_id,user_id) DO NOTHING
                """, id, target);
    }

    @Transactional
    public void removeMember(String id, String userId, String target) {
        Access access = access(id, userId, true, true);
        if (target.equals(access.ownerUserId())) throw new ApiException(409, "Não é possível remover o gestor.");
        boolean assigned = Boolean.TRUE.equals(db.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM task_assignment WHERE project_id=? AND user_id=?)", Boolean.class, id, target));
        if (assigned) throw new ApiException(409, "Retire primeiro todas as atribuições deste membro.");
        db.update("DELETE FROM participation WHERE project_id=? AND user_id=?", id, target);
    }

    public Progress progress(String id) {
        return db.query("""
                SELECT count(*) FILTER (WHERE status='TODO') AS todo,
                count(*) FILTER (WHERE status='IN_PROGRESS') AS doing,
                count(*) FILTER (WHERE status='IN_REVIEW') AS review,
                count(*) FILTER (WHERE status='DONE') AS done FROM task WHERE project_id=?
                """, (rs, row) -> Inputs.progress(rs.getLong("todo"), rs.getLong("doing"), rs.getLong("review"), rs.getLong("done")), id).getFirst();
    }

    private long currentVersion(String id) {
        return db.queryForObject("SELECT version FROM project WHERE id=?", Long.class, id);
    }

    private ProjectView project(ResultSet rs, String userId) throws SQLException {
        String id = rs.getString("id"), owner = rs.getString("owner_user_id");
        return new ProjectView(id, rs.getString("name"), rs.getString("description"), owner,
                owner.equals(userId) ? "MANAGER" : "MEMBER", rs.getLong("version"),
                rs.getTimestamp("created_at").toInstant(), progress(id));
    }

    public static ApiException stale() {
        return new ApiException(409, "Os dados foram alterados. Consulte a versão atual antes de tentar novamente.");
    }
}
