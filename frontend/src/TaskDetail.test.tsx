import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { api, ApiError, write } from './api';
import { TaskDetail } from './TaskDetail';
import App from './App';
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
    it('isola tipos e ciclos; aplicação efetiva bloqueia mesmo após apagar e nova tarefa/reabertura reinicia', async () => {
      const confirmation = vi.spyOn(window, 'confirm').mockReturnValue(false);
      const { rerender, unmount } = render(<TaskDetail projectId="p" id="t" />);
      await screen.findByRole('heading', { name: 'Teste' });
      const description = screen.getByLabelText('Descrição');
      const apply = screen.getByRole('button', { name: 'Aplicar template' });
      for (const type of ['TASK', 'BUG', 'IMPROVEMENT'] as const) {
        await userEvent.selectOptions(screen.getByLabelText('Tipo'), type);
        expect(description).toHaveValue('Texto original');
        await userEvent.click(apply);
        expect(description).toHaveValue('Texto original');
        expect(apply).toBeEnabled();
        confirmation.mockReturnValueOnce(true);
        await userEvent.click(apply);
        expect(description).toHaveValue(taskTemplates[type]);
        expect(apply).toBeDisabled();
        fireEvent.change(description, { target: { value: '' } });
        fireEvent.click(apply);
        expect(description).toHaveValue('');
        expect(apply).toBeDisabled();
        fireEvent.change(description, { target: { value: 'Texto original' } });
      }
      await userEvent.selectOptions(screen.getByLabelText('Tipo'), 'TASK');
      expect(apply).toBeDisabled();
      const fallback = vi.mocked(api).getMockImplementation()!;
      vi.mocked(api).mockImplementation(async (path, init) => path.endsWith('/tasks/other') ? { ...task, id: 'other' } : fallback(path, init));
      rerender(<TaskDetail projectId="p" id="other" />);
      await waitFor(() => expect(screen.getByRole('button', { name: 'Aplicar template' })).toBeEnabled());
      unmount();
      render(<TaskDetail projectId="p" id="t" />);
      await screen.findByRole('heading', { name: 'Teste' });
      expect(screen.getByRole('button', { name: 'Aplicar template' })).toBeEnabled();
      confirmation.mockRestore();
    });

    it.each([false, true])('preserva conjunto no PUT, refetch limpo/sujo, erro GET e recuperação (sujo=%s)', async dirty => {
      let current = { ...task, description: '' };
      let failGet = false;
      const fallback = vi.mocked(api).getMockImplementation()!;
      vi.mocked(api).mockImplementation(async (path, init) => {
        if (path.endsWith('/tasks/t')) {
          if (failGet) throw new Error('GET indisponível.');
          return current;
        }
        return fallback(path, init);
      });
      vi.mocked(write).mockImplementation(async (_path, method, body) => {
        if (method === 'PUT') { current = { ...current, ...body as Partial<Task>, version: current.version + 1 }; return current; }
        return {};
      });
      render(<TaskDetail projectId="p" id="t" />);
      await screen.findByRole('heading', { name: 'Teste' });
      const description = screen.getByLabelText('Descrição');
      await userEvent.click(screen.getByRole('button', { name: 'Aplicar template' }));
      await userEvent.click(screen.getByRole('button', { name: 'Guardar tarefa' }));
      await screen.findByText('Alteração guardada.');
      await waitFor(() => expect(screen.queryByText('A atualizar detalhe… Os rascunhos mantêm-se.')).not.toBeInTheDocument());
      await waitFor(() => expect(screen.getByRole('button', { name: 'Guardar tarefa' })).toBeEnabled());
      expect(screen.getByRole('button', { name: 'Aplicar template' })).toBeDisabled();
      if (dirty) fireEvent.change(description, { target: { value: 'Local' } });
      current = { ...current, description: 'Externa', version: 8 };
      async function comment() {
        fireEvent.change(screen.getByLabelText('Novo comentário'), { target: { value: 'Atualizar' } });
        await userEvent.click(screen.getByRole('button', { name: 'Adicionar comentário' }));
        await screen.findByText('Comentário adicionado.');
      }
      await comment();
      await waitFor(() => expect(description).toHaveValue(dirty ? 'Local' : 'Externa'));
      expect(screen.getByLabelText('Descrição')).toBe(description);
      expect(screen.getByRole('button', { name: 'Aplicar template' })).toBeDisabled();
      failGet = true;
      await comment();
      await screen.findByText('GET indisponível.');
      expect(screen.getByLabelText('Descrição')).toBe(description);
      expect(screen.getByRole('button', { name: 'Aplicar template' })).toBeDisabled();
      failGet = false;
      await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
      await waitFor(() => expect(screen.queryByText('GET indisponível.')).not.toBeInTheDocument());
      vi.mocked(write).mockRejectedValueOnce(new ApiError('Conflito.', 409));
      await userEvent.click(screen.getByRole('button', { name: 'Guardar tarefa' }));
      await screen.findByText('Conflito.');
      expect(screen.getByRole('button', { name: 'Aplicar template' })).toBeDisabled();
      const confirmation = vi.spyOn(window, 'confirm').mockReturnValue(false);
      await userEvent.click(screen.getByRole('button', { name: 'Consultar versão atual (substitui o rascunho)' }));
      expect(description).toHaveValue(dirty ? 'Local' : 'Externa');
      confirmation.mockReturnValue(true);
      await userEvent.click(screen.getByRole('button', { name: 'Consultar versão atual (substitui o rascunho)' }));
      await screen.findByText('Versão atual consultada.');
      expect(description).toHaveValue('Externa');
      expect(screen.getByRole('button', { name: 'Aplicar template' })).toBeDisabled();
      confirmation.mockRestore();
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
  it('X standalone confirma uma vez por ação no routing real; cancelar conserva o rascunho e aceitar volta ao projeto', async () => {
    window.history.replaceState(null, '', '#/projects/p/tasks/t');
    const confirmation = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const navigation = vi.fn();
    window.addEventListener('hashchange', navigation);
    const project = { id: 'p', name: 'Projeto', description: '', currentRole: 'MEMBER' };
    const progress = { total: 0, todo: 0, inProgress: 0, done: 0, completedPercent: 0 };
    const fallback = vi.mocked(api).getMockImplementation()!;
    vi.mocked(api).mockImplementation(async (path, init) => {
      if (path === '/auth/me') return { id: 'u', displayName: 'Ana' };
      if (path === '/projects/p') return project;
      if (path.includes('/tasks?')) return { ...empty, project, progress };
      return fallback(path, init);
    });
    const { unmount } = render(<App />);
    try {
      await screen.findByRole('heading', { name: 'Teste' });
      const close = screen.getByRole('button', { name: 'Fechar detalhe' });
      expect(close).toHaveTextContent('');
      expect(close).toHaveAttribute('type', 'button');
      expect(close.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
      expect(close.querySelector('svg')).toHaveAttribute('focusable', 'false');
      expect(screen.queryByRole('link', { name: 'Abrir em página completa' })).not.toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Rascunho' } });
      const description = screen.getByLabelText('Descrição');
      await userEvent.click(close);
      await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });
      expect(confirmation).toHaveBeenCalledTimes(1);
      expect(window.location.hash).toBe('#/projects/p/tasks/t');
      expect(screen.getByLabelText('Descrição')).toBe(description);
      expect(description).toHaveValue('Rascunho');
      const navigationsBeforeAccepting = navigation.mock.calls.length;
      confirmation.mockReturnValueOnce(true);
      await userEvent.click(close);
      await waitFor(() => expect(navigation).toHaveBeenCalledTimes(navigationsBeforeAccepting + 1));
      expect(confirmation).toHaveBeenCalledTimes(2);
      expect(window.location.hash).toBe('#/projects/p');
      await screen.findByRole('heading', { name: 'Projeto' });
      expect(screen.queryByRole('button', { name: 'Fechar detalhe' })).not.toBeInTheDocument();
    } finally {
      unmount();
      window.removeEventListener('hashchange', navigation);
      confirmation.mockRestore();
      window.history.replaceState(null, '', '#/');
    }
  });

  it('mantém Guardar submit e Eliminar button na mesma linha lógica, confirmação, busy e erro sem submissão acidental', async () => {
    const confirmation = vi.spyOn(window, 'confirm').mockReturnValue(false);
    let reject!: (reason: unknown) => void;
    vi.mocked(write).mockImplementation(() => new Promise((_resolve, fail) => { reject = fail; }));
    render(<TaskDetail projectId="p" id="t" />);
    await screen.findByRole('heading', { name: 'Teste' });
    const save = screen.getByRole('button', { name: 'Guardar tarefa' });
    const remove = screen.getByRole('button', { name: 'Eliminar tarefa' });
    expect(save).toHaveAttribute('type', 'submit');
    expect(remove).toHaveAttribute('type', 'button');
    expect(remove.parentElement).toBe(save.parentElement);
    expect(remove.closest('form')).toBe(save.closest('form'));
    await userEvent.click(remove);
    expect(write).not.toHaveBeenCalled();
    confirmation.mockReturnValue(true);
    await userEvent.dblClick(remove);
    expect(write).toHaveBeenCalledExactlyOnceWith('/projects/p/tasks/t?version=3', 'DELETE');
    expect(save).toBeDisabled();
    expect(remove).toBeDisabled();
    reject(new ApiError('Eliminação recusada.', 409));
    await screen.findByText('Eliminação recusada.');
    expect(screen.getByLabelText('Descrição')).toHaveValue('Texto original');
    expect(save).toBeEnabled();
    confirmation.mockRestore();
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
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar template' }));
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Descrição em rascunho' } });
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
    expect(screen.getByRole('button', { name: 'Aplicar template' })).toBeDisabled();
    await screen.findByRole('heading', { name: 'Título em rascunho' });
    await waitFor(() => expect(screen.queryByText('A atualizar detalhe… Os rascunhos mantêm-se.')).not.toBeInTheDocument());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Guardar tarefa' })).toBeEnabled());
    await edit();
    await userEvent.click(screen.getByRole('button', { name: kind === 'responsáveis' ? 'Retirar Ana' : 'Remover relação MAT-10' }));
    await waitFor(() => expect(current.version).toBe(6));
    await waitFor(() => expect(screen.queryByRole('button', { name: kind === 'responsáveis' ? 'Retirar Ana' : 'Remover relação MAT-10' })).not.toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Guardar tarefa' }));
    await waitFor(() => expect(current.version).toBe(7));
    expect(screen.getByRole('button', { name: 'Aplicar template' })).toBeDisabled();
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
