import { useEffect, useRef, useState } from 'react';
import { ApiError, write, query } from './api';
import { validEmail } from './email';
import type { Project, ProjectPage, Member } from './types';
import { Feedback, FieldError, LoadState, Pager, submit, useMutation, useResource } from './ui';

function ProjectOverview({ projects }: { projects: Project[] }) {
  const [selectedId, setSelectedId] = useState('');
  const project = projects.find(item => item.id === selectedId) ?? projects[0];
  if (!project) return null;
  const { progress } = project;
  const states = [
    { key: 'todo', label: 'Por fazer', count: progress.todo },
    { key: 'doing', label: 'Em curso', count: progress.inProgress },
    { key: 'review', label: 'Em revisão', count: progress.inReview },
    { key: 'done', label: 'Concluídas', count: progress.done },
  ];
  const largest = Math.max(1, ...states.map(state => state.count));
  return <section className="dashboard-overview" aria-label="Resumo do projeto">
    <div className="card overview-card">
      <div className="panel-heading"><div><p className="eyebrow">Cada passo conta</p><h2>Progresso do projeto</h2></div>
        <label className="overview-picker">Projeto do resumo<select value={project.id} onChange={event => setSelectedId(event.target.value)}>
          {projects.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select></label>
      </div>
      <div className="overview-body">
        <div className="overview-summary"><p className="overview-project-name">{project.name}</p>
          <strong className="overview-percent">{progress.completedPercent}<span>%</span></strong>
          <p className="muted">do trabalho concluído</p>
          <p>{progress.total ? `${progress.done} de ${progress.total} tarefas concluídas` : 'Sem tarefas'}</p>
          <a className="text-link" href={'#/projects/' + project.id}>Abrir projeto <span aria-hidden="true">↗</span></a>
        </div>
        <div className="overview-chart">
          <p className="chart-caption">Distribuição atual das tarefas</p>
          <svg viewBox="0 0 640 160" role="img" aria-label={'Tarefas por estado de ' + project.name}>
            <title>Distribuição atual por estado</title>
            <desc>{states.map(state => `${state.label}: ${state.count}`).join('; ')}. Não é uma série temporal.</desc>
            {[32, 87, 142].map(y => <line key={y} x1="24" y1={y} x2="616" y2={y} className="chart-gridline" />)}
            {states.map((state, index) => {
              // Keep the highest value's baseline at 42, with room for the 32px mobile font.
              const height = state.count / largest * 88;
              const x = (index + .5) * 640 / states.length;
              return <g key={state.key} className={'chart-state state-' + state.key}>
                <rect x={x - 30} y={142 - height} width="60" height={height} rx="4" />
                <text x={x} y={130 - height} textAnchor="middle" className="chart-value">{state.count}</text>
              </g>;
            })}
          </svg>
          <ol className="chart-labels" aria-label="Estados das barras, da esquerda para a direita">
            {states.map(state => <li key={state.key}>{state.label}</li>)}
          </ol>
          <p className="chart-note">Contagens globais deste projeto, não apenas da página de tarefas.</p>
        </div>
      </div>
    </div>
    <div className="metrics-grid">{states.map(state => <article key={state.key} className={'card metric-card state-' + state.key}
      aria-label={`${state.label}: ${state.count}`}>
      <p className="metric-label"><span className="metric-dot" aria-hidden="true" />{state.label}</p>
      <strong>{state.count}</strong><span className="muted"> / {progress.total} tarefas</span>
      <progress value={state.count} max={Math.max(1, progress.total)} aria-label={state.label + ' no projeto ' + project.name} />
      <p className="metric-footnote">{project.name}</p>
    </article>)}</div>
  </section>;
}

export function Projects({ dashboard = false }: { dashboard?: boolean }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const nameInput = useRef<HTMLInputElement>(null);
  const resource = useResource<ProjectPage>('/projects?' + query({ search, page }), revision);
  const mutation = useMutation();
  return <>
    <nav className="breadcrumbs" aria-label="Localização"><span>Matriz</span><span aria-hidden="true">/</span><span>{dashboard ? 'Visão geral' : 'Projetos'}</span></nav>
    <div className="page-heading"><div><p className="eyebrow">{dashboard ? 'Visão geral' : 'Espaço de trabalho'}</p>
      <h1>{dashboard ? 'Painel inicial' : 'Projetos'}</h1>
      <p className="muted">{dashboard ? 'Uma visão clara do trabalho que move a sua equipa.' : 'Encontre o próximo desafio. Dê forma ao trabalho.'}</p>
    </div><button onClick={() => nameInput.current?.focus()}>+ Novo projeto</button></div>
    <nav className="workspace-tabs" aria-label="Vistas do espaço de trabalho">
      <a href="#/" aria-current={dashboard ? 'page' : undefined}>Visão geral</a>
      <a href="#/projects" aria-current={!dashboard ? 'page' : undefined}>Lista de projetos</a>
    </nav>
    <Feedback {...mutation} />
    <LoadState {...resource}>
      {dashboard && resource.data && <ProjectOverview projects={resource.data.items} />}
    </LoadState>
    <div className="projects-layout"><section className="project-collection">
    <div className="collection-heading"><div><p className="eyebrow">O trabalho, organizado</p><h2>Os seus projetos</h2></div>
      <label className="project-search">Pesquisar pelo nome<input type="search" placeholder="Encontrar projeto…" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} /></label>
    </div>
    <LoadState {...resource}>
      {!resource.data?.items.length && <p className="empty-state">Sem projetos acessíveis.</p>}
      {!!resource.data?.items.length && <div className="card project-table-card"><div className="table-scroll"><table className="project-table">
        <thead><tr><th>Nome do projeto</th><th>A sua função</th><th>Tarefas</th><th>Progresso</th></tr></thead>
        <tbody>{resource.data.items.map(project => <tr key={project.id}>
          <td><div className="project-name-cell"><span className="project-monogram" aria-hidden="true">{Array.from(project.name)[0]}</span>
            <div><a href={'#/projects/' + project.id}>{project.name}</a><p className="project-description">{project.description || 'Sem descrição.'}</p></div>
          </div></td>
          <td><span className="role-badge">{project.currentRole === 'MANAGER' ? 'Gestor' : 'Membro'}</span></td>
          <td>{project.progress.total}</td>
          <td><div className="table-progress"><progress value={project.progress.completedPercent} max={100} aria-label={'Percentagem concluída de ' + project.name} />
            <span>{project.progress.completedPercent}%</span></div></td>
        </tr>)}</tbody>
      </table></div></div>}
      {resource.data && <Pager pagination={resource.data.pagination} change={setPage} />}
    </LoadState>
    </section>
    <section className="card create-project-card"><p className="eyebrow">Comece algo novo</p><h2>Criar projeto</h2>
      <p className="muted">Um espaço para a próxima ideia da sua equipa.</p>
      <form onSubmit={submit(() => void mutation.run(async () => {
        const project = await write<Project>('/projects', 'POST', { name, description });
        const pagination = resource.data?.pagination;
        if (pagination && project.name.toLowerCase().includes(search.toLowerCase())) {
          setPage(Math.ceil((pagination.totalItems + 1) / pagination.pageSize));
        }
        setName(''); setDescription(''); setRevision(value => value + 1);
      }, 'Projeto criado. A listagem será atualizada; a pesquisa mantém-se.'))}>
        <label>Nome do projeto *<input ref={nameInput} required value={name} onChange={event => setName(event.target.value)} /></label><FieldError field="name" errors={mutation.fields} />
        <label>Descrição<textarea value={description} onChange={event => setDescription(event.target.value)} /></label><FieldError field="description" errors={mutation.fields} />
        <button disabled={mutation.busy}>{mutation.busy ? 'A criar…' : 'Criar projeto'}</button>
      </form>
    </section>
    </div>
  </>;
}

