# 🎓 COMPRO - Academic Management System

Sistem manajemen akademik mahasiswa dengan frontend React/TypeScript dan backend Node.js yang terintegrasi dengan AI untuk rekomendasi mata kuliah.

## 🎯 Fitur Utama

- 📊 **Dashboard Akademik**: Profil mahasiswa, IPK, SKS, TAK, IKK dengan data real-time
- 🎯 **Integrasi Minat**: Input minat & skill dengan rekomendasi AI menggunakan Google Gemini
- 📈 **Simulasi IPK**: Prediksi nilai dan kalkulasi IPK otomatis
- 🔐 **Autentikasi JWT**: Login aman dengan data mahasiswa real

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Routing**: React Router
- **HTTP Client**: Fetch API

### Backend  
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB dengan Mongoose
- **Auth**: JWT + Bcrypt
- **AI Integration**: Google Gemini API
- **Documentation**: Swagger UI
- **Container**: Docker + Docker Compose

## 🚀 Panduan Setup (Dari Laptop Baru)

### Prasyarat
1. **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
2. **Node.js v18+** - [Download](https://nodejs.org/)
3. **Git** - [Download](https://git-scm.com/)

### Langkah 1: Clone Project
```bash
# Clone repository (sesuaikan dengan URL repository Anda)
git clone <repository-url>
cd compro-project

# Atau ekstrak dari ZIP dan masuk ke folder
cd "semester 7/compro/backend frontend"
    ```

3.  **Run Server**:
    ```bash
    npm run dev
    ```
```

### Langkah 2: Setup Backend (Docker)
```bash
# Masuk ke folder backend
cd compro-backend-master

# Pastikan Docker Desktop sudah berjalan
# Jalankan backend dengan database
docker-compose up -d

# Tunggu hingga container berjalan (cek di Docker Desktop)
# Lalu seed database dengan data mahasiswa
node seed.js
```

### Langkah 3: Setup Frontend
```bash
# Buka terminal baru, masuk ke folder root frontend
cd "backend frontend"

# Install dependencies
npm install

# Jalankan frontend development server
npm run dev
```

### Langkah 4: Verifikasi Setup
1. **Backend**: Buka http://localhost:5001/api-docs (Swagger UI)
2. **Frontend**: Buka http://localhost:8080
3. **Database**: Cek Docker Desktop - container `mongo-1` dan `compro-backend-master` harus running

## 🔑 Login Credentials

Gunakan NIM sebagai username dan password:

| NIM | Password | Nama |
|-----|----------|------|
| 1301221234 | 1301221234 | Iwan Awan Setiawan |
| 1301215432 | 1301215432 | Daffa Muhammad Pratama |
| 1301230001 | 1301230001 | Farunada Firda |
| 1301230021 | 1301230021 | Muhammad Agus Wahyudi |
| 1301200095 | 1301200095 | Akbar Setiawan |
| 1301222344 | 1301222344 | Farid Rahman |

## 🏗️ Arsitektur Aplikasi

```
┌─────────────────┐    HTTP/REST API    ┌──────────────────┐
│   Frontend      │ ──────────────────▶ │    Backend       │
│   React + TS    │                     │   Node.js + API  │
│   Port: 8080    │ ◀────────────────── │   Port: 5001     │
└─────────────────┘                     └──────────────────┘
                                                  │
                                                  ▼
                                        ┌──────────────────┐
                                        │    Database      │
                                        │   MongoDB        │
                                        │   Port: 27017    │
                                        └──────────────────┘
```

## 📱 Fitur dan Penggunaan

### 1. Dashboard
- Login dengan NIM/password
- Lihat profil, IPK, SKS, TAK, IKK real-time
- Data akademik per tingkat (I, II, III, IV)

### 2. Integrasi Minat
- Pilih hard skills dan soft skills
- Generate rekomendasi mata kuliah dengan AI
- Rekomendasi berdasarkan profil akademik dan minat

### 3. Simulasi IPK  
- Input mata kuliah dan prediksi nilai
- Kalkulasi IPS dan IPK otomatis
- Simulasi berbagai skenario nilai

## 🐛 Troubleshooting

### Backend Tidak Jalan
```bash
# Cek status container
docker ps

# Restart jika perlu
cd compro-backend-master
docker-compose down
docker-compose up -d

# Re-seed data jika perlu
node seed.js
```

### Frontend Error
```bash
# Clear cache dan reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Database Connection Error
```bash
# Pastikan MongoDB container running
docker ps | grep mongo

# Jika tidak ada, restart docker-compose
docker-compose up -d
```

## 🔧 Environment Variables

File `.env` di folder `compro-backend-master`:
```env
PORT=
MONGO_URI=
JWT_SECRET=
NODE_ENV=development
GEMINI_API_KEY=
```

## 📚 API Documentation

**Swagger UI**: http://localhost:5001/api-docs

### Endpoints Utama:
- `POST /api/auth/login` - Login mahasiswa
- `GET /api/menu` - Dashboard data
- `GET /api/interests` - Data minat & skills
- `POST /api/interests/recommend` - AI recommendations
- `GET /api/courses` - Daftar mata kuliah
- `POST /api/simulation/calculate` - Simulasi IPK

## 👥 Tim Pengembang

- **Frontend**: React/TypeScript dengan integrasi API
- **Backend**: Node.js/Express dengan MongoDB
- **AI Integration**: Google Gemini API
- **Database**: Data mahasiswa dan mata kuliah Telkom University

## 📄 Lisensi

Project untuk keperluan akademik Telkom University.
