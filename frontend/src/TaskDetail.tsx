import { useEffect, useRef, useState } from 'react';
import { api, write } from './api';
import type { CloseReason, Priority, Project, Status, Task, TaskType, Weight } from './types';
import { closeLabels, priorityLabels, statusLabels, typeLabels, weights } from './types';
import { Feedback, FieldError, submit, useMutation, useResource } from './ui';
import { Assignments } from './Tasks';
import type { LocalTaskUpdate } from './Tasks';
import { MarkdownBody, MarkdownEditor } from './MarkdownEditor';
import { codePoints, taskTemplates } from './taskTemplates';
import { TaskLinks } from './TaskLinks';
import { TaskAttachments } from './TaskAttachments';
import { TaskActivity } from './TaskActivity';

function TaskEditor({ task, base, changed, draft, localUpdate }: { task: Task; base: string; changed: () => void; draft: (dirty: boolean) => void; localUpdate?: LocalTaskUpdate }) {
  const [values, setValues] = useState(task);
  const [dirty, setDirty] = useState(false);
  const mutation = useMutation();
  const received = useRef(task);
  useEffect(() => {
    if (!localUpdate) return;
    const { previousVersion, task: saved } = localUpdate;
    // Only the acknowledged local write can advance this draft's base.
    // A GET (including the preflight GET for links) is never such an acknowledgement.
    setValues(current => current.id === saved.id && current.version === previousVersion && saved.version >= previousVersion
      ? { ...current, version: saved.version, assignees: saved.assignees, updatedAt: saved.updatedAt }
      : current);
  }, [localUpdate]);
  useEffect(() => {
    if (received.current !== task) {
      received.current = task;
      if (!dirty) setValues(task);
    }
  }, [task, dirty]);
  function change<K extends keyof Task>(field: K, value: Task[K]) {
    setValues(current => ({ ...current, [field]: value, ...(field === 'status' && value !== 'DONE' ? { closeReason: null } : {}) }));
    setDirty(true); draft(true);
  }
  const fields = ['title', 'description', 'status', 'priority', 'type', 'weight', 'closeReason', 'version'];
  return <section className="card"><h2>Editar tarefa</h2><Feedback {...mutation} />
    <form onSubmit={submit(() => void mutation.run(async () => {
      if (codePoints(values.description) > 2000) throw new Error('Descrição: máximo 2000 caracteres Unicode.');
      const saved = await write<Task>(base, 'PUT', {
        title: values.title, description: values.description, status: values.status, priority: values.priority,
        type: values.type, weight: values.weight, closeReason: values.status === 'DONE' ? values.closeReason : null, version: values.version,
      });
      setValues(saved); setDirty(false); draft(false); changed();
    }))}>
      <fieldset className="form-fields" disabled={mutation.busy}>
      <label>Título *<input required value={values.title} onChange={event => change('title', event.target.value)} /></label>
      <label>Tipo<select value={values.type} onChange={event => change('type', event.target.value as TaskType)}>
        {Object.entries(typeLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
      </select></label>
      <label>Peso<select value={values.weight ?? ''} onChange={event => change('weight', event.target.value ? Number(event.target.value) as Weight : null)}>
        <option value="">Sem peso</option>{weights.map(value => <option key={value}>{value}</option>)}
      </select></label>
      <button type="button" onClick={() => {
        if (!values.description.trim() || window.confirm('Substituir a descrição pelo template?')) change('description', taskTemplates[values.type]);
      }}>Aplicar template</button>
      <MarkdownEditor label="Descrição" value={values.description} onChange={value => change('description', value)} />
      <label>Estado<select value={values.status} onChange={event => change('status', event.target.value as Status)}>
        {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></label>
      <label>Prioridade<select value={values.priority} onChange={event => change('priority', event.target.value as Priority)}>
        {Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></label>
      {values.status === 'DONE' && <label>Motivo de fecho<select value={values.closeReason ?? ''} onChange={event => change('closeReason', event.target.value ? event.target.value as CloseReason : null)}>
        <option value="">Sem motivo</option>{Object.entries(closeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></label>}
      {fields.map(field => <FieldError key={field} field={field} errors={mutation.fields} />)}
      <button disabled={mutation.busy}>Guardar tarefa</button>
      </fieldset>
    </form>
    {mutation.error && <><p>O rascunho foi mantido. Pode copiá-lo antes de consultar a versão atual; substituir exige confirmação.</p><button disabled={mutation.busy} onClick={() => {
      if (window.confirm('Substituir o rascunho pela versão atual?')) void mutation.run(async () => {
        setValues(await api<Task>(base)); setDirty(false); draft(false); changed();
      }, 'Versão atual consultada.');
    }}>Consultar versão atual (substitui o rascunho)</button></>}
    <button className="danger" disabled={mutation.busy} onClick={() => {
      if (window.confirm('Eliminar a tarefa, relações, anexos, comentários e atribuições?')) void mutation.run(async () => {
        await write(base + '?version=' + task.version, 'DELETE'); draft(false);
        window.dispatchEvent(new Event('tasks-changed'));
        window.dispatchEvent(new Event('task-deleted')); window.location.hash = '/projects/' + task.projectId;
      }, '');
    }}>Eliminar tarefa</button>
  </section>;
}

export function TaskDetail({ projectId, id }: { projectId: string; id: string }) {
  const [revision, setRevision] = useState(0);
  const [localUpdate, setLocalUpdate] = useState<LocalTaskUpdate>();
  const base = `/projects/${projectId}/tasks/${id}`;
  const task = useResource<Task>(base, revision);
  const project = useResource<Project>('/projects/' + projectId);
  const drafts = useRef<Record<string, boolean>>({});
  const changed = (update?: LocalTaskUpdate) => {
    if (update) setLocalUpdate(update);
    setRevision(value => value + 1); window.dispatchEvent(new Event('tasks-changed'));
  };
  const draft = (name: string) => (dirty: boolean) => { drafts.current[name] = dirty; };
  useEffect(() => {
    const hasDraft = () => Object.values(drafts.current).some(Boolean);
    const ask = () => !hasDraft() || window.confirm('Existem rascunhos não guardados. Sair e descartá-los?');
    const close = (event: Event) => { if (!ask()) event.preventDefault(); };
    const unload = (event: BeforeUnloadEvent) => { if (hasDraft()) { event.preventDefault(); event.returnValue = ''; } };
    const deleted = () => { drafts.current = {}; };
    window.addEventListener('task-close-request', close);
    window.addEventListener('beforeunload', unload); window.addEventListener('task-deleted', deleted);
    return () => {
      window.removeEventListener('task-close-request', close);
      window.removeEventListener('beforeunload', unload); window.removeEventListener('task-deleted', deleted);
    };
  }, []);
  return <><nav className="breadcrumbs" aria-label="Localização"><a href="#/projects">Projetos</a><span>/</span><a href={'#/projects/' + projectId}>← Projeto</a></nav>
    <Feedback error={task.error || project.error} />
    {task.data && task.loading && <p role="status">A atualizar detalhe… Os rascunhos mantêm-se.</p>}
    {(!task.data || !project.data) && <p role="status">{task.loading || project.loading ? 'A carregar…' : 'Detalhe indisponível.'}</p>}
    {(task.error || project.error) && <button onClick={() => { task.reload(); project.reload(); }}>Tentar novamente</button>}
    {task.data && project.data && <>
      <div className="page-heading"><div><p>{task.data.key} · {typeLabels[task.data.type]} · Peso: {task.data.weight ?? 'Sem peso'}</p>
        <h1>{task.data.title}</h1><p className="muted">{statusLabels[task.data.status]} · Prioridade {priorityLabels[task.data.priority]}</p>
        {task.data.closeReason && <p>Motivo: {closeLabels[task.data.closeReason]}</p>}
        <MarkdownBody content={task.data.description} />
      </div></div>
      <div className="task-detail-layout"><div>
        <TaskEditor task={task.data} base={base} changed={changed} draft={draft('editor')} localUpdate={localUpdate} />
        <Assignments task={task.data} project={project.data} changed={changed} draft={draft('assignees')} />
        <TaskLinks task={task.data} revision={revision} changed={changed} draft={draft('links')} />
        <TaskAttachments base={base} revision={revision} changed={changed} draft={draft('files')} />
      </div><div className="task-side"><TaskActivity base={base} revision={revision} changed={changed} draft={draft('comment')} /></div></div>
    </>}
  </>;
}
