CREATE SEQUENCE task_key_sequence;
ALTER TABLE task ADD COLUMN task_key VARCHAR(40);
WITH numbered AS (
    SELECT id, row_number() OVER (ORDER BY created_at,id) AS n FROM task
)
UPDATE task SET task_key='MAT-' || numbered.n FROM numbered WHERE task.id=numbered.id;
SELECT setval('task_key_sequence', COALESCE((SELECT count(*) FROM task),0)+1, false);
ALTER TABLE task ALTER COLUMN task_key SET DEFAULT ('MAT-' || nextval('task_key_sequence'));
ALTER TABLE task ALTER COLUMN task_key SET NOT NULL;
ALTER TABLE task ADD CONSTRAINT task_key_unique UNIQUE(task_key);
ALTER TABLE task ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'TASK' CHECK(type IN ('TASK','BUG','IMPROVEMENT'));
ALTER TABLE task ADD COLUMN weight INTEGER CHECK(weight IN (1,2,3,5,8,13));
ALTER TABLE task ADD COLUMN close_reason VARCHAR(20) CHECK(close_reason IN ('COMPLETED','CANCELLED','DUPLICATE','WONT_DO'));
ALTER TABLE task ADD CONSTRAINT task_close_reason_status CHECK(close_reason IS NULL OR status='DONE');

CREATE TABLE task_link (
    id VARCHAR(80) PRIMARY KEY,
    project_id VARCHAR(80) NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK(type IN ('RELATED','BLOCKS','DUPLICATES')),
    source_task_id VARCHAR(80) NOT NULL,
    target_task_id VARCHAR(80) NOT NULL,
    created_by VARCHAR(80) NOT NULL REFERENCES app_user(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(source_task_id,project_id) REFERENCES task(id,project_id) ON DELETE CASCADE,
    FOREIGN KEY(target_task_id,project_id) REFERENCES task(id,project_id) ON DELETE CASCADE,
    CHECK(source_task_id<>target_task_id),
    CHECK(type<>'RELATED' OR source_task_id<target_task_id),
    UNIQUE(type,source_task_id,target_task_id)
);
CREATE INDEX link_source_order ON task_link(source_task_id,created_at,id);
CREATE INDEX link_target_order ON task_link(target_task_id,created_at,id);

ALTER TABLE task_comment ADD CONSTRAINT comment_task_unique UNIQUE(id,task_id);
CREATE TABLE task_attachment (
    id VARCHAR(80) PRIMARY KEY,
    task_id VARCHAR(80) NOT NULL REFERENCES task(id) ON DELETE CASCADE,
    comment_id VARCHAR(80),
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(80) NOT NULL,
    size_bytes INTEGER NOT NULL CHECK(size_bytes BETWEEN 1 AND 4194304),
    data BYTEA NOT NULL CHECK(octet_length(data)=size_bytes),
    author_id VARCHAR(80) NOT NULL REFERENCES app_user(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(comment_id,task_id) REFERENCES task_comment(id,task_id) ON DELETE CASCADE
);
CREATE INDEX attachment_task_order ON task_attachment(task_id,created_at,id);
CREATE INDEX attachment_comment_order ON task_attachment(comment_id,created_at,id);

CREATE TABLE task_activity (
    id VARCHAR(80) PRIMARY KEY,
    task_id VARCHAR(80) NOT NULL REFERENCES task(id) ON DELETE CASCADE,
    actor_id VARCHAR(80) NOT NULL REFERENCES app_user(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(30) NOT NULL CHECK(type IN ('TASK_CREATED','TASK_UPDATED','ASSIGNEES_CHANGED','COMMENT_ADDED',
        'LINK_ADDED','LINK_REMOVED','ATTACHMENT_ADDED','ATTACHMENT_REMOVED')),
    payload JSONB NOT NULL
);
CREATE INDEX activity_task_order ON task_activity(task_id,created_at,id);
