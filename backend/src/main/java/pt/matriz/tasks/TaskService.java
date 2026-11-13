package pt.matriz.tasks;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.ArrayList;
import java.util.Objects;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import pt.matriz.common.ApiException;
import pt.matriz.common.Inputs;
import pt.matriz.projects.ProjectService;
import static pt.matriz.common.ApiModels.*;

@Service
public class TaskService {
    private static final Set<String> STATES = Set.of("TODO", "IN_PROGRESS", "DONE");
    private static final Set<String> PRIORITIES = Set.of("LOW", "MEDIUM", "HIGH");
    private static final Set<String> TYPES = Set.of("TASK", "BUG", "IMPROVEMENT");
    private static final Set<String> REASONS = Set.of("COMPLETED", "CANCELLED", "DUPLICATE", "WONT_DO");
    private final JdbcTemplate db;
    private final ProjectService projects;
    private final TaskActivityService activity;
    private final TaskAttachmentService attachments;

    public TaskService(JdbcTemplate db, ProjectService projects, TaskActivityService activity, TaskAttachmentService attachments) {
        this.db = db;
        this.projects = projects;
        this.activity = activity;
        this.attachments = attachments;
    }

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public TaskPage list(String projectId, String userId, String status, String priority, int page, int size) {
        Inputs.page(page, size);
        projects.access(projectId, userId, false, false);
        if (status != null) Inputs.choice(status, STATES, "status");
        if (priority != null) Inputs.choice(priority, PRIORITIES, "priority");
        String where = " FROM task WHERE project_id=? AND (?='' OR status=?) AND (?='' OR priority=?)";
        String state = status == null ? "" : status, level = priority == null ? "" : priority;
        long total = db.queryForObject("SELECT count(*)" + where, Long.class, projectId, state, state, level, level);
        List<TaskView> items = db.query("SELECT *" + where + " ORDER BY created_at,id LIMIT ? OFFSET ?",
                (rs, row) -> task(rs), projectId, state, state, level, level, size, Inputs.offset(page, size));
        return new TaskPage(projects.get(projectId, userId), items, Inputs.pagination(page, size, total), projects.progress(projectId));
    }

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public TaskView get(String projectId, String id, String userId) {
        projects.access(projectId, userId, false, false);
        return find(projectId, id);
    }

    @Transactional
    public TaskView create(String projectId, String userId, CreateTask input) {
        lockProject(projects, db, projectId, userId, false);
        String title = Inputs.title(input.title(), 200, "title");
        String description = Inputs.description(input.description());
        String priority = input.priority() == null ? "MEDIUM" : Inputs.choice(input.priority(), PRIORITIES, "priority");
        String id = UUID.randomUUID().toString();
        String type = input.type() == null ? "TASK" : Inputs.choice(input.type(), TYPES, "type");
        db.update("INSERT INTO task(id,project_id,title,description,priority,type,weight) VALUES (?,?,?,?,?,?,?)",
                id, projectId, title, description, priority, type, Inputs.weight(input.weight()));
        activity.add(id, userId, ActivityType.TASK_CREATED, TaskActivityService.empty());
        return find(projectId, id);
    }

    @Transactional
    public TaskView update(String projectId, String id, String userId, UpdateTask input) {
        lockProject(projects, db, projectId, userId, false);
        TaskView before = find(projectId, id);
        if (before.version() != Inputs.version(input.version())) throw ProjectService.stale();
        String title = Inputs.title(input.title(), 200, "title");
        String description = Inputs.description(input.description());
        String status = Inputs.choice(input.status(), STATES, "status");
        String priority = Inputs.choice(input.priority(), PRIORITIES, "priority");
        String type = input.typePresent() ? Inputs.choice(input.type(), TYPES, "type") : before.type();
        Integer weight = input.weightPresent() ? Inputs.weight(input.weight()) : before.weight();
        String reason = input.closeReasonPresent() ? input.closeReason()
                : ("DONE".equals(status) && "DONE".equals(before.status()) ? before.closeReason() : null);
        if (reason != null) {
            Inputs.choice(reason, REASONS, "closeReason");
            if (!"DONE".equals(status)) throw Inputs.invalid("closeReason", "Motivo apenas permitido em tarefas fechadas.");
        }
        checkTransition(id, before.status(), status);
        int changed = db.update("""
                UPDATE task SET title=?,description=?,status=?,priority=?,type=?,weight=?,close_reason=?,
                version=version+1,updated_at=CURRENT_TIMESTAMP
                WHERE id=? AND project_id=? AND version=?
                """, title, description, status, priority, type, weight, reason, id, projectId, input.version());
        if (changed == 0) throw ProjectService.stale();
        List<ActivityChange> changes = new ArrayList<>();
        change(changes, ChangeField.status, before.status(), status);
        change(changes, ChangeField.priority, before.priority(), priority);
        change(changes, ChangeField.type, before.type(), type);
        if (!Objects.equals(before.weight(), weight)) changes.add(new ActivityChange(ChangeField.weight,
                new NumberValue(before.weight()), new NumberValue(weight)));
        change(changes, ChangeField.closeReason, before.closeReason(), reason);
        boolean titleChanged = !before.title().equals(title), descriptionChanged = !before.description().equals(description);
        if (!changes.isEmpty() || titleChanged || descriptionChanged) activity.add(id, userId, ActivityType.TASK_UPDATED,
                new TaskActivityService.Payload(changes, titleChanged, descriptionChanged, null, null, null));
        return find(projectId, id);
    }

