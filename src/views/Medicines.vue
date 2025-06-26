<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../lib/supabaseClient';
import Swal from 'sweetalert2';
import MedicineModal from '../components/MedicineModal.vue';
import { Plus, Edit, Trash2 } from 'lucide-vue-next';

const medicines = ref([]);
const loading = ref(true);
const isModalOpen = ref(false);
const selectedMedicine = ref(null);

async function fetchMedicines() {
  loading.value = true;
  // Ambil data obat beserta nama suppliernya (JOIN)
  const { data, error } = await supabase
    .from('medicines')
    .select(`
      id, name, type, selling_price, stock_quantity, supplier_id,
      suppliers ( name )
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching medicines:', error);
  } else {
    medicines.value = data;
  }
  loading.value = false;
}

function openAddModal() {
  selectedMedicine.value = null;
  isModalOpen.value = true;
}

function openEditModal(medicine) {
  selectedMedicine.value = medicine;
  isModalOpen.value = true;
}

async function handleSave(medicineData) {
  let error;
  if (medicineData.id) {
    // Mode Edit (Update)
    ({ error } = await supabase.from('medicines').update(medicineData).eq('id', medicineData.id));
  } else {
    // Mode Tambah (Insert)
    const { id, ...newMedicineData } = medicineData;
    ({ error } = await supabase.from('medicines').insert(newMedicineData));
  }

  if (error) {
    Swal.fire('Error', `Gagal menyimpan data: ${error.message}`, 'error');
  } else {
    Swal.fire('Sukses', 'Data obat berhasil disimpan.', 'success');
    isModalOpen.value = false;
    fetchMedicines(); // Muat ulang data
  }
}

async function handleDelete(medicine) {
  const { isConfirmed } = await Swal.fire({
    title: 'Anda yakin?',
    text: `Anda akan menghapus obat "${medicine.name}".`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal'
  });

  if (isConfirmed) {
    const { error } = await supabase.from('medicines').delete().eq('id', medicine.id);
    if (error) {
      Swal.fire('Error', `Gagal menghapus data: ${error.message}`, 'error');
    } else {
      Swal.fire('Terhapus!', 'Data obat telah dihapus.', 'success');
      fetchMedicines(); // Muat ulang data
    }
  }
}

onMounted(fetchMedicines);
</script>

<template>
  <div class="container mx-auto">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Data Obat</h1>
        <p class="mt-1 text-sm text-gray-500">Kelola semua daftar obat yang tersedia di apotek.</p>
      </div>
      <button @click="openAddModal" class="flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-opacity-90 transition">
        <Plus class="w-5 h-5 mr-2" />
        Tambah Obat Baru
      </button>
    </div>

    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Nama Obat</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Tipe</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Stok</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Harga Jual</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Pemasok</th>
              <th class="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="6" class="p-6 text-center text-gray-500">Memuat data...</td>
            </tr>
            <tr v-else-if="medicines.length === 0">
              <td colspan="6" class="p-6 text-center text-gray-500">Tidak ada data obat.</td>
            </tr>
            <tr v-for="medicine in medicines" :key="medicine.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{{ medicine.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">{{ medicine.type }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="medicine.stock_quantity < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'" 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ medicine.stock_quantity }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">Rp {{ medicine.selling_price.toLocaleString('id-ID') }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">{{ medicine.suppliers?.name || 'N/A' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button @click="openEditModal(medicine)" class="p-2 text-primary hover:bg-secondary rounded-full"><Edit class="w-4 h-4" /></button>
                  <button @click="handleDelete(medicine)" class="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 class="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <MedicineModal 
    :isOpen="isModalOpen" 
    :medicineData="selectedMedicine" 
    @close="isModalOpen = false" 
    @save="handleSave"
  />
</template>