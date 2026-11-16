/**
 * Örnek verileri data/tasks.json dosyasına yazar.
 * Kullanım: npm run seed
 */
const config = require('../src/config');
const FileDb = require('../src/utils/fileDb');

const now = Date.now();
const day = 24 * 60 * 60 * 1000;
const iso = (offsetDays) => new Date(now + offsetDays * day).toISOString();

const samples = [
  ['Backend proje iskeletini oluştur', 'Node.js + Express kurulumu ve klasör yapısı', 'completed', 'high', 'musa', 'TaskFlow API', -6],
  ['Logger middleware yaz', 'Tüm isteklerin method, endpoint ve zamanını logla', 'completed', 'high', 'serra', 'TaskFlow API', -5],
  ['Görev CRUD endpointleri', 'Ekleme, listeleme, detay, güncelleme ve silme', 'in-progress', 'high', 'serra', 'TaskFlow API', 1],
  ['Postman koleksiyonu hazırla', 'Tüm CRUD uçları için test istekleri', 'todo', 'medium', 'ayse', 'TaskFlow API', 3],
  ['Login sayfası tasarımı', 'Frontend ekibi için giriş ekranı tasarımı', 'todo', 'low', 'mehmet', 'Web Portal', 7],
  ['Veritabanı yedekleme planı', 'Haftalık yedekleme senaryosunu dokümante et', 'in-progress', 'medium', 'musa', 'Altyapı', -1],
  ['Backend kod incelemesi', 'Pull request incelemesi ve geri bildirim', 'todo', 'medium', 'ayse', 'TaskFlow API', 2],
  ['Raporlama servisi', 'Tamamlanan / bekleyen görev raporları', 'completed', 'low', 'serra', 'TaskFlow API', -2],
];

const tasks = samples.map(([title, description, status, priority, assignee, project, due], i) => ({
  id: i + 1,
  title,
  description,
  status,
  priority,
  assignee,
  project,
  dueDate: iso(due).slice(0, 10),
  createdAt: iso(-10 + i),
  updatedAt: iso(-10 + i),
}));

new FileDb(config.tasksFile).write({ lastId: tasks.length, tasks });
console.log(`${tasks.length} örnek görev yazıldı -> ${config.tasksFile}`);