    @Transactional
    public void delete(String projectId, String id, String userId, long version) {
        lockProject(projects, db, projectId, userId, false);
        TaskView before = find(projectId, id);
        if (before.version() != Inputs.version(version)) throw ProjectService.stale();
        // The surviving endpoint records the removal before cascade deletes the link.
        for (TaskLinkView link : db.query("SELECT * FROM task_link WHERE source_task_id=? OR target_task_id=?",
                (rs, row) -> link(rs), id, id)) {
            String survivor = link.sourceTaskId().equals(id) ? link.targetTaskId() : link.sourceTaskId();
            activity.relation(survivor, userId, ActivityType.LINK_REMOVED, link);
        }
        if (db.update("DELETE FROM task WHERE id=? AND project_id=? AND version=?", id, projectId, version) == 0) {
            throw ProjectService.stale();
        }
    }

    @Transactional
    public TaskView assign(String projectId, String id, String userId, String target, Long version, boolean remove) {
        lockProject(projects, db, projectId, userId, true);
        TaskView before = find(projectId, id);
        if (before.version() != Inputs.version(version)) throw ProjectService.stale();
        int changed;
        if (remove) {
            changed = db.update("DELETE FROM task_assignment WHERE task_id=? AND user_id=?", id, target);
        } else {
            boolean eligible = Boolean.TRUE.equals(db.queryForObject("""
                    SELECT EXISTS(SELECT 1 FROM participation m JOIN app_user u ON u.id=m.user_id
                    WHERE m.project_id=? AND u.id=? AND u.active)
                    """, Boolean.class, projectId, target));
            if (!eligible) throw Inputs.invalid("userId", "Conta não elegível.");
            changed = db.update("""
                    INSERT INTO task_assignment(task_id,project_id,user_id) VALUES (?,?,?) ON CONFLICT DO NOTHING
                    """, id, projectId, target);
        }
        if (changed > 0) {
            db.update("UPDATE task SET version=version+1,updated_at=CURRENT_TIMESTAMP WHERE id=?", id);
            activity.add(id, userId, ActivityType.ASSIGNEES_CHANGED, new TaskActivityService.Payload(
                    List.of(new ActivityChange(ChangeField.assignees,
                            new UserIdsValue(before.assignees().stream().map(UserView::id).sorted().toList()),
                            new UserIdsValue(find(projectId, id).assignees().stream().map(UserView::id).sorted().toList()))),
                    false, false, null, null, null));
        }
        return find(projectId, id);
    }

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public CommentPage comments(String projectId, String id, String userId, int page, int size) {
        Inputs.page(page, size);
        projects.access(projectId, userId, false, false);
        find(projectId, id);
        long total = db.queryForObject("SELECT count(*) FROM task_comment WHERE task_id=?", Long.class, id);
        List<CommentView> items = db.query("""
                SELECT c.*,u.display_name FROM task_comment c JOIN app_user u ON u.id=c.author_id
                WHERE c.task_id=? ORDER BY c.created_at,c.id LIMIT ? OFFSET ?
                """, (rs, row) -> comment(rs, userId), id, size, Inputs.offset(page, size));
        return new CommentPage(items, Inputs.pagination(page, size, total));
    }

    @Transactional
    public CommentView comment(String projectId, String id, String userId, String content) {
        return comment(projectId, id, userId, content, List.of());
    }

    @Transactional
    public CommentView comment(String projectId, String id, String userId, String content, List<MultipartFile> files) {
        lockProject(projects, db, projectId, userId, false);
        find(projectId, id);
        String text = Inputs.title(content, 2000, "content");
        String commentId = UUID.randomUUID().toString();
        db.update("INSERT INTO task_comment(id,task_id,author_id,content) VALUES (?,?,?,?)", commentId, id, userId, text);
        List<TaskAttachmentView> added = attachments.store(id, commentId, userId, files);
        activity.add(id, userId, ActivityType.COMMENT_ADDED,
                new TaskActivityService.Payload(List.of(), false, false, commentId, null, null, added.stream()
                        .map(a -> new AttachmentActivity(a.id(), a.filename(), a.contentType(), a.sizeBytes())).toList()));
        return db.query("""
                SELECT c.*,u.display_name FROM task_comment c JOIN app_user u ON u.id=c.author_id WHERE c.id=?
                """, (rs, row) -> comment(rs, userId), commentId).getFirst();
    }

