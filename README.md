# 📋 KitaABSENSI

**KitaABSENSI** adalah aplikasi absensi berbasis web yang dirancang untuk mencatat kehadiran karyawan secara cepat dan efisien. Dengan antarmuka yang responsif, user-friendly, dan tema **Presence** (maroon), aplikasi ini cocok digunakan untuk berbagai jenis usaha, mulai dari restoran, retail, hingga kantor.

---

## 🚀 Teknologi yang Digunakan

- **HTML5** – Struktur halaman
- **CSS3** – Styling kustom dengan tema maroon
- **Bootstrap 5** – Framework CSS untuk layout responsif
- **Bootstrap Icons** – Library ikon untuk tampilan lebih menarik
- **Alpine.js 3** – Framework JavaScript ringan untuk interaktivitas (tanpa build tool)
- **JavaScript Vanilla** – Logika bisnis, manipulasi DOM, dan integrasi dengan Alpine.js

---

## ✨ Fitur Utama

### 1. Halaman Presence (Absensi)
- **Pilih Outlet** – Tersedia 3 outlet dummy: *My Fried Chicken*, *Raja Kepiting*, *Ayam Bebek Ganza*
- **Pilih Shift** – Shift menyesuaikan dengan outlet yang dipilih (Pagi/Sore/Malam)
- **Jenis Kehadiran** – Check In / Check Out
- **Mode Absen** – Diri Sendiri (readonly) atau Orang Lain (input manual)
- **Upload Foto** – Ambil foto langsung dari kamera atau unggah dari galeri
- **Deteksi Keterlambatan** – Otomatis menghitung selisih waktu dengan toleransi:
  - Check In: telat > 15 menit
  - Check Out: telat > 30 menit
- **Notifikasi Modal** – Menampilkan hasil absen, status keterlambatan, dan foto yang diambil

### 2. Halaman Rekap (Recap)
- **Filter Outlet** – Tampilkan karyawan per outlet
- **Filter Shift** – Tampilkan karyawan per shift
- **Tabel Karyawan** – Menampilkan nama, outlet, shift, total kehadiran, dan status terakhir
- **Indikator Warna**:
  - 🟢 Hijau – On time (3 hari pertama)
  - 🟡 Kuning – Telat 5–15 menit
  - 🔴 Merah – Telat 30 menit – 1 jam

### 3. Halaman Detail Karyawan
- **Informasi Karyawan** – Nama, outlet, shift, total kehadiran
- **Riwayat Kehadiran** – Tabel lengkap berisi tanggal (format: *Sabtu, 26 Juni 2026*), shift, jam check-in, check-out, dan status

### 4. Navigasi & Pengalaman Pengguna
- **Floating Button Home** – Di semua halaman, untuk kembali ke beranda atau scroll ke form (jika sudah di halaman utama)
- **Toast Notification** – Notifikasi saat tombol Home diklik
- **Responsif** – Tampilan optimal di semua ukuran layar (mobile, tablet, desktop)

---

## 📁 Struktur File
/
├── index.html # Halaman presence (absensi)
├── rekap.html # Halaman rekap karyawan
├── detail.html # Halaman detail riwayat karyawan
├── assets/
│ ├── css/
│ │ └── kita-absensi.css # Semua style (tema maroon)
│ └── js/
│ └── kita-absensi.js # Semua logika Alpine.js (3 komponen)
└── README.md # Dokumentasi project

text

---

## 🛠️ Cara Menjalankan

1. **Clone atau download** repository ini.
2. Pastikan semua file berada dalam struktur folder seperti di atas.
3. Buka **`index.html`** di browser (disarankan menggunakan Live Server di VS Code).
4. **Tidak perlu** build tools atau dependency manager – semua sudah CDN.

---

## 🔧 Data Dummy

- **Karyawan**: *Deuwi Satriya Irawan*
- **Riwayat**:
  - 20 Mei – 8 Juni → Shift Sore di **Raja Kepiting**
  - 10 Juni – 27 Juni → Shift Sore di **My Fried Chicken**
- **Total Kehadiran**: 38 hari
- **Status**: On time / Late (di-generate acak)

---

## 👥 Kontributor

Project ini dikembangkan oleh:

**Deuwi Satriya Irawan**  
- 🌐 GitHub: [https://github.com/satriairawan05](https://github.com/satriairawan05)  
- 📸 Instagram: [https://instagram.com/satriairawan05_](https://instagram.com/satriairawan05_)  
- 💬 WhatsApp: [https://wa.me/6282253332802](https://wa.me/6282253332802)  

---

## 📄 Lisensi

© 2026 KitaABSENSI. Seluruh hak dilindungi. Bebas digunakan dan dimodifikasi untuk keperluan pembelajaran atau internal.

---

## 🧠 Catatan

- Aplikasi ini **tidak terhubung ke backend** – semua data bersifat statis (dummy) untuk demonstrasi.
- Jika ingin integrasi dengan Laravel atau database, Anda cukup mengganti fungsi `submitPresence()` dan data dummy di `rekapApp` / `detailApp`.

---

**Terima kasih telah menggunakan KitaABSENSI!** 🙏