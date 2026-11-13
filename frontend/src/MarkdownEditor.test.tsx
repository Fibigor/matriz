import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { MarkdownBody, MarkdownEditor, safeMarkdownUrl } from './MarkdownEditor';

describe('Markdown seguro', () => {
  it('renderiza formato básico sem HTML, imagens nem URLs não HTTP', () => {
    const { container } = render(<MarkdownBody content={'## Título\n\n**Forte** e *ênfase*\n\n> Citação\n\n- Item\n\n`código`\n\n[ok](https://example.invalid)\n\n[mail](mailto:a@example.invalid)\n\n![remota](https://example.invalid/image.png)\n\n<script>alert(1)</script><img src=x>'} />);
    expect(screen.getByRole('heading', { name: 'Título', level: 2 })).toBeInTheDocument();
    expect(container.querySelector('strong')).toHaveTextContent('Forte');
    expect(container.querySelector('blockquote')).toHaveTextContent('Citação');
    expect(container.querySelectorAll('img,script')).toHaveLength(0);
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer');
    for (const url of ['javascript:alert(1)', 'data:text/html,test', 'mailto:a@b', '/projects', '//evil.invalid']) expect(safeMarkdownUrl(url)).toBe('');
  });
  it('alterna escrever/pré-visualizar sem perder texto', async () => {
    function Editor() { const [value, setValue] = useState(''); return <MarkdownEditor label="Texto" value={value} onChange={setValue} />; }
    render(<Editor />);
    await userEvent.type(screen.getByLabelText('Texto'), '**Rascunho**');
    await userEvent.click(screen.getByRole('button', { name: 'Pré-visualizar' }));
    expect(screen.getByText('Rascunho')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Escrever' }));
    expect(screen.getByLabelText('Texto')).toHaveValue('**Rascunho**');
  });
});
