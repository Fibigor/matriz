import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskDetailPanel } from './TaskDetailPanel';
import App from './App';
import { api } from './api';
import type { Project, Task } from './types';
vi.mock('./api', async () => ({ ...await vi.importActual<typeof import('./api')>('./api'), api: vi.fn(), write: vi.fn() }));

describe('Painel de detalhe', () => {
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
  it('App conserva contexto e bloqueia hash/back com rascunho; página completa mantém o mesmo editor', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    window.history.replaceState(null, '', '#/projects/p');
    const project: Project = { id: 'p', name: 'Projeto contexto', description: '', ownerUserId: 'u', currentRole: 'MEMBER', version: 1, createdAt: '', progress: { total: 1, todo: 1, inProgress: 0, done: 0, completedPercent: 0 } };
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
    await userEvent.click(await screen.findByRole('link', { name: 'Tarefa painel' }));
    await screen.findByRole('dialog', { name: 'Detalhe da tarefa' });
    await userEvent.type(await screen.findByLabelText('Novo comentário'), 'Preservado');
    const textarea = screen.getByLabelText('Novo comentário');
    window.location.hash = '/projects';
    await waitFor(() => expect(window.location.hash).toBe('#/projects/p/tasks/t'));
    expect(confirmation).toHaveBeenCalledTimes(1);
    expect(textarea).toHaveValue('Preservado');
    await userEvent.click(screen.getByRole('link', { name: 'Abrir em página completa' }));
    expect(screen.queryByRole('dialog', { name: 'Detalhe da tarefa' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Novo comentário')).toBe(textarea);
    expect(confirmation).toHaveBeenCalledTimes(1);
    unmount(); confirmation.mockRestore(); vi.unstubAllGlobals();
    window.history.replaceState(null, '', '#/');
  });
});
