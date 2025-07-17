<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { X } from 'lucide-vue-next';
import { supabase } from '../../lib/supabaseClient';
import SearchableSelect from '../common/SearchableSelect.vue';

const props = defineProps({
  isOpen: Boolean,
  medicineData: Object,
});

const emit = defineEmits(['close', 'save']);

const form = ref({
  id: null,
  name: '',
  type: '',
  selling_price: 0,
  supplier_id: null,
});
const suppliers = ref([]);

const isFormValid = computed(() => {
  return form.value.name && 
         form.value.selling_price > 0 && 
         form.value.supplier_id;
});

async function fetchSuppliers() {
  const { data } = await supabase.from('suppliers').select('id, name').order('name');
  if (data) {
    suppliers.value = data;
  }
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.medicineData) {
      // Saat edit, kita tetap memuat semua data termasuk stock_quantity (hanya untuk ditampilkan jika perlu)
      form.value = { ...props.medicineData };
    } else {
      // Saat tambah baru, reset form
      form.value = { id: null, name: '', type: '', selling_price: 0, supplier_id: null };
    }
  }
});

function handleSubmit() {
  if (!isFormValid.value) return;

  let dataToSave = { ...form.value };

  // Jika ini adalah obat BARU (tidak ada ID), paksa stock_quantity menjadi 0
  if (!dataToSave.id) {
    dataToSave.stock_quantity = 0;
  }

  emit('save', dataToSave);
}

onMounted(fetchSuppliers);
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
    <div class="w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden">
      <div class="flex items-center justify-between p-4 bg-primary text-white">
        <h2 class="text-2xl font-bold">{{ medicineData ? 'Edit Obat' : 'Tambah Obat Baru' }}</h2>
        <button @click="$emit('close')" class="p-1 rounded-full hover:bg-white/20">
          <X class="w-6 h-6" />
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Nama Obat <span class="text-red-500">*</span></label>
          <input v-model="form.name" type="text" id="name" required class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
        </div>
        <div>
          <label for="type" class="block text-sm font-medium text-gray-700">Jenis Obat</label>
          <input v-model="form.type" type="text" id="type" class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
        </div>
        <div>
          <label for="supplier" class="block text-sm font-medium text-gray-700">Pemasok (Supplier) <span class="text-red-500">*</span></label>
          <SearchableSelect
            v-model="form.supplier_id"
            :options="suppliers"
            placeholder="-- Cari & Pilih Pemasok --"
            class="mt-1"
          />
        </div>
        <div>
          <label for="selling_price" class="block text-sm font-medium text-gray-700">Harga Jual <span class="text-red-500">*</span></label>
          <input v-model.number="form.selling_price" type="number" id="selling_price" min="1" required class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
        </div>
        
        <div class="pt-4 flex justify-end space-x-3">
          <button type="button" @click="$emit('close')" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Batal</button>
          <button 
            type="submit" 
            :disabled="!isFormValid"
            class="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  </div>
</template>