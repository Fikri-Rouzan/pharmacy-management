<script setup>
// src/views/purchases/Purchases.vue
import { ref, onMounted, computed, watch } from 'vue';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Eye, Search, ArrowDownUp } from 'lucide-vue-next';
import PurchaseDetailModal from '../../components/purchases/PurchaseDetailModal.vue';

const purchases = ref([]);
const loading = ref(true);
const isDetailModalOpen = ref(false);
const selectedPurchaseId = ref(null);
const searchQuery = ref('');
const sortOrder = ref('desc');
const searchDebounceTimer = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalPurchases = ref(0);

const totalPages = computed(() => {
  if (totalPurchases.value === 0) return 1;
  return Math.ceil(totalPurchases.value / itemsPerPage.value);
});

// Client-side filter based on fetched data
const filteredPurchases = computed(() => {
  if (!searchQuery.value) return purchases.value;
  const term = searchQuery.value.toLowerCase();
  return purchases.value.filter(purchase => {
    const dateStr = formatDate(purchase.created_at).toLowerCase();
    return (
      purchase.id.toLowerCase().includes(term) ||
      (purchase.suppliers?.name || '').toLowerCase().includes(term) ||
      (purchase.profiles?.name || '').toLowerCase().includes(term) ||
      purchase.total_amount.toString().toLowerCase().includes(term) ||
      dateStr.includes(term)
    );
  });
});

async function fetchPurchases() {
  loading.value = true;
  const from = (currentPage.value - 1) * itemsPerPage.value;
  const to = from + itemsPerPage.value - 1;

  let query = supabase
    .from('purchases')
    .select(
      `id, created_at, total_amount, suppliers(name), profiles(name)`,
      { count: 'exact' }
    );

  if (searchQuery.value) {
    const q = `%${searchQuery.value}%`;
    // Server-side search with proper casting for non-text fields
    query = query.or(
      `id::text.ilike.${q},` +
      `suppliers.name.ilike.${q},` +
      `profiles.name.ilike.${q},` +
      `total_amount::text.ilike.${q},` +
      `created_at::text.ilike.${q}`
    );
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: sortOrder.value === 'asc' })
    .range(from, to);

  if (error) {
    console.error('Error fetching purchases:', error);
    purchases.value = [];
    totalPurchases.value = 0;
  } else {
    purchases.value = data;
    totalPurchases.value = count || 0;
  }
  loading.value = false;
}

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc';
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function openDetailModal(purchase) {
  selectedPurchaseId.value = purchase.id;
  isDetailModalOpen.value = true;
}

function formatDate(dateString) {
  const options = {
    year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('id-ID', options);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
}

watch([currentPage, sortOrder, itemsPerPage], fetchPurchases);

watch(searchQuery, () => {
  clearTimeout(searchDebounceTimer.value);
  searchDebounceTimer.value = setTimeout(() => {
    currentPage.value = 1;
    fetchPurchases();
  }, 500);
});

onMounted(fetchPurchases);
</script>

<template>
  <div class="container mx-auto p-4 md:p-6">
    <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Data Pembelian</h1>
        <p class="mt-1 text-sm text-gray-500">Lihat semua riwayat transaksi pembelian dari pemasok.</p>
      </div>
      <div class="flex items-center gap-2 w-full md:w-auto flex-wrap">
        <button
          @click="toggleSortOrder"
          class="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition shadow-sm font-medium"
        >
          <ArrowDownUp class="w-4 h-4 mr-2" />
          Urutkan: {{ sortOrder === 'desc' ? 'Terbaru' : 'Terlama' }}
        </button>
        <div class="relative w-full md:w-auto flex-grow">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search class="w-5 h-5 text-gray-400" />
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari transaksi..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
          />
        </div>
        <router-link
          to="/purchases/new"
          class="flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-opacity-90 transition whitespace-nowrap"
        >
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
              <th class="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b">Tanggal Transaksi</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b">ID Transaksi</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b">Pemasok</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b">Dibuat Oleh</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider border-b">Total</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-b">Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white">
            <tr v-if="loading">
              <td colspan="6" class="p-6 text-center text-gray-500 border-t">Memuat data...</td>
            </tr>
            <tr v-else-if="filteredPurchases.length === 0">
              <td colspan="6" class="p-6 text-center text-gray-500 border-t">
                <span v-if="searchQuery">Transaksi tidak ditemukan.</span>
                <span v-else>Tidak ada data pembelian.</span>
              </td>
            </tr>
            <tr
              v-for="purchase in filteredPurchases"
              :key="purchase.id"
              @click="openDetailModal(purchase)"
              class="hover:bg-gray-100 transition cursor-pointer"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-t">{{ formatDate(purchase.created_at) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 border-t">{{ purchase.id.substring(0, 8) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-t">{{ purchase.suppliers?.name || 'N/A' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 border-t">{{ purchase.profiles?.name || 'N/A' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right font-semibold border-t">{{ formatCurrency(purchase.total_amount) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-center border-t">
                <button
                  @click.stop="openDetailModal(purchase)"
                  class="p-2 text-primary hover:bg-secondary rounded-full"
                  title="Lihat Detail"
                >
                  <Eye class="w-5 h-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
      <div class="flex items-center gap-2">
        <select
          v-model.number="itemsPerPage"
          class="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-primary focus:border-primary"
          :disabled="loading"
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </select>
        <span class="text-sm text-gray-600">dari <span class="font-semibold">{{ totalPurchases }}</span> data</span>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="prevPage"
          :disabled="currentPage === 1 || loading"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        > Sebelumnya
          </button>
          <span class="text-sm text-gray-700">Halaman <span class="font-semibold">{{ currentPage }}</span> dari <span class="font-semibold">{{ totalPages }}</span></span>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages || loading"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>

    <PurchaseDetailModal :isOpen="isDetailModalOpen" :purchaseId="selectedPurchaseId" @close="isDetailModalOpen = false" />
  </template>
