import { useEffect, useState } from 'react';
import { query, write } from './api';
import { Members, ProjectSettings } from './Projects';
import type { Member, Priority, Project, Task, TaskPage, TaskType, Weight } from './types';
import { priorityLabels, statusLabels, typeLabels, weights } from './types';
import { MarkdownEditor } from './MarkdownEditor';
import { taskTemplates, codePoints } from './taskTemplates';
import { Feedback, FieldError, LoadState, Pager, ProgressCard, submit, useMutation, useResource } from './ui';

export function TaskList({ data }: { data: TaskPage }) {
  if (!data.items.length) return <p className="empty-state">Sem tarefas para os critérios selecionados.</p>;
  return <div className="table-scroll"><table><thead><tr><th>Chave / Tipo / Peso</th><th>Tarefa</th><th>Estado</th><th>Prioridade</th><th>Responsáveis</th></tr></thead>
    <tbody>{data.items.map(task => <tr key={task.id}>
      <td>{task.key} · {typeLabels[task.type]} · {task.weight ?? 'Sem peso'}</td>
      <td><a href={`#/projects/${task.projectId}/tasks/${task.id}`}>{task.title}</a></td>
      <td><span className="status-badge" data-status={task.status}>{statusLabels[task.status]}</span></td>
      <td><span className="priority-label" data-priority={task.priority}>{priorityLabels[task.priority]}</span></td>
      <td>{task.assignees.map(person => person.displayName).join(', ') || 'Sem responsáveis'}</td>
    </tr>)}</tbody></table></div>;
}

