import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Dialog, type Locator, type Page } from '@playwright/test';
import { taskTemplates } from '../src/taskTemplates';
import type { Comment as TaskComment, Task, TaskAttachment } from '../src/types';

// Runtime requires an explicitly authorised target/artifact budget (quickstart V1–V5).
// The whole suite makes THREE real registrations: this original long-password case
// and the 6/200-point case below. Invalid UI boundaries and injected server errors
// never reach register. Do not retry/reset/restart or spoof forwarded headers for quota.
function expectRegistrationStatus(status: number) {
  expect(status, '429 is an environment/quota blocker (5/address/15min), not a password boundary failure.').not.toBe(429);
  expect(status).toBe(201);
}

async function writeFixture<T>(page: Page, path: string, method: 'post' | 'put' | 'delete', data?: unknown): Promise<T> {
  const csrfResponse = await page.request.get('/api/auth/csrf');
  expect(csrfResponse.status()).toBe(200);
  const csrf = await csrfResponse.json() as { headerName: string; token: string };
  const response = await page.request[method](path, { headers: { [csrf.headerName]: csrf.token }, data });
  expect(response.ok(), `${method.toUpperCase()} ${path}: ${response.status()}`).toBe(true);
  return response.status() === 204 ? undefined as T : await response.json() as T;
}

async function createFixtureProject(page: Page, name: string) {
  const project = await writeFixture<{ id: string }>(page, '/api/projects', 'post', { name, description: '' });
  await page.goto(`/#/projects/${project.id}`);
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  return project.id;
}

const card = (page: Page, heading: string) =>
  page.locator('section.card').filter({ has: page.getByRole('heading', { name: heading, exact: true }) });

async function confirmOnce(page: Page, accept: boolean, action: () => Promise<unknown>, settled: () => Promise<unknown>) {
  const messages: string[] = [];
  const handle = async (dialog: Dialog) => {
    messages.push(dialog.message());
    if (accept) await dialog.accept(); else await dialog.dismiss();
  };
  page.on('dialog', handle);
  try {
    await action();
    await expect.poll(() => messages.length).toBe(1);
    await settled();
    expect(messages).toHaveLength(1);
  } finally {
    page.off('dialog', handle);
  }
}

async function expectIcon(action: Locator, name: string) {
  await expect(action).toHaveAccessibleName(name);
  await expect(action).toHaveText('');
  await expect(action.locator('svg')).toHaveAttribute('aria-hidden', 'true');
  await expect(action.locator('svg')).toHaveAttribute('focusable', 'false');
}

async function expectSameRow(left: Locator, right: Locator) {
  await left.scrollIntoViewIfNeeded();
  const a = await left.boundingBox(), b = await right.boundingBox();
  expect(a).not.toBeNull(); expect(b).not.toBeNull();
  expect(a!.x + a!.width).toBeLessThanOrEqual(b!.x + 1);
  expect(Math.min(a!.y + a!.height, b!.y + b!.height) - Math.max(a!.y, b!.y)).toBeGreaterThan(0);
}

async function expectNoOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const panel of await page.locator('.task-panel').all()) {
    expect(await panel.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
  }
}

async function expectAttachmentRow(row: Locator, filename: string, actions: string[]) {
  await expect(row.locator('.attachment-meta')).toContainText(filename);
  expect(await row.evaluate(element => {
    const meta = element.querySelector('.attachment-meta')!;
    const actions = element.querySelector('.attachment-actions')!;
    return !!(meta.compareDocumentPosition(actions) & Node.DOCUMENT_POSITION_FOLLOWING);
  })).toBe(true);
  await expect(row.getByRole('button')).toHaveCount(actions.length);
  for (const [index, name] of actions.entries()) await expectIcon(row.getByRole('button').nth(index), `${name} ${filename}`);
  await expectSameRow(row.locator('.attachment-meta'), row.locator('.attachment-actions'));
  const bounds = await row.boundingBox(), group = await row.locator('.attachment-actions').boundingBox();
  expect(group!.x + group!.width).toBeLessThanOrEqual(bounds!.x + bounds!.width + 1);
}

async function exerciseTemplates(page: Page, editor: Locator) {
  const description = editor.getByLabel('Descrição', { exact: true });
  const apply = editor.getByRole('button', { name: 'Aplicar template', exact: true });
  expect(new Set(Object.values(taskTemplates)).size).toBe(3);
  for (const type of ['TASK', 'BUG', 'IMPROVEMENT'] as const) {
    await description.fill('Rascunho a conservar.');
    await editor.getByRole('combobox', { name: 'Tipo', exact: true }).selectOption(type);
    await expect(description).toHaveValue('Rascunho a conservar.');
    await expect(apply).toBeEnabled();
    await confirmOnce(page, false, () => apply.click(), () => expect(description).toHaveValue('Rascunho a conservar.'));
    await expect(apply).toBeEnabled();
    await confirmOnce(page, true, () => apply.click(), () => expect(description).toHaveValue(taskTemplates[type]));
    await expect(apply).toBeDisabled();
    await expect(apply).toHaveCSS('background-color', 'rgb(60, 64, 91)');
    await description.fill('');
    await expect(apply).toBeDisabled();
  }
  for (const type of ['TASK', 'BUG', 'IMPROVEMENT']) {
    await editor.getByRole('combobox', { name: 'Tipo', exact: true }).selectOption(type);
    await expect(apply).toBeDisabled();
    await expect(description).toHaveValue('');
  }
}

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

