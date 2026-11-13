import { useState } from 'react';
import { api, ApiError, query, write } from './api';
import type { ActivityValue, Comment, CommentPage, Page, TaskEvent } from './types';
import { Feedback, FieldError, LoadState, Pager, submit, useMutation, useResource } from './ui';
import { MarkdownBody, MarkdownEditor } from './MarkdownEditor';
import { AttachmentList, FilePicker, uploadFiles } from './TaskAttachments';
import { codePoints } from './taskTemplates';
import { linkLabels } from './TaskLinks';

const eventLabels: Record<TaskEvent['type'], string> = {
  TASK_CREATED: 'Tarefa criada', TASK_UPDATED: 'Tarefa atualizada', ASSIGNEES_CHANGED: 'Responsáveis alterados',
  COMMENT_ADDED: 'Comentário adicionado', LINK_ADDED: 'Relação adicionada', LINK_REMOVED: 'Relação removida',
  ATTACHMENT_ADDED: 'Anexo adicionado', ATTACHMENT_REMOVED: 'Anexo removido',
};
function valueText(value: ActivityValue) {
  return value.kind === 'userIds' ? value.userIds.join(', ') || 'Nenhum' : String(value.value ?? 'Sem valor');
}
function CommentBody({ comment, base, changed }: { comment: Comment; base: string; changed: () => void }) {
  return <article className="comment" id={'comment-' + comment.id}>
    <strong>{comment.author.displayName}</strong> · <time dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleString('pt-PT')}</time>
    <MarkdownBody content={comment.content} /><AttachmentList base={base} items={comment.attachments} changed={changed} />
  </article>;
}
function ActivityComment({ event, base, comments, changed }: { event: TaskEvent; base: string; comments: Comment[]; changed: () => void }) {
  const [resolved, setResolved] = useState<Comment>();
  const [nextPage, setNextPage] = useState(1);
  const [finished, setFinished] = useState(false);
  const mutation = useMutation();
  const comment = comments.find(item => item.id === event.commentId) ?? resolved;
  if (comment) return <CommentBody comment={comment} base={base} changed={changed} />;
  return <article className="comment"><strong>{event.actor.displayName}</strong> · <time dateTime={event.createdAt}>{new Date(event.createdAt).toLocaleString('pt-PT')}</time>
    <p>Comentário {event.commentId} · conteúdo não carregado nesta página.</p><Feedback {...mutation} />
    <button disabled={mutation.busy || finished} onClick={() => void mutation.run(async () => {
      const result = await api<CommentPage>(base + '/comments?' + query({ page: nextPage }));
      setResolved(result.items.find(item => item.id === event.commentId));
      setFinished(nextPage >= result.pagination.totalPages); setNextPage(nextPage + 1);
    }, '')}>Procurar comentário na página {nextPage}</button>
    {finished && !resolved && <p>Comentário não encontrado nas páginas consultadas.</p>}
  </article>;
}
export function TaskActivity({ base, revision, changed, draft }: { base: string; revision: number; changed: () => void; draft: (dirty: boolean) => void }) {
  const [tab, setTab] = useState('Comentários');
  const [page, setPage] = useState(1);
  const [activityPage, setActivityPage] = useState(1);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const comments = useResource<CommentPage>(base + '/comments?' + query({ page }), revision);
  const activity = useResource<Page<TaskEvent>>(base + '/activity?' + query({ page: activityPage }), revision);
  const mutation = useMutation();
  const changeContent = (value: string) => { setContent(value); draft(!!value || files.length > 0); };
  const changeFiles = (value: File[]) => { setFiles(value); draft(!!content || value.length > 0); };
  const events = activity.data?.items.filter(event => tab !== 'Histórico' || event.type !== 'COMMENT_ADDED') ?? [];
  return <section className="card comments-card"><h2>Atividade</h2>
    <div className="editor-toolbar" aria-label="Vistas da atividade">{['Comentários', 'Histórico', 'Toda a atividade'].map(name =>
      <button key={name} aria-pressed={tab === name} onClick={() => setTab(name)}>{name}</button>)}</div>
    {tab === 'Comentários' ? <LoadState {...comments}>
      {!comments.data?.items.length && <p>Sem comentários.</p>}
      {comments.data?.items.map(comment => <CommentBody key={comment.id} comment={comment} base={base} changed={changed} />)}
      {comments.data && <Pager pagination={comments.data.pagination} change={setPage} />}
    </LoadState> : <LoadState {...activity}>
      {tab === 'Histórico' && <p>Histórico sem eventos de comentários. A paginação abaixo conta todos os eventos da API; uma página pode não conter alterações.</p>}
      {!events.length && <p>Sem eventos nesta página para esta vista.</p>}
      {events.map(event => event.type === 'COMMENT_ADDED'
        ? <ActivityComment key={event.id} event={event} base={base} comments={comments.data?.items ?? []} changed={changed} />
        : <article className="comment" key={event.id}><strong>{eventLabels[event.type]}</strong> · {event.actor.displayName} · <time dateTime={event.createdAt}>{new Date(event.createdAt).toLocaleString('pt-PT')}</time>
          {event.titleChanged && <p>Título alterado.</p>}{event.descriptionChanged && <p>Descrição alterada.</p>}
          <ul>{event.changes.map(change => <li key={change.field}>{change.field}: {valueText(change.oldValue)} → {valueText(change.newValue)}</li>)}</ul>
          {event.relation && <p>{linkLabels[event.relation.type]} · {event.relation.sourceTaskId === event.taskId ? 'Saída para' : 'Entrada de'} {event.relation.otherTaskKey}</p>}
          {event.attachment && <p>{event.attachment.filename} · {event.attachment.sizeBytes} bytes</p>}
        </article>)}
      {activity.data && <><p className="form-note">Paginação de todos os eventos, não uma contagem de comentários.</p><Pager pagination={activity.data.pagination} change={setActivityPage} /></>}
    </LoadState>}
    <Feedback {...mutation} />
    <form onSubmit={submit(() => void mutation.run(async () => {
      if (codePoints(content) < 1 || codePoints(content) > 2000) throw new ApiError('O comentário deve ter entre 1 e 2000 caracteres Unicode.', 422, { content: 'Reveja o texto.' });
      if (files.length) await uploadFiles(base + '/comments', files, content);
      else await write(base + '/comments', 'POST', { content });
      setContent(''); setFiles([]); draft(false); setTab('Comentários');
      if (comments.data) setPage(Math.ceil((comments.data.pagination.totalItems + 1) / comments.data.pagination.pageSize));
      changed();
    }, 'Comentário adicionado.'))}>
      <fieldset className="form-fields" disabled={mutation.busy}>
      <MarkdownEditor label="Novo comentário" required value={content} onChange={changeContent} />
      <FieldError field="content" errors={mutation.fields} />
      <FilePicker label="Ficheiros do comentário" files={files} change={changeFiles} disabled={mutation.busy} />
      <FieldError field="files" errors={mutation.fields} />
      <button disabled={mutation.busy}>{mutation.busy ? 'A enviar…' : 'Adicionar comentário'}</button>
      </fieldset>
    </form>
  </section>;
}
