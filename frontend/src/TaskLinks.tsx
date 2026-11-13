import { useEffect, useState } from 'react';
import { api, query, write } from './api';
import type { LinkMutation, LinkType, Page, Task, TaskLink, TaskPage } from './types';
import { statusLabels, typeLabels } from './types';
import { Feedback, FieldError, LoadState, Pager, submit, useMutation, useResource } from './ui';
import type { LocalTaskUpdate } from './Tasks';

export const linkLabels: Record<LinkType, string> = { RELATED: 'Relacionada', BLOCKS: 'Bloqueia', DUPLICATES: 'Duplica' };
export function TaskLinks({ task, revision, changed, draft }: { task: Task; revision: number; changed: (update?: LocalTaskUpdate) => void; draft?: (dirty: boolean) => void }) {
  const base = `/projects/${task.projectId}/tasks/${task.id}`;
  const [page, setPage] = useState(1);
  const [pickerPage, setPickerPage] = useState(1);
  const [search, setSearch] = useState('');
  const [target, setTarget] = useState<Task>();
  const [type, setType] = useState<LinkType>('RELATED');
  const resource = useResource<Page<TaskLink>>(base + '/links?' + query({ page }), revision);
  const candidates = useResource<TaskPage>(`/projects/${task.projectId}/tasks?` + query({ page: pickerPage }), revision);
  const mutation = useMutation();
  useEffect(() => { draft?.(!!target || !!search || type !== 'RELATED'); }, [target, search, type, draft]);
  const selected = candidates.data?.items.filter(item => item.id !== task.id && `${item.key} ${item.title}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())) ?? [];
  async function mutate(link?: TaskLink) {
    // Read both endpoints immediately before the explicit operation, never retry a rejected write.
    const otherId = link ? (link.sourceTaskId === task.id ? link.targetTaskId : link.sourceTaskId) : target?.id;
    if (!otherId || (!link && (candidates.loading || candidates.error))) throw new Error('Selecione uma tarefa de destino disponível antes de adicionar a relação.');
    const [current, other] = await Promise.all([api<Task>(base), api<Task>(`/projects/${task.projectId}/tasks/${otherId}`)]);
    const saved = link
      ? await write<LinkMutation>(`${base}/links/${link.id}?` + query({ version: current.version, targetVersion: other.version }), 'DELETE')
      : await write<LinkMutation>(base + '/links', 'POST', { type, targetTaskId: other.id, version: current.version, targetVersion: other.version });
    if (!link) { setTarget(undefined); setSearch(''); setType('RELATED'); }
    changed({ previousVersion: current.version, task: saved.task });
  }
  return <section className="card"><h2>Relações</h2><Feedback {...mutation} />
    <p>Bloquear não impede iniciar ou editar. Para concluir, todos os bloqueadores têm de estar concluídos; reabrir um bloqueador é recusado se algum dependente estiver concluído.</p>
    <LoadState {...resource}>
      {!resource.data?.items.length && <p>Sem relações.</p>}
      <ul>{resource.data?.items.map(link => {
        const outgoing = link.sourceTaskId === task.id;
        const other = outgoing ? link.targetTask : link.sourceTask;
        const direction = link.type === 'RELATED' ? 'Relacionada com' : link.type === 'BLOCKS' ? outgoing ? 'Bloqueia' : 'Bloqueada por' : outgoing ? 'Duplica' : 'Duplicada por';
        return <li key={link.id}>{direction}{' '}<a href={`#/projects/${task.projectId}/tasks/${other.id}`}>{other.key} · {other.title}</a>
          {' · '}{statusLabels[other.status]} · versões {link.sourceTask.key}: {link.sourceTask.version}, {link.targetTask.key}: {link.targetTask.version}
          {link.type === 'BLOCKS' && !outgoing && other.status !== 'DONE' && <strong> · Bloqueador pendente: {other.key}</strong>}{' '}
          {link.type === 'BLOCKS' && outgoing && other.status === 'DONE' && <strong> · Reabertura impedida por: {other.key}</strong>}{' '}
          <button disabled={mutation.busy} onClick={() => void mutation.run(() => mutate(link), 'Relação removida.')}>Remover relação {other.key}</button>
        </li>;
      })}</ul>
      {resource.data && <Pager pagination={resource.data.pagination} change={setPage} />}
    </LoadState>
    <LoadState {...candidates}><p className="form-note">Destinos consultados.</p></LoadState>
    <form onSubmit={submit(() => void mutation.run(() => mutate(), 'Relação adicionada.'))}>
      <fieldset className="form-fields" disabled={mutation.busy}>
      <label>Tipo de relação<select value={type} onChange={event => setType(event.target.value as LinkType)}>
        {Object.entries(linkLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></label>
      <label>Pesquisar chave MAT ou título nesta página<input value={search} onChange={event => { setSearch(event.target.value); setTarget(undefined); }} /></label>
      <p className="form-note">Tarefas acessíveis deste projeto, 20 por página. A pesquisa só filtra a página apresentada; percorra as páginas para encontrar outra chave.</p>
      <label>Tarefa de destino<select required disabled={candidates.loading || !!candidates.error} value={target?.id ?? ''} onChange={event => setTarget(candidates.data?.items.find(item => item.id === event.target.value))}>
        <option value="">Selecionar chave e título</option>
        {selected.map(item => <option key={item.id} value={item.id}>{item.key} · {typeLabels[item.type]} · {item.title}</option>)}
      </select></label>
      {['targetTaskId', 'targetVersion', 'version', 'type'].map(field => <FieldError key={field} field={field} errors={mutation.fields} />)}
      {!target && <p className="form-note">Selecione uma tarefa de destino para adicionar a relação.</p>}
      <button disabled={mutation.busy || !target || candidates.loading || !!candidates.error}>Adicionar relação</button>
      </fieldset>
    </form>
    {candidates.data && <Pager pagination={candidates.data.pagination} change={value => { setPickerPage(value); setTarget(undefined); }} />}
  </section>;
}
