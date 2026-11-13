package pt.matriz.common;

import java.time.Instant;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonSubTypes;

public final class ApiModels {
    private ApiModels() {}

    public record UserView(String id, String displayName) {}
    public record MemberView(String id, String displayName, boolean active, String role) {}
    public record Progress(long total, long todo, long inProgress, long done, int completedPercent) {}
    public record Pagination(int page, int pageSize, long totalItems, long totalPages) {}
    public record ProjectView(String id, String name, String description, String ownerUserId,
                              String currentRole, long version, Instant createdAt, Progress progress) {}
    public record ProjectPage(List<ProjectView> items, Pagination pagination) {}
    public record TaskView(String id, String projectId, String title, String description,
                           String status, String priority, List<UserView> assignees,
                           long version, Instant createdAt, Instant updatedAt,
                           String key, String type, Integer weight, String closeReason) {}
    public record TaskPage(ProjectView project, List<TaskView> items, Pagination pagination, Progress progress) {}
    public record CommentView(String id, String taskId, UserView author, String content, Instant createdAt,
                              List<TaskAttachmentView> attachments) {}
    public record CommentPage(List<CommentView> items, Pagination pagination) {}
    public record ProjectInput(String name, String description, Long version) {}
    public record CreateTask(String title, String description, String priority, String type, Integer weight) {
        public CreateTask(String title, String description, String priority) { this(title, description, priority, null, null); }
    }
    // Presence is part of the PUT contract for the new fields; explicit null is not omission.
    public static final class UpdateTask {
        public String title, description, status, priority;
        public Long version;
        private String type, closeReason;
        private Integer weight;
        private boolean typePresent, weightPresent, closeReasonPresent;
        @JsonSetter("type") public void setType(String value) { typePresent = true; type = value; }
        @JsonSetter("weight") public void setWeight(Integer value) { weightPresent = true; weight = value; }
        @JsonSetter("closeReason") public void setCloseReason(String value) { closeReasonPresent = true; closeReason = value; }
        public String title() { return title; }
        public String description() { return description; }
        public String status() { return status; }
        public String priority() { return priority; }
        public Long version() { return version; }
        public String type() { return type; }
        public Integer weight() { return weight; }
        public String closeReason() { return closeReason; }
        public boolean typePresent() { return typePresent; }
        public boolean weightPresent() { return weightPresent; }
        public boolean closeReasonPresent() { return closeReasonPresent; }
    }
    public enum LinkType { RELATED, BLOCKS, DUPLICATES }
    public record TaskReference(String id, String key, String title, String status, long version) {}
    public record TaskLinkView(String id, String projectId, LinkType type, String sourceTaskId, String targetTaskId,
                               UserView createdBy, Instant createdAt, TaskReference sourceTask, TaskReference targetTask) {}
    public record LinkInput(String type, String targetTaskId, Long version, Long targetVersion) {}
    public record LinkPage(List<TaskLinkView> items, Pagination pagination) {}
    public record LinkMutation(TaskLinkView link, TaskView task, TaskView otherTask) {}
    public record LinkDeletion(TaskView task, TaskView otherTask) {}
    public record TaskAttachmentView(String id, String taskId, String commentId, String filename, String contentType,
                                     long sizeBytes, UserView author, Instant createdAt, boolean canDelete) {}
    public record AttachmentList(List<TaskAttachmentView> items) {}
    public enum ActivityType {
        TASK_CREATED, TASK_UPDATED, ASSIGNEES_CHANGED, COMMENT_ADDED, LINK_ADDED, LINK_REMOVED,
        ATTACHMENT_ADDED, ATTACHMENT_REMOVED
    }
    public enum ChangeField { status, priority, type, weight, closeReason, assignees }
    @JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "kind")
    @JsonSubTypes({
        @JsonSubTypes.Type(value = TextValue.class, name = "text"),
        @JsonSubTypes.Type(value = NumberValue.class, name = "number"),
        @JsonSubTypes.Type(value = UserIdsValue.class, name = "userIds")
    })
    public sealed interface ActivityValue permits TextValue, NumberValue, UserIdsValue {}
    public record TextValue(String value) implements ActivityValue {}
    public record NumberValue(Integer value) implements ActivityValue {}
    public record UserIdsValue(List<String> userIds) implements ActivityValue {}
    public record ActivityChange(ChangeField field, ActivityValue oldValue, ActivityValue newValue) {}
    // Snapshots deliberately have no FK to a possibly deleted link/other task/attachment.
    public record RelationActivity(String id, LinkType type, String sourceTaskId, String targetTaskId,
                                    String otherTaskId, String otherTaskKey) {}
    public record AttachmentActivity(String id, String filename, String contentType, long sizeBytes) {}
    public record TaskActivityView(String id, String taskId, UserView actor, Instant createdAt, ActivityType type,
                                   List<ActivityChange> changes, boolean titleChanged, boolean descriptionChanged,
                                   String commentId, RelationActivity relation, AttachmentActivity attachment,
                                   List<AttachmentActivity> attachments) {}
    public record ActivityPage(List<TaskActivityView> items, Pagination pagination) {}
    public record VersionInput(Long version) {}
    public record MemberInput(String userId) {}
    public record CommentInput(String content) {}
}
