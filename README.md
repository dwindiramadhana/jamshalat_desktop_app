# 🕌 Jam Shalat - Aplikasi Jadwal Shalat Indonesia

Aplikasi desktop untuk menampilkan jadwal waktu shalat di Indonesia dengan tampilan dan fitur yang modern.

## ✨ Fitur Utama

- 🕐 **Waktu Shalat Otomatis** - Secara otomatis highlight waktu shalat saat ini dan berikutnya. Jika semua jadwal hari ini telah terlewati, maka jadwal besok hari yang akan ditampilkan
- 🎨 **8 Tema Warna** dengan dukungan mode gelap penuh
- 🖼️ **Gambar Latar yang Dapat Diurutkan** - Drag & Drop untuk mengatur urutan slideshow
- 🔄 **Dua Jenis Latar Belakang** - Otomatis (dari Unsplash) dan Lokal (gunakan foto-foto favorit Anda)
- 🌅 **Rotasi Gambar Otomatis** dengan kontrol urutan oleh pengguna
- 🇮🇩 **Bahasa Indonesia** untuk pengalaman pengguna yang lebih baik
- ⚙️ **Modal Pengaturan Modern** dengan kustomisasi komprehensif
- 📱 **Desain Responsif** berfungsi di semua ukuran layar

## 💾 Sumber Data

Data waktu shalat menggunakan [API myQuran](https://documenter.getpostman.com/view/841292/Tz5p7yHS) yang tersedia hingga Desember 2030.

## 📦 Unduhan

| OS | Arsitektur | File Download |
|---|---|---|
| **Windows** | x64 | [📥 Jam Shalat.msi](https://github.com/dwindiramadhana/jamshalat_desktop_app/releases/latest/download/Jam.Shalat_1.0.2_x64_en-US.msi) |
| **Windows** | x64 | [📥 Jam Shalat.exe](https://github.com/dwindiramadhana/jamshalat_desktop_app/releases/latest/download/Jam.Shalat_1.0.2_x64-setup.exe) |
| **macOS** | Apple Silicon (M1+) | [📥 Jam Shalat (ARM).dmg](https://github.com/dwindiramadhana/jamshalat_desktop_app/releases/latest/download/Jam.Shalat_aarch64.dmg) |
| **macOS** | Intel | [📥 Jam Shalat (Intel).dmg](https://github.com/dwindiramadhana/jamshalat_desktop_app/releases/latest/download/Jam.Shalat_x64.dmg) |
| **Linux** | x64 | [📥 Jam Shalat.AppImage](https://github.com/dwindiramadhana/jamshalat_desktop_app/releases/latest/download/jam-shalat_1.0.2_amd64.AppImage) |
| **Linux** | x64 | [📥 Jam Shalat.deb](https://github.com/dwindiramadhana/jamshalat_desktop_app/releases/latest/download/jam-shalat_1.0.2_amd64.deb) |

> **💡 Tips Memilih File:**
> - **macOS**: Pilih ARM untuk Mac M1/M2/M3, pilih Intel untuk Mac lama
> - **Windows**: Gunakan .msi untuk instalasi standar, .exe untuk instalasi kustom
> - **Linux**: AppImage tidak perlu instalasi, DEB untuk Ubuntu/Debian

## 🔧 Panduan Instalasi

### Windows

1. Unduh file `.msi` atau `.exe` dari halaman rilis
2. Klik dua kali file installer yang telah diunduh
3. Ikuti petunjuk instalasi
4. Aplikasi akan tersedia di Start Menu

### macOS

1. Unduh file `.dmg` dari halaman rilis
2. Buka file `.dmg` yang telah diunduh
3. Seret aplikasi "Jam Shalat" ke folder Applications
4. **Penting**: Jika muncul pesan error "aplikasi rusak", jalankan salah satu cara berikut:

#### Cara 1: Menggunakan Terminal
```bash
sudo xattr -rd com.apple.quarantine "/Applications/Jam Shalat.app"
```

#### Cara 2: Menggunakan GUI
1. Klik kanan pada aplikasi "Jam Shalat" di folder Applications
2. Pilih "Open" dari menu konteks
3. Klik "Open" lagi pada dialog konfirmasi untuk melewati Gatekeeper

### Linux

#### Menggunakan AppImage (Semua Distribusi)
1. Unduh file `.AppImage` dari halaman rilis
2. Buat file dapat dieksekusi:
   ```bash
   chmod +x Jam-Shalat_*.AppImage
   ```
3. Jalankan aplikasi:
   ```bash
   ./Jam-Shalat_*.AppImage
   ```

#### Menggunakan DEB (Ubuntu/Debian)
1. Unduh file `.deb` dari halaman rilis
2. Install menggunakan dpkg:
   ```bash
   sudo dpkg -i jam-shalat_*.deb
   ```
3. Jika ada dependensi yang hilang, jalankan:
   ```bash
   sudo apt-get install -f
   ```

## ⚙️ Pengaturan Awal

1. Buka aplikasi Jam Shalat
2. Klik ikon pengaturan (⚙️) untuk membuka modal pengaturan
3. Konfigurasikan lokasi Anda:
   - Pilih provinsi
   - Pilih kota/kabupaten
4. Sesuaikan preferensi lainnya:
   - Pilih tema warna favorit
   - Atur jenis latar belakang (Otomatis/Lokal)
   - Upload gambar kustom jika menggunakan latar belakang lokal
5. Klik "Simpan" untuk menyimpan pengaturan
6. Nikmati jadwal shalat yang akurat dengan latar belakang yang indah!

## 🎨 Kustomisasi

### Tema Warna
Aplikasi menyediakan 8 pilihan tema warna:
- Biru (Default)
- Hijau
- Ungu
- Merah
- Orange
- Pink
- Kuning
- Indigo

### Latar Belakang
- **Otomatis**: Menggunakan gambar dari Unsplash yang berganti secara otomatis
- **Lokal**: Upload gambar kustom Anda sendiri dan atur urutan rotasinya

## 🐛 Troubleshooting

### macOS: Error "Aplikasi Rusak"
Ini terjadi karena aplikasi belum ditandatangani secara digital. Gunakan salah satu cara di atas untuk melewati Gatekeeper.

### Linux: Aplikasi Tidak Bisa Dibuka
Pastikan file AppImage memiliki permission untuk dieksekusi:
```bash
chmod +x Jam-Shalat_*.AppImage
```

### Windows: Antivirus Memblokir
Beberapa antivirus mungkin memblokir aplikasi. Tambahkan aplikasi ke whitelist antivirus Anda.

## 🔄 Update Aplikasi

Untuk mendapatkan versi terbaru:
1. Kunjungi [halaman rilis](https://github.com/dwindiramadhana/jamshalat_desktop_app/releases)
2. Unduh versi terbaru sesuai sistem operasi Anda
3. Install seperti instalasi pertama (akan menggantikan versi lama)

## 📞 Dukungan

Jika mengalami masalah atau memiliki saran:
- Buat [issue baru](https://github.com/dwindiramadhana/jamshalat_desktop_app/issues) di GitHub
- Sertakan informasi sistem operasi dan versi aplikasi

## 📄 Lisensi

Aplikasi ini dibuat untuk memudahkan umat Muslim Indonesia dalam menjalankan ibadah shalat tepat waktu.

---

**Selamat beribadah! 🤲**
