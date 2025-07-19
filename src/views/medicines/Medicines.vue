<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { supabase } from '../../lib/supabaseClient';
import Swal from 'sweetalert2';
import MedicineModal from '../../components/medicines/MedicineModal.vue';
import MedicineStockDetailModal from '../../components/medicines/MedicineStockDetailModal.vue';
import { Plus, Edit, Trash2, Search, Boxes } from 'lucide-vue-next';

// --- State untuk Pagination & Data ---
const medicines = ref([]);
const loading = ref(true);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalMedicines = ref(0);

// --- State untuk Modal & Pencarian ---
const isFormModalOpen = ref(false);
const isStockModalOpen = ref(false);
const selectedMedicine = ref(null);
const searchQuery = ref('');
const searchDebounceTimer = ref(null);

// --- Computed Properties ---
const totalPages = computed(() => {
  if (totalMedicines.value === 0) return 1;
  return Math.ceil(totalMedicines.value / itemsPerPage.value);
});

// --- Data Fetching & Logic ---
async function fetchMedicines() {
  loading.value = true;
  const from = (currentPage.value - 1) * itemsPerPage.value;
  const to = from + itemsPerPage.value - 1;

  let query = supabase
    .from('medicines')
    .select(`id, name, type, selling_price, stock_quantity, supplier_id, suppliers(name)`, { count: 'exact' });

  // Pencarian dilakukan di sisi server untuk performa lebih baik
  if (searchQuery.value) {
    const q = `%${searchQuery.value}%`;
    query = query.or(`name.ilike.${q},type.ilike.${q},suppliers.name.ilike.${q}`);
  }

  const { data, error, count } = await query
    .order('name', { ascending: true })
    .range(from, to);

  if (error) {
    console.error('Error fetching medicines:', error);
  } else {
    medicines.value = data;
    totalMedicines.value = count || 0;
  }
  loading.value = false;
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

watch([currentPage, itemsPerPage], fetchMedicines);

watch(searchQuery, () => {
  clearTimeout(searchDebounceTimer.value);
  searchDebounceTimer.value = setTimeout(() => {
    currentPage.value = 1;
    fetchMedicines();
  }, 300);
});

onMounted(fetchMedicines);

// --- Modal & CRUD Functions ---
function openAddModal() {
  selectedMedicine.value = null;
  isFormModalOpen.value = true;
}

function openEditModal(medicine) {
  selectedMedicine.value = medicine;
  isFormModalOpen.value = true;
}

function openStockDetailModal(medicine) {
  selectedMedicine.value = medicine;
  isStockModalOpen.value = true;
}

async function handleSave(medicineData) {
  let error;
  const { suppliers, ...dataToSave } = medicineData;

  if (dataToSave.id) {
    ({ error } = await supabase.from('medicines').update(dataToSave).eq('id', dataToSave.id));
  } else {
    const { id, ...newMedicineData } = dataToSave;
    ({ error } = await supabase.from('medicines').insert(newMedicineData));
  }

  if (error) {
    Swal.fire('Error', `Gagal menyimpan data: ${error.message}`, 'error');
  } else {
    Swal.fire('Sukses', 'Data obat berhasil disimpan.', 'success');
    isFormModalOpen.value = false;
    fetchMedicines();  
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
      fetchMedicines();
    }
  }
}
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
            placeholder="Cari obat, tipe, supplier..." 
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
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
              <th class="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Nama Obat</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Tipe</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Total Stok</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Harga Jual</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Pemasok</th>
              <th class="px-6 py-3 text-right text-xs font-bold text-white uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white">
            <tr v-if="loading">
              <td colspan="6" class="p-6 text-center text-gray-500 border-t">Memuat data...</td>
            </tr>
            <tr v-else-if="medicines.length === 0">
              <td colspan="6" class="p-6 text-center text-gray-500 border-t">
                <span v-if="searchQuery">Obat tidak ditemukan.</span>
                <span v-else>Tidak ada data obat.</span>
              </td>
            </tr>
            <tr 
              v-for="medicine in medicines" 
              :key="medicine.id" 
              @click="openStockDetailModal(medicine)"
              class="hover:bg-gray-50 transition cursor-pointer"
            >
              <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-800 border-t">{{ medicine.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600 border-t">{{ medicine.type }}</td>
              <td class="px-6 py-4 whitespace-nowrap border-t">
                <span 
                  :class="medicine.stock_quantity < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'" 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ medicine.stock_quantity }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600 border-t">Rp {{ (medicine.selling_price || 0).toLocaleString('id-ID') }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600 border-t">{{ medicine.suppliers?.name || 'N/A' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium border-t">
                <div class="flex justify-end items-center space-x-1">
                  <button @click.stop="openStockDetailModal(medicine)" class="p-2 text-teal-600 hover:bg-teal-100 rounded-full transition" title="Lihat Detail Stok & ED"><Boxes class="w-4 h-4" /></button>
                  <button @click.stop="openEditModal(medicine)" class="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition" title="Edit Obat"><Edit class="w-4 h-4" /></button>
                  <button @click.stop="handleDelete(medicine)" class="p-2 text-red-600 hover:bg-red-100 rounded-full transition" title="Hapus Obat"><Trash2 class="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
       <div class="flex items-center gap-2">
         <select v-model.number="itemsPerPage" class="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-primary focus:border-primary" :disabled="loading">
           <option value="10">10</option><option value="25">25</option><option value="50">50</option><option value="100">100</option>
         </select>
         <span class="text-sm text-gray-600">dari <span class="font-semibold">{{ totalMedicines }}</span> data</span>
       </div>
       <div class="flex items-center gap-2">
         <button @click="prevPage" :disabled="currentPage === 1 || loading" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">Sebelumnya</button>
         <span class="text-sm text-gray-700">Halaman <span class="font-semibold">{{ currentPage }}</span> dari <span class="font-semibold">{{ totalPages }}</span></span>
         <button @click="nextPage" :disabled="currentPage === totalPages || loading" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">Berikutnya</button>
       </div>
    </div>
  </div>

  <MedicineModal 
    :isOpen="isFormModalOpen" 
    :medicineData="selectedMedicine" 
    @close="isFormModalOpen = false" 
    @save="handleSave"
  />
  
  <MedicineStockDetailModal 
    :isOpen="isStockModalOpen" 
    :medicineId="selectedMedicine?.id"
    :medicineName="selectedMedicine?.name"
    @close="isStockModalOpen = false" 
  />
</template>