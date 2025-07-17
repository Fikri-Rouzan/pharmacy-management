<script setup>
import { ref, watch } from 'vue';
import { supabase } from '../../lib/supabaseClient';
import { X } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  purchaseId: String,
});

const emit = defineEmits(['close']);

const loading = ref(false);
const purchaseDetails = ref(null);

const formatDate = (dateString) => new Date(dateString).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
const formatExpiryDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  // Tambah 1 hari karena masalah timezone UTC
  date.setDate(date.getDate() + 1);
  return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
};
const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);

async function fetchPurchaseDetails(id) {
  if (!id) return;
  loading.value = true;
  purchaseDetails.value = null;
  try {
    const { data, error } = await supabase.from('purchases').select('*, suppliers(name), profiles(name)').eq('id', id).single();
    if (error) throw error;
    
    // Ambil juga expiry_date dari item
    const { data: items, error: itemsError } = await supabase.from('purchase_items').select('*, medicines(name), expiry_date').eq('purchase_id', id);
    if (itemsError) throw itemsError;
    
    purchaseDetails.value = { ...data, items: items };
  } catch (err) {
    console.error('Error fetching purchase details:', err);
  } finally {
    loading.value = false;
  }
}

watch(() => props.purchaseId, (newId) => {
  if (props.isOpen && newId) {
    fetchPurchaseDetails(newId);
  }
});
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity">
    <div class="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden">
      <div class="flex items-center justify-between p-4 bg-primary text-white">
        <h2 class="text-2xl font-bold">Detail Transaksi Pembelian</h2>
        <button @click="$emit('close')" class="p-1 rounded-full hover:bg-white/20"><X class="w-6 h-6" /></button>
      </div>
      
      <div class="p-6">
        <div v-if="loading" class="text-center py-10">Memuat detail...</div>
        <div v-else-if="purchaseDetails" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><p class="text-gray-500">ID Transaksi</p><p class="font-mono text-gray-800">{{ purchaseDetails.id.substring(0, 8) }}</p></div>
            <div><p class="text-gray-500">Tanggal</p><p class="font-semibold text-gray-800">{{ formatDate(purchaseDetails.created_at) }}</p></div>
            <div><p class="text-gray-500">Supplier</p><p class="font-semibold text-gray-800">{{ purchaseDetails.suppliers.name || 'N/A' }}</p></div>
            <div><p class="text-gray-500">Dicatat oleh</p><p class="font-semibold text-gray-800">{{ purchaseDetails.profiles.name || 'N/A' }}</p></div>
            <div><p class="text-gray-500">Total Transaksi</p><p class="font-bold text-lg text-primary">{{ formatCurrency(purchaseDetails.total_amount) }}</p></div>
          </div>
          <hr/>
          <div>
            <h3 class="font-semibold mb-2 text-gray-800">Item Dibeli:</h3>
            <div class="border rounded-lg max-h-64 overflow-y-auto">
              <table class="w-full">
                <thead class="bg-gray-50 sticky top-0">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Nama Obat</th>
                    <th class="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Tgl. Kedaluwarsa</th>
                    <th class="px-4 py-2 text-right text-xs font-bold text-gray-600 uppercase">Harga Beli</th>
                    <th class="px-4 py-2 text-center text-xs font-bold text-gray-600 uppercase">Jumlah</th>
                    <th class="px-4 py-2 text-right text-xs font-bold text-gray-600 uppercase">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr v-for="item in purchaseDetails.items" :key="item.id">
                    <td class="px-4 py-2 font-medium">{{ item.medicines.name }}</td>
                    <td class="px-4 py-2 text-sm">{{ formatExpiryDate(item.expiry_date) }}</td>
                    <td class="px-4 py-2 text-right">{{ formatCurrency(item.purchase_price) }}</td>
                    <td class="px-4 py-2 text-center">{{ item.quantity }}</td>
                    <td class="px-4 py-2 text-right font-semibold">{{ formatCurrency(item.purchase_price * item.quantity) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="mt-6 flex justify-end">
          <button type="button" @click="$emit('close')" class="px-5 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</template>