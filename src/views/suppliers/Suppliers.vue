<script setup>
// Bagian script tidak ada perubahan, Anda bisa gunakan yang sudah ada.
import { ref, onMounted, computed, watch } from 'vue';
import { supabase } from '../../lib/supabaseClient';
import Swal from 'sweetalert2';
import SupplierModal from '../../components/suppliers/SupplierModal.vue';
import SupplierDetailModal from '../../components/suppliers/SupplierDetailModal.vue';
import { Plus, Edit, Trash2, Search, Eye, ArrowDownUp } from 'lucide-vue-next';

const suppliers = ref([]);
const loading = ref(true);
const isFormModalOpen = ref(false);
const isDetailModalOpen = ref(false);
const selectedSupplier = ref(null);
const selectedSupplierId = ref(null);
const searchQuery = ref('');
const sortOrder = ref('asc');
const searchDebounceTimer = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalSuppliers = ref(0);

const totalPages = computed(() => {
  if (totalSuppliers.value === 0) return 1;
  return Math.ceil(totalSuppliers.value / itemsPerPage.value);
});

const filteredSuppliers = computed(() => suppliers.value);

async function fetchSuppliers() {
  loading.value = true;
  const from = (currentPage.value - 1) * itemsPerPage.value;
  const to = from + itemsPerPage.value - 1;
  let query = supabase
    .from('suppliers')
    .select('*', { count: 'exact' });
  if (searchQuery.value) {
    const q = `%${searchQuery.value}%`;
    query = query.or(`name.ilike.${q},email.ilike.${q},phone_number.ilike.${q}`);
  }
  query = query.order('name', { ascending: sortOrder.value === 'asc' });
  query = query.range(from, to);
  const { data, error, count } = await query;
  if (error) {
    console.error('Error fetching suppliers:', error);
  } else {
    suppliers.value = data;
    totalSuppliers.value = count || 0;
  }
  loading.value = false;
}
function toggleSortOrder() { sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'; }
function nextPage() { if (currentPage.value < totalPages.value) currentPage.value++; }
function prevPage() { if (currentPage.value > 1) currentPage.value--; }
function openAddModal() { selectedSupplier.value = null; isFormModalOpen.value = true; }
function openEditModal(supplier) { selectedSupplier.value = supplier; isFormModalOpen.value = true; }
function openDetailModal(supplier) { selectedSupplierId.value = supplier.id; isDetailModalOpen.value = true; }
async function handleSave(supplierData) {
  let error;
  const dataToSave = { name: supplierData.name, email: supplierData.email, phone_number: supplierData.phone_number, address: supplierData.address };
  if (supplierData.id) {
    ({ error } = await supabase.from('suppliers').update(dataToSave).eq('id', supplierData.id));
  } else {
    ({ error } = await supabase.from('suppliers').insert(dataToSave));
  }
  if (error) Swal.fire('Error', `Gagal menyimpan data: ${error.message}`, 'error');
  else {
    Swal.fire('Sukses', 'Data pemasok berhasil disimpan.', 'success');
    isFormModalOpen.value = false;
    fetchSuppliers();
  }
}
async function handleDelete(supplier) {
  const { isConfirmed } = await Swal.fire({ title: 'Anda yakin?', text: `Anda akan menghapus supplier "${supplier.name}".`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Ya, hapus!' });
  if (isConfirmed) {
    const { error } = await supabase.from('suppliers').delete().eq('id', supplier.id);
    if (error) Swal.fire('Error', `Gagal menghapus data: ${error.message}`, 'error');
    else {
      Swal.fire('Berhasil!', 'Data supplier telah dihapus.', 'success');
      fetchSuppliers(); 
    }
  }
}
watch([currentPage, sortOrder, itemsPerPage], fetchSuppliers);
watch(searchQuery, () => {
  clearTimeout(searchDebounceTimer.value);
  searchDebounceTimer.value = setTimeout(() => {
    currentPage.value = 1;
    fetchSuppliers();
  }, 500);
});
onMounted(fetchSuppliers);
</script>

<template>
  <div class="container mx-auto p-4 md:p-6">
    <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Data Pemasok</h1>
        <p class="mt-1 text-sm text-gray-500">Kelola semua daftar pemasok obat.</p>
      </div>
      <div class="flex items-center gap-2 w-full md:w-auto flex-wrap">
         <button 
           @click="toggleSortOrder" 
           class="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition shadow-sm font-medium"
         >
          <ArrowDownUp class="w-4 h-4 mr-2" />
          Urutkan: Nama {{ sortOrder === 'asc' ? 'A-Z' : 'Z-A' }}
        </button>
        <div class="relative w-full sm:w-64">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3"><Search class="w-5 h-5 text-gray-400" /></span>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Cari Pemasok..." 
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
          >
        </div>
        <button @click="openAddModal" class="flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-opacity-90 transition whitespace-nowrap">
          <Plus class="w-5 h-5 mr-2" />
          Tambah Pemasok
        </button>
      </div>
    </div>

    <!-- ================= PERUBAHAN UTAMA DI SINI ================= -->
    <!-- Tampilan Tabel untuk Desktop -->
    <div class="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead class="bg-secondary">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Nama Pemasok</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Kontak</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Alamat</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading"><td colspan="4" class="p-6 text-center text-gray-500">Memuat data...</td></tr>
            <tr v-else-if="filteredSuppliers.length === 0">
              <td colspan="4" class="p-6 text-center text-gray-500">
                <span v-if="searchQuery">Pemasok tidak ditemukan.</span>
                <span v-else>Tidak ada data pemasok.</span>
              </td>
            </tr>
            <tr v-for="supplier in filteredSuppliers" :key="supplier.id" @click="openDetailModal(supplier)" class="hover:bg-gray-50 transition cursor-pointer">
              <td class="px-6 py-4 font-medium text-gray-900">{{ supplier.name }}</td>
              <td class="px-6 py-4 text-gray-600">
                <p>{{ supplier.email || 'N/A' }}</p>
                <p class="text-xs text-gray-500">{{ supplier.phone_number || 'N/A' }}</p>
              </td>
              <td class="px-6 py-4 text-gray-600">{{ supplier.address || 'N/A' }}</td>
              <td class="px-6 py-4 text-center text-sm font-medium">
                <div class="flex justify-center items-center space-x-1">
                  <button @click.stop="openDetailModal(supplier)" class="p-2 text-green-600 hover:bg-green-100 rounded-full transition" title="Lihat Detail Obat"><Eye class="w-5 h-5" /></button>
                  <button @click.stop="openEditModal(supplier)" class="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition" title="Edit Supplier"><Edit class="w-5 h-5" /></button>
                  <button @click.stop="handleDelete(supplier)" class="p-2 text-red-600 hover:bg-red-100 rounded-full transition" title="Hapus Supplier"><Trash2 class="w-5 h-5" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tampilan Kartu untuk Mobile -->
    <div class="md:hidden space-y-4">
       <div v-if="loading" class="p-6 text-center text-gray-500">Memuat data...</div>
       <div v-else-if="filteredSuppliers.length === 0" class="p-6 text-center text-gray-500">
          <span v-if="searchQuery">Pemasok tidak ditemukan.</span>
          <span v-else>Tidak ada data pemasok.</span>
       </div>
       <div v-for="supplier in filteredSuppliers" :key="supplier.id" @click="openDetailModal(supplier)" class="bg-white rounded-lg shadow-md p-4 space-y-3">
          <div class="flex justify-between items-start">
            <h3 class="font-bold text-lg text-primary">{{ supplier.name }}</h3>
            <div class="flex items-center space-x-1 flex-shrink-0">
              <button @click.stop="openDetailModal(supplier)" class="p-2 text-green-600 hover:bg-green-100 rounded-full transition"><Eye class="w-5 h-5" /></button>
              <button @click.stop="openEditModal(supplier)" class="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition"><Edit class="w-5 h-5" /></button>
              <button @click.stop="handleDelete(supplier)" class="p-2 text-red-600 hover:bg-red-100 rounded-full transition"><Trash2 class="w-5 h-5" /></button>
            </div>
          </div>
          <div class="text-sm text-gray-600 space-y-1">
            <p><span class="font-semibold">Email:</span> {{ supplier.email || 'N/A' }}</p>
            <p><span class="font-semibold">Telepon:</span> {{ supplier.phone_number || 'N/A' }}</p>
            <p><span class="font-semibold">Alamat:</span> {{ supplier.address || 'N/A' }}</p>
          </div>
       </div>
    </div>
    
    <!-- Pagination (tidak berubah) -->
    <div class="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
      <!-- ... -->
    </div>
  </div>

  <SupplierModal :isOpen="isFormModalOpen" :supplierData="selectedSupplier" @close="isFormModalOpen = false" @save="handleSave" />
  <SupplierDetailModal :isOpen="isDetailModalOpen" :supplierId="selectedSupplierId" @close="isDetailModalOpen = false" />
</template>