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
  const detail = page.getByRole('dialog', { name: 'Detalhe da tarefa' });
  await expect(detail).toBeVisible();
  await detail.getByRole('combobox', { name: 'Tipo', exact: true }).selectOption('BUG');
  await detail.getByRole('combobox', { name: 'Peso', exact: true }).selectOption('5');
  await detail.getByLabel('Descrição', { exact: true }).fill('## Objetivo seguro\n\n**Importante**\n\n![sem imagem](https://example.invalid/a.png)\n\n[inválida](javascript:alert%281%29)');
  await page.getByRole('combobox', { name: 'Estado', exact: true }).selectOption('DONE');
  await detail.getByRole('combobox', { name: 'Motivo de fecho', exact: true }).selectOption('CANCELLED');
  await detail.getByRole('combobox', { name: 'Prioridade', exact: true }).selectOption('HIGH');
  await page.getByRole('button', { name: 'Guardar tarefa' }).click();
  await expect(page.getByText('Concluída · Prioridade Alta', { exact: true })).toBeVisible();
  await expect(detail.getByText(/MAT-\d+ · Bug · Peso: 5/)).toBeVisible();
  await expect(detail.locator('.markdown-body img')).toHaveCount(0);
  await expect(detail.locator('.markdown-body a[href^="javascript:"]')).toHaveCount(0);
  await page.getByRole('combobox', { name: 'Participante elegível', exact: true }).selectOption('user-ana');
  await page.getByRole('button', { name: 'Atribuir responsável' }).click();
  await expect(page.getByRole('button', { name: 'Retirar Ana' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Participante elegível', exact: true }).selectOption('user-bruno');
  await page.getByRole('button', { name: 'Atribuir responsável' }).click();
  await expect(page.getByRole('button', { name: 'Retirar Bruno' })).toBeVisible();
  await page.getByLabel('Novo comentário').fill('Comentário persistente de demonstração.');
  await page.getByLabel('Ficheiros do comentário', { exact: true }).setInputFiles({
    name: 'comentario.txt', mimeType: 'text/plain', buffer: Buffer.from('Anexo do comentário de demonstração.'),
  });
  await page.getByRole('button', { name: 'Adicionar comentário' }).click();
  await expect(page.getByRole('article').getByText('Comentário persistente de demonstração.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Descarregar comentario.txt' })).toBeVisible();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descarregar comentario.txt' }).click();
  expect((await downloadEvent).suggestedFilename()).toBe('comentario.txt');
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

  // Both task endpoints and all files belong exclusively to this test's project.
  const projectId = new URL(page.url()).hash.split('/')[2];
  const csrf = await (await page.request.get('/api/auth/csrf')).json() as { headerName: string; token: string };
  const headers = { [csrf.headerName]: csrf.token };
  const created = await page.request.post(`/api/projects/${projectId}/tasks`, {
    headers, data: { title: `Bloqueador ${suffix}`, type: 'IMPROVEMENT', weight: 8 },
  });
  expect(created.status()).toBe(201);
  const blocker = await created.json() as { id: string; key: string };
  await page.reload();
  await page.getByRole('link', { name: `Bloqueador ${suffix}`, exact: true }).click();
  let detail = page.getByRole('dialog', { name: 'Detalhe da tarefa' });
  await detail.getByRole('combobox', { name: 'Tipo de relação', exact: true }).selectOption('BLOCKS');
  const targetOption = detail.getByRole('combobox', { name: 'Tarefa de destino', exact: true }).locator('option').filter({ hasText: taskTitle });
  const targetId = await targetOption.getAttribute('value');
  await detail.getByRole('combobox', { name: 'Tarefa de destino', exact: true }).selectOption(targetId!);
  await detail.getByRole('button', { name: 'Adicionar relação', exact: true }).click();
  await expect(detail.getByText('Relação adicionada.', { exact: true })).toBeVisible();
  await detail.getByLabel('Novo comentário').fill('Rascunho responsivo');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(detail.getByLabel('Novo comentário')).toHaveValue('Rascunho responsivo');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(detail.getByLabel('Novo comentário')).toHaveValue('Rascunho responsivo');
  await detail.getByLabel('Novo comentário').fill('');
  await expectNoAccessibilityViolations(page);
  await detail.getByRole('button', { name: 'Fechar detalhe' }).click();
  await expect(page.getByRole('link', { name: `Bloqueador ${suffix}`, exact: true })).toBeFocused();
  await page.getByRole('link', { name: taskTitle, exact: true }).click();
  detail = page.getByRole('dialog', { name: 'Detalhe da tarefa' });
  await expect(detail.getByText(`Bloqueador pendente: ${blocker.key}`, { exact: false })).toBeVisible();
  await detail.getByRole('combobox', { name: 'Estado', exact: true }).selectOption('DONE');
  await detail.getByRole('button', { name: 'Guardar tarefa' }).click();
  await expect(detail.getByRole('alert').first()).toBeVisible();
  await expect(detail.getByRole('combobox', { name: 'Estado', exact: true })).toHaveValue('DONE');
  // Discard only this explicitly failed draft, then conclude the blocker.
  page.once('dialog', dialog => dialog.accept());
  await detail.getByRole('button', { name: 'Fechar detalhe' }).click();
  await page.getByRole('link', { name: `Bloqueador ${suffix}`, exact: true }).click();
  detail = page.getByRole('dialog', { name: 'Detalhe da tarefa' });
  await detail.getByRole('combobox', { name: 'Estado', exact: true }).selectOption('DONE');
  await detail.getByRole('button', { name: 'Guardar tarefa' }).click();
  await expect(detail.getByText('Concluída · Prioridade Média', { exact: true })).toBeVisible();
  await detail.getByRole('button', { name: 'Fechar detalhe' }).click();
  await page.getByRole('link', { name: taskTitle, exact: true }).click();
  detail = page.getByRole('dialog', { name: 'Detalhe da tarefa' });
  await detail.getByRole('combobox', { name: 'Estado', exact: true }).selectOption('DONE');
  await detail.getByRole('button', { name: 'Guardar tarefa' }).click();
  await expect(detail.getByText('Concluída · Prioridade Média', { exact: true })).toBeVisible();
  await detail.getByLabel('Anexos diretos', { exact: true }).setInputFiles(Array.from({ length: 5 }, (_, index) => ({
    name: `direto-${index}.txt`, mimeType: 'text/plain', buffer: Buffer.from('Ficheiro de teste.'),
  })));
  await detail.getByRole('button', { name: 'Enviar anexos', exact: true }).click();
  await expect(detail.getByText('Anexos enviados.', { exact: true })).toBeVisible();
  await detail.getByLabel('Anexos diretos', { exact: true }).setInputFiles({ name: 'sexto.txt', mimeType: 'text/plain', buffer: Buffer.from('Limite.') });
  await expect(detail.getByText('Máximo de 5 ficheiros neste grupo.')).toBeVisible();
  await detail.getByRole('button', { name: 'Fechar detalhe' }).click();
  await page.getByRole('link', { name: `Bloqueador ${suffix}`, exact: true }).click();
  detail = page.getByRole('dialog', { name: 'Detalhe da tarefa' });
  await detail.getByRole('combobox', { name: 'Estado', exact: true }).selectOption('TODO');
  await detail.getByRole('button', { name: 'Guardar tarefa' }).click();
  await expect(detail.getByRole('alert').first()).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await detail.getByRole('button', { name: 'Fechar detalhe' }).click();

  // Native new-tab URL/reload opens the same detail as a full page.
  const href = await page.getByRole('link', { name: taskTitle, exact: true }).getAttribute('href');
  const direct = await page.context().newPage();
  await direct.goto('/' + href!);
  await expect(direct.getByRole('heading', { name: taskTitle, exact: true })).toBeVisible();
  await expect(direct.getByRole('dialog')).toHaveCount(0);
  await direct.reload();
  await expect(direct.getByRole('button', { name: 'Descarregar direto-0.txt' })).toBeVisible();
  await direct.setViewportSize({ width: 390, height: 844 });
  await direct.getByLabel('Novo comentário').fill('Rascunho móvel');
  await direct.setViewportSize({ width: 1440, height: 1000 });
  await expect(direct.getByLabel('Novo comentário')).toHaveValue('Rascunho móvel');
  await direct.getByLabel('Novo comentário').fill('');
  await direct.close();

  await page.getByText('Gerir projeto', { exact: true }).click();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Eliminar projeto', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Projetos', exact: true })).toBeVisible();
});

