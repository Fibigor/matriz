import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { api, ApiError, write } from './api';
import { TaskLinks } from './TaskLinks';
import type { Task, TaskLink } from './types';
vi.mock('./api', async () => ({ ...await vi.importActual<typeof import('./api')>('./api'), api: vi.fn(), write: vi.fn() }));
const task: Task = { id: 'b', projectId: 'p', key: 'MAT-2', title: 'Destino', description: '', type: 'TASK', weight: null, closeReason: null, status: 'TODO', priority: 'MEDIUM', version: 3, assignees: [], createdAt: '', updatedAt: '' };
const other: Task = { ...task, id: 'a', key: 'MAT-1', title: 'Origem', type: 'BUG', version: 7 };
const link: TaskLink = { id: 'l', projectId: 'p', type: 'BLOCKS', sourceTaskId: 'a', targetTaskId: 'b', sourceTask: other, targetTask: task, createdBy: { id: 'u', displayName: 'Ana' }, createdAt: '' };
const pagination = { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 };
describe('Relações versionadas', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api).mockImplementation(async path => {
      if (path.includes('/links?')) return { items: [link], pagination };
      if (path.includes('/tasks?')) return { items: [other], pagination };
      if (path.endsWith('/a')) return other;
      if (path.endsWith('/b')) return task;
      throw new Error('Rota não prevista: ' + path);
    });
  });
  it('mostra direção/chaves e elimina relação incoming com versões dos endpoints corretos', async () => {
    vi.mocked(write).mockResolvedValue({ task: { ...task, version: 4 }, otherTask: { ...other, version: 8 } });
    const changed = vi.fn();
    render(<TaskLinks task={task} revision={0} changed={changed} />);
    expect(await screen.findByText('Bloqueador pendente: MAT-1', { exact: false })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Remover relação MAT-1' }));
    expect(write).toHaveBeenCalledWith('/projects/p/tasks/b/links/l?version=3&targetVersion=7', 'DELETE');
    expect(changed).toHaveBeenCalledTimes(1);
  });
  it('seleciona chave/tipo/título e conserva seleção no 409 sem repetir a escrita', async () => {
    vi.mocked(write).mockRejectedValue(new ApiError('Versão desatualizada.', 409, { targetVersion: 'Reveja a tarefa de destino.' }));
    render(<TaskLinks task={task} revision={0} changed={vi.fn()} />);
    await screen.findByRole('option', { name: 'MAT-1 · Bug · Origem' });
    await userEvent.selectOptions(screen.getByLabelText('Tarefa de destino'), 'a');
    await userEvent.selectOptions(screen.getByLabelText('Tipo de relação'), 'DUPLICATES');
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar relação' }));
    expect(await screen.findByText('Reveja a tarefa de destino.')).toBeInTheDocument();
    expect(screen.getByLabelText('Tarefa de destino')).toHaveValue('a');
    expect(write).toHaveBeenCalledExactlyOnceWith('/projects/p/tasks/b/links', 'POST', { type: 'DUPLICATES', targetTaskId: 'a', version: 3, targetVersion: 7 });
  });
  it.each([false, true])('retry dos candidatos envia só GET, sem escrita/sucesso (seleção anterior: %s)', async selected => {
    const fallback = vi.mocked(api).getMockImplementation()!;
    let failed = !selected;
    vi.mocked(api).mockImplementation(async (path, init) => {
      if (path.includes('/tasks?') && failed) throw new Error('Falha ao consultar destinos.');
      return fallback(path, init);
    });
    const changed = vi.fn();
    const view = render(<TaskLinks task={task} revision={0} changed={changed} />);
    if (selected) {
      await screen.findByRole('option', { name: 'MAT-1 · Bug · Origem' });
      await userEvent.selectOptions(screen.getByLabelText('Tarefa de destino'), 'a');
      failed = true;
      view.rerender(<TaskLinks task={task} revision={1} changed={changed} />);
    }
    await screen.findByText('Falha ao consultar destinos.');
    const before = vi.mocked(api).mock.calls.length;
    failed = false;
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => expect(screen.queryByText('Falha ao consultar destinos.')).not.toBeInTheDocument());
    expect(vi.mocked(api).mock.calls.slice(before).map(([path]) => path)).toEqual(['/projects/p/tasks?page=1']);
    expect(write).not.toHaveBeenCalled();
    expect(changed).not.toHaveBeenCalled();
    expect(screen.queryByText('Relação adicionada.')).not.toBeInTheDocument();
  });
  it('valida formulário vazio e guarda apenas uma vez com Enter e destino válido', async () => {
    const changed = vi.fn();
    vi.mocked(write).mockResolvedValue({ task: { ...task, version: 4 }, otherTask: other });
    render(<TaskLinks task={task} revision={0} changed={changed} />);
    await screen.findByRole('option', { name: 'MAT-1 · Bug · Origem' });
    const select = screen.getByLabelText('Tarefa de destino') as HTMLSelectElement;
    expect(select.checkValidity()).toBe(false);
    // Even a synthetic submit bypassing native validation must not report success.
    fireEvent.submit(select.closest('form')!);
    await screen.findByText('Selecione uma tarefa de destino disponível antes de adicionar a relação.');
    expect(write).not.toHaveBeenCalled();
    expect(changed).not.toHaveBeenCalled();
    expect(screen.queryByText('Relação adicionada.')).not.toBeInTheDocument();
    await userEvent.selectOptions(select, 'a');
    expect(select.checkValidity()).toBe(true);
    await userEvent.click(screen.getByLabelText('Pesquisar chave MAT ou título nesta página'));
    await userEvent.keyboard('{Enter}');
    await screen.findByText('Relação adicionada.');
    expect(write).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalledWith({ previousVersion: 3, task: expect.objectContaining({ version: 4 }) });
  });
});
