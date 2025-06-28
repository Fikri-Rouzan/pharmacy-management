<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../lib/supabaseClient'; // Pastikan path ini benar
import Swal from 'sweetalert2';
import MedicineModal from '../components/MedicineModal.vue'; // Pastikan path ini benar
import { Plus, Edit, Trash2, Search } from 'lucide-vue-next';

const medicines = ref([]);
const loading = ref(true);
const isModalOpen = ref(false);
const selectedMedicine = ref(null);
const searchQuery = ref('');

// Computed property untuk memfilter data obat secara dinamis berdasarkan pencarian
const filteredMedicines = computed(() => {
  if (!searchQuery.value) {
    return medicines.value;
  }
  const query = searchQuery.value.toLowerCase();
  return medicines.value.filter(medicine => {
    const nameMatch = medicine.name.toLowerCase().includes(query);
    const typeMatch = medicine.type ? medicine.type.toLowerCase().includes(query) : false;
    const supplierMatch = medicine.suppliers ? medicine.suppliers.name.toLowerCase().includes(query) : false;
    
    return nameMatch || typeMatch || supplierMatch;
  });
});

// Fungsi untuk mengambil data obat dari Supabase
async function fetchMedicines() {
  loading.value = true;
  const { data, error } = await supabase
    .from('medicines')
    .select(`
      id, name, type, selling_price, stock_quantity, supplier_id,
      suppliers ( name )
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching medicines:', error);
    Swal.fire('Error', `Gagal mengambil data: ${error.message}`, 'error');
  } else {
    medicines.value = data;
  }
  loading.value = false;
}

// Fungsi untuk membuka modal tambah obat
function openAddModal() {
  selectedMedicine.value = null;
  isModalOpen.value = true;
}

// Fungsi untuk membuka modal edit obat
function openEditModal(medicine) {
  selectedMedicine.value = medicine;
  isModalOpen.value = true;
}

// Fungsi untuk menyimpan data (baik tambah maupun edit)
async function handleSave(medicineData) {
  let error;
  const { suppliers, ...dataToSave } = medicineData;

  if (dataToSave.id) {
    // Mode Edit (Update)
    ({ error } = await supabase.from('medicines').update(dataToSave).eq('id', dataToSave.id));
  } else {
    // Mode Tambah (Insert)
    const { id, ...newMedicineData } = dataToSave;
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

// Fungsi untuk menghapus data
async function handleDelete(medicine) {
  const { isConfirmed } = await Swal.fire({
    title: 'Anda yakin?',
    text: `Anda akan menghapus obat "${medicine.name}". Aksi ini tidak bisa dibatalkan.`,
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

// Panggil fetchMedicines saat komponen pertama kali dimuat
onMounted(fetchMedicines);
</script>

<template>
  <div class="container mx-auto p-4 md:p-6">
    <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Data Obat</h1>
        <p class="mt-1 text-sm text-gray-500">Kelola semua daftar obat yang tersedia di apotek.</p>
      </div>
      <div class="flex items-center gap-4 w-full md:w-auto">
        <div class="relative w-full md:w-64">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search class="w-5 h-5 text-gray-400" />
          </span>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Cari " 
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
          >
        </div>
        <button @click="openAddModal" class="flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-opacity-90 transition whitespace-nowrap">
          <Plus class="w-5 h-5 mr-2" />
          Tambah Obat
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead class="bg-secondary">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-gray-300">Nama Obat</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-gray-300">Tipe</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-gray-300">Stok</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-gray-300">Harga Jual</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-gray-300">Pemasok</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider border-b border-gray-300">Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white">
            <tr v-if="loading">
              <td colspan="6" class="p-6 text-center text-gray-500 border-t border-gray-200">Memuat data...</td>
            </tr>
            <tr v-else-if="filteredMedicines.length === 0">
              <td colspan="6" class="p-6 text-center text-gray-500 border-t border-gray-200">
                <span v-if="searchQuery">Obat tidak ditemukan untuk pencarian "{{ searchQuery }}".</span>
                <span v-else>Tidak ada data obat.</span>
              </td>
            </tr>
            <tr v-for="medicine in filteredMedicines" :key="medicine.id" class="hover:bg-gray-50 transition">
              <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-800 border-t border-gray-200">{{ medicine.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600 border-t border-gray-200">{{ medicine.type }}</td>
              <td class="px-6 py-4 whitespace-nowrap border-t border-gray-200">
                <span 
                  :class="medicine.stock_quantity < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'" 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ medicine.stock_quantity }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600 border-t border-gray-200">Rp {{ medicine.selling_price.toLocaleString('id-ID') }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600 border-t border-gray-200">{{ medicine.suppliers?.name || 'N/A' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium border-t border-gray-200">
                <div class="flex justify-end items-center space-x-1">
                  <button @click="openEditModal(medicine)" class="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition"><Edit class="w-4 h-4" /></button>
                  <button @click="handleDelete(medicine)" class="p-2 text-red-600 hover:bg-red-100 rounded-full transition"><Trash2 class="w-4 h-4" /></button>
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