<script setup>
// 1. Tambahkan 'computed' dari vue dan ikon 'Search'
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../lib/supabaseClient';
import Swal from 'sweetalert2';
import SupplierModal from '../components/SupplierModal.vue';
import { Plus, Edit, Trash2, Search } from 'lucide-vue-next';

const suppliers = ref([]);
const loading = ref(true);
const isModalOpen = ref(false);
const selectedSupplier = ref(null);

// 2. State baru untuk menampung teks pencarian
const searchQuery = ref('');

// 3. Computed property untuk memfilter data supplier secara dinamis
const filteredSuppliers = computed(() => {
  // Jika kotak pencarian kosong, tampilkan semua supplier
  if (!searchQuery.value) {
    return suppliers.value;
  }
  // Jika ada teks, filter data
  const query = searchQuery.value.toLowerCase();
  return suppliers.value.filter(supplier => {
    const nameMatch = supplier.name.toLowerCase().includes(query);
    const emailMatch = supplier.email ? supplier.email.toLowerCase().includes(query) : false;
    const phoneMatch = supplier.phone_number ? supplier.phone_number.includes(query) : false;
    
    return nameMatch || emailMatch || phoneMatch;
  });
});

async function fetchSuppliers() {
  loading.value = true;
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
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
  isModalOpen.value = true;
}

function openEditModal(supplier) {
  selectedSupplier.value = supplier;
  isModalOpen.value = true;
}

async function handleSave(supplierData) {
  let error;
  const dataToSave = {
    name: supplierData.name,
    email: supplierData.email,
    phone_number: supplierData.phone_number,
    address: supplierData.address,
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
    isModalOpen.value = false;
    fetchSuppliers();
  }
}

async function handleDelete(supplier) {
  const { isConfirmed } = await Swal.fire({
    title: 'Anda yakin?',
    text: `Anda akan menghapus supplier "${supplier.name}". Ini bisa mempengaruhi data obat yang terkait.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal'
  });

  if (isConfirmed) {
    const { error } = await supabase.from('suppliers').delete().eq('id', supplier.id);
    if (error) {
      Swal.fire('Error', `Gagal menghapus data: ${error.message}`, 'error');
    } else {
      Swal.fire('Terhapus!', 'Data supplier telah dihapus.', 'success');
      fetchSuppliers();
    }
  }
}

onMounted(fetchSuppliers);
</script>

<template>
  <div class="container mx-auto">
    <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Data Supplier</h1>
        <p class="mt-1 text-sm text-gray-500">Kelola semua daftar supplier atau pemasok obat.</p>
      </div>
      <div class="flex items-center gap-4 w-full md:w-auto">
        <div class="relative w-full md:w-64">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search class="w-5 h-5 text-gray-400" />
          </span>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Cari nama, email, telepon..." 
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
          >
        </div>
        <button @click="openAddModal" class="flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-opacity-90 transition whitespace-nowrap">
          <Plus class="w-5 h-5 mr-2" />
          Tambah Supplier
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Nama Supplier</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">No. Telepon</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Alamat</th>
              <th class="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="5" class="p-6 text-center text-gray-500">Memuat data...</td>
            </tr>
            <tr v-else-if="filteredSuppliers.length === 0">
              <td colspan="5" class="p-6 text-center text-gray-500">
                <span v-if="searchQuery">Supplier tidak ditemukan untuk pencarian "{{ searchQuery }}".</span>
                <span v-else>Tidak ada data supplier.</span>
              </td>
            </tr>
            <tr v-for="supplier in filteredSuppliers" :key="supplier.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{{ supplier.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">{{ supplier.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">{{ supplier.phone_number }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">{{ supplier.address }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button @click="openEditModal(supplier)" class="p-2 text-primary hover:bg-secondary rounded-full"><Edit class="w-4 h-4" /></button>
                  <button @click="handleDelete(supplier)" class="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 class="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <SupplierModal 
    :isOpen="isModalOpen" 
    :supplierData="selectedSupplier" 
    @close="isModalOpen = false" 
    @save="handleSave"
  />
</template>