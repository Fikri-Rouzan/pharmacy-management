<script setup>
import { ref, watch } from 'vue';
import { supabase } from '../../lib/supabaseClient';
import { X } from 'lucide-vue-next';
import Swal from 'sweetalert2';

const props = defineProps({
  isOpen: Boolean,
  medicineId: String,
  medicineName: String,
});

const emit = defineEmits(['close']);
const loading = ref(false);
const stockBatches = ref([]);

const formatTimestamp = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
};
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  // Penyesuaian timezone untuk tipe data DATE dari database
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
};

// --- FUNGSI DIAMBIL ALIH OLEH KODE VUE (TIDAK LAGI MENGGUNAKAN RPC) ---
async function fetchStockDetails(id) {
  if (!id) return;
  loading.value = true;
  stockBatches.value = [];
  try {
    // 1. Ambil total penjualan untuk obat ini
    const { data: salesData, error: salesError } = await supabase
      .from('sale_items')
      .select('quantity')
      .eq('medicine_id', id);
    if (salesError) throw salesError;
    let totalSold = salesData.reduce((sum, item) => sum + item.quantity, 0);

    // 2. Ambil semua batch pembelian untuk obat ini, diurutkan berdasarkan ED
    const { data: purchaseData, error: purchaseError } = await supabase
      .from('purchase_items')
      .select('*, purchases(created_at)')
      .eq('medicine_id', id)
      .order('expiry_date', { ascending: true });
    if (purchaseError) throw purchaseError;

    // 3. Lakukan kalkulasi FEFO (First-Expired, First-Out) di sini
    const calculatedBatches = purchaseData.map(batch => {
      const quantityPurchased = batch.quantity;
      // Hitung berapa banyak dari batch ini yang sudah terjual
      const quantityToDeduct = Math.min(totalSold, quantityPurchased);
      // Hitung sisa stoknya
      const quantityRemaining = quantityPurchased - quantityToDeduct;
      
      // Kurangi total terjual untuk persiapan iterasi batch berikutnya
      totalSold -= quantityToDeduct;

      return {
        purchase_item_id: batch.id,
        purchase_date: batch.purchases.created_at,
        expiry_date: batch.expiry_date,
        quantity_purchased: quantityPurchased,
        quantity_remaining: quantityRemaining,
      };
    });

    stockBatches.value = calculatedBatches;

  } catch (err) {
    console.error('Error fetching stock details:', err);
    Swal.fire('Error', 'Gagal mengambil detail stok dari database.', 'error');
  } finally {
    loading.value = false;
  }
}

watch(() => props.medicineId, (newId) => {
  if (props.isOpen && newId) {
    fetchStockDetails(newId);
  }
});
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
    <div class="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden">
      <div class="flex items-center justify-between p-4 bg-primary text-white">
        <div>
          <h2 class="text-2xl font-bold">Detail Stok Batch</h2>
          <p class="text-sm text-blue-100">{{ medicineName }}</p>
        </div>
        <button @click="$emit('close')" class="p-1 rounded-full hover:bg-white/20"><X class="w-6 h-6" /></button>
      </div>
      <div class="p-6">
        <div class="border rounded-lg max-h-80 overflow-y-auto">
          <table class="w-full">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Tgl. Pembelian</th>
                <th class="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Tgl. Kedaluwarsa</th>
                <th class="px-4 py-2 text-center text-xs font-bold text-gray-600 uppercase">Jumlah Beli</th>
                <th class="px-4 py-2 text-center text-xs font-bold text-gray-600 uppercase">Stok Sisa</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-if="loading"><td colspan="4" class="p-4 text-center">Memuat...</td></tr>
              <tr v-else-if="stockBatches.length === 0"><td colspan="4" class="p-4 text-center text-gray-500">Tidak ada riwayat pembelian untuk obat ini.</td></tr>
              <tr v-for="batch in stockBatches" :key="batch.purchase_item_id" :class="{'bg-red-50': new Date(batch.expiry_date) < new Date()}">
                <td class="px-4 py-2 text-sm">{{ formatTimestamp(batch.purchase_date) }}</td>
                <td class="px-4 py-2 text-sm font-semibold" :class="{'text-red-600': new Date(batch.expiry_date) < new Date()}">{{ formatDate(batch.expiry_date) }}</td>
                <td class="px-4 py-2 text-center">{{ batch.quantity_purchased }}</td>
                <td class="px-4 py-2 text-center font-bold text-primary">{{ batch.quantity_remaining }}</td>
              </tr>
            </tbody>
          </table>
        </div>
         <div class="mt-6 flex justify-end">
          <button type="button" @click="$emit('close')" class="px-5 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</template>
