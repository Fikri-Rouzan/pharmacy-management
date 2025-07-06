<script setup>
import { ref, watch } from 'vue';
import { supabase } from '../lib/supabaseClient';
import { X } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  medicineId: String,
  medicineName: String,
});

const emit = defineEmits(['close']);
const loading = ref(false);
const stockBatches = ref([]);

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  date.setDate(date.getDate() + 1); // Penyesuaian timezone UTC
  return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
};

async function fetchStockDetails(id) {
  if (!id) return;
  loading.value = true;
  stockBatches.value = [];
  try {
    const { data, error } = await supabase.rpc('get_stock_details_by_medicine', {
      medicine_id_input: id
    });
    if (error) throw error;
    stockBatches.value = data;
  } catch (err) {
    console.error('Error fetching stock details:', err);
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
  <div v-if="isOpen" class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
    <div class="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden">
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
              <tr v-for="(batch, index) in stockBatches" :key="index" :class="{'bg-red-50': new Date(batch.expiry_date) < new Date()}">
                <td class="px-4 py-2 text-sm">{{ formatDate(batch.purchase_date) }}</td>
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