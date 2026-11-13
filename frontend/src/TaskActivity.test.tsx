import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { api, ApiError, write } from './api';
import { TaskActivity } from './TaskActivity';
import type { Comment, TaskEvent } from './types';
vi.mock('./api', async () => ({ ...await vi.importActual<typeof import('./api')>('./api'), api: vi.fn(), write: vi.fn() }));
const author = { id: 'u', displayName: 'Ana' };
const comment: Comment = { id: 'c', taskId: 't', author, content: '**Texto único**', createdAt: '2026-11-13T00:00:00Z', attachments: [] };
const event: TaskEvent = { id: 'e', taskId: 't', actor: author, createdAt: comment.createdAt, type: 'COMMENT_ADDED', changes: [], titleChanged: false, descriptionChanged: false, commentId: 'c', relation: null, attachment: null, attachments: [] };
const pagination = { page: 1, pageSize: 20, totalItems: 2, totalPages: 1 };
describe('Comentários e histórico', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api).mockImplementation(async path => {
      if (path.includes('/comments?')) return { items: [comment], pagination };
      if (path.includes('/activity?')) return { items: [event, { ...event, id: 'e2', type: 'TASK_UPDATED', commentId: null, titleChanged: true,
        changes: [{ field: 'weight', oldValue: { kind: 'number', value: null }, newValue: { kind: 'number', value: 5 } }] }], pagination };
      throw new Error('Rota não prevista: ' + path);
    });
  });
  it('renderiza comentário uma vez, alterações tipadas e exclui comentário do histórico', async () => {
    render(<TaskActivity base="/t" revision={0} changed={vi.fn()} draft={vi.fn()} />);
    expect(await screen.findByText('Texto único')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Toda a atividade' }));
    expect(screen.getAllByText('Texto único')).toHaveLength(1);
    expect(screen.getByText('weight: Sem valor → 5')).toBeInTheDocument();
    expect(screen.getByText('Título alterado.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Histórico' }));
    expect(screen.queryByText('Texto único')).not.toBeInTheDocument();
    expect(screen.getByText(/paginação abaixo conta todos/)).toBeInTheDocument();
  });
  it('resolve comentário fora da página por consulta limitada explícita', async () => {
    vi.mocked(api).mockImplementation(async path => path.includes('/activity?')
      ? { items: [event], pagination }
      : { items: path.includes('page=2') ? [comment] : [], pagination: { ...pagination, totalPages: 2 } });
    render(<TaskActivity base="/t" revision={0} changed={vi.fn()} draft={vi.fn()} />);
    await screen.findByText('Sem comentários.');
    await userEvent.click(screen.getByRole('button', { name: 'Toda a atividade' }));
    await userEvent.click(screen.getByRole('button', { name: 'Procurar comentário na página 1' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Procurar comentário na página 2' }));
    expect(await screen.findByText('Texto único')).toBeInTheDocument();
  });
  it('mantém comentário perante 422 e não fabrica evento', async () => {
    vi.mocked(write).mockRejectedValue(new ApiError('Texto recusado.', 422, { content: 'Rever texto.' }));
    const changed = vi.fn();
    render(<TaskActivity base="/t" revision={0} changed={changed} draft={vi.fn()} />);
    await screen.findByText('Texto único');
    await userEvent.type(screen.getByLabelText('Novo comentário'), 'Rascunho');
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar comentário' }));
    expect(await screen.findByText('Rever texto.')).toBeInTheDocument();
    expect(screen.getByLabelText('Novo comentário')).toHaveValue('Rascunho');
    expect(changed).not.toHaveBeenCalled();
  });
});
