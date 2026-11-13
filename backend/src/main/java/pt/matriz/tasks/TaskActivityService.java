package pt.matriz.tasks;

import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;
import pt.matriz.common.ApiException;
import pt.matriz.common.Inputs;
import pt.matriz.projects.ProjectService;
import static pt.matriz.common.ApiModels.*;

@Service
public class TaskActivityService {
    private final JdbcTemplate db;
    private final JsonMapper json;
    private final ProjectService projects;

    public TaskActivityService(JdbcTemplate db, JsonMapper json, ProjectService projects) {
        this.db = db;
        this.json = json;
        this.projects = projects;
    }

    public record Payload(List<ActivityChange> changes, boolean titleChanged, boolean descriptionChanged,
                          String commentId, RelationActivity relation, AttachmentActivity attachment,
                          List<AttachmentActivity> attachments) {
        public Payload(List<ActivityChange> changes, boolean titleChanged, boolean descriptionChanged,
                       String commentId, RelationActivity relation, AttachmentActivity attachment) {
            this(changes, titleChanged, descriptionChanged, commentId, relation, attachment, List.of());
        }
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void add(String taskId, String actor, ActivityType type, Payload payload) {
        db.update("INSERT INTO task_activity(id,task_id,actor_id,type,payload) VALUES (?,?,?,?,?::jsonb)",
                UUID.randomUUID().toString(), taskId, actor, type.name(), json.writeValueAsString(payload));
    }

    public static Payload empty() { return new Payload(List.of(), false, false, null, null, null); }

    @Transactional(propagation = Propagation.MANDATORY)
    public void relation(String taskId, String actor, ActivityType event, TaskLinkView link) {
        TaskReference other = taskId.equals(link.sourceTaskId()) ? link.targetTask() : link.sourceTask();
        add(taskId, actor, event, new Payload(List.of(), false, false, null,
                new RelationActivity(link.id(), link.type(), link.sourceTaskId(), link.targetTaskId(), other.id(), other.key()), null));
    }

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public ActivityPage list(String projectId, String taskId, String user, int page, int size) {
        Inputs.page(page, size);
        projects.access(projectId, user, false, false);
        if (!Boolean.TRUE.equals(db.queryForObject("SELECT EXISTS(SELECT 1 FROM task WHERE id=? AND project_id=?)",
                Boolean.class, taskId, projectId))) throw ApiException.notFound();
        long total = db.queryForObject("SELECT count(*) FROM task_activity WHERE task_id=?", Long.class, taskId);
        List<TaskActivityView> items = db.query("""
                SELECT a.*,u.display_name FROM task_activity a JOIN app_user u ON u.id=a.actor_id
                WHERE a.task_id=? ORDER BY a.created_at,a.id LIMIT ? OFFSET ?
                """, (rs, row) -> {
            Payload payload = json.readValue(rs.getString("payload"), Payload.class);
            return new TaskActivityView(rs.getString("id"), taskId,
                    new UserView(rs.getString("actor_id"), rs.getString("display_name")), rs.getTimestamp("created_at").toInstant(),
                    ActivityType.valueOf(rs.getString("type")), payload.changes(), payload.titleChanged(), payload.descriptionChanged(),
                    payload.commentId(), payload.relation(), payload.attachment(), payload.attachments());
        }, taskId, size, Inputs.offset(page, size));
        return new ActivityPage(items, Inputs.pagination(page, size, total));
    }
}
