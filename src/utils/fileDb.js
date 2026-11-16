const fs = require('fs');
const path = require('path');

/**
 * JSON dosyası üzerinde çalışan basit bir veri saklama katmanı.
 * Dosya yoksa boş bir yapı ile oluşturulur.
 */
class FileDb {
  constructor(filePath) {
    this.filePath = filePath;
  }

  ensureFile() {
    if (!fs.existsSync(this.filePath)) {
      fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
      this.write({ lastId: 0, tasks: [] });
    }
  }

  read() {
    this.ensureFile();
    const raw = fs.readFileSync(this.filePath, 'utf-8');
    if (!raw.trim()) return { lastId: 0, tasks: [] };
    const data = JSON.parse(raw);
    return {
      lastId: Number(data.lastId) || 0,
      tasks: Array.isArray(data.tasks) ? data.tasks : [],
    };
  }

  write(data) {
    // Önce geçici dosyaya yazıp sonra yeniden adlandırarak dosyanın
    // yarım yazılmış halde kalmasını engelliyoruz.
    const tmpPath = `${this.filePath}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpPath, this.filePath);
  }
}

module.exports = FileDb;
