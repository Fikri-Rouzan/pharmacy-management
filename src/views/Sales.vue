<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../lib/supabaseClient';
import { Plus, Eye, Search, ArrowDownUp } from 'lucide-vue-next';
import SaleDetailModal from '../components/SaleDetailModal.vue';

const sales = ref([]);
const loading = ref(true);
const isDetailModalOpen = ref(false);
const selectedSaleId = ref(null);

// State filter hanya butuh searchQuery dan sortOrder sekarang
const searchQuery = ref('');
const sortOrder = ref('desc');

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc';
}

// --- Computed property diperbarui dengan logika pencarian tanggal ---
const filteredSales = computed(() => {
  let dataToProcess = [...sales.value];

  // 1. Terapkan filter pencarian jika ada teks
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    dataToProcess = dataToProcess.filter(sale => {
      // Mencari berdasarkan ID
      const idMatch = sale.id.toLowerCase().includes(query);
      // Mencari berdasarkan nama karyawan
      const profileMatch = sale.profiles?.name?.toLowerCase().includes(query);
      // Mencari berdasarkan tanggal yang diformat (e.g., "27 juni 2025")
      const formattedDate = formatDate(sale.created_at).toLowerCase();
      const dateMatch = formattedDate.includes(query);
      
      return idMatch || profileMatch || dateMatch;
    });
  }

  // 2. Terapkan logika sortir pada hasil filter
  dataToProcess.sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return sortOrder.value === 'desc' ? dateB - dateA : dateA - dateB;
  });

  return dataToProcess;
});

async function fetchSales() {
  loading.value = true;
  const { data, error } = await supabase.from('sales').select(`id,created_at,total_amount,profiles(name)`).order('created_at', { ascending: false });
  if (error) console.error('Error fetching sales:', error); else sales.value = data;
  loading.value = false;
}

function openDetailModal(sale) {
  selectedSaleId.value = sale.id;
  isDetailModalOpen.value = true;
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
}

onMounted(fetchSales);
</script>

<template>
  <div class="container mx-auto">
    <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Data Penjualan</h1>
        <p class="mt-1 text-sm text-gray-500">Lihat semua riwayat transaksi penjualan.</p>
      </div>
       <div class="flex items-center gap-2 w-full md:w-auto flex-wrap">
        <button @click="toggleSortOrder" class="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition">
          <ArrowDownUp class="w-4 h-4 mr-2" />
          Urutkan: {{ sortOrder === 'desc' ? 'Terbaru' : 'Terlama' }}
        </button>
        
        <div class="relative w-full md:w-auto flex-grow">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search class="w-5 h-5 text-gray-400" />
          </span>
          <input v-model="searchQuery" type="text" placeholder="Cari ID, Karyawan, Bulan..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
        </div>
        
        <router-link to="/sales/new" class="flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-opacity-90 transition whitespace-nowrap">
          <Plus class="w-5 h-5 mr-2" />
          Catat Penjualan
        </router-link>
      </div>
    </div>
    
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <tbody class="divide-y divide-gray-200">
              <tr v-if="loading"><td colspan="5" class="p-6 text-center text-gray-500">Memuat data...</td></tr>
              <tr v-else-if="filteredSales.length === 0">
                <td colspan="5" class="p-6 text-center text-gray-500">
                  <span v-if="searchQuery">Transaksi tidak ditemukan untuk pencarian "{{ searchQuery }}".</span>
                  <span v-else>Tidak ada data penjualan.</span>
                </td>
              </tr>
              <tr v-for="sale in filteredSales" :key="sale.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ formatDate(sale.created_at) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{{ sale.id.substring(0, 8) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ sale.profiles?.name || 'N/A' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right font-semibold">{{ formatCurrency(sale.total_amount) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <button @click="openDetailModal(sale)" class="p-2 text-primary hover:bg-secondary rounded-full" title="Lihat Detail">
                    <Eye class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  </div>

  <SaleDetailModal :isOpen="isDetailModalOpen" :saleId="selectedSaleId" @close="isDetailModalOpen = false" />
</template>