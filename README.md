# OpenAppEngine

Modern, ultra-fast, multi-tenant website engine and headless CMS.

* **Backend:** PHP 8.3 + Laravel 11 (REST / JSON API)
* **Frontend:** React + TypeScript + Vite
* **Database:** MariaDB 10.11 (optimized for JSON component trees)
* **Web Server:** Nginx (Reverse Proxy & Static Cache)
* **Environment:** Fully containerized with Docker

---

## 🚀 Port Yapılandırması

| Servis | Konteyner | Host Portu | URL / Erişim |
| :--- | :--- | :--- | :--- |
| **Frontend (React)** | `openappengine-frontend` | `11000` | [http://localhost:11000](http://localhost:11000) |
| **Backend API (Laravel)** | `openappengine-nginx` | `11001` | [http://localhost:11001](http://localhost:11001) |
| **Veritabanı (MariaDB)** | `openappengine-db` | `11002` | `127.0.0.1:11002` |

---

## 🛠️ Temel Komutlar

### Ortamı Başlatma / Durdurma
```bash
# Başlatma (Arka planda)
docker compose up -d

# Durdurma
docker compose stop

# Logları İzleme
docker compose logs -f
```

### Backend (Laravel Artisan & Composer)
```bash
# Artisan komutları
docker exec -it openappengine-backend php artisan migrate
docker exec -it openappengine-backend php artisan db:show

# Composer
docker exec -it openappengine-backend composer install
```

### Frontend (React & NPM)
```bash
# Paket ekleme
docker exec -it openappengine-frontend npm install <paket-adi>
```

---

## 📦 Proje Mimarisi

* `backend/`: Laravel 11 API çekirdeği, multi-tenant modelleri, WordPress migration servisleri.
* `frontend/`: React tabanlı görsel blok editörü ve tema render motoru.
* `docker/`: PHP-FPM, Nginx ve MariaDB konfigürasyonları.
* `sites/`: (İsteğe bağlı) Dönüştürülen sitelerin içerik JSON ve medya paketleri.
