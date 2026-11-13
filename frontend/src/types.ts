export interface User { id: string; displayName: string }
export interface Member extends User { active: boolean; role: 'MANAGER' | 'MEMBER' }
export interface Progress { total: number; todo: number; inProgress: number; done: number; completedPercent: number }
export interface Pagination { page: number; pageSize: number; totalItems: number; totalPages: number }
export interface Project {
  id: string; name: string; description: string; ownerUserId: string;
  currentRole: 'MANAGER' | 'MEMBER'; version: number; createdAt: string; progress: Progress;
}
export type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskType = 'TASK' | 'BUG' | 'IMPROVEMENT';
export type Weight = 1 | 2 | 3 | 5 | 8 | 13;
export type CloseReason = 'COMPLETED' | 'CANCELLED' | 'DUPLICATE' | 'WONT_DO';
export const typeLabels: Record<TaskType, string> = { TASK: 'Tarefa', BUG: 'Bug', IMPROVEMENT: 'Melhoria' };
export const closeLabels: Record<CloseReason, string> = { COMPLETED: 'Concluído', CANCELLED: 'Cancelado', DUPLICATE: 'Duplicado', WONT_DO: 'Não será feito' };
export const weights: Weight[] = [1, 2, 3, 5, 8, 13];
export interface Task {
  key: string; type: TaskType; weight: Weight | null; closeReason: CloseReason | null;
  id: string; projectId: string; title: string; description: string; status: Status;
  priority: Priority; assignees: User[]; version: number; createdAt: string; updatedAt: string;
}
export interface ProjectPage { items: Project[]; pagination: Pagination }
export interface TaskPage { project: Project; items: Task[]; pagination: Pagination; progress: Progress }
export interface Comment { id: string; taskId: string; author: User; content: string; createdAt: string; attachments: TaskAttachment[] }
export interface CommentPage { items: Comment[]; pagination: Pagination }
export interface Page<T> { items: T[]; pagination: Pagination }
export type LinkType = 'RELATED' | 'BLOCKS' | 'DUPLICATES';
export interface TaskReference { id: string; key: string; title: string; status: Status; version: number }
export interface TaskLink {
  id: string; projectId: string; type: LinkType; sourceTaskId: string; targetTaskId: string;
  sourceTask: TaskReference; targetTask: TaskReference; createdBy: User; createdAt: string;
}
export interface LinkMutation { task: Task; otherTask: Task; link?: TaskLink }
export interface TaskAttachment {
  id: string; taskId: string; commentId: string | null; filename: string; contentType: string;
  sizeBytes: number; author: User; createdAt: string; canDelete: boolean;
}
export type ActivityValue = { kind: 'text'; value: string | null } | { kind: 'number'; value: number | null } | { kind: 'userIds'; userIds: string[] };
type TextValue = Extract<ActivityValue, { kind: 'text' }>;
export type ActivityChange =
  | { field: 'status' | 'priority' | 'type' | 'closeReason'; oldValue: TextValue; newValue: TextValue }
  | { field: 'weight'; oldValue: Extract<ActivityValue, { kind: 'number' }>; newValue: Extract<ActivityValue, { kind: 'number' }> }
  | { field: 'assignees'; oldValue: Extract<ActivityValue, { kind: 'userIds' }>; newValue: Extract<ActivityValue, { kind: 'userIds' }> };
export interface AttachmentSnapshot { id: string; filename: string; contentType: string; sizeBytes: number }
export interface TaskEvent {
  id: string; taskId: string; actor: User; createdAt: string;
  type: 'TASK_CREATED' | 'TASK_UPDATED' | 'ASSIGNEES_CHANGED' | 'COMMENT_ADDED' | 'LINK_ADDED' | 'LINK_REMOVED' | 'ATTACHMENT_ADDED' | 'ATTACHMENT_REMOVED';
  changes: ActivityChange[]; titleChanged: boolean; descriptionChanged: boolean; commentId: string | null;
  relation: { id: string; type: LinkType; sourceTaskId: string; targetTaskId: string; otherTaskId: string; otherTaskKey: string } | null;
  attachment: AttachmentSnapshot | null; attachments: AttachmentSnapshot[];
}
export const statusLabels: Record<Status, string> = { TODO: 'Por fazer', IN_PROGRESS: 'Em curso', DONE: 'Concluída' };
export const priorityLabels: Record<Priority, string> = { LOW: 'Baixa', MEDIUM: 'Média', HIGH: 'Alta' };
