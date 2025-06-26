<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../lib/supabaseClient';
import Swal from 'sweetalert2';
import SupplierModal from '../components/SupplierModal.vue';
import { Plus, Edit, Trash2 } from 'lucide-vue-next';

const suppliers = ref([]);
const loading = ref(true);
const isModalOpen = ref(false);
const selectedSupplier = ref(null);

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
    // Mode Edit
    ({ error } = await supabase.from('suppliers').update(dataToSave).eq('id', supplierData.id));
  } else {
    // Mode Tambah
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
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Data Supplier</h1>
        <p class="mt-1 text-sm text-gray-500">Kelola semua daftar supplier atau pemasok obat.</p>
      </div>
      <button @click="openAddModal" class="flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-opacity-90 transition">
        <Plus class="w-5 h-5 mr-2" />
        Tambah Supplier Baru
      </button>
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
            <tr v-else-if="suppliers.length === 0">
              <td colspan="5" class="p-6 text-center text-gray-500">Tidak ada data supplier.</td>
            </tr>
            <tr v-for="supplier in suppliers" :key="supplier.id" class="hover:bg-gray-50">
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