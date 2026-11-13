import type { TaskType } from './types';

export const taskTemplates: Record<TaskType, string> = {
  TASK: '## Objetivo\n\n\n## Passos\n\n\n## Critérios\n\n',
  BUG: '## Reprodução\n\n\n## Esperado\n\n\n## Obtido\n\n',
  IMPROVEMENT: '## Problema\n\n\n## Proposta\n\n\n## Critérios\n\n',
};
export const codePoints = (text: string) => Array.from(text.trim()).length;
