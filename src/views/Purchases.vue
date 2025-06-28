<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../lib/supabaseClient'; // Pastikan path ini benar
import { Plus, Eye, Search, ArrowDownUp } from 'lucide-vue-next';
import PurchaseDetailModal from '../components/PurchaseDetailModal.vue'; // Pastikan path ini benar

const purchases = ref([]);
const loading = ref(true);
const isDetailModalOpen = ref(false);
const selectedPurchaseId = ref(null);

// --- State untuk filter & sortir ---
const searchQuery = ref('');
const sortOrder = ref('desc');

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc';
}

// --- Computed property untuk filter dan sortir ---
const filteredPurchases = computed(() => {
  let dataToProcess = [...purchases.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    dataToProcess = dataToProcess.filter(purchase => {
      const idMatch = purchase.id.toLowerCase().includes(query);
      const supplierMatch = purchase.suppliers?.name?.toLowerCase().includes(query);
      const profileMatch = purchase.profiles?.name?.toLowerCase().includes(query);
      const formattedDate = formatDate(purchase.created_at).toLowerCase();
      const dateMatch = formattedDate.includes(query);
      return idMatch || supplierMatch || profileMatch || dateMatch;
    });
  }

  dataToProcess.sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return sortOrder.value === 'desc' ? dateB - dateA : dateA - dateB;
  });

  return dataToProcess;
});

// Fungsi untuk mengambil data pembelian dari Supabase
async function fetchPurchases() {
  loading.value = true;
  const { data, error } = await supabase
    .from('purchases')
    .select(`id, created_at, total_amount, suppliers(name), profiles(name)`)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching purchases:', error);
  } else {
    purchases.value = data;
  }
  loading.value = false;
}

// Fungsi untuk membuka modal detail
function openDetailModal(purchase) {
  selectedPurchaseId.value = purchase.id;
  isDetailModalOpen.value = true;
}

// Fungsi untuk memformat tanggal
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Fungsi untuk memformat mata uang
function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
}

// Panggil fetchPurchases saat komponen pertama kali dimuat
onMounted(fetchPurchases);
</script>

<template>
  <div class="container mx-auto p-4 md:p-6">
    <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Data Pembelian</h1>
        <p class="mt-1 text-sm text-gray-500">Lihat semua riwayat transaksi pembelian dari supplier.</p>
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
          <input v-model="searchQuery" type="text" placeholder="Cari " class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
        </div>
        <router-link to="/purchases/new" class="flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-opacity-90 transition whitespace-nowrap">
          <Plus class="w-5 h-5 mr-2" />
          Catat Pembelian
        </router-link>
      </div>
    </div>
    
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead class="bg-secondary">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-gray-300">Tanggal Transaksi</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-gray-300">ID Transaksi</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-gray-300">Supplier</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-gray-300">Dibuat Oleh</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider border-b border-gray-300">Total</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-b border-gray-300">Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white">
            <tr v-if="loading"><td colspan="6" class="p-6 text-center text-gray-500 border-t border-gray-200">Memuat data...</td></tr>
            <tr v-else-if="filteredPurchases.length === 0">
              <td colspan="6" class="p-6 text-center text-gray-500 border-t border-gray-200">
                <span v-if="searchQuery">Transaksi tidak ditemukan untuk pencarian "{{ searchQuery }}".</span>
                <span v-else>Tidak ada data pembelian.</span>
              </td>
            </tr>
            <tr v-for="purchase in filteredPurchases" :key="purchase.id" class="hover:bg-gray-50 transition">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-t border-gray-200">{{ formatDate(purchase.created_at) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 border-t border-gray-200">{{ purchase.id.substring(0, 8) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-t border-gray-200">{{ purchase.suppliers?.name || 'N/A' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 border-t border-gray-200">{{ purchase.profiles?.name || 'N/A' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right font-semibold border-t border-gray-200">{{ formatCurrency(purchase.total_amount) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-center border-t border-gray-200">
                <button @click="openDetailModal(purchase)" class="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition" title="Lihat Detail">
                  <Eye class="w-5 h-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <PurchaseDetailModal :isOpen="isDetailModalOpen" :purchaseId="selectedPurchaseId" @close="isDetailModalOpen = false" />
</template>