    TaskView find(String projectId, String id) {
        return db.query("SELECT * FROM task WHERE project_id=? AND id=?", (rs, row) -> task(rs), projectId, id)
                .stream().findFirst().orElseThrow(ApiException::notFound);
    }

    private TaskView task(ResultSet rs) throws SQLException {
        String id = rs.getString("id");
        List<UserView> assignees = db.query("""
                SELECT u.id,u.display_name FROM task_assignment a JOIN app_user u ON u.id=a.user_id
                WHERE a.task_id=? ORDER BY u.display_name,u.id
                """, (user, row) -> new UserView(user.getString("id"), user.getString("display_name")), id);
        return new TaskView(id, rs.getString("project_id"), rs.getString("title"), rs.getString("description"),
                rs.getString("status"), rs.getString("priority"), assignees, rs.getLong("version"),
                rs.getTimestamp("created_at").toInstant(), rs.getTimestamp("updated_at").toInstant(),
                rs.getString("task_key"), rs.getString("type"), (Integer) rs.getObject("weight"), rs.getString("close_reason"));
    }

    private CommentView comment(ResultSet rs, String userId) throws SQLException {
        return new CommentView(rs.getString("id"), rs.getString("task_id"),
                new UserView(rs.getString("author_id"), rs.getString("display_name")), rs.getString("content"),
                rs.getTimestamp("created_at").toInstant(), attachments.forComment(rs.getString("task_id"), rs.getString("id"), userId));
    }

    private static void change(List<ActivityChange> changes, ChangeField field, String before, String after) {
        if (!Objects.equals(before, after)) changes.add(new ActivityChange(field, new TextValue(before), new TextValue(after)));
    }

    private void checkTransition(String id, String before, String after) {
        if (!"DONE".equals(before) && "DONE".equals(after) && Boolean.TRUE.equals(db.queryForObject("""
                SELECT EXISTS(SELECT 1 FROM task_link l JOIN task t ON t.id=l.source_task_id
                WHERE l.target_task_id=? AND l.type='BLOCKS' AND t.status<>'DONE')
                """, Boolean.class, id))) throw Inputs.invalid("status", "Conclua primeiro todos os bloqueadores diretos.");
        if ("DONE".equals(before) && !"DONE".equals(after) && Boolean.TRUE.equals(db.queryForObject("""
                SELECT EXISTS(SELECT 1 FROM task_link l JOIN task t ON t.id=l.target_task_id
                WHERE l.source_task_id=? AND l.type='BLOCKS' AND t.status='DONE')
                """, Boolean.class, id))) throw Inputs.invalid("status", "Reabra primeiro os dependentes diretos concluídos.");
    }

    TaskReference reference(String id) {
        return db.query("SELECT id,task_key,title,status,version FROM task WHERE id=?", (rs, row) ->
                new TaskReference(id, rs.getString("task_key"), rs.getString("title"), rs.getString("status"), rs.getLong("version")), id).getFirst();
    }

    static void lockProject(ProjectService projects, JdbcTemplate db, String projectId, String userId, boolean manager) {
        projects.access(projectId, userId, manager, true);
        // A join evaluated before waiting for FOR UPDATE can still see a participation
        // that the preceding writer removed. Recheck using a fresh READ_COMMITTED snapshot.
        projects.access(projectId, userId, manager, false);
        if (!Boolean.TRUE.equals(db.queryForObject("SELECT EXISTS(SELECT 1 FROM app_user WHERE id=? AND active)",
                Boolean.class, userId))) throw new ApiException(401, "É necessário acesso válido.");
    }

    TaskLinkView link(ResultSet rs) throws SQLException {
        String author = rs.getString("created_by");
        UserView user = db.query("SELECT display_name FROM app_user WHERE id=?",
                (u, row) -> new UserView(author, u.getString("display_name")), author).getFirst();
        return new TaskLinkView(rs.getString("id"), rs.getString("project_id"), LinkType.valueOf(rs.getString("type")),
                rs.getString("source_task_id"), rs.getString("target_task_id"), user, rs.getTimestamp("created_at").toInstant(),
                reference(rs.getString("source_task_id")), reference(rs.getString("target_task_id")));
    }
}