export function ProjectSettings({ project, changed }: { project: Project; changed: () => void }) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const mutation = useMutation();
  if (project.currentRole !== 'MANAGER') return null;
  return <details className="card management-card"><summary>Gerir projeto</summary><Feedback {...mutation} />
    <form onSubmit={submit(() => void mutation.run(async () => {
      await write('/projects/' + project.id, 'PUT', { name, description, version: project.version }); changed();
    }))}>
      <label>Nome<input required value={name} onChange={event => setName(event.target.value)} /></label><FieldError field="name" errors={mutation.fields} />
      <label>Descrição<textarea value={description} onChange={event => setDescription(event.target.value)} /></label><FieldError field="description" errors={mutation.fields} />
      <button disabled={mutation.busy}>Guardar projeto</button>
    </form>
    <button className="danger" disabled={mutation.busy} onClick={() => {
      if (window.confirm('Eliminar este projeto e todas as tarefas, comentários, atribuições e participações?')) {
        void mutation.run(async () => {
          await write('/projects/' + project.id + '?version=' + project.version, 'DELETE');
          window.location.hash = '/projects';
        });
      }
    }}>Eliminar projeto</button>
  </details>;
}

export function Members({ project, revision = 0 }: { project: Project; revision?: number }) {
  const [target, setTarget] = useState('');
  const emailInput = useRef<HTMLInputElement>(null);
  const members = useResource<Member[]>('/projects/' + project.id + '/members', revision);
  const mutation = useMutation();
  const manager = project.currentRole === 'MANAGER';
  const emailErrorId = `member-email-${project.id}-error`;
  useEffect(() => {
    if (!mutation.busy && mutation.fields.email) emailInput.current?.focus();
  }, [mutation.busy, mutation.fields]);
  return <details className="card management-card"><summary>Participantes do projeto</summary><Feedback {...mutation} />
    <LoadState {...members}><ul>{members.data?.map(member => <li key={member.id}>
      {member.displayName} · {member.role === 'MANAGER' ? 'Gestor' : 'Membro'}{!member.active && ' · Inativo'}{' '}
      {manager && member.role !== 'MANAGER' && <button disabled={mutation.busy} onClick={() => {
        if (window.confirm('Remover o acesso deste membro ao projeto?')) void mutation.run(async () => {
          await write('/projects/' + project.id + '/members/' + member.id, 'DELETE'); members.reload();
        });
      }}>Remover {member.displayName}</button>}
    </li>)}</ul></LoadState>
    {manager && <form noValidate aria-busy={mutation.busy} onSubmit={submit(() => void mutation.run(async () => {
      if (!validEmail(target)) {
        const message = 'Indique um email válido com até 254 caracteres.';
        throw new ApiError(message, 422, { email: message });
      }
      await write('/projects/' + project.id + '/members', 'POST', { email: target }); setTarget(''); members.reload();
    }, 'Participação confirmada. Adicionar novamente não cria duplicados.'))}>
      <label>Email completo do membro<input ref={emailInput} type="text" inputMode="email" autoComplete="off" autoCapitalize="none"
        required disabled={mutation.busy} aria-invalid={!!mutation.fields.email}
        aria-describedby={mutation.fields.email ? emailErrorId : undefined}
        value={target} onChange={event => setTarget(event.target.value)} placeholder="pessoa@example.invalid" /></label>
      {mutation.fields.email && <span id={emailErrorId} className="field-error" role="alert">{mutation.fields.email}</span>}
      <button disabled={mutation.busy}>Adicionar membro</button>
    </form>}
  </details>;
}
