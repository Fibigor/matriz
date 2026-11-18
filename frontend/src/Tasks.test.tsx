import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewTask, ProjectDetail, TaskDetail } from './Tasks';
import { Members, Projects } from './Projects';
import { api, ApiError, write } from './api';
import type { Member, Task, TaskPage } from './types';
import { taskTemplates } from './taskTemplates';

vi.mock('./api', async () => {
  const original = await vi.importActual<typeof import('./api')>('./api');
  return { ...original, api: vi.fn(), write: vi.fn() };
});

const page: TaskPage = {
  project: { id: 'alpha', name: 'Alfa', description: '', ownerUserId: 'ana', currentRole: 'MEMBER', version: 1, createdAt: '', progress: { total: 0, todo: 0, inProgress: 0, done: 0, completedPercent: 0 } },
  items: [], pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
  progress: { total: 0, todo: 0, inProgress: 0, done: 0, completedPercent: 0 },
};
const createdTask: Task = { id: 't1', projectId: 'alpha', title: 'Nova tarefa real', description: '', status: 'TODO',
  key: 'MAT-1', type: 'TASK', weight: null, closeReason: null,
  priority: 'MEDIUM', assignees: [], version: 1, createdAt: '', updatedAt: '' };

describe('Participantes por email completo', () => {
  const project = { ...page.project, currentRole: 'MANAGER' as const };
  const roster: Member[] = [
    { id: 'ana', displayName: 'Ana fictícia', role: 'MANAGER', active: true },
    { id: 'bruno', displayName: 'Bruno fictício', role: 'MEMBER', active: true },
    { id: 'carla', displayName: 'Carla fictícia', role: 'MEMBER', active: false },
  ];
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api).mockResolvedValue(roster);
    vi.mocked(write).mockResolvedValue(undefined); // 204 does not distinguish new/existing participation.
  });
  afterEach(() => vi.restoreAllMocks());

  async function open(manager = true) {
    render(<Members project={manager ? project : page.project} />);
    await userEvent.click(screen.getByText('Participantes do projeto'));
    await screen.findByText(/Ana fictícia/);
  }
  function send(email: string) {
    const input = screen.getByLabelText('Email completo do membro');
    fireEvent.change(input, { target: { value: email } });
    fireEvent.submit(input.closest('form')!);
    return input;
  }

  it('mostra nomes, funções e inatividade sem IDs, diretório ou sugestões; só gestor gere membros', async () => {
    await open(false);
    expect(screen.getByText(/Ana fictícia · Gestor/)).toBeInTheDocument();
    expect(screen.getByText(/Bruno fictício · Membro/)).toBeInTheDocument();
    expect(screen.getByText(/Carla fictícia · Membro · Inativo/)).toBeInTheDocument();
    for (const { id } of roster) expect(screen.queryByText(new RegExp(`\\b${id}\\b`))).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Email completo do membro')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Remover|Adicionar membro/ })).not.toBeInTheDocument();
    expect(api).toHaveBeenCalledTimes(1);
    expect(api).toHaveBeenCalledWith('/projects/alpha/members', expect.anything());
  });

  it.each([
    '  BRUNO@EXAMPLE.INVALID  ', 'josé@example.invalid', 'nome@exemplo.inválido', '🚀@example.invalid',
    '\u0000\u001fBRUNO@EXAMPLE.INVALID\u0020',
    '\u00a0' + 'a'.repeat(237) + '@example.invalid', // NBSP is not Java trim.
    'e\u0301@example.invalid', // No NFC/NFKC.
    '  ' + 'A'.repeat(238) + '@EXAMPLE.INVALID  ',
    '🚀'.repeat(119) + '@example.invalid',
  ])('envia só o email bruto %j; API normaliza e 204 confirma sem anunciar nova participação', async email => {
    await open();
    const input = screen.getByLabelText('Email completo do membro');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('inputmode', 'email');
    expect(input).not.toHaveAttribute('list');
    expect(input).not.toHaveAttribute('maxlength');
    expect(input).toHaveAttribute('placeholder', 'pessoa@example.invalid');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    send(email);
    expect(await screen.findByText('Participação confirmada. Adicionar novamente não cria duplicados.')).toHaveAttribute('role', 'status');
    expect(write).toHaveBeenCalledExactlyOnceWith('/projects/alpha/members', 'POST', { email });
    expect(input).toHaveValue('');
    await waitFor(() => expect(api).toHaveBeenCalledTimes(2));
    expect(vi.mocked(api).mock.calls.every(([path]) => path === '/projects/alpha/members')).toBe(true);
    for (const { id } of roster) expect(screen.queryByText(new RegExp(`\\b${id}\\b`))).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remover Ana fictícia' })).not.toBeInTheDocument();
  });

  it.each([
    '', 'bruno', 'bruno@exemplo', 'bru no@example.invalid', '\u00a0' + 'a'.repeat(238) + '@example.invalid',
    'a'.repeat(239) + '@example.invalid', '🚀'.repeat(119) + 'a@example.invalid',
    'a'.repeat(238) + '@example.invalid\u00a0', 'a\u000bb@example.invalid',
  ])('recusa email parcial/inválido ou 255 unidades normalizadas %j sem escrita, com erro e foco', async email => {
    await open();
    const input = send(email);
    await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
    expect(input).toHaveAccessibleDescription('Indique um email válido com até 254 caracteres.');
    await waitFor(() => expect(input).toHaveFocus());
    expect(input).toHaveValue(email);
    expect(write).not.toHaveBeenCalled();
    expect(screen.queryByText('Participação confirmada. Adicionar novamente não cria duplicados.')).not.toBeInTheDocument();
  });

  it.each([
    new ApiError('Conta não elegível.', 422, { email: 'Conta não elegível.' }),
    new ApiError('A ligação falhou. O resultado pode ser incerto;', 0),
    new ApiError('Acesso recusado.', 403),
  ])('conserva entrada e mostra falha explícita sem repetir escrita: %s', async error => {
    vi.mocked(write).mockRejectedValue(error);
    await open();
    const input = send('inexistente@example.invalid');
    await waitFor(() => expect(screen.getAllByRole('alert')[0]).toHaveTextContent(error.message));
    expect(input).toHaveValue('inexistente@example.invalid');
    if (error.fields.email) {
      expect(input).toHaveAccessibleDescription(error.fields.email);
      await waitFor(() => expect(input).toHaveFocus());
    }
    expect(write).toHaveBeenCalledTimes(1);
    expect(api).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('bloqueia submits síncronos/remoção durante o pedido e permite repetição neutra depois do 204', async () => {
    let finish!: (value: unknown) => void;
    vi.mocked(write).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    await open();
    const input = send('bruno@example.invalid');
    fireEvent.submit(input.closest('form')!);
    expect(write).toHaveBeenCalledTimes(1);
    expect(input.closest('form')).toHaveAttribute('aria-busy', 'true');
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Adicionar membro' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remover Bruno fictício' })).toBeDisabled();
    await act(async () => finish(undefined));
    await screen.findByText('Participação confirmada. Adicionar novamente não cria duplicados.');
    send('bruno@example.invalid');
    expect(write).toHaveBeenCalledTimes(2);
    await act(async () => finish(undefined));
    await screen.findByText('Participação confirmada. Adicionar novamente não cria duplicados.');
    expect(screen.getAllByText(/Bruno fictício · Membro/)).toHaveLength(1);
  });

  it('mantém confirmação de remoção, IDs internos no URL e recusa de membro atribuído', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await open();
    const remove = screen.getByRole('button', { name: 'Remover Bruno fictício' });
    await userEvent.click(remove);
    expect(confirm).toHaveBeenCalledWith('Remover o acesso deste membro ao projeto?');
    expect(write).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    vi.mocked(write).mockRejectedValueOnce(new ApiError('Retire primeiro todas as atribuições deste membro.', 409));
    await userEvent.click(remove);
    expect(await screen.findByRole('alert')).toHaveTextContent('Retire primeiro todas as atribuições deste membro.');
    expect(screen.getByText(/Bruno fictício · Membro/)).toBeInTheDocument();
    expect(api).toHaveBeenCalledTimes(1);
    await userEvent.click(remove);
    expect(write).toHaveBeenLastCalledWith('/projects/alpha/members/bruno', 'DELETE');
    await waitFor(() => expect(api).toHaveBeenCalledTimes(2));
  });
});

