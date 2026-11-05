import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

async function expectNoAccessibilityViolations(page: import('@playwright/test').Page) {
  const violations = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'])
    .analyze()
    .then(results => results.violations);
  const details = violations.map(violation =>
    `${violation.id} (${violation.impact}): ${violation.help}\n${violation.nodes.map(node => `  ${node.target.join(', ')}`).join('\n')}`,
  ).join('\n');
  expect(violations, details).toEqual([]);
}

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByLabel('Email').fill('ana@example.invalid');
  await page.getByLabel('Palavra-passe').fill('Matriz-Demo-2026!');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Painel inicial' })).toBeVisible();
}

async function keyboardSignIn(page: import('@playwright/test').Page) {
  await page.goto('/');
  const email = page.getByLabel('Email');
  await email.focus();
  await expect(email).toBeFocused();
  await page.keyboard.type('ana@example.invalid');
  await page.keyboard.press('Tab');
  const password = page.getByLabel('Palavra-passe');
  await expect(password).toBeFocused();
  await page.keyboard.type('Matriz-Demo-2026!');
  await page.keyboard.press('Tab');
  const submit = page.getByRole('button', { name: 'Entrar', exact: true });
  await expect(submit).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Painel inicial' })).toBeVisible();
}

test('percurso integrado: projeto, tarefas, filtros, atribuições, comentários e eliminação', async ({ page }) => {
  const suffix = Date.now();
  await keyboardSignIn(page);
  await page.getByLabel('Nome do projeto *').fill(`E2E ${suffix}`);
  await page.getByRole('button', { name: 'Criar projeto', exact: true }).click();
  await page.getByRole('link', { name: `E2E ${suffix}`, exact: true }).click();
  await page.getByText('Participantes do projeto', { exact: true }).click();
  await page.getByLabel('Identificador exato do membro').fill('user-bruno');
  await page.getByRole('button', { name: 'Adicionar membro' }).click();
  await expect(page.getByText('Bruno · user-bruno · Membro')).toBeVisible();
  await page.getByLabel('Título *', { exact: true }).fill(`Tarefa ${suffix}`);
  await page.getByRole('button', { name: 'Criar tarefa', exact: true }).click();
  await expect(page.getByRole('link', { name: `Tarefa ${suffix}`, exact: true })).toHaveCount(1);
  await page.getByRole('link', { name: `Tarefa ${suffix}`, exact: true }).click();
  await page.getByRole('combobox', { name: 'Estado', exact: true }).selectOption('DONE');
  await page.getByRole('combobox', { name: 'Prioridade', exact: true }).selectOption('HIGH');
  await page.getByRole('button', { name: 'Guardar tarefa' }).click();
  await expect(page.getByText('Concluída · Prioridade Alta', { exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: 'Participante elegível', exact: true }).selectOption('user-ana');
  await page.getByRole('button', { name: 'Atribuir responsável' }).click();
  await expect(page.getByRole('button', { name: 'Retirar Ana' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Participante elegível', exact: true }).selectOption('user-bruno');
  await page.getByRole('button', { name: 'Atribuir responsável' }).click();
  await expect(page.getByRole('button', { name: 'Retirar Bruno' })).toBeVisible();
  await page.getByLabel('Novo comentário').fill('Comentário persistente de demonstração.');
  await page.getByRole('button', { name: 'Adicionar comentário' }).click();
  await expect(page.getByRole('article').getByText('Comentário persistente de demonstração.', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('article').getByText('Comentário persistente de demonstração.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retirar Bruno' })).toBeVisible();
  await page.getByRole('button', { name: 'Retirar Bruno' }).click();
  await expect(page.getByRole('button', { name: 'Retirar Bruno' })).toHaveCount(0);
  await page.getByRole('link', { name: '← Projeto' }).click();
  await expect(page.getByText('100% concluído', { exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: 'Filtrar por estado', exact: true }).selectOption('TODO');
  await expect(page.getByText('Sem tarefas para os critérios selecionados.')).toBeVisible();
  await expect(page.getByText('100% concluído', { exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: 'Filtrar por estado', exact: true }).selectOption('DONE');
  await page.getByRole('link', { name: `Tarefa ${suffix}`, exact: true }).click();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Eliminar tarefa', exact: true }).click();
  await expect(page.getByText('Sem tarefas para os critérios selecionados.')).toBeVisible();
  await page.getByText('Gerir projeto', { exact: true }).click();
  await page.getByLabel('Nome', { exact: true }).fill(`E2E editado ${suffix}`);
  await page.getByRole('button', { name: 'Guardar projeto' }).click();
  await expect(page.getByRole('heading', { name: `E2E editado ${suffix}`, exact: true })).toBeVisible();
  await page.getByText('Gerir projeto', { exact: true }).click();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Eliminar projeto', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Projetos', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Entrar na Matriz' })).toBeVisible();
});

test('Ficha 04: autenticar, abrir projeto, criar tarefa e confirmar listagem', async ({ page }) => {
  const suffix = Date.now();
  const projectName = `Ficha 04 ${suffix}`;
  const taskTitle = `Tarefa de qualidade ${suffix}`;

  await signIn(page);
  await page.getByLabel('Nome do projeto *').fill(projectName);
  await page.getByRole('button', { name: 'Criar projeto', exact: true }).click();
  await page.getByRole('link', { name: projectName, exact: true }).click();
  await page.getByLabel('Título *', { exact: true }).fill(taskTitle);
  await page.getByRole('button', { name: 'Criar tarefa', exact: true }).click();
  await expect(page.getByRole('link', { name: taskTitle, exact: true })).toHaveCount(1);

  await page.getByText('Gerir projeto', { exact: true }).click();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Eliminar projeto', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Projetos', exact: true })).toBeVisible();
});

test('login rejeita credenciais inválidas e a vista móvel funciona', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Entrar na Matriz' })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByLabel('Email').fill('ana@example.invalid');
  await page.getByLabel('Palavra-passe').fill('incorreta');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByLabel('Palavra-passe')).toBeVisible();
  await expect(page.getByText('Email ou palavra-passe incorretos.', { exact: true })).toBeVisible();
  await page.getByLabel('Palavra-passe').fill('Matriz-Demo-2026!');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Painel inicial' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('workspace Jira: dados reais, navegação móvel e teclado', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Entrar na Matriz' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('login-desktop.png'), fullPage: true });
  await signIn(page);
  const summary = page.getByRole('region', { name: 'Resumo do projeto' });
  await summary.getByRole('combobox', { name: 'Projeto do resumo' }).selectOption('proj-alfa');
  await expect(summary.getByText('2 de 5 tarefas concluídas')).toBeVisible();
  await expect(summary.getByRole('article', { name: 'Por fazer: 2' })).toBeVisible();
  await expect(summary.getByRole('article', { name: 'Em curso: 1' })).toBeVisible();
  await expect(summary.getByRole('article', { name: 'Concluídas: 2' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('dashboard-desktop.png'), fullPage: true });
  const hash = new URL(page.url()).hash;
  await page.getByRole('link', { name: 'Saltar para o conteúdo' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  expect(new URL(page.url()).hash).toBe(hash);
  expect(await page.evaluate(() => document.querySelector('main')!.getBoundingClientRect().top
    >= document.querySelector('header')!.getBoundingClientRect().bottom)).toBe(true);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath('dashboard-mobile.png'), fullPage: true });
  const toggle = page.getByRole('button', { name: 'Abrir menu' });
  await toggle.click();
  const drawer = page.getByRole('dialog', { name: 'Menu de navegação' });
  await expect(drawer).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(drawer.getByRole('button', { name: 'Fechar menu' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(drawer.getByRole('link', { name: 'Painel', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(drawer.getByRole('link', { name: 'Projetos', exact: true })).toBeFocused();
  await page.evaluate(() => document.querySelector<HTMLButtonElement>('.logout-button')?.focus());
  await expect(drawer.getByRole('link', { name: 'Projetos', exact: true })).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath('navigation-mobile.png') });
  await page.keyboard.press('Escape');
  await expect(drawer).not.toBeVisible();
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await drawer.getByRole('link', { name: 'Projetos', exact: true }).click();
  await expect(drawer).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'Projetos', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Lista de projetos' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('table')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('projects-mobile.png'), fullPage: true });
  await page.getByRole('link', { name: 'Alfa', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Alfa', exact: true })).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('project-detail-mobile.png'), fullPage: true });
  const taskLink = page.getByRole('table').getByRole('link').first();
  const taskTitle = await taskLink.innerText();
  await taskLink.click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(taskTitle);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('task-detail-mobile.png'), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: testInfo.outputPath('task-detail-desktop.png'), fullPage: true });
});

test('acessibilidade: vistas principais sem violações WCAG 2.0/2.1/2.2 A/AA', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Entrar na Matriz' })).toBeVisible();
  await expectNoAccessibilityViolations(page);

  await keyboardSignIn(page);
  await expectNoAccessibilityViolations(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoAccessibilityViolations(page);
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await expect(page.getByRole('dialog', { name: 'Menu de navegação' })).toBeVisible();
  await expectNoAccessibilityViolations(page);
  await page.keyboard.press('Escape');

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('link', { name: 'Projetos', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Projetos', exact: true })).toBeVisible();
  await expectNoAccessibilityViolations(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoAccessibilityViolations(page);
  await page.getByRole('link', { name: 'Alfa', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Alfa', exact: true })).toBeVisible();
  await expectNoAccessibilityViolations(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expectNoAccessibilityViolations(page);

  const firstTask = page.getByRole('table').getByRole('link').first();
  await expect(firstTask).toBeVisible();
  await firstTask.click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expectNoAccessibilityViolations(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoAccessibilityViolations(page);
});
