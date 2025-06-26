<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../lib/supabaseClient';
import { Plus, Eye } from 'lucide-vue-next';
import PurchaseDetailModal from '../components/PurchaseDetailModal.vue'; // <-- Import komponen modal

const purchases = ref([]);
const loading = ref(true);

// --- State baru untuk mengontrol modal ---
const isDetailModalOpen = ref(false);
const selectedPurchaseId = ref(null);
// -----------------------------------------

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

// --- Fungsi baru untuk membuka modal ---
function openDetailModal(purchase) {
  selectedPurchaseId.value = purchase.id;
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

onMounted(fetchPurchases);
</script>

<template>
  <div class="container mx-auto">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Data Pembelian</h1>
        <p class="mt-1 text-sm text-gray-500">Lihat semua riwayat transaksi pembelian dari supplier.</p>
      </div>
      <router-link to="/purchases/new" class="flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-opacity-90 transition">
        <Plus class="w-5 h-5 mr-2" />
        Catat Pembelian Baru
      </router-link>
    </div>

    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Tanggal</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">ID Transaksi</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Supplier</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Karyawan</th>
              <th class="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase">Total Pembelian</th>
              <th class="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="6" class="p-6 text-center text-gray-500">Memuat data...</td>
            </tr>
            <tr v-else-if="purchases.length === 0">
              <td colspan="6" class="p-6 text-center text-gray-500">Tidak ada data pembelian.</td>
            </tr>
            <tr v-for="purchase in purchases" :key="purchase.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ formatDate(purchase.created_at) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{{ purchase.id.substring(0, 8) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ purchase.suppliers?.name || 'N/A' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{{ purchase.profiles?.name || 'N/A' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right font-semibold">{{ formatCurrency(purchase.total_amount) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <button @click="openDetailModal(purchase)" class="p-2 text-primary hover:bg-secondary rounded-full" title="Lihat Detail">
                  <Eye class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <PurchaseDetailModal 
    :isOpen="isDetailModalOpen" 
    :purchaseId="selectedPurchaseId"
    @close="isDetailModalOpen = false" 
  />
</template>