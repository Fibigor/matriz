ALTER TABLE task DROP CONSTRAINT task_status_check;
ALTER TABLE task ADD CONSTRAINT task_status_check
    CHECK (status IN ('TODO','IN_PROGRESS','IN_REVIEW','DONE'));
