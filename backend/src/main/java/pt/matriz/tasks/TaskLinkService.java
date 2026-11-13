package pt.matriz.tasks;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import pt.matriz.common.ApiException;
import pt.matriz.common.Inputs;
import pt.matriz.projects.ProjectService;
import static pt.matriz.common.ApiModels.*;

@Service
public class TaskLinkService {
    private final JdbcTemplate db;
    private final ProjectService projects;
    private final TaskService tasks;
    private final TaskActivityService activity;

    public TaskLinkService(JdbcTemplate db, ProjectService projects, TaskService tasks, TaskActivityService activity) {
        this.db = db;
        this.projects = projects;
        this.tasks = tasks;
        this.activity = activity;
    }

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public LinkPage list(String projectId, String id, String user, int page, int size) {
        Inputs.page(page, size);
        projects.access(projectId, user, false, false);
        tasks.find(projectId, id);
        long total = db.queryForObject("SELECT count(*) FROM task_link WHERE source_task_id=? OR target_task_id=?", Long.class, id, id);
        List<TaskLinkView> items = db.query("""
                SELECT * FROM task_link WHERE source_task_id=? OR target_task_id=? ORDER BY created_at,id LIMIT ? OFFSET ?
                """, (rs, row) -> tasks.link(rs), id, id, size, Inputs.offset(page, size));
        return new LinkPage(items, Inputs.pagination(page, size, total));
    }

    public record Created(boolean created, LinkMutation result) {}

    @Transactional
    public Created create(String projectId, String id, String user, LinkInput input) {
        TaskService.lockProject(projects, db, projectId, user, false);
        TaskView before = tasks.find(projectId, id);
        TaskView other = tasks.find(projectId, input.targetTaskId());
        versions(before, other, input.version(), input.targetVersion());
        String type = Inputs.choice(input.type(), Set.of("RELATED", "BLOCKS", "DUPLICATES"), "type");
        if (id.equals(other.id())) throw Inputs.invalid("targetTaskId", "Não é possível ligar uma tarefa a si própria.");
        String source = id, target = other.id();
        if ("RELATED".equals(type) && source.compareTo(target) > 0) { source = other.id(); target = id; }
        List<TaskLinkView> existing = db.query("SELECT * FROM task_link WHERE type=? AND source_task_id=? AND target_task_id=?",
                (rs, row) -> tasks.link(rs), type, source, target);
        if (!existing.isEmpty()) return new Created(false, new LinkMutation(existing.getFirst(), before, other));
        if ("BLOCKS".equals(type)) {
            if ("DONE".equals(other.status()) && !"DONE".equals(before.status())) {
                throw Inputs.invalid("targetTaskId", "Uma tarefa concluída não pode ficar bloqueada por trabalho não concluído.");
            }
            boolean cycle = Boolean.TRUE.equals(db.queryForObject("""
                    WITH RECURSIVE reachable(id) AS (
                        SELECT target_task_id FROM task_link WHERE source_task_id=? AND type='BLOCKS'
                        UNION
                        SELECT l.target_task_id FROM task_link l JOIN reachable r ON l.source_task_id=r.id WHERE l.type='BLOCKS'
                    ) SELECT EXISTS(SELECT 1 FROM reachable WHERE id=?)
                    """, Boolean.class, target, source));
            if (cycle) throw Inputs.invalid("targetTaskId", "A relação criaria um ciclo de bloqueio.");
        }
        String linkId = UUID.randomUUID().toString();
        db.update("INSERT INTO task_link(id,project_id,type,source_task_id,target_task_id,created_by) VALUES (?,?,?,?,?,?)",
                linkId, projectId, type, source, target, user);
        increment(id, other.id());
        TaskLinkView link = find(projectId, id, linkId);
        activity.relation(id, user, ActivityType.LINK_ADDED, link);
        activity.relation(other.id(), user, ActivityType.LINK_ADDED, link);
        return new Created(true, new LinkMutation(link, tasks.find(projectId, id), tasks.find(projectId, other.id())));
    }

    @Transactional
    public LinkDeletion delete(String projectId, String id, String linkId, String user, Long version, Long targetVersion) {
        TaskService.lockProject(projects, db, projectId, user, false);
        TaskView before = tasks.find(projectId, id);
        TaskLinkView link = find(projectId, id, linkId);
        String otherId = id.equals(link.sourceTaskId()) ? link.targetTaskId() : link.sourceTaskId();
        TaskView other = tasks.find(projectId, otherId);
        versions(before, other, version, targetVersion);
        db.update("DELETE FROM task_link WHERE id=?", linkId);
        increment(id, otherId);
        activity.relation(id, user, ActivityType.LINK_REMOVED, link);
        activity.relation(otherId, user, ActivityType.LINK_REMOVED, link);
        return new LinkDeletion(tasks.find(projectId, id), tasks.find(projectId, otherId));
    }

    private TaskLinkView find(String project, String task, String link) {
        return db.query("SELECT * FROM task_link WHERE id=? AND project_id=? AND (source_task_id=? OR target_task_id=?)",
                (rs, row) -> tasks.link(rs), link, project, task, task).stream().findFirst().orElseThrow(ApiException::notFound);
    }

    private static void versions(TaskView task, TaskView other, Long version, Long targetVersion) {
        long expected = Inputs.version(version), otherExpected = Inputs.version(targetVersion, "targetVersion");
        if (task.version() != expected || other.version() != otherExpected) throw ProjectService.stale();
    }

    private void increment(String id, String other) {
        db.update("UPDATE task SET version=version+1,updated_at=CURRENT_TIMESTAMP WHERE id IN (?,?)", id, other);
    }
}
