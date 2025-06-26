<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../lib/supabaseClient';
import { Plus, Eye } from 'lucide-vue-next';
import SaleDetailModal from '../components/SaleDetailModal.vue'; // <-- 1. Import komponen modal

const sales = ref([]);
const loading = ref(true);

// --- State baru untuk mengontrol modal ---
const isDetailModalOpen = ref(false);
const selectedSaleId = ref(null);
// -----------------------------------------

async function fetchSales() {
  loading.value = true;
  const { data, error } = await supabase
    .from('sales')
    .select(`id, created_at, total_amount, profiles(name)`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sales:', error);
  } else {
    sales.value = data;
  }
  loading.value = false;
}

// --- Fungsi baru untuk membuka modal ---
function openDetailModal(sale) {
  selectedSaleId.value = sale.id;
  isDetailModalOpen.value = true;
}
// --------------------------------------

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
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Data Penjualan</h1>
        <p class="mt-1 text-sm text-gray-500">Lihat semua riwayat transaksi penjualan.</p>
      </div>
      <router-link to="/sales/new" class="flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-opacity-90 transition">
        <Plus class="w-5 h-5 mr-2" />
        Catat Penjualan Baru
      </router-link>
    </div>

    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Tanggal</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">ID Transaksi</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Karyawan</th>
              <th class="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase">Total Penjualan</th>
              <th class="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="5" class="p-6 text-center text-gray-500">Memuat data...</td>
            </tr>
            <tr v-else-if="sales.length === 0">
              <td colspan="5" class="p-6 text-center text-gray-500">Tidak ada data penjualan.</td>
            </tr>
            <tr v-for="sale in sales" :key="sale.id" class="hover:bg-gray-50">
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

  <SaleDetailModal 
    :isOpen="isDetailModalOpen" 
    :saleId="selectedSaleId"
    @close="isDetailModalOpen = false" 
  />
</template>