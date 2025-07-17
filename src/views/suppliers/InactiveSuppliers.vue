<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../../lib/supabaseClient';
import Swal from 'sweetalert2';
// Ikon yang digunakan di halaman ini
import { ArrowLeft, ArchiveRestore } from 'lucide-vue-next';

const router = useRouter();
const inactiveSuppliers = ref([]);
const loading = ref(true);

// Fungsi ini KHUSUS mengambil supplier yang statusnya 'inactive'
async function fetchInactiveSuppliers() {
  loading.value = true;
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('status', 'inactive') // Mengambil supplier tidak aktif
    .order('name', { ascending: true });
    
  if (error) {
    console.error('Error fetching inactive suppliers:', error);
  } else {
    inactiveSuppliers.value = data;
  }
  loading.value = false;
}

// Fungsi untuk mengaktifkan kembali supplier
async function handleReactivate(supplier) {
  const { isConfirmed } = await Swal.fire({
    title: 'Aktifkan Kembali?',
    text: `Supplier "${supplier.name}" akan muncul kembali di daftar utama dan bisa dipilih untuk transaksi baru.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#aaa',
    confirmButtonText: 'Ya, aktifkan!',
    cancelButtonText: 'Batal'
  });

  if (isConfirmed) {
    const { error } = await supabase
      .from('suppliers')
      .update({ status: 'active' }) // Ubah statusnya kembali menjadi 'active'
      .eq('id', supplier.id);
      
    if (error) {
      Swal.fire('Error', `Gagal mengaktifkan data: ${error.message}`, 'error');
    } else {
      Swal.fire('Berhasil!', 'Pemasok telah diaktifkan kembali.', 'success');
      // Panggil ulang fungsi fetch agar daftar di halaman ini ter-update
      fetchInactiveSuppliers(); 
    }
  }
}

onMounted(fetchInactiveSuppliers);
</script>

<template>
  <div class="container mx-auto p-4 md:p-6">
    <div class="flex items-center mb-6">
      <button @click="router.push('/suppliers')" class="p-2 mr-4 rounded-full hover:bg-gray-200" title="Kembali ke Daftar Supplier">
        <ArrowLeft class="w-6 h-6 text-gray-700" />
      </button>
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Arsip Pemasok</h1>
        <p class="mt-1 text-sm text-gray-500">Daftar pemasok yang telah dinonaktifkan.</p>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse table-fixed">
          <thead class="bg-secondary"> <tr>
              <th class="w-[30%] px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Nama Pemasok</th>
              <th class="w-[30%] px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Email</th>
              <th class="w-[20%] px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">No. Telepon</th>
              <th class="w-[20%] px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white">
            <tr v-if="loading"><td colspan="4" class="p-6 text-center text-gray-500 border-t">Memuat data...</td></tr>
            <tr v-else-if="inactiveSuppliers.length === 0">
              <td colspan="4" class="p-6 text-center text-gray-500 border-t">Tidak ada pemasok yang diarsipkan.</td>
            </tr>
            <tr v-for="supplier in inactiveSuppliers" :key="supplier.id" class="hover:bg-gray-50 transition">
              <td class="px-6 py-4 font-medium text-gray-800 border-t truncate" :title="supplier.name">{{ supplier.name }}</td>
              <td class="px-6 py-4 text-gray-600 border-t truncate" :title="supplier.email">{{ supplier.email || 'N/A' }}</td>
              <td class="px-6 py-4 text-gray-600 border-t">{{ supplier.phone_number || 'N/A' }}</td>
              <td class="px-6 py-4 text-center text-sm font-medium border-t">
                <button @click="handleReactivate(supplier)" class="flex items-center justify-center mx-auto px-3 py-2 bg-green-100 text-green-800 hover:bg-green-200 rounded-lg text-xs font-bold transition" title="Aktifkan Kembali">
                  <ArchiveRestore class="w-4 h-4 mr-2" />
                  Aktifkan
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>