describe('Criação de tarefas', () => {
  beforeEach(() => vi.resetAllMocks());

  it('aplica cada template uma vez por criação; cancelar, editar e apagar não consomem nem reativam tipos', async () => {
    const confirmation = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<NewTask projectId="alpha" changed={vi.fn()} />);
    const description = screen.getByLabelText('Descrição');
    const apply = screen.getByRole('button', { name: 'Aplicar template' });
    fireEvent.change(description, { target: { value: 'Rascunho' } });
    for (const type of ['TASK', 'BUG', 'IMPROVEMENT'] as const) {
      await userEvent.selectOptions(screen.getByLabelText('Tipo'), type);
      expect(description).toHaveValue('Rascunho');
      expect(apply).toBeEnabled();
      confirmation.mockReturnValueOnce(false);
      await userEvent.click(apply);
      expect(description).toHaveValue('Rascunho');
      expect(apply).toBeEnabled();
      confirmation.mockReturnValueOnce(true);
      await userEvent.click(apply);
      expect(description).toHaveValue(taskTemplates[type]);
      expect(apply).toBeDisabled();
      fireEvent.change(description, { target: { value: '' } });
      fireEvent.click(apply);
      expect(description).toHaveValue('');
      expect(apply).toBeDisabled();
      fireEvent.change(description, { target: { value: 'Rascunho' } });
    }
    await userEvent.selectOptions(screen.getByLabelText('Tipo'), 'TASK');
    expect(apply).toBeDisabled();
    confirmation.mockRestore();
  });

  it('conserva o conjunto no POST falhado e reinicia apenas após criação confirmada ou outro projeto', async () => {
    vi.mocked(write).mockRejectedValueOnce(new ApiError('Falha recuperável.', 422)).mockResolvedValue(createdTask);
    const changed = vi.fn();
    const { rerender } = render(<NewTask key="alpha" projectId="alpha" changed={changed} />);
    fireEvent.change(screen.getByLabelText('Título *'), { target: { value: 'Nova' } });
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar template' }));
    await userEvent.click(screen.getByRole('button', { name: 'Criar tarefa' }));
    await screen.findByText('Falha recuperável.');
    expect(screen.getByLabelText('Descrição')).toHaveValue(taskTemplates.TASK);
    expect(screen.getByRole('button', { name: 'Aplicar template' })).toBeDisabled();
    expect(changed).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Criar tarefa' }));
    await screen.findByText(/Tarefa criada/);
    expect(screen.getByLabelText('Descrição')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Aplicar template' })).toBeEnabled();
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar template' }));
    rerender(<NewTask key="beta" projectId="beta" changed={changed} />);
    expect(screen.getByRole('button', { name: 'Aplicar template' })).toBeEnabled();
    expect(write).toHaveBeenLastCalledWith('/projects/alpha/tasks', 'POST', expect.not.objectContaining({ appliedTypes: expect.anything() }));
  });

  it.each([false, true])('mantém a mesma criação em refetch limpo/sujo e erro recuperável (sujo=%s)', async dirty => {
    let fail = false;
    vi.mocked(api).mockImplementation(async path => {
      if (path.endsWith('/members')) return [];
      if (fail) throw new Error('Projeto temporariamente indisponível.');
      return path.startsWith('/projects/beta/') ? { ...page, project: { ...page.project, id: 'beta' } } : page;
    });
    const { rerender } = render(<ProjectDetail key="alpha" id="alpha" />);
    await screen.findByRole('heading', { name: 'Alfa' });
    const description = screen.getByLabelText('Descrição');
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar template' }));
    fireEvent.change(description, { target: { value: dirty ? 'Rascunho local' : '' } });
    const refresh = () => act(() => { window.dispatchEvent(new Event('tasks-changed')); });
    refresh();
    await screen.findByRole('heading', { name: 'Alfa' });
    expect(screen.getByLabelText('Descrição')).toBe(description);
    expect(screen.getByRole('button', { name: 'Aplicar template' })).toBeDisabled();
    fail = true;
    refresh();
    await screen.findByText('Projeto temporariamente indisponível.');
    expect(screen.getByLabelText('Descrição')).toBe(description);
    expect(description).toHaveValue(dirty ? 'Rascunho local' : '');
    expect(screen.getByRole('button', { name: 'Aplicar template' })).toBeDisabled();
    fail = false;
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await screen.findByRole('heading', { name: 'Alfa' });
    expect(screen.getByLabelText('Descrição')).toBe(description);
    expect(screen.getByRole('button', { name: 'Aplicar template' })).toBeDisabled();
    rerender(<ProjectDetail key="beta" id="beta" />);
    await waitFor(() => expect(api).toHaveBeenCalledWith(expect.stringContaining('/projects/beta/tasks?'), expect.anything()));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Aplicar template' })).toBeEnabled());
    expect(screen.getByLabelText('Descrição')).not.toBe(description);
    expect(screen.getByLabelText('Descrição')).toHaveValue('');
  });

  it('conserva o texto e mostra a falha sem anunciar sucesso', async () => {
    vi.mocked(write).mockRejectedValue(new ApiError('Título inválido.', 422, { title: 'Rever título.' }));
    const changed = vi.fn();
    render(<NewTask projectId="alpha" changed={changed} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Título *'), 'Texto preservado');
    await user.click(screen.getByRole('button', { name: 'Criar tarefa' }));
    expect(await screen.findByText('Título inválido.')).toBeInTheDocument();
    expect(screen.getByLabelText('Título *')).toHaveValue('Texto preservado');
    expect(changed).not.toHaveBeenCalled();
    expect(screen.queryByText(/Tarefa criada/)).not.toBeInTheDocument();
  });

  describe('Indicadores do painel', () => {
    beforeEach(() => vi.resetAllMocks());

    it('usa os totais do projeto selecionado, não soma uma página como se fosse o conjunto global', async () => {
      const alpha = { ...page.project, progress: { total: 5, todo: 2, inProgress: 1, done: 2, completedPercent: 40 } };
      const beta = { ...page.project, id: 'beta', name: 'Beta', progress: { total: 2, todo: 0, inProgress: 0, done: 2, completedPercent: 100 } };
      vi.mocked(api).mockResolvedValue({ items: [alpha, beta], pagination: { page: 1, pageSize: 20, totalItems: 40, totalPages: 2 } });
      render(<Projects dashboard />);
      const summary = await screen.findByRole('region', { name: 'Resumo do projeto' });
      expect(within(summary).getByRole('article', { name: 'Por fazer: 2' })).toBeInTheDocument();
      expect(within(summary).getByRole('img', { name: 'Tarefas por estado de Alfa' })).toBeInTheDocument();
      await userEvent.selectOptions(within(summary).getByRole('combobox', { name: 'Projeto do resumo' }), 'beta');
      expect(within(summary).getByRole('article', { name: 'Por fazer: 0' })).toBeInTheDocument();
      expect(within(summary).getByText('2 de 2 tarefas concluídas')).toBeInTheDocument();
      expect(within(summary).getByRole('img', { name: 'Tarefas por estado de Beta' })).toBeInTheDocument();
    });

    it('mostra o vazio sem fabricar indicadores para projetos inexistentes', async () => {
      vi.mocked(api).mockResolvedValue({ items: [], pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 } });
      render(<Projects dashboard />);
      expect(await screen.findByText('Sem projetos acessíveis.')).toBeInTheDocument();
      expect(screen.queryByRole('region', { name: 'Resumo do projeto' })).not.toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  describe('Criação de projetos', () => {
    beforeEach(() => vi.resetAllMocks());

    it('apresenta o projeto criado além da primeira página', async () => {
      let created = false;
      const project = { ...page.project, name: 'Projeto 21' };
      vi.mocked(api).mockImplementation(async path => {
        const lastPage = created && path.includes('page=2');
        return { items: lastPage ? [project] : [],
          pagination: { page: lastPage ? 2 : 1, pageSize: 20, totalItems: created ? 21 : 20, totalPages: created ? 2 : 1 } };
      });
      vi.mocked(write).mockImplementation(async () => { created = true; return project; });
      render(<Projects />);
      const user = userEvent.setup();
      await screen.findByText('Página 1 · 20 resultados · 1 páginas');
      await user.type(screen.getByLabelText('Nome do projeto *'), project.name);
      await user.click(screen.getByRole('button', { name: 'Criar projeto' }));
      expect(await screen.findByRole('link', { name: project.name })).toBeInTheDocument();
      expect(screen.getByText('Página 2 · 21 resultados · 2 páginas')).toBeInTheDocument();
    });
  });

  it('bloqueia submissão repetida enquanto a API não confirma', async () => {
    let finish!: (value: unknown) => void;
    vi.mocked(write).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const changed = vi.fn();
    render(<NewTask projectId="alpha" changed={changed} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Título *'), 'Tarefa única');
    await user.dblClick(screen.getByRole('button', { name: 'Criar tarefa' }));
    expect(write).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'A criar…' })).toBeDisabled();
    finish({});
    await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
  });

  it('atualiza a listagem e contagens sem recarregar e sem duplicar', async () => {
    let created = false;
    vi.mocked(api).mockImplementation(async path => {
      if (path.endsWith('/members')) return [];
      return created ? { ...page, items: [createdTask],
        pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 }, progress: { total: 1, todo: 1, inProgress: 0, done: 0, completedPercent: 0 } } : page;
    });
    vi.mocked(write).mockImplementation(async () => { created = true; return createdTask; });
    render(<ProjectDetail id="alpha" />);
    const user = userEvent.setup();
    await screen.findByRole('heading', { name: 'Alfa' });
    await user.type(screen.getByLabelText('Título *'), 'Nova tarefa real');
    await user.click(screen.getByRole('button', { name: 'Criar tarefa' }));
    expect(await screen.findByRole('link', { name: 'Nova tarefa real' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Nova tarefa real' })).toHaveLength(1);
    expect(screen.getByText(/Total: 1/)).toBeInTheDocument();
  });

  it('apresenta a nova tarefa na segunda página quando a primeira está cheia', async () => {
    let created = false;
    vi.mocked(api).mockImplementation(async path => {
      if (path.endsWith('/members')) return [];
      const lastPage = created && path.includes('page=2');
      return { ...page, items: lastPage ? [createdTask] : [],
        pagination: { page: lastPage ? 2 : 1, pageSize: 20, totalItems: created ? 21 : 20, totalPages: created ? 2 : 1 } };
    });
    vi.mocked(write).mockImplementation(async () => { created = true; return createdTask; });
    render(<ProjectDetail id="alpha" />);
    const user = userEvent.setup();
    await screen.findByRole('heading', { name: 'Alfa' });
    await user.type(screen.getByLabelText('Título *'), createdTask.title);
    await user.click(screen.getByRole('button', { name: 'Criar tarefa' }));
    expect(await screen.findByRole('link', { name: createdTask.title })).toBeInTheDocument();
    expect(screen.getByText('Página 2 · 21 resultados · 2 páginas')).toBeInTheDocument();
  });

  it('mantém o filtro ativo quando a nova tarefa não lhe corresponde', async () => {
    vi.mocked(api).mockImplementation(async path => path.endsWith('/members') ? [] : page);
    vi.mocked(write).mockResolvedValue(createdTask);
    render(<ProjectDetail id="alpha" />);
    const user = userEvent.setup();
    await screen.findByRole('heading', { name: 'Alfa' });
    const filter = screen.getByRole('combobox', { name: 'Filtrar por estado' });
    await user.selectOptions(filter, 'DONE');
    await screen.findByRole('heading', { name: 'Alfa' });
    await user.type(screen.getByLabelText('Título *'), createdTask.title);
    await user.click(screen.getByRole('button', { name: 'Criar tarefa' }));
    expect(await screen.findByText(/Tarefa criada/)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Filtrar por estado' })).toHaveValue('DONE');
    expect(screen.queryByRole('link', { name: createdTask.title })).not.toBeInTheDocument();
  });

  it('mostra o comentário novo na última página sem perder autoria', async () => {
    let created = false;
    vi.mocked(api).mockImplementation(async path => {
      if (path.endsWith('/members')) return [];
      if (path.endsWith('/attachments')) return { items: [] };
      if (path.includes('/activity?') || path.includes('/links?')) return { items: [], pagination: page.pagination };
      if (path.includes('/tasks?')) return page;
      if (path.includes('/comments?')) {
        const lastPage = created && path.includes('page=2');
        return { items: lastPage ? [{ id: 'c21', taskId: 't1', author: { id: 'ana', displayName: 'Ana' },
          content: 'Comentário 21', createdAt: '2026-10-29T12:00:00Z', attachments: [] }] : [],
        pagination: { page: lastPage ? 2 : 1, pageSize: 20, totalItems: created ? 21 : 20, totalPages: created ? 2 : 1 } };
      }
      if (path.endsWith('/tasks/t1')) return createdTask;
      return page.project;
    });
    vi.mocked(write).mockImplementation(async () => { created = true; return {}; });
    render(<TaskDetail projectId="alpha" id="t1" />);
    const user = userEvent.setup();
    await screen.findByRole('heading', { name: createdTask.title });
    await user.type(screen.getByLabelText('Novo comentário'), 'Comentário 21');
    await user.click(screen.getByRole('button', { name: 'Adicionar comentário' }));
    expect(await screen.findByText('Comentário 21')).toBeInTheDocument();
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('Página 2 · 21 resultados · 2 páginas')).toBeInTheDocument();
  });
});
