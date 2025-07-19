<script setup>
// Mengimpor ikon untuk mempercantik tampilan judul
import { 
  BookOpen, 
  LayoutDashboard, 
  Pill, 
  Truck, 
  Workflow,
  UserCircle,
} from 'lucide-vue-next';
</script>

<template>
  <div class="container mx-auto p-4 md:p-6">
    <div class="bg-white p-6 sm:p-8 rounded-xl shadow-md space-y-8">

      <div class="border-b pb-4">
        <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <BookOpen class="w-8 h-8 text-primary" />
          <span>Panduan Penggunaan Aplikasi</span>
        </h1>
        <p class="mt-2 text-gray-600">
          Selamat datang di PharmaSys! Panduan ini akan membantu Anda memahami alur kerja dan cara menggunakan setiap fitur secara efektif.
        </p>
      </div>

      <div class="space-y-4">
        <h2 class="text-2xl font-semibold text-gray-700 flex items-center gap-3">
          <Workflow class="w-7 h-7 text-primary" />
          <span>Alur Kerja Ideal (Penting!)</span>
        </h2>
        <p class="text-gray-600">
          Untuk menjaga integritas data, ikuti alur kerja berikut saat ada obat baru yang masuk ke apotek Anda:
        </p>
        <ol class="list-decimal list-inside space-y-2 text-gray-700 pl-4">
          <li><strong>Daftarkan Obat Baru:</strong> Pergi ke menu <code class="font-mono bg-gray-100 px-1 rounded">Data Obat</code> &rarr; <code class="bg-gray-100 px-1 rounded">Tambah Obat</code>. Stok awal untuk obat baru selalu 0.</li>
          <li><strong>Daftarkan Supplier Baru:</strong> Jika pemasok baru, pergi ke <code class="font-mono bg-gray-100 px-1 rounded">Data Supplier</code> &rarr; <code class="bg-gray-100 px-1 rounded">Tambah Supplier</code>.</li>
          <li><strong>Catat Transaksi Pembelian:</strong> Ini adalah langkah kunci. Pergi ke <code class="font-mono bg-gray-100 px-1 rounded">Data Pembelian</code> &rarr; <code class="bg-gray-100 px-1 rounded">Catat Pembelian</code>. Proses ini akan otomatis menambah stok, mencatat harga beli, dan tanggal kedaluwarsa.</li>
          <li><strong>Lakukan Transaksi Penjualan:</strong> Setelah stok masuk, obat siap dijual melalui menu <code class="font-mono bg-gray-100 px-1 rounded">Data Penjualan</code> &rarr; <code class="bg-gray-100 px-1 rounded">Catat Penjualan</code>.</li>
        </ol>
      </div>

      <div class="space-y-3 pt-6 border-t">
        <h2 class="text-2xl font-semibold text-gray-700 flex items-center gap-3">
          <LayoutDashboard class="w-7 h-7 text-primary" />
          <span>Dashboard</span>
        </h2>
        <p class="text-gray-600">
          Dashboard adalah halaman ringkasan yang menampilkan data-data penting dalam bentuk kartu, seperti Total Obat, Total Supplier Aktif, dan jumlah total transaksi penjualan serta pembelian.
        </p>
      </div>
      
      <div class="space-y-3 pt-6 border-t">
        <h2 class="text-2xl font-semibold text-gray-700 flex items-center gap-3">
          <Pill class="w-7 h-7 text-primary" />
          <span>Mengelola Data Obat</span>
        </h2>
        <ul class="list-disc list-inside space-y-2 text-gray-600 pl-4">
          <li><strong>Tambah Obat:</strong> Gunakan tombol "Tambah Obat". Stok awal akan otomatis diatur ke 0. Penambahan stok hanya bisa melalui menu Pembelian.</li>
          <li><strong>Detail Stok Batch:</strong> Klik pada baris obat atau ikon <code class="font-mono bg-gray-100 px-1 rounded">kotak</code> untuk melihat rincian setiap batch pembelian, termasuk tanggal kedaluwarsa dan sisa stoknya.</li>
          <li><strong>Edit/Hapus:</strong> Gunakan ikon pensil untuk mengedit dan ikon tempat sampah untuk menghapus data obat secara permanen.</li>
        </ul>
      </div>

      <div class="space-y-3 pt-6 border-t">
        <h2 class="text-2xl font-semibold text-gray-700 flex items-center gap-3">
          <Truck class="w-7 h-7 text-primary" />
          <span>Mengelola Data Supplier</span>
        </h2>
         <ul class="list-disc list-inside space-y-2 text-gray-600 pl-4">
          <li><strong>Menonaktifkan Supplier:</strong> Mengklik ikon <code class="font-mono bg-gray-100 px-1 rounded">tempat sampah</code> tidak akan menghapus data supplier, melainkan hanya menonaktifkannya (Soft Delete) dan memindahkannya ke arsip. Ini menjaga riwayat transaksi tetap utuh.</li>
          <li><strong>Arsip Supplier:</strong> Gunakan tombol <code class="font-mono bg-gray-100 px-1 rounded">arsip</code> untuk melihat daftar supplier yang tidak aktif dan mengaktifkannya kembali jika diperlukan.</li>
        </ul>
      </div>

      <div class="space-y-3 pt-6 border-t">
        <h2 class="text-2xl font-semibold text-gray-700 flex items-center gap-3">
          <UserCircle class="w-7 h-7 text-primary" />
          <span>Profil & Keluar</span>
        </h2>
         <ul class="list-disc list-inside space-y-2 text-gray-600 pl-4">
          <li><strong>Profil Saya:</strong> Klik nama Anda di pojok kanan atas layar untuk melihat atau mengubah detail profil Anda.</li>
          <li><strong>Keluar:</strong> Tombol untuk keluar dari aplikasi kini selalu tersedia di bagian bawah sidebar untuk akses yang lebih cepat.</li>
        </ul>
      </div>

    </div>
  </div>
</template>