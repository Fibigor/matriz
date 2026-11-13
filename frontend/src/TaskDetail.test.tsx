import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { api, ApiError, write } from './api';
import { TaskDetail } from './TaskDetail';
import type { Task, TaskLink } from './types';
import { taskTemplates } from './taskTemplates';
vi.mock('./api', async () => ({ ...await vi.importActual<typeof import('./api')>('./api'), api: vi.fn(), write: vi.fn() }));
const task: Task = { id: 't', projectId: 'p', key: 'MAT-9', title: 'Teste', description: 'Texto original', type: 'TASK', weight: null, closeReason: null, status: 'TODO', priority: 'MEDIUM', assignees: [], version: 3, createdAt: '', updatedAt: '' };
const empty = { items: [], pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 } };
describe('Detalhe partilhado', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api).mockImplementation(async path => {
      if (path.endsWith('/tasks/t')) return task;
      if (path === '/projects/p') return { id: 'p', name: 'Projeto', currentRole: 'MEMBER' };
      if (path.endsWith('/members')) return [];
      if (path.includes('/tasks?') || path.includes('/comments?') || path.includes('/activity?') || path.includes('/links?')) return empty;
      if (path.endsWith('/attachments')) return { items: [] };
      throw new Error('Rota não prevista: ' + path);
    });
  });
  it('não aplica template ao mudar tipo; substituição exige confirmação', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<TaskDetail projectId="p" id="t" />);
    await screen.findByRole('heading', { name: 'Teste' });
    await userEvent.selectOptions(screen.getByLabelText('Tipo'), 'BUG');
    expect(screen.getByLabelText('Descrição')).toHaveValue('Texto original');
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar template' }));
    expect(window.confirm).toHaveBeenCalled();
    expect(screen.getByLabelText('Descrição')).toHaveValue('Texto original');
    vi.mocked(window.confirm).mockReturnValue(true);
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar template' }));
    expect(screen.getByLabelText('Descrição')).toHaveValue(taskTemplates.BUG);
    expect(screen.queryByRole('button', { name: 'Atribuir responsável' })).not.toBeInTheDocument();
  });
  it('conserva rascunho e status no 422 com bloqueadores identificados pelo servidor', async () => {
    vi.mocked(write).mockRejectedValue(new ApiError('Bloqueadores pendentes: MAT-1, MAT-2.', 422, { status: 'Conclua MAT-1, MAT-2.' }));
    render(<TaskDetail projectId="p" id="t" />);
    await screen.findByRole('heading', { name: 'Teste' });
    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'DONE');
    await userEvent.selectOptions(screen.getByLabelText('Motivo de fecho'), 'CANCELLED');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar tarefa' }));
    expect(await screen.findByText('Bloqueadores pendentes: MAT-1, MAT-2.')).toBeInTheDocument();
    expect(screen.getByLabelText('Estado')).toHaveValue('DONE');
    expect(screen.getByLabelText('Motivo de fecho')).toHaveValue('CANCELLED');
    expect(write).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenCalledWith('/projects/p/tasks/t', 'PUT', expect.objectContaining({ version: 3, closeReason: 'CANCELLED' }));
  });
  it('protege fecho com rascunhos e não perde comentários ao atualizar a tarefa', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<TaskDetail projectId="p" id="t" />);
    await screen.findByRole('heading', { name: 'Teste' });
    await userEvent.type(screen.getByLabelText('Novo comentário'), 'Não perder');
    expect(window.dispatchEvent(new Event('task-close-request', { cancelable: true }))).toBe(false);
    vi.mocked(write).mockResolvedValue({ ...task, version: 4 });
    await userEvent.click(screen.getByRole('button', { name: 'Guardar tarefa' }));
    await screen.findByText('Alteração guardada.');
    expect(screen.getByLabelText('Novo comentário')).toHaveValue('Não perder');
    expect(window.dispatchEvent(new Event('task-close-request', { cancelable: true }))).toBe(false);
  });
  it('invalida a listagem e o progresso conservados atrás do painel após eliminar', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.mocked(write).mockResolvedValue(undefined);
    const changed = vi.fn(), deleted = vi.fn();
    window.addEventListener('tasks-changed', changed); window.addEventListener('task-deleted', deleted);
    render(<TaskDetail projectId="p" id="t" />);
    await screen.findByRole('heading', { name: 'Teste' });
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar tarefa' }));
    expect(write).toHaveBeenCalledWith('/projects/p/tasks/t?version=3', 'DELETE');
    expect(changed).toHaveBeenCalledTimes(1); expect(deleted).toHaveBeenCalledTimes(1);
    window.removeEventListener('tasks-changed', changed); window.removeEventListener('task-deleted', deleted);
    window.history.replaceState(null, '', '#/');
  });
  it.each(['responsáveis', 'relações'])('avança apenas a base local ao adicionar/remover %s sem perder campos do rascunho', async kind => {
    let current = { ...task };
    const other = { ...task, id: 'other', key: 'MAT-10', title: 'Outra tarefa' };
    const person = { id: 'u', displayName: 'Ana' };
    const link: TaskLink = { id: 'l', projectId: 'p', type: 'RELATED', sourceTaskId: 't', targetTaskId: 'other', sourceTask: task, targetTask: other, createdBy: person, createdAt: '' };
    let links: TaskLink[] = [];
    const fallback = vi.mocked(api).getMockImplementation()!;
    vi.mocked(api).mockImplementation(async (path, init) => {
      if (path.endsWith('/tasks/t')) return current;
      if (path.endsWith('/tasks/other')) return other;
      if (path === '/projects/p') return { id: 'p', name: 'Projeto', currentRole: 'MANAGER' };
      if (path.endsWith('/members')) return [{ ...person, active: true, role: 'MEMBER' }];
      if (path.includes('/tasks?')) return { ...empty, items: [other] };
      if (path.includes('/links?')) return { ...empty, items: links };
      return fallback(path, init);
    });
    vi.mocked(write).mockImplementation(async (path, method, body) => {
      const previousVersion = current.version;
      if (path.includes('/assignments/')) {
        expect(method === 'PUT' ? body : path).toEqual(method === 'PUT' ? { version: previousVersion } : expect.stringContaining(`version=${previousVersion}`));
        current = { ...current, version: previousVersion + 1, assignees: method === 'DELETE' ? [] : [person] };
        return current;
      }
      if (path.includes('/links')) {
        current = { ...current, version: previousVersion + 1 };
        links = method === 'DELETE' ? [] : [link];
        return { task: current, otherTask: other };
      }
      expect(body).toEqual(expect.objectContaining({ version: previousVersion, title: 'Título em rascunho', description: 'Descrição em rascunho', type: 'BUG', weight: 8 }));
      current = { ...current, ...body as Partial<Task>, version: previousVersion + 1 };
      return current;
    });
    render(<TaskDetail projectId="p" id="t" />);
    await screen.findByRole('heading', { name: 'Teste' });
    async function edit() {
      await userEvent.clear(screen.getByLabelText('Título *'));
      await userEvent.type(screen.getByLabelText('Título *'), 'Título em rascunho');
      await userEvent.clear(screen.getByLabelText('Descrição'));
      await userEvent.type(screen.getByLabelText('Descrição'), 'Descrição em rascunho');
      await userEvent.selectOptions(screen.getByLabelText('Tipo'), 'BUG');
      await userEvent.selectOptions(screen.getByLabelText('Peso'), '8');
    }
    await edit();
    if (kind === 'responsáveis') {
      await screen.findByRole('option', { name: 'Ana' });
      await userEvent.selectOptions(screen.getByLabelText('Participante elegível'), 'u');
      await userEvent.click(screen.getByRole('button', { name: 'Atribuir responsável' }));
      await screen.findByRole('button', { name: 'Retirar Ana' });
    } else {
      await screen.findByRole('option', { name: 'MAT-10 · Tarefa · Outra tarefa' });
      await userEvent.selectOptions(screen.getByLabelText('Tarefa de destino'), 'other');
      await userEvent.click(screen.getByRole('button', { name: 'Adicionar relação' }));
      await screen.findByRole('button', { name: 'Remover relação MAT-10' });
    }
    await userEvent.click(screen.getByRole('button', { name: 'Guardar tarefa' }));
    await waitFor(() => expect(current.version).toBe(5));
    await screen.findByRole('heading', { name: 'Título em rascunho' });
    await waitFor(() => expect(screen.queryByText('A atualizar detalhe… Os rascunhos mantêm-se.')).not.toBeInTheDocument());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Guardar tarefa' })).toBeEnabled());
    await edit();
    await userEvent.click(screen.getByRole('button', { name: kind === 'responsáveis' ? 'Retirar Ana' : 'Remover relação MAT-10' }));
    await waitFor(() => expect(current.version).toBe(6));
    await waitFor(() => expect(screen.queryByRole('button', { name: kind === 'responsáveis' ? 'Retirar Ana' : 'Remover relação MAT-10' })).not.toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Guardar tarefa' }));
    await waitFor(() => expect(current.version).toBe(7));
    expect(write).toHaveBeenCalledTimes(4);
  });
  it('não adota versão externa no preflight/refetch nem no 409; só descarta com confirmação explícita', async () => {
    let current = { ...task };
    const other = { ...task, id: 'other', key: 'MAT-10', title: 'Outra tarefa' };
    const fallback = vi.mocked(api).getMockImplementation()!;
    vi.mocked(api).mockImplementation(async (path, init) => {
      if (path.endsWith('/tasks/t')) return current;
      if (path.endsWith('/tasks/other')) return other;
      if (path.includes('/tasks?')) return { ...empty, items: [other] };
      return fallback(path, init);
    });
    vi.mocked(write).mockImplementation(async path => {
      if (path.endsWith('/links')) {
        current = { ...current, version: 5 };
        return { task: current, otherTask: other };
      }
      throw new ApiError('Versão desatualizada.', 409, { version: 'Consulte a versão atual.' });
    });
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<TaskDetail projectId="p" id="t" />);
    await screen.findByRole('heading', { name: 'Teste' });
    await userEvent.type(screen.getByLabelText('Título *'), ' rascunho');
    await userEvent.selectOptions(screen.getByLabelText('Tipo'), 'BUG');
    await userEvent.selectOptions(screen.getByLabelText('Peso'), '8');
    current = { ...current, version: 4, title: 'Título externo', type: 'IMPROVEMENT', weight: 13 };
    await userEvent.selectOptions(await screen.findByLabelText('Tarefa de destino'), 'other');
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar relação' }));
    await screen.findByRole('heading', { name: 'Título externo' });
    await userEvent.click(screen.getByRole('button', { name: 'Guardar tarefa' }));
    await screen.findByText('Consulte a versão atual.');
    const recovery = screen.getByRole('button', { name: 'Consultar versão atual (substitui o rascunho)' });
    await userEvent.click(recovery);
    expect(screen.getByLabelText('Título *')).toHaveValue('Teste rascunho');
    expect(screen.getByLabelText('Tipo')).toHaveValue('BUG');
    expect(screen.getByLabelText('Peso')).toHaveValue('8');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar tarefa' }));
    expect(vi.mocked(write).mock.calls.filter(([path]) => path.endsWith('/tasks/t'))).toEqual([
      ['/projects/p/tasks/t', 'PUT', expect.objectContaining({ version: 3, title: 'Teste rascunho' })],
      ['/projects/p/tasks/t', 'PUT', expect.objectContaining({ version: 3, title: 'Teste rascunho' })],
    ]);
    vi.mocked(window.confirm).mockReturnValue(true);
    await userEvent.click(await screen.findByRole('button', { name: 'Consultar versão atual (substitui o rascunho)' }));
    await waitFor(() => expect(screen.getByLabelText('Título *')).toHaveValue('Título externo'));
    expect(screen.getByLabelText('Tipo')).toHaveValue('IMPROVEMENT');
    expect(screen.getByLabelText('Peso')).toHaveValue('13');
  });
});