test('revisão: rascunhos sobrevivem a mutações locais, retry só consulta e conflito externo exige confirmação', async ({ page }) => {
  const suffix = Date.now();
  await signIn(page);
  const projectName = `Revisão local ${suffix}`;
  await page.getByLabel('Nome do projeto *').fill(projectName);
  await page.getByRole('button', { name: 'Criar projeto', exact: true }).click();
  await page.getByRole('link', { name: projectName, exact: true }).click();
  for (const title of [`Origem ${suffix}`, `Destino ${suffix}`]) {
    await page.getByLabel('Título *', { exact: true }).fill(title);
    await page.getByRole('button', { name: 'Criar tarefa', exact: true }).click();
    await expect(page.getByRole('link', { name: title, exact: true })).toBeVisible();
  }
  const projectId = new URL(page.url()).hash.split('/')[2];
  const origin = page.getByRole('link', { name: `Origem ${suffix}`, exact: true });
  const taskId = (await origin.getAttribute('href'))!.split('/').pop()!;
  const base = `/api/projects/${projectId}/tasks/${taskId}`;
  const writes: string[] = [];
  page.on('request', request => { if (request.url().includes('/links') && request.method() !== 'GET') writes.push(request.method()); });
  let failCandidates = true;
  await page.route(`**/api/projects/${projectId}/tasks?*`, async route => {
    if (failCandidates) await route.fulfill({ status: 503, contentType: 'application/problem+json', body: JSON.stringify({ detail: 'Destinos temporariamente indisponíveis.' }) });
    else await route.continue();
  });
  await origin.click();
  const detail = page.getByRole('dialog', { name: 'Detalhe da tarefa' });
  await expect(detail.getByText('Destinos temporariamente indisponíveis.')).toBeVisible();
  failCandidates = false;
  await detail.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
  await expect(detail.getByRole('combobox', { name: 'Tarefa de destino', exact: true })).toBeEnabled();
  expect(writes).toEqual([]);
  await expect(detail.getByText('Relação adicionada.', { exact: true })).toHaveCount(0);

  async function draft(title: string) {
    await detail.getByLabel('Título *', { exact: true }).fill(title);
    await detail.getByLabel('Descrição', { exact: true }).fill('Descrição preservada durante mutação local.');
    await detail.getByRole('combobox', { name: 'Tipo', exact: true }).selectOption('BUG');
    await detail.getByRole('combobox', { name: 'Peso', exact: true }).selectOption('8');
  }
  async function save(title: string) {
    await expect(detail.getByLabel('Descrição', { exact: true })).toHaveValue('Descrição preservada durante mutação local.');
    const response = page.waitForResponse(response => response.url().endsWith(base) && response.request().method() === 'PUT');
    await detail.getByRole('button', { name: 'Guardar tarefa', exact: true }).click();
    expect((await response).status()).toBe(200);
    await expect(detail.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await expect(detail.getByRole('combobox', { name: 'Tipo', exact: true })).toHaveValue('BUG');
    await expect(detail.getByRole('combobox', { name: 'Peso', exact: true })).toHaveValue('8');
  }
  await draft(`Atribuição ${suffix}`);
  await detail.getByRole('combobox', { name: 'Participante elegível', exact: true }).selectOption('user-ana');
  await detail.getByRole('button', { name: 'Atribuir responsável' }).click();
  await expect(detail.getByRole('button', { name: 'Retirar Ana' })).toBeVisible();
  await save(`Atribuição ${suffix}`);
  await draft(`Remoção ${suffix}`);
  await detail.getByRole('button', { name: 'Retirar Ana' }).click();
  await expect(detail.getByRole('button', { name: 'Retirar Ana' })).toHaveCount(0);
  await save(`Remoção ${suffix}`);

  const picker = detail.getByRole('combobox', { name: 'Tarefa de destino', exact: true });
  const targetId = await picker.locator('option').filter({ hasText: `Destino ${suffix}` }).getAttribute('value');
  await picker.selectOption(targetId!);
  // Refetch with a retained selection, then retry: still no POST or false success.
  failCandidates = true;
  await detail.getByRole('combobox', { name: 'Participante elegível', exact: true }).selectOption('user-ana');
  await detail.getByRole('button', { name: 'Atribuir responsável' }).click();
  await expect(detail.getByText('Destinos temporariamente indisponíveis.')).toBeVisible();
  failCandidates = false;
  await detail.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
  await expect(picker).toBeEnabled();
  await expect(picker).toHaveValue(targetId!);
  expect(writes).toEqual([]);
  await expect(detail.getByText('Relação adicionada.', { exact: true })).toHaveCount(0);
  await draft(`Relação ${suffix}`);
  await detail.getByLabel('Pesquisar chave MAT ou título nesta página').focus();
  await page.keyboard.press('Enter');
  await expect(detail.getByText('Relação adicionada.', { exact: true })).toBeVisible();
  await save(`Relação ${suffix}`);
  await draft(`Sem relação ${suffix}`);
  await detail.getByRole('button', { name: /^Remover relação MAT-/ }).click();
  await expect(detail.getByText('Relação removida.', { exact: true })).toBeVisible();
  await save(`Sem relação ${suffix}`);
  expect(writes).toEqual(['POST', 'DELETE']);

  await draft(`Rascunho em conflito ${suffix}`);
  const csrf = await (await page.request.get('/api/auth/csrf')).json() as { headerName: string; token: string };
  const current = await (await page.request.get(base)).json();
  const external = await page.request.put(base, {
    headers: { [csrf.headerName]: csrf.token },
    data: { title: `Versão externa ${suffix}`, description: current.description, status: current.status, priority: current.priority, closeReason: current.closeReason, type: 'IMPROVEMENT', weight: 13, version: current.version },
  });
  expect(external.status()).toBe(200);
  // Comment refreshes task data but is not a versioned local task mutation.
  await detail.getByLabel('Novo comentário').fill('Atualizar detalhe sem substituir o rascunho.');
  await detail.getByRole('button', { name: 'Adicionar comentário' }).click();
  await expect(detail.getByRole('heading', { name: `Versão externa ${suffix}`, exact: true })).toBeVisible();
  const conflict = page.waitForResponse(response => response.url().endsWith(base) && response.request().method() === 'PUT');
  await detail.getByRole('button', { name: 'Guardar tarefa', exact: true }).click();
  expect((await conflict).status()).toBe(409);
  await expect(detail.getByLabel('Título *', { exact: true })).toHaveValue(`Rascunho em conflito ${suffix}`);
  await expect(detail.getByRole('combobox', { name: 'Tipo', exact: true })).toHaveValue('BUG');
  const recover = detail.getByRole('button', { name: 'Consultar versão atual (substitui o rascunho)' });
  page.once('dialog', dialog => dialog.dismiss());
  await recover.click();
  await expect(detail.getByLabel('Título *', { exact: true })).toHaveValue(`Rascunho em conflito ${suffix}`);
  page.once('dialog', dialog => dialog.accept());
  await recover.click();
  await expect(detail.getByLabel('Título *', { exact: true })).toHaveValue(`Versão externa ${suffix}`);
  await expect(detail.getByRole('combobox', { name: 'Tipo', exact: true })).toHaveValue('IMPROVEMENT');
  await expect(detail.getByRole('combobox', { name: 'Peso', exact: true })).toHaveValue('13');
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
