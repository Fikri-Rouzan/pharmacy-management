<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../lib/supabaseClient';
import Swal from 'sweetalert2';
import SupplierModal from '../components/SupplierModal.vue';
import SupplierDetailModal from '../components/SupplierDetailModal.vue';
// Import semua ikon yang digunakan, termasuk 'Archive'
import { Plus, Edit, Trash2, Search, Eye, Archive } from 'lucide-vue-next';

const suppliers = ref([]);
const loading = ref(true);
const isFormModalOpen = ref(false);
const isDetailModalOpen = ref(false);
const selectedSupplier = ref(null);
const selectedSupplierId = ref(null);
const searchQuery = ref('');

const filteredSuppliers = computed(() => {
  if (!searchQuery.value) {
    return suppliers.value;
  }
  const query = searchQuery.value.toLowerCase();
  return suppliers.value.filter(supplier => 
    supplier.name.toLowerCase().includes(query) ||
    (supplier.email && supplier.email.toLowerCase().includes(query)) ||
    (supplier.phone_number && supplier.phone_number.includes(query))
  );
});

// Fungsi ini hanya mengambil supplier dengan status 'active'
async function fetchSuppliers() {
  loading.value = true;
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('status', 'active') // Hanya tampilkan yang aktif
    .order('name', { ascending: true });
    
  if (error) {
    console.error('Error fetching suppliers:', error);
  } else {
    suppliers.value = data;
  }
  loading.value = false;
}

function openAddModal() {
  selectedSupplier.value = null;
  isFormModalOpen.value = true;
}

function openEditModal(supplier) {
  selectedSupplier.value = supplier;
  isFormModalOpen.value = true;
}

function openDetailModal(supplier) {
  selectedSupplierId.value = supplier.id;
  isDetailModalOpen.value = true;
}

async function handleSave(supplierData) {
  let error;
  const dataToSave = { 
    name: supplierData.name, 
    email: supplierData.email, 
    phone_number: supplierData.phone_number, 
    address: supplierData.address 
  };

  if (supplierData.id) {
    ({ error } = await supabase.from('suppliers').update(dataToSave).eq('id', supplierData.id));
  } else {
    ({ error } = await supabase.from('suppliers').insert(dataToSave));
  }

  if (error) {
    Swal.fire('Error', `Gagal menyimpan data: ${error.message}`, 'error');
  } else {
    Swal.fire('Sukses', 'Data supplier berhasil disimpan.', 'success');
    isFormModalOpen.value = false;
    fetchSuppliers();
  }
}

// Fungsi ini menjalankan UPDATE (soft delete), bukan DELETE
async function handleDelete(supplier) {
  const { isConfirmed } = await Swal.fire({
    title: 'Anda yakin?',
    text: `Anda akan menonaktifkan supplier "${supplier.name}". Supplier ini tidak akan bisa dipilih lagi untuk transaksi baru, tapi riwayatnya tetap ada.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, nonaktifkan!',
    cancelButtonText: 'Batal'
  });

  if (isConfirmed) {
    const { error } = await supabase
      .from('suppliers')
      .update({ status: 'inactive' })
      .eq('id', supplier.id);
      
    if (error) {
      Swal.fire('Error', `Gagal menonaktifkan data: ${error.message}`, 'error');
    } else {
      Swal.fire('Berhasil!', 'Data supplier telah dinonaktifkan.', 'success');
      fetchSuppliers(); 
    }
  }
}

onMounted(fetchSuppliers);
</script>

<template>
  <div class="container mx-auto p-4 md:p-6">
    <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Data Supplier</h1>
        <p class="mt-1 text-sm text-gray-500">Kelola semua daftar supplier atau pemasok obat yang aktif.</p>
      </div>
      <div class="flex items-center gap-2 w-full md:w-auto">
        <div class="relative w-full sm:w-64">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3"><Search class="w-5 h-5 text-gray-400" /></span>
          <input v-model="searchQuery" type="text" placeholder="Cari nama, email, no.hp..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
        </div>
        <button @click="openAddModal" class="flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-opacity-90 transition whitespace-nowrap">
          <Plus class="w-5 h-5 mr-2" />
          Tambah Supplier
        </button>
        <router-link 
          to="/suppliers/inactive" 
          class="p-2 text-gray-600 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 transition"
          title="Lihat Arsip Supplier"
        >
          <Archive class="w-5 h-5" />
        </router-link>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse table-fixed">
          <thead class="bg-secondary">
            <tr>
              <th class="w-[25%] px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b">Nama Supplier</th>
              <th class="w-[25%] px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b">Email</th>
              <th class="w-[15%] px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b">No. Telepon</th>
              <th class="w-[20%] px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b">Alamat</th>
              <th class="w-[15%] px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-b">Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white">
            <tr v-if="loading"><td colspan="5" class="p-6 text-center text-gray-500 border-t">Memuat data...</td></tr>
            <tr v-else-if="filteredSuppliers.length === 0">
              <td colspan="5" class="p-6 text-center text-gray-500 border-t">
                <span v-if="searchQuery">Supplier tidak ditemukan.</span>
                <span v-else>Tidak ada data supplier aktif.</span>
              </td>
            </tr>
            <tr v-for="supplier in filteredSuppliers" :key="supplier.id" class="hover:bg-gray-50 transition">
              <td class="px-6 py-4 font-medium text-gray-900 border-t truncate" :title="supplier.name">{{ supplier.name }}</td>
              <td class="px-6 py-4 text-gray-600 border-t truncate" :title="supplier.email">{{ supplier.email || 'N/A' }}</td>
              <td class="px-6 py-4 text-gray-600 border-t">{{ supplier.phone_number || 'N/A' }}</td>
              <td class="px-6 py-4 text-gray-600 border-t truncate" :title="supplier.address">{{ supplier.address || 'N/A' }}</td>
              <td class="px-6 py-4 text-center text-sm font-medium border-t">
                <div class="flex justify-center items-center space-x-1">
                  <button @click="openDetailModal(supplier)" class="p-2 text-green-600 hover:bg-green-100 rounded-full transition" title="Lihat Detail">
                    <Eye class="w-5 h-5" />
                  </button>
                  <button @click="openEditModal(supplier)" class="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition" title="Edit Supplier"><Edit class="w-5 h-5" /></button>
                  <button @click="handleDelete(supplier)" class="p-2 text-red-600 hover:bg-red-100 rounded-full transition" title="Nonaktifkan Supplier"><Trash2 class="w-5 h-5" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <SupplierModal :isOpen="isFormModalOpen" :supplierData="selectedSupplier" @close="isFormModalOpen = false" @save="handleSave" />
  <SupplierDetailModal :isOpen="isDetailModalOpen" :supplierId="selectedSupplierId" @close="isDetailModalOpen = false" />
</template>