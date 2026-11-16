# TaskFlow API

Görev ve proje yönetimi için Node.js + Express ile yazdığım basit bir REST API.
Görev ekleme, listeleme, detay, güncelleme ve silme işlemlerini yapıyor. Veriler `data/tasks.json` dosyasında tutuluyor, veritabanı kurmaya gerek yok.

## Kullanılanlar

- Node.js (18 ve üstü)
- Express.js
- Veri saklama için JSON dosyası
- Test için Postman

## Kurulum

1. Repoyu indir:

```bash
git clone https://github.com/serra0781/TaskFlow.git
cd TaskFlow
```

2. Paketleri yükle:

```bash
npm install
```

3. (İsteğe bağlı) Örnek görevleri yükle:

```bash
npm run seed
```

4. Sunucuyu başlat:

```bash
npm start
```

Sunucu `http://localhost:3000` adresinde çalışır. Port değiştirmek için `PORT=4000 npm start` kullanılabilir.

## Klasör yapısı

```
src/
  app.js            -> express ayarları ve middleware'ler
  server.js         -> sunucuyu başlatır
  config/           -> port, dosya yolları, sabitler
  routes/           -> endpoint tanımları
  controllers/      -> istek/cevap işlemleri
  services/         -> görev ve rapor işlemleri (JSON okuma/yazma)
  middlewares/      -> logger, validation, hata yönetimi
  utils/            -> JSON dosya işlemleri, hata sınıfı
data/tasks.json     -> görev verileri
logs/requests.log   -> logger çıktısı (otomatik oluşur)
postman/            -> Postman koleksiyonu
docs/               -> proje tanıtım dokümanı ve ekran görüntüleri
```

## Endpointler

| Method | Endpoint | Açıklama |
|---|---|---|
| POST | /tasks | Yeni görev ekler |
| GET | /tasks | Tüm görevleri listeler |
| GET | /tasks/:id | Görev detayı |
| PUT | /tasks/:id | Görevi günceller (tüm alanlar) |
| PATCH | /tasks/:id | Görevin bazı alanlarını günceller |
| DELETE | /tasks/:id | Görevi siler |
| GET | /tasks?status=completed | Duruma göre filtre |
| GET | /tasks?priority=high | Önceliğe göre filtre |
| GET | /tasks/assignee/musa | Kişiye göre listeleme |
| GET | /tasks/search?keyword=backend | Başlık/açıklamada arama |
| GET | /tasks?sort=createdAt | Sıralama (`-createdAt` ters sıra) |
| GET | /tasks?page=1&limit=10 | Sayfalama |
| GET | /reports/completed | Tamamlanan görevler |
| GET | /reports/pending | Bekleyen görevler |
| GET | /reports/summary | Genel özet |

Görev alanları:

```json
{
  "title": "Login sayfası",
  "description": "Giriş ekranını hazırla",
  "status": "todo",
  "priority": "high",
  "assignee": "musa",
  "project": "Web Portal",
  "dueDate": "2026-12-31"
}
```

- `status`: `todo`, `in-progress`, `completed` (varsayılan `todo`)
- `priority`: `low`, `medium`, `high`
- POST için `title`, `description`, `priority`, `assignee` zorunlu. Eksik ya da hatalı veri gelirse 400 döner.

## Logger

`src/middlewares/logger.js` her isteği konsola ve `logs/requests.log` dosyasına yazar:

```
[2026-11-16T18:30:12.123Z] GET /tasks 200 - 3.41 ms
```

## Postman ile test

`postman/TaskFlow.postman_collection.json` dosyasını Postman'e import et (Import > dosyayı seç). İçinde `baseUrl` değişkeni var, varsayılanı `http://localhost:3000`.
"01 Görev Ekle" isteği oluşan görevin id'sini `taskId` değişkenine kaydediyor, diğer istekler bunu kullanıyor. Bu yüzden CRUD klasörünü sırayla çalıştırmak gerekiyor.

Ekran görüntüleri `docs/screenshots` klasöründe.

Ayrıca `npm test` ile otomatik testler de çalıştırılabilir.
