# Ketentuan Lomba Website UMKM

File ini berisi rangkuman teknis dan ketentuan lomba yang akan diikuti oleh project ini (micro-sayur), sebagai panduan pengembangan.

## G. Teknis dan Ketentuan Lomba & Real-World Usage
1. **Tema**: Website bertema UMKM yang mendukung proses transformasi digital.
> **Penting**: Meskipun ini proyek lomba, aplikasi ini **harus didesain dan dibangun layaknya website sungguhan yang siap dipakai (production-ready)**. Hapus semua teks "selamat datang juri" atau kesan prototipe. Fokus pada e-commerce nyata.
2. **Sistem Wajib**: Wajib memiliki sistem CRUDS (Create, Read, Update, Delete, Search).
3. **Halaman Wajib**:
   - **Autentikasi**: Login & Register.
   - **User Side**: Home, Fitur Utama (jual beli), Kontak (termasuk form sederhana), About.
   - **Admin Side**: Dashboard, Daftar Produk, Daftar Transaksi.
4. **Teknologi**: Bebas (bisa menggunakan apa saja), namun wajib mencantumkan tech stack di dalam dokumentasi.

## H. Komponen Penilaian Babak Final
Berikut adalah fokus kriteria penilaian untuk memaksimalkan skor lomba:

| Aspek Penilaian | Bobot | Detail Kriteria Penilaian |
|---|---|---|
| **Fungsionalitas & Implementasi Sistem** | 40% | Kelengkapan fitur (CRUDS, Login/Register, User/Admin side), kelancaran sistem tanpa bug utama, validasi input, performa, keamanan dasar, clean code yang orisinal dan bebas plagiarisme. |
| **Kualitas UI/UX** (Visual & Kemudahan Penggunaan) | 30% | Estetika tampilan, konsistensi desain, kemudahan navigasi (user journey), responsivitas pada berbagai perangkat (mobile-friendly), serta kenyamanan pengguna mengakses fitur. |
| **Inovasi & Solusi Digital untuk UMKM** | 20% | Kreativitas, keunikan ide, nilai inovasi, sejauh mana solusi membantu digitalisasi UMKM (pengelolaan produk, transaksi, pemasaran, efisiensi operasional). |
| **Kesesuaian dengan Tema & Presentasi** | 10% | Sesuai dengan tema "UMKM GOES DIGITAL", relevansi fitur terhadap kebutuhan pelaku UMKM, kemampuan peserta menjelaskan solusi, dan penguasaan materi saat presentasi. |

## Fokus Pengembangan AI / Gemini
- Pastikan semua **Halaman Wajib** dan fitur **CRUDS** berfungsi 100% tanpa bug karena ini menyumbang bobot penilaian terbesar (40%).
- Tulis **clean code** dengan validasi data yang baik.
- Buat **UI/UX yang sangat menarik, estetik, dan responsif**. Gunakan desain modern agar memukau juri (Bobot 30%).
- Pastikan semua *tech stack* dicatat agar mudah dimasukkan ke dokumentasi.

## Strategi & Alur Pengerjaan 1 Hari (24 Jam)
Karena keterbatasan waktu, kita akan menggunakan pendekatan yang pragmatis: **Fokus pada fitur MVP (Minimum Viable Product) yang dilombakan, dengan desain UI/UX yang maksimal.**

1. **Fase 1: Assessment & Backend (Jam 1-4)**
   - Cek kondisi microservices yang sudah ada (user, produk, order).
   - Pastikan API endpoint untuk CRUDS Produk, Transaksi, dan Auth berjalan. Jika ada error rumit, kita fallback ke solusi cepat agar tidak membuang waktu.
2. **Fase 2: Frontend Foundation & UI/UX Design System (Jam 5-8)**
   - Menyiapkan React (Vite) di `frontend-sayur`.
   - Membuat sistem desain: palet warna (vibrant & modern), tipografi, dan komponen dasar.
   - Membuat Halaman Auth (Login & Register) yang interaktif.
3. **Fase 3: Core Fitur User Side (Jam 9-14)**
   - **Home**: Hero section animasi, menonjolkan inovasi "UMKM Goes Digital".
   - **Fitur Utama (Katalog/Jual Beli)**: Daftar produk dengan fitur Search & Filter (memenuhi Search pada CRUDS).
   - **Kontak & About**: Halaman informatif yang estetik.
4. **Fase 4: Core Fitur Admin Side (Jam 15-19)**
   - **Dashboard**: Tampilan summary data.
   - **Daftar Produk**: Tabel data dengan fitur Create, Update, Delete (menyelesaikan sisa CRUDS).
   - **Daftar Transaksi**: Melihat transaksi masuk.
5. **Fase 5: Polish, Animasi & Bug Fixing (Jam 20-24)**
   - Menambahkan micro-animations untuk efek "WOW" pada juri.
   - Uji coba flow dari pendaftaran user -> beli produk -> masuk ke admin.
   - Perbaikan bug dan optimalisasi performa.
