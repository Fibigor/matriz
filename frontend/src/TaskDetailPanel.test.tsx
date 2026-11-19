import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskDetailPanel } from './TaskDetailPanel';
import { TaskDetail } from './TaskDetail';
import App from './App';
import { api, ApiError, write } from './api';
import type { Project, Task } from './types';
vi.mock('./api', async () => ({ ...await vi.importActual<typeof import('./api')>('./api'), api: vi.fn(), write: vi.fn() }));

describe('Painel de detalhe', () => {
  it('Guardar pendente recupera foco em revisão e conclusão; Escape fecha e devolve ao link', async () => {
    vi.resetAllMocks();
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    window.history.replaceState(null, '', '#/projects/p');
    const project: Project = { id: 'p', name: 'Projeto foco', description: '', ownerUserId: 'u', currentRole: 'MEMBER', version: 1, createdAt: '',
      progress: { total: 1, todo: 1, inProgress: 0, inReview: 0, done: 0, completedPercent: 0 } };
    let current: Task = { id: 't', projectId: 'p', key: 'MAT-1', title: 'Tarefa foco', description: '', type: 'TASK', weight: null,
      closeReason: null, status: 'TODO', priority: 'MEDIUM', assignees: [], version: 1, createdAt: '', updatedAt: '' };
    const pagination = { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 };
    vi.mocked(api).mockImplementation(async path => {
      if (path === '/auth/me') return { id: 'u', displayName: 'Ana' };
      if (path === '/projects/p') return project;
      if (path === '/projects/p/tasks/t') return current;
      if (path.includes('/tasks?')) return { project, items: [current], pagination, progress: project.progress };
      if (path.endsWith('/members')) return [];
      if (path.endsWith('/attachments')) return { items: [] };
      return { items: [], pagination: { ...pagination, totalItems: 0, totalPages: 0 } };
    });
    const confirmation = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { unmount } = render(<App />);
    const origin = await screen.findByRole('link', { name: 'Tarefa foco' });
    await userEvent.click(origin);
    await screen.findByRole('heading', { name: 'Tarefa foco' });
    for (const status of ['IN_REVIEW', 'DONE'] as const) {
      await userEvent.selectOptions(screen.getByLabelText('Estado'), status);
      let resolve!: (saved: Task) => void;
      vi.mocked(write).mockImplementationOnce(() => new Promise(confirm => { resolve = confirm; }));
      const button = screen.getByRole('button', { name: 'Guardar tarefa' });
      await userEvent.click(button);
      expect(button).toBeDisabled();
      // JSDOM cannot blur a disabled button. Model loss to BODY while pending,
      // not recovery: no test focuses the editor after the response.
      document.body.tabIndex = -1;
      document.body.focus();
      document.body.removeAttribute('tabindex');
      expect(document.body).toHaveFocus();
      fireEvent.submit(button.closest('form')!);
      expect(write).toHaveBeenCalledTimes(status === 'IN_REVIEW' ? 1 : 2);
      current = { ...current, status, version: current.version + 1 };
      await act(async () => resolve(current));
      await screen.findByText('Alteração guardada.');
      expect(button).toBeEnabled();
      expect(button).toHaveFocus();
      expect(within(screen.getByLabelText('Estado')).getByRole('option', { name: 'Concluída' })).toBeEnabled();
    }
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    // Saving refreshes the list; the panel also restores the matching task link
    // when the original node was replaced by that refresh.
    expect(await screen.findByRole('link', { name: 'Tarefa foco' })).toHaveFocus();
    expect(confirmation).not.toHaveBeenCalled();
    unmount(); confirmation.mockRestore(); vi.unstubAllGlobals();
    window.history.replaceState(null, '', '#/');
  });
  it.each(['DONE', 'IN_REVIEW'] as const)('mantém manutenção/reabertura e erro BLOCKS alcançável no painel com base %s', async status => {
    vi.resetAllMocks();
    const current: Task = { id: 't', projectId: 'p', key: 'MAT-1', title: 'Compatibilidade painel', description: '', status,
      type: 'TASK', weight: null, closeReason: status === 'DONE' ? 'CANCELLED' : null,
      priority: 'MEDIUM', assignees: [], version: 3, createdAt: '', updatedAt: '' };
    const empty = { items: [], pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 } };
    vi.mocked(api).mockImplementation(async path => {
      if (path === '/projects/p/tasks/t') return current;
      if (path === '/projects/p') return { id: 'p', currentRole: 'MEMBER' };
      if (path.endsWith('/members')) return [];
      if (path.endsWith('/attachments')) return { items: [] };
      return empty;
    });
    vi.mocked(write).mockRejectedValue(new ApiError('BLOCKS: MAT-2.', 422));
    render(<TaskDetailPanel close={vi.fn()}><TaskDetail projectId="p" id="t" standalone={false} /></TaskDetailPanel>);
    await screen.findByRole('heading', { name: 'Compatibilidade painel' });
    expect(screen.getByRole('option', { name: 'Concluída' })).toBeEnabled();
    if (status === 'DONE') expect(screen.getByLabelText('Motivo de fecho')).toHaveValue('CANCELLED');
    await userEvent.selectOptions(screen.getByLabelText('Estado'), status === 'DONE' ? 'IN_REVIEW' : 'DONE');
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Rascunho' } });
    await userEvent.click(screen.getByRole('button', { name: 'Guardar tarefa' }));
    await screen.findByText('BLOCKS: MAT-2.');
    expect(write).toHaveBeenCalledExactlyOnceWith('/projects/p/tasks/t', 'PUT', expect.objectContaining({
      version: 3, status: status === 'DONE' ? 'IN_REVIEW' : 'DONE', closeReason: null,
    }));
    expect(screen.getByLabelText('Descrição')).toHaveValue('Rascunho');
    expect(screen.getByRole('option', { name: 'Concluída' })).toBeEnabled();
  });
  it('revisão obrigatória: painel/página e resize conservam base suja mesmo com revisão externa', async () => {
    vi.resetAllMocks();
    let current: Task = { id: 't', projectId: 'p', key: 'MAT-1', title: 'Revisão no painel', description: '', status: 'TODO',
      type: 'TASK', weight: null, closeReason: null, priority: 'MEDIUM', assignees: [], version: 1, createdAt: '', updatedAt: '' };
    const empty = { items: [], pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 } };
    vi.mocked(api).mockImplementation(async path => {
      if (path === '/projects/p/tasks/t') return current;
      if (path === '/projects/p') return { id: 'p', currentRole: 'MEMBER' };
      if (path.endsWith('/members')) return [];
      if (path.endsWith('/attachments')) return { items: [] };
      return empty;
    });
    const close = vi.fn();
    const { rerender } = render(<TaskDetailPanel close={close}><TaskDetail projectId="p" id="t" standalone={false} /></TaskDetailPanel>);
    await screen.findByRole('heading', { name: 'Revisão no painel' });
    const description = screen.getByLabelText('Descrição');
    fireEvent.change(description, { target: { value: 'Local' } });
    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'IN_REVIEW');
    current = { ...current, status: 'IN_REVIEW', version: 2 };
    vi.mocked(write).mockResolvedValue({});
    fireEvent.change(screen.getByLabelText('Novo comentário'), { target: { value: 'Atualizar' } });
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar comentário' }));
    await screen.findByText('Comentário adicionado.');
    await waitFor(() => expect(screen.queryByText('A atualizar detalhe… Os rascunhos mantêm-se.')).not.toBeInTheDocument());
    rerender(<TaskDetailPanel close={close} full><TaskDetail projectId="p" id="t" standalone={false} /></TaskDetailPanel>);
    fireEvent(window, new Event('resize'));
    expect(screen.getByLabelText('Descrição')).toBe(description);
    expect(screen.getByRole('option', { name: 'Concluída' })).toBeDisabled();
    expect(description).toHaveValue('Local');
    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'DONE');
    expect(screen.getByLabelText('Estado')).toHaveValue('IN_REVIEW');
    expect(write).toHaveBeenCalledTimes(1);
  });
  it('isola o fundo, foca fecho, Escape fecha e devolve foco', async () => {
    const origin = document.createElement('button'); origin.textContent = 'Origem'; document.body.append(origin); origin.focus();
    const close = vi.fn();
    const { unmount } = render(<TaskDetailPanel close={close}><input aria-label="Rascunho" /></TaskDetailPanel>);
    expect(screen.getByRole('button', { name: 'Fechar detalhe' })).toHaveFocus();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    await userEvent.keyboard('{Escape}');
    expect(close).toHaveBeenCalledTimes(1);
    unmount(); expect(origin).toHaveFocus(); origin.remove();
  });
  it('respeita recusa do guard e mantém a mesma árvore ao passar a página completa', () => {
    const guard = (event: Event) => event.preventDefault();
    window.addEventListener('task-close-request', guard);
    const close = vi.fn();
    const { rerender } = render(<TaskDetailPanel close={close}><input aria-label="Texto" defaultValue="Rascunho" /></TaskDetailPanel>);
    const input = screen.getByLabelText('Texto');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(close).not.toHaveBeenCalled();
    rerender(<TaskDetailPanel close={close} full><input aria-label="Texto" defaultValue="Rascunho" /></TaskDetailPanel>);
    expect(screen.getByLabelText('Texto')).toBe(input);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    window.removeEventListener('task-close-request', guard);
  });
  it('mantém inert e trap Tab/Shift+Tab só no painel, libertando-os em página completa', async () => {
    window.history.replaceState(null, '', '#/projects/p/tasks/t');
    const rectangle = new DOMRect(0, 0, 40, 40);
    const rectangles = vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue({
      0: rectangle, length: 1, item: index => index === 0 ? rectangle : null, [Symbol.iterator]: () => [rectangle].values(),
    });
    const close = vi.fn();
    const { rerender } = render(<><button>Área de trabalho</button><TaskDetailPanel close={close}><input aria-label="Último campo" /></TaskDetailPanel></>);
    const background = screen.getByRole('button', { name: 'Área de trabalho' });
    const first = screen.getByRole('link', { name: 'Abrir em página completa' });
    const last = screen.getByLabelText('Último campo');
    expect(background.inert).toBe(true);
    last.focus();
    await userEvent.tab();
    expect(first).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(last).toHaveFocus();
    rerender(<><button>Área de trabalho</button><TaskDetailPanel close={close} full><input aria-label="Último campo" /></TaskDetailPanel></>);
    expect(background.inert).toBe(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.keyDown(last, { key: 'Escape' });
    expect(close).not.toHaveBeenCalled();
    expect(fireEvent.keyDown(last, { key: 'Tab' })).toBe(true);
    rectangles.mockRestore();
    window.history.replaceState(null, '', '#/');
  });
  it('toolbar tem apenas ícones, mantém href/modificadores e só oferece maximizar com destino', () => {
    window.history.replaceState(null, '', '#/projects/p/tasks/t');
    const fullPage = vi.fn();
    window.addEventListener('task-full-page', fullPage);
    const close = vi.fn();
    const { rerender } = render(<TaskDetailPanel close={close}><input aria-label="Rascunho" /></TaskDetailPanel>);
    const maximize = screen.getByRole('link', { name: 'Abrir em página completa' });
    const dismiss = screen.getByRole('button', { name: 'Fechar detalhe' });
    expect(maximize).toHaveAttribute('href', '#/projects/p/tasks/t');
    expect(maximize).toHaveAttribute('data-task-preserve', 'true');
    for (const action of [maximize, dismiss]) {
      expect(action.textContent).toBe('');
      expect(action.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
      expect(action.querySelector('svg')).toHaveAttribute('focusable', 'false');
    }
    expect(dismiss).toHaveFocus();
    const nativeNavigation = vi.fn((event: MouseEvent) => {
      expect(event.defaultPrevented).toBe(false);
      event.preventDefault();
    });
    document.addEventListener('click', nativeNavigation, { once: true });
    fireEvent.click(maximize, { ctrlKey: true });
    expect(nativeNavigation).toHaveBeenCalledTimes(1);
    expect(fullPage).not.toHaveBeenCalled();
    expect(fireEvent.click(maximize)).toBe(false);
    expect(fullPage).toHaveBeenCalledTimes(1);
    rerender(<TaskDetailPanel close={close} full><input aria-label="Rascunho" /></TaskDetailPanel>);
    expect(screen.queryByRole('link', { name: 'Abrir em página completa' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Fechar detalhe' })).toHaveLength(1);
    window.removeEventListener('task-full-page', fullPage);
    window.history.replaceState(null, '', '#/');
  });
  it('App conserva contexto, guards e foco ao maximizar, fechar e reabrir o painel', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    window.history.replaceState(null, '', '#/projects/p');
    const project: Project = { id: 'p', name: 'Projeto contexto', description: '', ownerUserId: 'u', currentRole: 'MEMBER', version: 1, createdAt: '', progress: { total: 1, todo: 1, inProgress: 0, inReview: 0, done: 0, completedPercent: 0 } };
    const task: Task = { id: 't', projectId: 'p', key: 'MAT-1', title: 'Tarefa painel', description: '', type: 'TASK', weight: null, closeReason: null, status: 'TODO', priority: 'MEDIUM', assignees: [], version: 1, createdAt: '', updatedAt: '' };
    const pagination = { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 };
    vi.mocked(api).mockImplementation(async path => {
      if (path === '/auth/me') return { id: 'u', displayName: 'Ana' };
      if (path === '/projects/p') return project;
      if (path === '/projects/p/tasks/t') return task;
      if (path.includes('/tasks?')) return { project, items: [task], pagination, progress: project.progress };
      if (path.endsWith('/members')) return [];
      if (path.endsWith('/attachments')) return { items: [] };
      if (path.includes('/comments?') || path.includes('/activity?') || path.includes('/links?')) return { items: [], pagination: { ...pagination, totalItems: 0, totalPages: 0 } };
      throw new Error('Rota não prevista: ' + path);
    });
    const confirmation = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { unmount } = render(<App />);
    const origin = await screen.findByRole('link', { name: 'Tarefa painel' });
    await userEvent.click(origin);
    await screen.findByRole('dialog', { name: 'Detalhe da tarefa' });
    expect(screen.getAllByRole('button', { name: 'Fechar detalhe' })).toHaveLength(1);
    await userEvent.click(screen.getAllByRole('button', { name: 'Aplicar template' }).at(-1)!);
    const description = screen.getAllByLabelText('Descrição').at(-1)!;
    await userEvent.type(await screen.findByLabelText('Novo comentário'), 'Preservado');
    const textarea = screen.getByLabelText('Novo comentário');
    window.location.hash = '/projects';
    await waitFor(() => expect(window.location.hash).toBe('#/projects/p/tasks/t'));
    expect(confirmation).toHaveBeenCalledTimes(1);
    expect(textarea).toHaveValue('Preservado');
    expect(screen.getAllByRole('button', { name: 'Aplicar template' }).at(-1)).toBeDisabled();
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
    fireEvent(window, new Event('resize'));
    expect(screen.getAllByLabelText('Descrição').at(-1)).toBe(description);
    expect(screen.getAllByRole('button', { name: 'Aplicar template' }).at(-1)).toBeDisabled();
    await userEvent.click(screen.getByRole('link', { name: 'Abrir em página completa' }));
    expect(screen.queryByRole('dialog', { name: 'Detalhe da tarefa' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Fechar detalhe' })).toHaveLength(1);
    expect(screen.getByLabelText('Novo comentário')).toBe(textarea);
    expect(screen.getAllByLabelText('Descrição').at(-1)).toBe(description);
    expect(screen.getByRole('button', { name: 'Aplicar template' })).toBeDisabled();
    expect(confirmation).toHaveBeenCalledTimes(1);
    confirmation.mockReturnValue(true);
    await userEvent.click(screen.getByRole('button', { name: 'Fechar detalhe' }));
    await waitFor(() => expect(window.location.hash).toBe('#/projects/p'));
    expect(await screen.findByRole('link', { name: 'Tarefa painel' })).toBe(origin);
    expect(confirmation).toHaveBeenCalledTimes(2);
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    await userEvent.click(origin);
    await screen.findByRole('dialog', { name: 'Detalhe da tarefa' });
    expect(screen.getByRole('button', { name: 'Fechar detalhe' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('link', { name: 'Tarefa painel' })).toBe(origin);
    expect(origin).toHaveFocus();
    expect(confirmation).toHaveBeenCalledTimes(2);
    await userEvent.click(origin);
    await userEvent.type(await screen.findByLabelText('Novo comentário'), 'Novo rascunho');
    confirmation.mockReturnValue(false);
    window.location.hash = '/projects';
    await waitFor(() => expect(window.location.hash).toBe('#/projects/p/tasks/t'));
    expect(confirmation).toHaveBeenCalledTimes(3);
    expect(screen.getByLabelText('Novo comentário')).toHaveValue('Novo rascunho');
    confirmation.mockReturnValue(true);
    await userEvent.click(screen.getByRole('button', { name: 'Fechar detalhe' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(origin).toHaveFocus();
    expect(confirmation).toHaveBeenCalledTimes(4);
    unmount(); confirmation.mockRestore(); vi.unstubAllGlobals();
    window.history.replaceState(null, '', '#/');
  });
});