async function signIn(page: import('@playwright/test').Page, email = 'ana@example.invalid') {
  await page.goto('/');
  await page.getByLabel('Email').fill(email);
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

test('registo académico: confirmação, login explícito, email idempotente e acesso sem herança', async ({ page, browser }) => {
  const suffix = crypto.randomUUID();
  const displayName = `Pessoa fictícia ${suffix}`;
  const email = `nova.é.${suffix}@example.invalid`;
  const password = '  palavra fictícia 🚀  ';
  const projectName = `Registo E2E ${suffix}`;
  let registrations = 0;
  let logins = 0;
  page.on('request', request => {
    if (request.method() !== 'POST') return;
    const path = new URL(request.url()).pathname;
    if (path === '/api/auth/register') registrations++;
    if (path === '/api/auth/login') logins++;
  });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Entrar na Matriz' })).toBeVisible();
  await page.getByRole('button', { name: 'Criar conta', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Criar conta', exact: true })).toBeVisible();
  const nameInput = page.getByLabel('Nome', { exact: true });
  const emailInput = page.getByLabel('Email', { exact: true });
  const passwordInput = page.getByLabel('Palavra-passe', { exact: true });
  const confirmation = page.getByLabel('Confirmar palavra-passe', { exact: true });
  await expect(nameInput).toBeFocused();
  await expect(page.getByText('Demonstração académica: a conta fica ativa sem confirmação por email. Não use credenciais reais.')).toBeVisible();
  await expectNoAccessibilityViolations(page);

  await page.keyboard.insertText(` ${displayName} `);
  await page.keyboard.press('Tab');
  await expect(emailInput).toBeFocused();
  await page.keyboard.insertText(email);
  await page.keyboard.press('Tab');
  await expect(passwordInput).toBeFocused();
  await page.keyboard.insertText(password);
  await page.keyboard.press('Tab');
  await expect(confirmation).toBeFocused();
  await page.keyboard.insertText('confirmação diferente');
  await page.keyboard.press('Enter');
  await expect(confirmation).toBeFocused();
  await expect(confirmation).toHaveAttribute('aria-invalid', 'true');
  await expect(confirmation).toHaveAccessibleDescription('As palavras-passe não coincidem.');
  await expect(nameInput).toHaveValue(` ${displayName} `);
  await expect(emailInput).toHaveValue(email);
  await expect(passwordInput).toHaveValue(password);
  expect(registrations).toBe(0);
  expect(logins).toBe(0);

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expectNoAccessibilityViolations(page);
  await confirmation.fill(password);
  // Only this corrected submission reaches the real API: one registration per run.
  const registered = page.waitForResponse(response =>
    new URL(response.url()).pathname === '/api/auth/register' && response.request().method() === 'POST');
  await page.keyboard.press('Enter');
  const registration = await registered;
  expectRegistrationStatus(registration.status());
  expect(registration.headers()['content-type']).toContain('application/json');
  expect(await registration.json()).toEqual({ message: 'Conta criada. Inicie sessão.' });
  expect(registration.request().postDataJSON()).toEqual({ displayName: ` ${displayName} `, email, password });
  await expect(page.getByRole('heading', { name: 'Entrar na Matriz' })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('Conta criada. Inicie sessão.');
  await expect(emailInput).toBeFocused();
  await expect(passwordInput).toHaveValue('');
  expect(await page.evaluate(value => !JSON.stringify([localStorage, sessionStorage]).includes(value), password)).toBe(true);
  expect(page.url()).not.toContain(encodeURIComponent(password));
  await expect(page.getByRole('button', { name: 'Sair', exact: true })).toHaveCount(0);
  expect(registrations).toBe(1);
  expect(logins).toBe(0);
  expect((await page.request.get('/api/auth/me')).status()).toBe(401);
  await expectNoAccessibilityViolations(page);

  await page.keyboard.insertText(email);
  await page.keyboard.press('Tab');
  await expect(passwordInput).toBeFocused();
  await page.keyboard.insertText(password);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeFocused();
  const projectsLoaded = page.waitForResponse(response =>
    new URL(response.url()).pathname === '/api/projects' && response.request().method() === 'GET');
  await page.keyboard.press('Enter');
  const projects = await projectsLoaded;
  expect(projects.status()).toBe(200);
  expect(await projects.json()).toMatchObject({ items: [], pagination: { totalItems: 0 } });
  await expect(page.getByRole('heading', { name: 'Painel inicial' })).toBeVisible();
  await expect(page.getByLabel(`Utilizador: ${displayName}`, { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Lista de projetos', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Projetos', exact: true })).toBeVisible();
  await expect(page.getByText('Sem projetos acessíveis.', { exact: true })).toBeVisible();
  // No project links at all, including Alfa/Beta or other pre-existing demo data.
  await expect(page.locator('a[href^="#/projects/"]')).toHaveCount(0);
  await expectNoAccessibilityViolations(page);

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByLabel('Nome do projeto *').fill(projectName);
  const projectCreated = page.waitForResponse(response =>
    new URL(response.url()).pathname === '/api/projects' && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Criar projeto', exact: true }).click();
  const created = await projectCreated;
  expect(created.status()).toBe(201);
  expect(await created.json()).toMatchObject({ name: projectName, currentRole: 'MANAGER' });
  await expect(page.getByRole('link', { name: projectName, exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('link', { name: projectName, exact: true })).toBeVisible();
  await expect(page.locator('a[href^="#/projects/"]')).toHaveCount(1);
  const ownProjects = await (await page.request.get('/api/projects')).json();
  const ownId = ownProjects.items[0].id as string;
  const managerContext = await browser.newContext({ baseURL: new URL(page.url()).origin });
  try {
    const manager = await managerContext.newPage();
    await signIn(manager);
    const sharedName = `Partilhado ${suffix}`;
    const sharedId = await createFixtureProject(manager, sharedName);
    const privateId = await createFixtureProject(manager, `Privado ${suffix}`);
    await manager.goto(`/#/projects/${sharedId}`);
    await manager.getByText('Participantes do projeto', { exact: true }).click();
    const members = manager.locator('details').filter({ has: manager.getByText('Participantes do projeto', { exact: true }) });
    const input = members.getByLabel('Email completo do membro');
    await expect(input).toHaveAttribute('type', 'text');
    await expect(input).not.toHaveAttribute('list', /.+/);
    await expect(members.getByRole('listbox')).toHaveCount(0);
    await expect(members).not.toContainText('user-ana');
    await expect(members.getByText('Ana · Gestor', { exact: true })).toBeVisible();
    for (const value of [` ${email.toUpperCase()} `, email]) {
      await input.fill(value);
      const response = manager.waitForResponse(r => r.url().endsWith(`/api/projects/${sharedId}/members`) && r.request().method() === 'POST');
      await members.getByRole('button', { name: 'Adicionar membro', exact: true }).click();
      const added = await response;
      expect(added.status()).toBe(204);
      expect(added.request().postDataJSON()).toEqual({ email: value });
      await expect(members.getByRole('status').filter({ hasText: 'Participação confirmada.' })).toHaveText('Participação confirmada. Adicionar novamente não cria duplicados.');
      const membership = members.getByRole('listitem').filter({ hasText: displayName });
      await expect(membership).toHaveCount(1);
      await expect(membership).toContainText(`${displayName} · Membro`);
    }
    const people = await (await manager.request.get(`/api/projects/${sharedId}/members`)).json() as { id: string; displayName: string; role: string }[];
    expect(people.filter(person => person.displayName === displayName)).toHaveLength(1);
    const person = people.find(person => person.displayName === displayName)!;
    expect(person.role).toBe('MEMBER');
    await expect(members).not.toContainText(person.id);
    // Unknown account is a real API refusal; no account lifecycle endpoint exists.
    const missingEmail = `missing.${suffix}@example.invalid`;
    await input.fill(missingEmail);
    const refused = manager.waitForResponse(r => r.url().endsWith(`/api/projects/${sharedId}/members`) && r.request().method() === 'POST');
    await members.getByRole('button', { name: 'Adicionar membro', exact: true }).click();
    const unknown = await refused;
    expect(unknown.status()).toBe(422);
    const unknownProblem = await unknown.json();
    await expect(input).toBeFocused();
    await expect(input).toHaveValue(missingEmail);
    await expect(input).toHaveAccessibleDescription('Conta não elegível.');
    // Inactive UI contract only: seed has no inactive account and we never mutate it.
    // The real unknown/inactive equivalence is covered by isolated B1 API tests.
    const memberURL = `**/api/projects/${sharedId}/members`;
    await manager.route(memberURL, async route => {
      if (route.request().method() === 'POST') await route.fulfill({
        status: 422, contentType: 'application/problem+json', body: JSON.stringify(unknownProblem),
      }); else await route.continue();
    });
    await input.fill(`inactive.${suffix}@example.invalid`);
    await members.getByRole('button', { name: 'Adicionar membro', exact: true }).click();
    await expect(input).toHaveAccessibleDescription('Conta não elegível.');
    await expect(input).toHaveValue(`inactive.${suffix}@example.invalid`);
      await expect(members.getByRole('button', { name: 'Adicionar membro', exact: true })).toBeEnabled();
    await manager.unroute(memberURL);
    await page.reload();
    await expect(page.getByRole('link', { name: sharedName, exact: true })).toBeVisible();
    const accessible = await (await page.request.get('/api/projects')).json();
    expect(accessible.items.map((item: { id: string }) => item.id).sort()).toEqual([ownId, sharedId].sort());
    expect(accessible.items.find((item: { id: string }) => item.id === sharedId).currentRole).toBe('MEMBER');
    expect((await page.request.get(`/api/projects/${privateId}`)).status()).toBe(404);
    expect((await page.request.get('/api/projects/proj-alfa')).status()).toBe(404);
    await page.goto(`/#/projects/${sharedId}`);
    await expect(page.getByRole('heading', { name: sharedName, exact: true })).toBeVisible();
    await page.getByText('Participantes do projeto', { exact: true }).click();
    await expect(page.getByLabel('Email completo do membro')).toHaveCount(0);
    await expect(page.getByText('Gerir projeto', { exact: true })).toHaveCount(0);
    const csrf = await (await page.request.get('/api/auth/csrf')).json();
    expect((await page.request.post(`/api/projects/${sharedId}/members`, {
      headers: { [csrf.headerName]: csrf.token }, data: { email: 'bruno@example.invalid' },
    })).status()).toBe(403);
    expect((await page.request.post(`/api/projects/${privateId}/members`, {
      headers: { [csrf.headerName]: csrf.token }, data: { email },
    })).status()).toBe(404);
  } finally {
    await managerContext.close();
  }
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Entrar na Matriz' })).toBeVisible();
  await expect(passwordInput).toHaveValue('');
  expect((await page.request.get('/api/auth/me')).status()).toBe(401);
  expect(registrations).toBe(1);
  expect(logins).toBe(1);
  // Preserve this fictitious account/project; never delete existing data for cleanup.
});

test('registo fronteiras: 5/201 locais, erro servidor seguro e 6/200 Unicode brutos com login explícito', async ({ page, browser }) => {
  let realRegistrations = 0, logins = 0;
  page.on('request', request => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/auth/login') logins++;
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  const name = page.getByLabel('Nome', { exact: true });
  const email = page.getByLabel('Email', { exact: true });
  const password = page.getByLabel('Palavra-passe', { exact: true });
  const confirmation = page.getByLabel('Confirmar palavra-passe', { exact: true });
  const register = page.getByRole('button', { name: 'Criar conta', exact: true });
  const registrationCard = page.locator('.login-card');
  await name.fill('Pessoa de fronteira fictícia');
  await email.fill(`fronteira.${crypto.randomUUID()}@example.invalid`);
  await expect(password).not.toHaveAttribute('maxlength', /.+/);
  let intercepted = 0;
  // Fail closed: even a UI regression cannot spend quota on invalid boundaries.
  await page.route('**/api/auth/register', async route => {
    intercepted++;
    await route.fulfill({ status: 422, contentType: 'application/problem+json', body: JSON.stringify({
      detail: 'Palavra-passe demasiado longa', errors: [{ field: 'password', message: 'Palavra-passe demasiado longa' }],
    }) });
  });
  for (const value of ['abcde', '🚀'.repeat(5), ' '.repeat(5), 'a'.repeat(201), '🚀'.repeat(201), ' '.repeat(201)]) {
    await password.fill(value); await confirmation.fill(value);
    await register.click();
    await expect(password).toBeFocused();
    await expect(password).toHaveValue(value);
    await expect(password).toHaveAccessibleDescription(Array.from(value).length === 5 ? 'Mínimo de 6 caracteres' : 'Palavra-passe demasiado longa');
    await expect(registrationCard).not.toContainText('200');
    expect(intercepted).toBe(0);
  }
  // Locally valid six spaces reach the simulated server unchanged. This asserts
  // both error channels/focus without consuming a real registration or quota.
  await password.fill('      '); await confirmation.fill('      ');
  const safeError = page.waitForResponse(r => r.url().endsWith('/api/auth/register') && r.request().method() === 'POST');
  await register.click();
  expect((await safeError).request().postDataJSON().password).toBe('      ');
  await expect(registrationCard.getByRole('alert')).toHaveCount(2);
  await expect(password).toBeFocused();
  await expect(password).toHaveAccessibleDescription('Palavra-passe demasiado longa');
  await expect(registrationCard).not.toContainText('200');
  expect(intercepted).toBe(1);
  await page.unroute('**/api/auth/register');

  for (const value of [' 🚀éab ', '🚀'.repeat(200)]) {
    const points = Array.from(value).length;
    expect([6, 200]).toContain(points);
    if (realRegistrations) await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
    const address = `limite.${points}.${crypto.randomUUID()}@example.invalid`;
    await name.fill(`Fronteira ${points}`); await email.fill(address);
    await password.fill(value); await confirmation.fill(value);
    await expect(password).toHaveValue(value);
    const registered = page.waitForResponse(r => r.url().endsWith('/api/auth/register') && r.request().method() === 'POST');
    await register.click();
    const response = await registered;
    expectRegistrationStatus(response.status());
    realRegistrations++;
    expect(response.request().postDataJSON()).toEqual({ displayName: `Fronteira ${points}`, email: address, password: value });
    expect(await response.json()).toEqual({ message: 'Conta criada. Inicie sessão.' });
    await expect(page.getByRole('heading', { name: 'Entrar na Matriz' })).toBeVisible();
    await expect(password).toHaveValue('');
    await expect(email).toBeFocused();
    expect(logins).toBe(realRegistrations - 1);
    expect((await page.request.get('/api/auth/me')).status()).toBe(401);
    expect(await page.evaluate(secret => !JSON.stringify([localStorage, sessionStorage]).includes(secret), value)).toBe(true);
    expect(page.url()).not.toContain(encodeURIComponent(value));
    await email.fill(address); await password.fill(value);
    const login = page.waitForResponse(r => r.url().endsWith('/api/auth/login') && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    expect((await login).status()).toBe(200);
    await expect(page.getByRole('heading', { name: 'Painel inicial' })).toBeVisible();
    const projects = await (await page.request.get('/api/projects')).json();
    expect(projects.items).toEqual([]);
    if (points === 6) {
      const ownId = await createFixtureProject(page, `Próprio seis ${crypto.randomUUID()}`);
      const managerContext = await browser.newContext({ baseURL: new URL(page.url()).origin });
      try {
        const manager = await managerContext.newPage();
        await signIn(manager);
        const sharedId = await createFixtureProject(manager, `Email seis ${crypto.randomUUID()}`);
        const privateId = await createFixtureProject(manager, `Alheio seis ${crypto.randomUUID()}`);
        await manager.goto(`/#/projects/${sharedId}`);
        await manager.getByText('Participantes do projeto', { exact: true }).click();
        for (const addressVariant of [` ${address.toUpperCase()} `, address]) {
          await manager.getByLabel('Email completo do membro').fill(addressVariant);
          const membership = manager.waitForResponse(r => r.url().endsWith(`/api/projects/${sharedId}/members`) && r.request().method() === 'POST');
          await manager.getByRole('button', { name: 'Adicionar membro', exact: true }).click();
          expect((await membership).status()).toBe(204);
          await expect(manager.getByText('Participação confirmada. Adicionar novamente não cria duplicados.', { exact: true })).toBeVisible();
        }
        const members = await (await manager.request.get(`/api/projects/${sharedId}/members`)).json() as { displayName: string; role: string }[];
        expect(members.filter(member => member.displayName === 'Fronteira 6')).toEqual([expect.objectContaining({ role: 'MEMBER' })]);
        const accessible = await (await page.request.get('/api/projects')).json();
        expect(accessible.items.map((item: { id: string }) => item.id).sort()).toEqual([ownId, sharedId].sort());
        expect((await page.request.get(`/api/projects/${privateId}`)).status()).toBe(404);
        await page.goto(`/#/projects/${sharedId}`);
        await expect(page.getByRole('heading', { name: /^Email seis / })).toBeVisible();
        await page.getByText('Participantes do projeto', { exact: true }).click();
        await expect(page.getByLabel('Email completo do membro')).toHaveCount(0);
        await expect(page.getByText('Gerir projeto', { exact: true })).toHaveCount(0);
      } finally { await managerContext.close(); }
    }
    await page.getByRole('button', { name: 'Sair', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Entrar na Matriz' })).toBeVisible();
  }
  expect(realRegistrations).toBe(2);
  expect(logins).toBe(2);
});

test('percurso integrado: projeto, tarefas, filtros, atribuições, comentários e eliminação', async ({ page }) => {
  const suffix = Date.now();
  await keyboardSignIn(page);
  await page.getByLabel('Nome do projeto *').fill(`E2E ${suffix}`);
  await page.getByRole('button', { name: 'Criar projeto', exact: true }).click();
  await page.getByRole('link', { name: `E2E ${suffix}`, exact: true }).click();
  await page.getByText('Participantes do projeto', { exact: true }).click();
  await page.getByLabel('Email completo do membro').fill('bruno@example.invalid');
  await page.getByRole('button', { name: 'Adicionar membro' }).click();
  await expect(page.getByText('Bruno · Membro')).toBeVisible();
  await expect(page.getByText('Bruno · user-bruno · Membro')).toHaveCount(0);
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
  // Native browser Files preserve UTF-8 bytes without requiring Node Buffer typings.
  await page.getByLabel('Ficheiros do comentário', { exact: true }).evaluate(input => {
    if (!(input instanceof HTMLInputElement)) throw new Error('Esperado um input de ficheiros.');
    const transfer = new DataTransfer();
    transfer.items.add(new File(['Anexo do comentário de demonstração.'], 'comentario.txt', { type: 'text/plain' }));
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
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
  await detail.getByLabel('Anexos diretos', { exact: true }).evaluate(input => {
    if (!(input instanceof HTMLInputElement)) throw new Error('Esperado um input de ficheiros.');
    const transfer = new DataTransfer();
    for (let index = 0; index < 5; index++) {
      transfer.items.add(new File(['Ficheiro de teste.'], `direto-${index}.txt`, { type: 'text/plain' }));
    }
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await detail.getByRole('button', { name: 'Enviar anexos', exact: true }).click();
  await expect(detail.getByText('Anexos enviados.', { exact: true })).toBeVisible();
  await detail.getByLabel('Anexos diretos', { exact: true }).evaluate(input => {
    if (!(input instanceof HTMLInputElement)) throw new Error('Esperado um input de ficheiros.');
    const transfer = new DataTransfer();
    transfer.items.add(new File(['Limite.'], 'sexto.txt', { type: 'text/plain' }));
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
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
  await detail.getByRole('combobox', { name: 'Tipo', exact: true }).selectOption('BUG');
  await detail.getByRole('button', { name: 'Aplicar template', exact: true }).click();
  await expect(detail.getByRole('button', { name: 'Aplicar template', exact: true })).toBeDisabled();

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
    await expect(detail.getByRole('button', { name: 'Aplicar template', exact: true })).toBeDisabled();
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
  await expect(detail.getByRole('button', { name: 'Aplicar template', exact: true })).toBeEnabled();
  await detail.getByRole('combobox', { name: 'Tipo', exact: true }).selectOption('BUG');
  await expect(detail.getByRole('button', { name: 'Aplicar template', exact: true })).toBeDisabled();
});

test('templates: três tipos, criação/edição, save/refetch/erro/recuperação e ciclos independentes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await signIn(page);
  const suffix = crypto.randomUUID();
  const projectId = await createFixtureProject(page, `Templates ${suffix}`);
  const listURL = `**/api/projects/${projectId}/tasks?*`;
  const tasksURL = `/api/projects/${projectId}/tasks`;
  const creation = card(page, 'Nova tarefa');
  await exerciseTemplates(page, creation);
  const creationDescription = creation.getByLabel('Descrição', { exact: true });
  const creationNode = await creationDescription.elementHandle();
  await creation.getByLabel('Título *', { exact: true }).fill(`Template ${suffix}`);
  // Empty description after application still retains the set across GET.
  const cleanList = page.waitForResponse(r => r.url().includes(`${tasksURL}?`) && r.request().method() === 'GET');
  await page.getByRole('combobox', { name: 'Filtrar por estado', exact: true }).selectOption('TODO');
  expect((await cleanList).status()).toBe(200);
  await expect(page.getByRole('heading', { name: `Templates ${suffix}`, exact: true })).toBeVisible();
  await expect(creationDescription).toHaveValue('');
  await expect(creation.getByRole('button', { name: 'Aplicar template' })).toBeDisabled();
  await creationDescription.fill('Criação preservada.');
  // Real UI filtering also causes a recoverable failed GET, without remount.
  await page.route(listURL, route => route.fulfill({
    status: 503, contentType: 'application/problem+json', body: JSON.stringify({ detail: 'Lista indisponível neste teste.' }),
  }));
  await page.getByRole('combobox', { name: 'Filtrar por estado', exact: true }).selectOption('');
  await expect(page.getByText('Lista indisponível neste teste.', { exact: true })).toBeVisible();
  await expect(creationDescription).toHaveValue('Criação preservada.');
  await expect(creation.getByRole('button', { name: 'Aplicar template' })).toBeDisabled();
  expect(await creationDescription.evaluate((node, original) => node === original, creationNode)).toBe(true);
  await page.unroute(listURL);
  await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
  await expect(page.getByRole('heading', { name: `Templates ${suffix}`, exact: true })).toBeVisible();
  await page.route(`**${tasksURL}`, async route => {
    if (route.request().method() === 'POST') await route.fulfill({
      status: 422, contentType: 'application/problem+json', body: JSON.stringify({ detail: 'Criação recusada neste teste.' }),
    }); else await route.continue();
  });
  await creation.getByRole('button', { name: 'Criar tarefa', exact: true }).click();
  await expect(creation.getByRole('alert')).toHaveText('Criação recusada neste teste.');
  await expect(creationDescription).toHaveValue('Criação preservada.');
  await expect(creation.getByRole('button', { name: 'Aplicar template' })).toBeDisabled();
  await page.unroute(`**${tasksURL}`);
  const createdResponse = page.waitForResponse(r => r.url().endsWith(tasksURL) && r.request().method() === 'POST');
  await creation.getByRole('button', { name: 'Criar tarefa', exact: true }).click();
  const created = await createdResponse;
  expect(created.status()).toBe(201);
  expect(created.request().postDataJSON()).not.toHaveProperty('appliedTypes');
  const task = await created.json() as Task;
  await expect(creationDescription).toHaveValue('');
  for (const type of ['TASK', 'BUG', 'IMPROVEMENT']) {
    await creation.getByRole('combobox', { name: 'Tipo', exact: true }).selectOption(type);
    await expect(creation.getByRole('button', { name: 'Aplicar template' })).toBeEnabled();
  }
  await page.getByRole('link', { name: task.title, exact: true }).click();
  const editor = card(page, 'Editar tarefa');
  await exerciseTemplates(page, editor);
  const description = editor.getByLabel('Descrição', { exact: true });
  const originalNode = await description.elementHandle();
  const apply = editor.getByRole('button', { name: 'Aplicar template' });
  const base = `${tasksURL}/${task.id}`;
  async function save() {
    const saved = page.waitForResponse(r => r.url().endsWith(base) && r.request().method() === 'PUT');
    await editor.getByRole('button', { name: 'Guardar tarefa' }).click();
    expect((await saved).status()).toBe(200);
    await expect(editor.getByRole('status')).toHaveText('Alteração guardada.');
    await expect(page.getByText('A atualizar detalhe… Os rascunhos mantêm-se.')).toHaveCount(0);
    await expect(apply).toBeDisabled();
  }
  await description.fill('Descrição gravada.');
  await save();
  async function externalDescription(value: string) {
    const currentResponse = await page.request.get(base);
    expect(currentResponse.status()).toBe(200);
    const current = await currentResponse.json() as Task;
    await writeFixture(page, base, 'put', {
      title: current.title, description: value, status: current.status, priority: current.priority,
      type: current.type, weight: current.weight, closeReason: current.closeReason, version: current.version,
    });
  }
  async function refreshThroughComment(text: string) {
    const response = page.waitForResponse(r => r.url().endsWith(base) && r.request().method() === 'GET');
    await page.getByLabel('Novo comentário', { exact: true }).fill(text);
    await page.getByRole('button', { name: 'Adicionar comentário', exact: true }).click();
    await (await response).finished();
    await expect(page.getByText('A atualizar detalhe… Os rascunhos mantêm-se.')).toHaveCount(0);
    await expect(apply).toBeDisabled();
    expect(await description.evaluate((node, original) => node === original, originalNode)).toBe(true);
  }
  await externalDescription('Atualização externa limpa.');
  await refreshThroughComment('GET com editor limpo.');
  await expect(description).toHaveValue('Atualização externa limpa.');
  await description.fill('Rascunho local sujo.');
  await externalDescription('Atualização externa suja.');
  await refreshThroughComment('GET com editor sujo.');
  await expect(description).toHaveValue('Rascunho local sujo.');
  // Dirty GET must not advance the version: a real server 409 follows.
  const stale = page.waitForResponse(r => r.url().endsWith(base) && r.request().method() === 'PUT');
  await editor.getByRole('button', { name: 'Guardar tarefa' }).click();
  expect((await stale).status()).toBe(409);
  await expect(description).toHaveValue('Rascunho local sujo.');
  await expect(apply).toBeDisabled();
  const recover = editor.getByRole('button', { name: 'Consultar versão atual (substitui o rascunho)' });
  await confirmOnce(page, false, () => recover.click(), () => expect(description).toHaveValue('Rascunho local sujo.'));
  await confirmOnce(page, true, () => recover.click(), () => expect(editor.getByRole('status')).toHaveText('Versão atual consultada.'));
  await expect(description).toHaveValue('Atualização externa suja.');
  await expect(apply).toBeDisabled();
  // Recoverable detail GET does not remount the editor either.
  await page.route(`**${base}`, async route => {
    if (route.request().method() === 'GET') await route.fulfill({
      status: 503, contentType: 'application/problem+json', body: JSON.stringify({ detail: 'Detalhe indisponível neste teste.' }),
    }); else await route.continue();
  });
  await refreshThroughComment('GET recuperável.');
  await expect(page.getByText('Detalhe indisponível neste teste.', { exact: true })).toBeVisible();
  await expect(description).toHaveValue('Atualização externa suja.');
  await page.unroute(`**${base}`);
  await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
  await expect(page.getByText('Detalhe indisponível neste teste.', { exact: true })).toHaveCount(0);
  for (const type of ['TASK', 'BUG', 'IMPROVEMENT']) {
    await editor.getByRole('combobox', { name: 'Tipo', exact: true }).selectOption(type);
    await expect(apply).toBeDisabled();
  }
  await save();
  await page.getByRole('button', { name: 'Fechar detalhe' }).click();
  await page.getByRole('link', { name: task.title, exact: true }).click();
  await expect(card(page, 'Editar tarefa').getByRole('button', { name: 'Aplicar template' })).toBeEnabled();
  await page.getByRole('button', { name: 'Fechar detalhe' }).click();
  const other = await writeFixture<Task>(page, tasksURL, 'post', { title: `Outro ciclo ${suffix}` });
  await page.goto(`/#/projects/${projectId}/tasks/${other.id}`);
  await expect(card(page, 'Editar tarefa').getByRole('button', { name: 'Aplicar template' })).toBeEnabled();
});

test('detalhe: ícones, seletores CSS/teclado, geometria responsiva e X standalone confirma uma vez', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await signIn(page);
  const projectId = await createFixtureProject(page, `Geometria ${crypto.randomUUID()}`);
  const task = await writeFixture<Task>(page, `/api/projects/${projectId}/tasks`, 'post', {
    title: 'Título longo '.repeat(15), description: '',
  });
  await page.reload();
  const origin = page.getByRole('link', { name: task.title, exact: true });
  await origin.click();
  const detail = page.getByRole('dialog', { name: 'Detalhe da tarefa' });
  const close = page.getByRole('button', { name: 'Fechar detalhe', exact: true });
  const maximize = page.getByRole('link', { name: 'Abrir em página completa', exact: true });
  await expect(close).toBeFocused();
  await expectIcon(close, 'Fechar detalhe');
  await expectIcon(maximize, 'Abrir em página completa');
  await expect(maximize).toHaveAttribute('href', `#/projects/${projectId}/tasks/${task.id}`);
  expect(await page.locator('[inert]').count()).toBeGreaterThan(0);
  const editor = card(page, 'Editar tarefa');
  const description = editor.getByLabel('Descrição', { exact: true });
  const descriptionNode = await description.elementHandle();
  await editor.getByRole('button', { name: 'Aplicar template' }).click();
  await description.fill('Rascunho de descrição preservado.');
  await page.getByLabel('Novo comentário').fill('Rascunho de comentário preservado.');
  const commentNode = await page.getByLabel('Novo comentário').elementHandle();
  const taskHash = new URL(page.url()).hash;
  await confirmOnce(page, false, () => detail.getByRole('link', { name: '← Projeto' }).click(),
    () => expect(page).toHaveURL(new RegExp(`${task.id}$`)));
  expect(new URL(page.url()).hash).toBe(taskHash);
  await confirmOnce(page, false, () => page.keyboard.press('Escape'),
    () => expect(detail).toBeVisible());
  await expect(description).toHaveValue('Rascunho de descrição preservado.');
  // Tab and Shift+Tab wrap only inside the modal.
  const last = detail.getByRole('button', { name: 'Adicionar comentário', exact: true });
  await last.focus(); await page.keyboard.press('Tab'); await expect(maximize).toBeFocused();
  await page.keyboard.press('Shift+Tab'); await expect(last).toBeFocused();

  async function checkTextSelector(button: Locator) {
    await expect(button).toHaveAttribute('type', 'button');
    const style = await button.evaluate(element => {
      const css = getComputedStyle(element);
      return {
        weight: Number(css.fontWeight), underline: css.textDecorationLine,
        background: css.backgroundColor, image: css.backgroundImage, shadow: css.boxShadow,
        borders: [css.borderTopWidth, css.borderRightWidth, css.borderBottomWidth, css.borderLeftWidth],
      };
    });
    expect(style.weight).toBeGreaterThanOrEqual(700);
    expect(style.underline).toContain('underline');
    expect(style.background).toBe('rgba(0, 0, 0, 0)');
    expect(style.image).toBe('none'); expect(style.shadow).toBe('none');
    expect(style.borders).toEqual(['0px', '0px', '0px', '0px']);
  }
  for (const markdown of [editor.locator('.markdown-editor'), card(page, 'Atividade').locator('.markdown-editor')]) {
    const edit = markdown.getByRole('button', { name: 'Editar', exact: true });
    const preview = markdown.getByRole('button', { name: 'Pré-visualizar', exact: true });
    await checkTextSelector(edit); await checkTextSelector(preview);
    await edit.focus(); await page.keyboard.press('Tab'); await expect(preview).toBeFocused();
    expect(await preview.evaluate(node => {
      const css = getComputedStyle(node);
      return css.outlineStyle !== 'none' && parseFloat(css.outlineWidth) > 0;
    })).toBe(true);
    await page.keyboard.press('Enter');
    await expect(preview).toHaveAttribute('aria-pressed', 'true');
    await expect(edit).toHaveAttribute('aria-pressed', 'false');
    await preview.hover(); await checkTextSelector(preview);
    expect(await preview.evaluate(node => getComputedStyle(node).textDecorationThickness))
      .not.toBe(await edit.evaluate(node => getComputedStyle(node).textDecorationThickness));
    await page.keyboard.press('Shift+Tab'); await expect(edit).toBeFocused();
    await page.keyboard.press('Space'); await expect(edit).toHaveAttribute('aria-pressed', 'true');
  }
  const activity = card(page, 'Atividade');
  const comments = activity.getByRole('button', { name: 'Comentários', exact: true });
  const history = activity.getByRole('button', { name: 'Histórico', exact: true });
  const all = activity.getByRole('button', { name: 'Toda a atividade', exact: true });
  for (const button of [comments, history, all]) await checkTextSelector(button);
  await comments.focus(); await page.keyboard.press('Tab'); await expect(history).toBeFocused();
  await page.keyboard.press('Enter'); await expect(history).toHaveAttribute('aria-pressed', 'true');
  await history.hover(); await checkTextSelector(history);
  await expect(activity.getByText('Histórico sem eventos de comentários.', { exact: false })).toBeVisible();
  await page.keyboard.press('Tab'); await expect(all).toBeFocused();
  await page.keyboard.press('Space'); await expect(all).toHaveAttribute('aria-pressed', 'true');
  await all.hover(); await checkTextSelector(all);
  expect(await all.evaluate(node => {
    const css = getComputedStyle(node);
    return css.outlineStyle !== 'none' && parseFloat(css.outlineWidth) > 0;
  })).toBe(true);
  await comments.click();
  await expect(page.getByRole('button', { name: 'Escrever', exact: true })).toHaveCount(0);

  const save = editor.getByRole('button', { name: 'Guardar tarefa', exact: true });
  const remove = editor.getByRole('button', { name: 'Eliminar tarefa', exact: true });
  await expect(save).toHaveAttribute('type', 'submit');
  await expect(remove).toHaveAttribute('type', 'button');
  let deletes = 0;
  let taskWrites = 0;
  page.on('request', request => {
    if (new URL(request.url()).pathname === `/api/projects/${projectId}/tasks/${task.id}` && request.method() === 'DELETE') deletes++;
    if (new URL(request.url()).pathname === `/api/projects/${projectId}/tasks/${task.id}` && request.method() === 'PUT') taskWrites++;
  });
  let releaseSave!: () => void;
  const saveGate = new Promise<void>(resolve => { releaseSave = resolve; });
  const taskURL = `**/api/projects/${projectId}/tasks/${task.id}`;
  await page.route(taskURL, async route => {
    if (route.request().method() !== 'PUT') { await route.continue(); return; }
    await saveGate;
    await route.fulfill({ status: 503, contentType: 'application/problem+json', body: JSON.stringify({ detail: 'Gravação indisponível neste teste.' }) });
  });
  try {
    await save.click();
    await expect(save).toBeDisabled();
    await expect(remove).toBeDisabled();
  } finally { releaseSave(); }
  await expect(editor.getByRole('alert')).toHaveText('Gravação indisponível neste teste.');
  expect(taskWrites).toBe(1);
  await expect(description).toHaveValue('Rascunho de descrição preservado.');
  await expect(editor.getByRole('button', { name: 'Aplicar template' })).toBeDisabled();
  await page.unroute(taskURL);
  await confirmOnce(page, false, () => remove.click(), () => expect(description).toHaveValue('Rascunho de descrição preservado.'));
  expect(deletes).toBe(0);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    await expectSameRow(save, remove);
    await close.scrollIntoViewIfNeeded();
    await expectSameRow(maximize, close);
    const toolbar = await page.locator('.task-panel-toolbar').boundingBox(), x = await close.boundingBox();
    expect(Math.abs(toolbar!.x + toolbar!.width - x!.x - x!.width)).toBeLessThanOrEqual(1);
    await expectNoOverflow(page);
    expect(await description.evaluate((node, original) => node === original, descriptionNode)).toBe(true);
    expect(await page.getByLabel('Novo comentário').evaluate((node, original) => node === original, commentNode)).toBe(true);
    await expect(editor.getByRole('button', { name: 'Aplicar template' })).toBeDisabled();
    await expectNoAccessibilityViolations(page);
    // Future authorised runtime only; default Playwright attachments, no new destination.
    await testInfo.attach(`detalhe-${width}`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await maximize.focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Detalhe da tarefa' })).toHaveCount(0);
  await expect(maximize).toHaveCount(0);
  await expect(close).toHaveCount(1);
  expect(await page.locator('[inert]').count()).toBe(0);
  expect(await description.evaluate((node, original) => node === original, descriptionNode)).toBe(true);
  await expect(description).toHaveValue('Rascunho de descrição preservado.');
  await expect(editor.getByRole('button', { name: 'Aplicar template' })).toBeDisabled();
  await confirmOnce(page, false, () => close.click(), () => expect(description).toHaveValue('Rascunho de descrição preservado.'));
  await confirmOnce(page, true, () => close.click(),
    () => expect(page.getByRole('heading', { name: /^Geometria / })).toBeVisible());
  // Reopen modal, then Escape really closes and returns focus to the task link.
  await origin.click();
  await expect(close).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Detalhe da tarefa' })).toHaveCount(0);
  await expect(origin).toBeFocused();
  expect(await page.locator('[inert]').count()).toBe(0);
  // A direct hash uses standalone routing (B3-01), not the retained panel tree.
  await page.goto(`/#/projects/${projectId}/tasks/${task.id}`);
  await expect(page.getByRole('heading', { name: task.title, exact: true })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(maximize).toHaveCount(0);
  await expect(close).toHaveCount(1);
  await expect(card(page, 'Editar tarefa').getByRole('button', { name: 'Aplicar template' })).toBeEnabled();
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    await expectSameRow(save, remove);
    await close.scrollIntoViewIfNeeded();
    const toolbar = await page.locator('.task-panel-toolbar').boundingBox(), x = await close.boundingBox();
    expect(Math.abs(toolbar!.x + toolbar!.width - x!.x - x!.width)).toBeLessThanOrEqual(1);
    await expectNoOverflow(page);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await card(page, 'Editar tarefa').getByLabel('Descrição', { exact: true }).fill('Standalone não descartar duas vezes.');
  await confirmOnce(page, false, () => close.click(),
    () => expect(card(page, 'Editar tarefa').getByLabel('Descrição', { exact: true })).toHaveValue('Standalone não descartar duas vezes.'));
  expect(new URL(page.url()).hash).toBe(taskHash);
  await confirmOnce(page, true, () => close.click(),
    () => expect(page.getByRole('heading', { name: /^Geometria / })).toBeVisible());
  // Confirmed task deletion is one request, never a form submit.
  await origin.click();
  const deleted = page.waitForResponse(r => r.url().includes(`/tasks/${task.id}?version=`) && r.request().method() === 'DELETE');
  await confirmOnce(page, true, () => card(page, 'Editar tarefa').getByRole('button', { name: 'Eliminar tarefa' }).click(),
    () => expect(page.getByText('Sem tarefas para os critérios selecionados.', { exact: true })).toBeVisible());
  expect((await deleted).status()).toBe(204);
  expect(deletes).toBe(1);
  expect(taskWrites).toBe(1); // The only PUT was the explicit failed save, never delete.
});

test('anexos: seleção local, multipart/validação real, ícones responsivos e autor/gestor versus membro', async ({ page, browser }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await signIn(page);
  const projectId = await createFixtureProject(page, `Anexos ${crypto.randomUUID()}`);
  const membersURL = `/api/projects/${projectId}/members`;
  // Existing integration by exact seed ID remains supported; no seed/option IDs change.
  await writeFixture(page, membersURL, 'post', { userId: 'user-bruno' });
  await writeFixture(page, membersURL, 'post', { email: 'carla@example.invalid' });
  for (const data of [{}, { email: 'bruno@example.invalid', userId: 'user-bruno' }, { email: null }, { email: 'parcial' }]) {
    const csrf = await (await page.request.get('/api/auth/csrf')).json();
    expect((await page.request.post(membersURL, { headers: { [csrf.headerName]: csrf.token }, data })).status()).toBe(422);
  }
  const people = await (await page.request.get(membersURL)).json() as { id: string }[];
  expect(people.map(person => person.id).sort()).toEqual(['user-ana', 'user-bruno', 'user-carla']);
  const task = await writeFixture<Task>(page, `/api/projects/${projectId}/tasks`, 'post', { title: 'Anexos com metadados longos' });
  const base = `/api/projects/${projectId}/tasks/${task.id}`;
  const authorContext = await browser.newContext({ baseURL: new URL(page.url()).origin });
  const otherContext = await browser.newContext({ baseURL: new URL(page.url()).origin });
  try {
    const author = await authorContext.newPage(), other = await otherContext.newPage();
    await signIn(author, 'bruno@example.invalid');
    await author.goto(`/#/projects/${projectId}/tasks/${task.id}`);
    const attachments = card(author, 'Anexos');
    const activity = card(author, 'Atividade');
    const directName = `${'nome-direto-muito-longo-'.repeat(7)}ficticio.txt`;
    const commentName = `${'nome-comentario-muito-longo-'.repeat(6)}ficticio.md`;
    const text = 'Conteúdo fictício UTF-8 para download íntegro.';
    const commentText = '## Conteúdo fictício\n\nAnexo do comentário.';
    let deletes = 0, uploads = 0;
    author.on('request', request => {
      if (request.url().includes(`${base}/attachments`) && request.method() === 'DELETE') deletes++;
      if (request.url().endsWith(`${base}/attachments`) && request.method() === 'POST') uploads++;
    });
    const directInput = attachments.getByLabel('Anexos diretos', { exact: true });
    await directInput.evaluate((input, files) => {
      if (!(input instanceof HTMLInputElement)) throw new Error('Esperado um input de ficheiros.');
      const transfer = new DataTransfer();
      for (const file of files) transfer.items.add(new File([file.content], file.name, { type: file.mimeType }));
      input.files = transfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, [
      { name: directName, mimeType: 'text/plain', content: text },
      { name: 'retirar-local.txt', mimeType: 'text/plain', content: 'Seleção temporária.' },
    ]);
    const selected = attachments.locator('.file-picker .attachment-row');
    await expect(selected).toHaveCount(2);
    await expectAttachmentRow(selected.first(), directName, ['Retirar']);
    const localX = attachments.getByRole('button', { name: 'Retirar retirar-local.txt', exact: true });
    await localX.focus(); await author.keyboard.press('Space');
    await expect(localX).toHaveCount(0);
    expect(deletes).toBe(0); expect(uploads).toBe(0);
    for (const kind of ['drop', 'paste'] as const) {
      await attachments.locator('.file-picker').evaluate((picker, eventKind) => {
        const transfer = new DataTransfer();
        transfer.items.add(new File(['Ficheiro local fictício.'], `${eventKind}.txt`, { type: 'text/plain' }));
        picker.dispatchEvent(eventKind === 'drop'
          ? new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer })
          : new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: transfer }));
      }, kind);
      const selectedX = attachments.getByRole('button', { name: `Retirar ${kind}.txt`, exact: true });
      await expect(selectedX).toBeVisible();
      await selectedX.focus(); await author.keyboard.press('Enter');
      await expect(selectedX).toHaveCount(0);
    }
    expect(deletes).toBe(0); expect(uploads).toBe(0);
    for (const width of [1440, 390, 320]) {
      await author.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
      await expectAttachmentRow(selected, directName, ['Retirar']);
      await expectNoOverflow(author);
    }
    // Valid extension passes UI but real server rejects text markup atomically.
    await directInput.evaluate(input => {
      if (!(input instanceof HTMLInputElement)) throw new Error('Esperado um input de ficheiros.');
      const transfer = new DataTransfer();
      transfer.items.add(new File(['<p>Formato textual recusado.</p>'], 'invalido.txt', { type: 'text/plain' }));
      input.files = transfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    const invalid = author.waitForResponse(r => r.url().endsWith(`${base}/attachments`) && r.request().method() === 'POST');
    await attachments.getByRole('button', { name: 'Enviar anexos', exact: true }).click();
    expect((await invalid).status()).toBe(422);
    await expect(attachments.getByRole('alert').first()).toBeVisible();
    await expect(selected).toHaveCount(2);
    const afterFailure = await (await author.request.get(`${base}/attachments`)).json();
    expect(afterFailure.items).toEqual([]);
    await attachments.getByRole('button', { name: 'Retirar invalido.txt', exact: true }).click();
    const uploaded = author.waitForResponse(r => r.url().endsWith(`${base}/attachments`) && r.request().method() === 'POST');
    await attachments.getByRole('button', { name: 'Enviar anexos', exact: true }).click();
    const directResponse = await uploaded;
    expect(directResponse.status()).toBe(201);
    expect(directResponse.request().headers()['content-type']).toContain('multipart/form-data; boundary=');
    const direct = (await directResponse.json() as { items: TaskAttachment[] }).items[0];
    expect(direct).toMatchObject({ filename: directName, canDelete: true, author: { id: 'user-bruno' }, commentId: null });
    await expect(attachments.getByText('Anexos enviados.', { exact: true })).toBeVisible();
    await expect(selected).toHaveCount(0);
    const savedDirect = attachments.locator('.attachment-row').filter({ hasText: directName });
    await expectAttachmentRow(savedDirect, directName, ['Descarregar', 'Eliminar']);

    await activity.getByLabel('Novo comentário').fill('Comentário multipart com ficheiros fictícios.');
    await activity.getByLabel('Ficheiros do comentário', { exact: true }).evaluate((input, files) => {
      if (!(input instanceof HTMLInputElement)) throw new Error('Esperado um input de ficheiros.');
      const transfer = new DataTransfer();
      for (const file of files) transfer.items.add(new File([file.content], file.name, { type: file.mimeType }));
      input.files = transfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, [
      { name: commentName, mimeType: 'text/markdown', content: commentText },
      { name: 'comentario-local.txt', mimeType: 'text/plain', content: 'Local.' },
    ]);
    await expectAttachmentRow(activity.locator('.file-picker .attachment-row').first(), commentName, ['Retirar']);
    await activity.getByRole('button', { name: 'Retirar comentario-local.txt', exact: true }).click();
    expect(deletes).toBe(0);
    for (const width of [1440, 390, 320]) {
      await author.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
      await expectAttachmentRow(activity.locator('.file-picker .attachment-row'), commentName, ['Retirar']);
      await expectNoOverflow(author);
    }
    // Injected write failure tests preserved draft, files and busy; real multipart
    // below still exercises the server. No synthetic success replaces an API write.
    let releaseComment!: () => void;
    const commentGate = new Promise<void>(resolve => { releaseComment = resolve; });
    let failedCommentRequests = 0;
    await author.route(`**${base}/comments`, async route => {
      failedCommentRequests++;
      await commentGate;
      await route.fulfill({ status: 503, contentType: 'application/problem+json', body: JSON.stringify({ detail: 'Comentário indisponível neste teste.' }) });
    });
    try {
      await activity.getByRole('button', { name: 'Adicionar comentário', exact: true }).click();
      await expect(activity.getByRole('button', { name: 'A enviar…', exact: true })).toBeDisabled();
      await expect(activity.getByRole('button', { name: `Retirar ${commentName}`, exact: true })).toBeDisabled();
    } finally { releaseComment(); }
    await expect(activity.getByRole('alert')).toHaveText('Comentário indisponível neste teste.');
    expect(failedCommentRequests).toBe(1);
    await expect(activity.getByLabel('Novo comentário')).toHaveValue('Comentário multipart com ficheiros fictícios.');
    await expect(activity.getByRole('button', { name: `Retirar ${commentName}`, exact: true })).toBeVisible();
    await author.unroute(`**${base}/comments`);
    const commented = author.waitForResponse(r => r.url().endsWith(`${base}/comments`) && r.request().method() === 'POST');
    await activity.getByRole('button', { name: 'Adicionar comentário', exact: true }).click();
    const commentResponse = await commented;
    expect(commentResponse.status()).toBe(201);
    expect(commentResponse.request().headers()['content-type']).toContain('multipart/form-data; boundary=');
    const comment = await commentResponse.json() as TaskComment;
    expect(comment).toMatchObject({
      taskId: task.id, content: 'Comentário multipart com ficheiros fictícios.', author: { id: 'user-bruno' },
    });
    expect(comment.attachments).toHaveLength(1);
    const commentFile = comment.attachments[0];
    expect(commentFile).toMatchObject({
      filename: commentName, contentType: 'text/markdown', sizeBytes: new TextEncoder().encode(commentText).length,
      author: { id: 'user-bruno' }, commentId: comment.id, canDelete: true,
    });
    const commentBytes = await author.request.get(`${base}/attachments/${commentFile.id}`);
    expect(commentBytes.status()).toBe(200);
    expect((await commentBytes.body()).toString('utf8')).toBe(commentText);
    await expect(activity.getByLabel('Novo comentário')).toHaveValue('');
    await expectAttachmentRow(activity.locator('article .attachment-row'), commentName, ['Descarregar', 'Eliminar']);
    await activity.getByRole('button', { name: 'Toda a atividade', exact: true }).click();
    await expectAttachmentRow(activity.locator('article .attachment-row'), commentName, ['Descarregar', 'Eliminar']);
    await activity.getByRole('button', { name: 'Histórico', exact: true }).click();
    await expect(activity.getByRole('button', { name: `Descarregar ${commentName}`, exact: true })).toHaveCount(0);
    await activity.getByRole('button', { name: 'Comentários', exact: true }).click();
    for (const width of [1440, 390, 320]) {
      await author.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
      await expectAttachmentRow(savedDirect, directName, ['Descarregar', 'Eliminar']);
      await expectAttachmentRow(activity.locator('article .attachment-row'), commentName, ['Descarregar', 'Eliminar']);
      await expectNoOverflow(author);
      await expectNoAccessibilityViolations(author);
      await testInfo.attach(`anexos-${width}`, { body: await author.screenshot({ fullPage: true }), contentType: 'image/png' });
    }
    const down = attachments.getByRole('button', { name: `Descarregar ${directName}`, exact: true });
    const download = author.waitForEvent('download');
    await down.focus(); await author.keyboard.press('Enter');
    expect((await download).suggestedFilename()).toBe(directName);
    await expect(attachments.getByText('Download solicitado.', { exact: true })).toBeVisible();
    const bytes = await author.request.get(`${base}/attachments/${direct.id}`);
    expect(bytes.status()).toBe(200);
    expect(bytes.headers()['content-disposition']).toContain('attachment');
    expect(bytes.headers()['x-content-type-options']).toBe('nosniff');
    expect(bytes.headers()['cache-control']).toContain('no-store');
    expect((await bytes.body()).toString('utf8')).toBe(text);
    await author.route(`**${base}/attachments/${direct.id}`, route => route.fulfill({
      status: 503, contentType: 'application/problem+json', body: JSON.stringify({ detail: 'Download indisponível neste teste.' }),
    }));
    await down.click();
    await expect(attachments.getByText('Download indisponível neste teste.', { exact: true })).toBeVisible();
    await expect(attachments.getByText('Download solicitado.', { exact: true })).toHaveCount(0);
    await author.unroute(`**${base}/attachments/${direct.id}`);
    await activity.getByLabel('Novo comentário').fill('Rascunho preservado ao cancelar eliminação.');
    await confirmOnce(author, false, () => attachments.getByRole('button', { name: `Eliminar ${directName}`, exact: true }).click(),
      () => expect(savedDirect).toBeVisible());
    expect(deletes).toBe(0);
    await expect(activity.getByLabel('Novo comentário')).toHaveValue('Rascunho preservado ao cancelar eliminação.');

    await signIn(other, 'carla@example.invalid');
    await other.goto(`/#/projects/${projectId}/tasks/${task.id}`);
    for (const filename of [directName, commentName]) {
      const row = other.locator('.attachment-row').filter({ hasText: filename });
      await expectAttachmentRow(row, filename, ['Descarregar']);
      await expect(other.getByRole('button', { name: `Eliminar ${filename}`, exact: true })).toHaveCount(0);
    }
    const otherCsrf = await (await other.request.get('/api/auth/csrf')).json();
    for (const file of [direct, commentFile]) {
      expect((await other.request.delete(`${base}/attachments/${file.id}`, {
        headers: { [otherCsrf.headerName]: otherCsrf.token },
      })).status()).toBe(403);
    }
    // Manager can delete another participant's comment attachment; cancelled
    // confirmation sends nothing, failed delete keeps the row and explicit error.
    await page.goto(`/#/projects/${projectId}/tasks/${task.id}`);
    const managerRow = card(page, 'Atividade').locator('article .attachment-row');
    await expectAttachmentRow(managerRow, commentName, ['Descarregar', 'Eliminar']);
    await confirmOnce(page, false, () => managerRow.getByRole('button', { name: `Eliminar ${commentName}`, exact: true }).click(),
      () => expect(managerRow).toBeVisible());
    let releaseDelete!: () => void;
    const deleteGate = new Promise<void>(resolve => { releaseDelete = resolve; });
    let failedDeletes = 0;
    await page.route(`**${base}/attachments/${commentFile.id}`, async route => {
      failedDeletes++;
      await deleteGate;
      await route.fulfill({ status: 503, contentType: 'application/problem+json', body: JSON.stringify({ detail: 'Eliminação indisponível neste teste.' }) });
    });
    try {
      await confirmOnce(page, true, () => managerRow.getByRole('button', { name: `Eliminar ${commentName}`, exact: true }).click(),
        () => expect(managerRow.getByRole('button', { name: `Descarregar ${commentName}`, exact: true })).toBeDisabled());
      await expect(managerRow.getByRole('button', { name: `Eliminar ${commentName}`, exact: true })).toBeDisabled();
    } finally { releaseDelete(); }
    await expect(page.getByText('Eliminação indisponível neste teste.', { exact: true })).toBeVisible();
    expect(failedDeletes).toBe(1);
    await expect(managerRow).toBeVisible();
    await page.unroute(`**${base}/attachments/${commentFile.id}`);
    const managerDeleted = page.waitForResponse(r => r.url().endsWith(`/attachments/${commentFile.id}`) && r.request().method() === 'DELETE');
    await confirmOnce(page, true, () => managerRow.getByRole('button', { name: `Eliminar ${commentName}`, exact: true }).click(),
      () => expect(managerRow).toHaveCount(0));
    expect((await managerDeleted).status()).toBe(204);
    // Measure confirmed deletion and its refetched list: LoadState remounts
    // AttachmentList, so its local success message is transient.
    const authorDeleted = author.waitForResponse(r => new URL(r.url()).pathname === `${base}/attachments/${direct.id}` && r.request().method() === 'DELETE');
    const authorRefetched = author.waitForResponse(r => new URL(r.url()).pathname === `${base}/attachments`
      && r.request().method() === 'GET' && r.ok());
    await confirmOnce(author, true, () => attachments.getByRole('button', { name: `Eliminar ${directName}`, exact: true }).click(),
      async () => {
        expect((await authorDeleted).status()).toBe(204);
        const refreshed = await authorRefetched;
        expect(refreshed.status()).toBe(200);
        const listing = await refreshed.json() as { items: TaskAttachment[] };
        expect(listing.items.map(file => file.id)).not.toContain(direct.id);
        expect(listing.items.map(file => file.filename)).not.toContain(directName);
        await expect(attachments.getByText('Sem anexos diretos.', { exact: true })).toBeVisible();
        await expect(savedDirect).toHaveCount(0);
        await expect(attachments.getByRole('alert')).toHaveCount(0);
        expect(deletes).toBe(1);
      });
    // Another upload proves author status does not bypass revoked project access.
    await directInput.evaluate((input, content) => {
      if (!(input instanceof HTMLInputElement)) throw new Error('Esperado um input de ficheiros.');
      const transfer = new DataTransfer();
      transfer.items.add(new File([content], 'acesso-revogado.txt', { type: 'text/plain' }));
      input.files = transfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, text);
    const retainedResponse = author.waitForResponse(r => r.url().endsWith(`${base}/attachments`) && r.request().method() === 'POST');
    await attachments.getByRole('button', { name: 'Enviar anexos', exact: true }).click();
    const retained = (await (await retainedResponse).json() as { items: TaskAttachment[] }).items[0];
    await writeFixture(page, `${membersURL}/user-bruno`, 'delete');
    expect((await author.request.get(`${base}/attachments/${retained.id}`)).status()).toBe(404);
  } finally {
    await authorContext.close();
    await otherContext.close();
  }
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
