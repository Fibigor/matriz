import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewTask, ProjectDetail, TaskDetail } from './Tasks';
import { Projects } from './Projects';
import { api, ApiError, write } from './api';
import type { Task, TaskPage } from './types';

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

describe('Criação de tarefas', () => {
  beforeEach(() => vi.resetAllMocks());

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
