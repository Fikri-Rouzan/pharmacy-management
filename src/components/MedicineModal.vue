<script setup>
import { ref, watch, onMounted } from 'vue';
import { X } from 'lucide-vue-next';
import { supabase } from '../lib/supabaseClient';

const props = defineProps({
  isOpen: Boolean,
  medicineData: Object, // Menerima data obat untuk mode edit
});

const emit = defineEmits(['close', 'save']);

// State untuk form
const form = ref({
  id: null,
  name: '',
  type: '',
  selling_price: 0,
  stock_quantity: 0,
  supplier_id: null,
});
const suppliers = ref([]);

// Fungsi untuk mengambil daftar supplier
async function fetchSuppliers() {
  const { data, error } = await supabase.from('suppliers').select('id, name');
  if (!error) {
    suppliers.value = data;
  }
}

// Mengawasi perubahan pada props
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    // Jika ada data yang dikirim, kita masuk mode edit
    if (props.medicineData) {
      form.value = { ...props.medicineData };
    } else {
      // Jika tidak, kita masuk mode tambah (reset form)
      form.value = { id: null, name: '', type: '', selling_price: 0, stock_quantity: 0, supplier_id: null };
    }
  }
});

function handleSubmit() {
  emit('save', form.value);
}

onMounted(fetchSuppliers);
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
    <div class="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold">{{ medicineData ? 'Edit Obat' : 'Tambah Obat Baru' }}</h2>
        <button @click="$emit('close')" class="p-2 rounded-full hover:bg-gray-200">
          <X class="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="mt-6 space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Nama Obat</label>
          <input v-model="form.name" type="text" id="name" required class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
        </div>
        <div>
          <label for="type" class="block text-sm font-medium text-gray-700">Jenis Obat</label>
          <input v-model="form.type" type="text" id="type" class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
        </div>
        <div>
          <label for="supplier" class="block text-sm font-medium text-gray-700">Pemasok (Supplier)</label>
          <select v-model="form.supplier_id" id="supplier" class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
            <option :value="null" disabled>-- Pilih Pemasok --</option>
            <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
              {{ supplier.name }}
            </option>
          </select>
        </div>
        <div>
          <label for="selling_price" class="block text-sm font-medium text-gray-700">Harga Jual</label>
          <input v-model.number="form.selling_price" type="number" id="selling_price" required class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
        </div>
         <div>
          <label for="stock" class="block text-sm font-medium text-gray-700">Stok Awal</label>
          <input v-model.number="form.stock_quantity" type="number" id="stock" required class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
          <p class="text-xs text-gray-500 mt-1">Stok akan bertambah/berkurang otomatis saat ada transaksi.</p>
        </div>

        <div class="pt-4 flex justify-end space-x-3">
          <button type="button" @click="$emit('close')" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Batal</button>
          <button type="submit" class="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90">Simpan</button>
        </div>
      </form>
    </div>
  </div>
</template>