export function NewTask({ projectId, changed }: { projectId: string; changed: (task: Task) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [type, setType] = useState<TaskType>('TASK');
  const [weight, setWeight] = useState<Weight | null>(null);
  const mutation = useMutation();
  return <section className="card new-task-card"><p className="eyebrow">O próximo passo</p><h2>Nova tarefa</h2><Feedback {...mutation} />
    <form onSubmit={submit(() => void mutation.run(async () => {
      if (codePoints(description) > 2000) throw new Error('Descrição: máximo 2000 caracteres Unicode.');
      const task = await write<Task>(`/projects/${projectId}/tasks`, 'POST', { title, description, priority, type, weight });
      setTitle(''); setDescription(''); changed(task);
    }, 'Tarefa criada. A listagem e o progresso serão atualizados; os filtros mantêm-se.'))}>
      <fieldset className="form-fields" disabled={mutation.busy}>
      <label>Título *<input required value={title} onChange={event => setTitle(event.target.value)} /></label><FieldError field="title" errors={mutation.fields} />
      <label>Tipo<select value={type} onChange={event => setType(event.target.value as TaskType)}>
        {Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></label><FieldError field="type" errors={mutation.fields} />
      <label>Peso<select value={weight ?? ''} onChange={event => setWeight(event.target.value ? Number(event.target.value) as Weight : null)}>
        <option value="">Sem peso</option>{weights.map(value => <option key={value}>{value}</option>)}
      </select></label><FieldError field="weight" errors={mutation.fields} />
      <button type="button" onClick={() => {
        if (!description.trim() || window.confirm('Substituir a descrição pelo template?')) setDescription(taskTemplates[type]);
      }}>Aplicar template</button>
      <MarkdownEditor label="Descrição" value={description} onChange={setDescription} /><FieldError field="description" errors={mutation.fields} />
      <label>Prioridade<select value={priority} onChange={event => setPriority(event.target.value as Priority)}>
        {Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></label>
      <p className="form-note">Estado inicial: Por fazer · Sem responsáveis</p>
      <button disabled={mutation.busy}>{mutation.busy ? 'A criar…' : 'Criar tarefa'}</button>
      </fieldset>
    </form>
  </section>;
}

export function ProjectDetail({ id }: { id: string }) {
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const resource = useResource<TaskPage>(`/projects/${id}/tasks?` + query({ status, priority, page }), revision);
  const changed = () => setRevision(value => value + 1);
  useEffect(() => {
    window.addEventListener('tasks-changed', changed);
    return () => window.removeEventListener('tasks-changed', changed);
  }, []);
  return <><nav className="breadcrumbs" aria-label="Localização"><a href="#/projects">← Projetos</a><span aria-hidden="true">/</span><span>Detalhe do projeto</span></nav>
    <div className="project-detail-layout"><div className="project-main">
    <LoadState {...resource}>{resource.data && <>
      <div className="page-heading"><div><p className="eyebrow">Detalhe do projeto</p>
        <h1>{resource.data.project.name}</h1><p className="muted plain-text">{resource.data.project.description}</p></div>
        <span className="role-badge">{resource.data.project.currentRole === 'MANAGER' ? 'Gestor' : 'Membro'}</span>
      </div>
      <ProgressCard progress={resource.data.progress} />
      <div className="management-grid">
      <ProjectSettings key={resource.data.project.id} project={resource.data.project} changed={changed} />
      <Members project={resource.data.project} revision={revision} />
      </div>
      <section className="card task-list-card"><div className="panel-heading"><div><p className="eyebrow">Trabalho em equipa</p><h2>Tarefas</h2></div></div>
      <div className="filters">
        <label>Filtrar por estado<select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}>
          <option value="">Todos os estados</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select></label>
        <label>Filtrar por prioridade<select value={priority} onChange={event => { setPriority(event.target.value); setPage(1); }}>
          <option value="">Todas as prioridades</option>{Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select></label>
      </div>
      <TaskList data={resource.data} /><Pager pagination={resource.data.pagination} change={setPage} />
      </section>
    </>}</LoadState>
    </div><div className="project-side">
    {resource.data && !resource.error && <NewTask projectId={id} changed={task => {
      const pagination = resource.data?.pagination;
      if (pagination && (!status || task.status === status) && (!priority || task.priority === priority)) {
        setPage(Math.ceil((pagination.totalItems + 1) / pagination.pageSize));
      }
      changed();
    }} />}
    </div></div>
  </>;
}

export type LocalTaskUpdate = { previousVersion: number; task: Task };

export function Assignments({ task, project, changed, draft }: { task: Task; project: Project; changed: (update?: LocalTaskUpdate) => void; draft?: (dirty: boolean) => void }) {
  const [target, setTarget] = useState('');
  const mutation = useMutation();
  const members = useResource<Member[]>('/projects/' + project.id + '/members');
  const eligible = members.data?.filter(person => person.active && !task.assignees.some(assigned => assigned.id === person.id)) ?? [];
  const manager = project.currentRole === 'MANAGER';
  useEffect(() => { draft?.(!!target); }, [target, draft]);
  return <section className="card"><p className="eyebrow">Quem faz acontecer</p><h2>Responsáveis</h2><Feedback {...mutation} />
    {!task.assignees.length && <p>Sem responsáveis.</p>}
    <ul>{task.assignees.map(person => <li key={person.id}>{person.displayName}{' '}
      {manager && <button disabled={mutation.busy} onClick={() => void mutation.run(async () => {
        const saved = await write<Task>(`/projects/${project.id}/tasks/${task.id}/assignments/${person.id}?version=${task.version}`, 'DELETE');
        changed({ previousVersion: task.version, task: saved });
      })}>Retirar {person.displayName}</button>}</li>)}</ul>
    {manager && <LoadState {...members}><form onSubmit={submit(() => void mutation.run(async () => {
      const saved = await write<Task>(`/projects/${project.id}/tasks/${task.id}/assignments/${target}`, 'PUT', { version: task.version });
      setTarget(''); changed({ previousVersion: task.version, task: saved });
    }))}>
      <label>Participante elegível<select required value={target} onChange={event => setTarget(event.target.value)}>
        <option value="">Selecionar participante</option>{eligible.map(person => <option key={person.id} value={person.id}>{person.displayName}</option>)}
      </select></label>
      <button disabled={mutation.busy || !target}>Atribuir responsável</button>
    </form></LoadState>}
  </section>;
}

export { TaskDetail } from './TaskDetail';
