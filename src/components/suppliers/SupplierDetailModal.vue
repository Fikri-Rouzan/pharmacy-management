<script setup>
import { ref, watch } from 'vue';
import { supabase } from '../../lib/supabaseClient';
import { X } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  supplierId: String,
});

const emit = defineEmits(['close']);

const loading = ref(false);
const supplierDetails = ref(null);
const medicines = ref([]);

const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);

async function fetchDetails(id) {
  if (!id) return;
  loading.value = true;
  supplierDetails.value = null;
  medicines.value = [];
  try {
    // 1. Ambil detail data supplier
    const { data: supplierData, error: supplierError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();
    if (supplierError) throw supplierError;
    supplierDetails.value = supplierData;

    // 2. Ambil semua obat yang disediakan oleh supplier ini
    const { data: medicinesData, error: medicinesError } = await supabase
      .from('medicines')
      .select('*')
      .eq('supplier_id', id)
      .order('name');
    if (medicinesError) throw medicinesError;
    medicines.value = medicinesData;

  } catch (err) {
    console.error('Error fetching supplier details:', err);
  } finally {
    loading.value = false;
  }
}

watch(() => props.supplierId, (newId) => {
  if (props.isOpen && newId) {
    fetchDetails(newId);
  }
});
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
    <div class="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden">
      <div class="flex items-center justify-between p-4 bg-primary text-white">
        <h2 class="text-2xl font-bold">Detail Supplier</h2>
        <button @click="$emit('close')" class="p-1 rounded-full hover:bg-white/20">
          <X class="w-6 h-6" />
        </button>
      </div>

      <div class="p-6">
        <div v-if="loading" class="text-center py-10">Memuat detail...</div>
        <div v-else-if="supplierDetails" class="space-y-6">
          <div>
            <h3 class="text-xl font-bold text-gray-800">{{ supplierDetails.name }}</h3>
            <p class="text-sm text-gray-500">{{ supplierDetails.email }} | {{ supplierDetails.phone_number }}</p>
            <p class="text-sm text-gray-500 mt-1">{{ supplierDetails.address }}</p>
          </div>
          <hr/>
          <div>
            <h4 class="text-lg font-semibold text-gray-700 mb-2">Daftar Obat yang Disediakan</h4>
            <div class="border rounded-lg max-h-64 overflow-y-auto">
              <table class="w-full">
                <thead class="bg-gray-50 sticky top-0">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Nama Obat</th>
                    <th class="px-4 py-2 text-right text-xs font-bold text-gray-600 uppercase">Harga Beli</th>
                    <th class="px-4 py-2 text-right text-xs font-bold text-gray-600 uppercase">Harga Jual</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr v-if="medicines.length === 0">
                    <td colspan="3" class="p-4 text-center text-gray-500">Supplier ini belum memiliki data obat.</td>
                  </tr>
                  <tr v-for="med in medicines" :key="med.id">
                    <td class="px-4 py-2 font-medium">{{ med.name }}</td>
                    <td class="px-4 py-2 text-right text-green-600 font-semibold">{{ formatCurrency(med.purchase_price) }}</td>
                    <td class="px-4 py-2 text-right text-blue-600 font-semibold">{{ formatCurrency(med.selling_price) }}</td>
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