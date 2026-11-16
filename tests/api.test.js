/**
 * Otomatik API testleri (Node.js yerleşik test koşucusu, ek bağımlılık yok).
 * Çalıştırma: npm test
 * Testler geçici bir JSON dosyası kullanır; data/tasks.json'a dokunmaz.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'taskflow-'));
process.env.TASKS_FILE = path.join(tmpDir, 'tasks.json');
process.env.LOG_FILE = path.join(tmpDir, 'requests.log');
process.env.LOG_TO_CONSOLE = 'false';

const app = require('../src/app');

let server;
let base;

async function api(method, url, body) {
  const res = await fetch(base + url, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

const sample = { title: 'Backend görevi', description: 'API yaz', priority: 'high', assignee: 'musa' };

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.close();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('CRUD: oluştur, listele, detay, güncelle, sil', async () => {
  const created = await api('POST', '/tasks', sample);
  assert.equal(created.status, 201);
  assert.equal(created.body.data.status, 'todo');
  const id = created.body.data.id;

  const list = await api('GET', '/tasks');
  assert.equal(list.status, 200);
  assert.ok(list.body.data.some((t) => t.id === id));

  const detail = await api('GET', `/tasks/${id}`);
  assert.equal(detail.body.data.title, 'Backend görevi');

  const put = await api('PUT', `/tasks/${id}`, { ...sample, status: 'in-progress', title: 'Yeni başlık' });
  assert.equal(put.status, 200);
  assert.equal(put.body.data.title, 'Yeni başlık');

  const patch = await api('PATCH', `/tasks/${id}`, { status: 'completed' });
  assert.equal(patch.body.data.status, 'completed');
  assert.equal(patch.body.data.title, 'Yeni başlık');

  const del = await api('DELETE', `/tasks/${id}`);
  assert.equal(del.status, 200);

  const gone = await api('GET', `/tasks/${id}`);
  assert.equal(gone.status, 404);
});

test('Validation: eksik/geçersiz alanlar 400 döner', async () => {
  const missing = await api('POST', '/tasks', { description: 'x' });
  assert.equal(missing.status, 400);
  const fields = missing.body.errors.map((e) => e.field);
  assert.ok(fields.includes('title') && fields.includes('priority') && fields.includes('assignee'));

  const badPriority = await api('POST', '/tasks', { ...sample, priority: 'urgent' });
  assert.equal(badPriority.status, 400);

  const badJson = await api('POST', '/tasks', '{bozuk json');
  assert.equal(badJson.status, 400);

  const badId = await api('GET', '/tasks/abc');
  assert.equal(badId.status, 400);

  const badQuery = await api('GET', '/tasks?status=done');
  assert.equal(badQuery.status, 400);
});

test('Filtreleme, arama, sıralama ve sayfalama', async () => {
  await api('POST', '/tasks', { ...sample, title: 'Frontend login', priority: 'low', assignee: 'ayse', status: 'completed' });
  await api('POST', '/tasks', { ...sample, title: 'Backend logger', priority: 'medium' });
  await api('POST', '/tasks', { ...sample, title: 'Backend raporlama', priority: 'high' });

  const completed = await api('GET', '/tasks?status=completed');
  assert.ok(completed.body.data.every((t) => t.status === 'completed'));

  const high = await api('GET', '/tasks?priority=high');
  assert.ok(high.body.data.every((t) => t.priority === 'high'));

  const search = await api('GET', '/tasks/search?keyword=backend');
  assert.ok(search.body.count >= 1);
  assert.ok(search.body.data.every((t) => /backend/i.test(t.title + t.description)));

  const byAssignee = await api('GET', '/tasks/assignee/musa');
  assert.ok(byAssignee.body.data.every((t) => t.assignee === 'musa'));

  const sorted = await api('GET', '/tasks?sort=-priority');
  assert.equal(sorted.body.data[0].priority, 'high');

  const page = await api('GET', '/tasks?page=1&limit=1');
  assert.equal(page.body.data.length, 1);
  assert.equal(page.body.pagination.limit, 1);
});

test('Raporlar', async () => {
  const summary = await api('GET', '/reports/summary');
  assert.equal(summary.status, 200);
  const s = summary.body.data;
  assert.equal(s.completed + s.pending, s.totalTasks);

  const completed = await api('GET', '/reports/completed');
  assert.equal(completed.body.data.count, s.completed);

  const pending = await api('GET', '/reports/pending');
  assert.equal(pending.body.data.count, s.pending);
});

test('Logger: istekler log dosyasına yazılır', async () => {
  await api('GET', '/health');
  await new Promise((r) => setTimeout(r, 100));
  const log = fs.readFileSync(process.env.LOG_FILE, 'utf-8');
  assert.match(log, /\] GET \/health 200 - [\d.]+ ms/);
});

test('Bilinmeyen endpoint 404 döner', async () => {
  const res = await api('GET', '/olmayan');
  assert.equal(res.status, 404);
});
