<script setup>
import { ref, watch } from 'vue';
import { supabase } from '../lib/supabaseClient';
import { X } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  saleId: String, // Menerima ID penjualan yang akan ditampilkan
});

const emit = defineEmits(['close']);

const loading = ref(false);
const saleDetails = ref(null);

// Fungsi untuk memformat tanggal dan mata uang
const formatDate = (dateString) => new Date(dateString).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);

// Fungsi untuk mengambil detail transaksi dari Supabase
async function fetchSaleDetails(id) {
  if (!id) return;
  loading.value = true;
  saleDetails.value = null;
  try {
    // Ambil data utama dari tabel 'sales' dan data karyawan terkait
    const { data, error } = await supabase
      .from('sales')
      .select('*, profiles(name)')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Ambil semua item yang terkait dengan penjualan ini dari 'sale_items'
    const { data: items, error: itemsError } = await supabase
      .from('sale_items')
      .select('*, medicines(name)')
      .eq('sale_id', id);

    if (itemsError) throw itemsError;

    // Gabungkan hasilnya
    saleDetails.value = { ...data, items: items };

  } catch (err) {
    console.error('Error fetching sale details:', err);
  } finally {
    loading.value = false;
  }
}

// Awasi perubahan pada props. Jika modal dibuka, ambil datanya.
watch(() => props.saleId, (newId) => {
  if (props.isOpen && newId) {
    fetchSaleDetails(newId);
  }
});
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
    <div class="w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl transform transition-all">
      <div class="flex items-center justify-between border-b pb-3">
        <h2 class="text-2xl font-bold text-gray-800">Detail Transaksi Penjualan</h2>
        <button @click="$emit('close')" class="p-2 rounded-full hover:bg-gray-200">
          <X class="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <div v-if="loading" class="text-center py-10">Memuat detail...</div>
      <div v-else-if="saleDetails" class="mt-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <p class="text-gray-500">ID Transaksi</p>
            <p class="font-mono text-gray-800">{{ saleDetails.id.substring(0, 8) }}</p>
          </div>
          <div>
            <p class="text-gray-500">Tanggal</p>
            <p class="font-semibold text-gray-800">{{ formatDate(saleDetails.created_at) }}</p>
          </div>
          <div>
            <p class="text-gray-500">Karyawan</p>
            <p class="font-semibold text-gray-800">{{ saleDetails.profiles.name || 'N/A' }}</p>
          </div>
           <div>
            <p class="text-gray-500">Total Transaksi</p>
            <p class="font-bold text-lg text-primary">{{ formatCurrency(saleDetails.total_amount) }}</p>
          </div>
        </div>

        <h3 class="font-semibold mb-2">Item Terjual:</h3>
        <div class="border rounded-lg overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Nama Obat</th>
                <th class="px-4 py-2 text-right text-xs font-bold text-gray-600 uppercase">Harga Satuan</th>
                <th class="px-4 py-2 text-center text-xs font-bold text-gray-600 uppercase">Jumlah</th>
                <th class="px-4 py-2 text-right text-xs font-bold text-gray-600 uppercase">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-for="item in saleDetails.items" :key="item.id">
                <td class="px-4 py-2 font-medium">{{ item.medicines.name }}</td>
                <td class="px-4 py-2 text-right">{{ formatCurrency(item.price) }}</td>
                <td class="px-4 py-2 text-center">{{ item.quantity }}</td>
                <td class="px-4 py-2 text-right font-semibold">{{ formatCurrency(item.price * item.quantity) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
      <div class="mt-6 flex justify-end">
        <button type="button" @click="$emit('close')" class="px-5 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90">Tutup</button>
      </div>
    </div>
  </div>
</template>