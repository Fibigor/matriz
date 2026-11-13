import { describe, expect, it } from 'vitest';
import { codePoints, taskTemplates } from './taskTemplates';

describe('Templates explícitos', () => {
  it('mantém as secções aprovadas de cada tipo', () => {
    expect(taskTemplates.TASK.match(/^## .+$/gm)).toEqual(['## Objetivo', '## Passos', '## Critérios']);
    expect(taskTemplates.BUG.match(/^## .+$/gm)).toEqual(['## Reprodução', '## Esperado', '## Obtido']);
    expect(taskTemplates.IMPROVEMENT.match(/^## .+$/gm)).toEqual(['## Problema', '## Proposta', '## Critérios']);
  });
  it('conta pontos Unicode e remove apenas espaços das extremidades', () => {
    expect(codePoints(' 😀a ')).toBe(2);
    expect(codePoints('😀'.repeat(2000))).toBe(2000);
    expect(codePoints('😀'.repeat(2001))).toBe(2001);
  });
});
