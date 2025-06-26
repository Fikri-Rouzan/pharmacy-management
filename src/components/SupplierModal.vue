<script setup>
import { ref, watch } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  supplierData: Object,
});

const emit = defineEmits(['close', 'save']);

const form = ref({
  id: null,
  name: '',
  email: '',
  phone_number: '',
  address: '',
});

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.supplierData) {
      form.value = { ...props.supplierData };
    } else {
      form.value = { id: null, name: '', email: '', phone_number: '', address: '' };
    }
  }
});

function handleSubmit() {
  emit('save', form.value);
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
    <div class="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold">{{ supplierData ? 'Edit Supplier' : 'Tambah Supplier Baru' }}</h2>
        <button @click="$emit('close')" class="p-2 rounded-full hover:bg-gray-200">
          <X class="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="mt-6 space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Nama Supplier</label>
          <input v-model="form.name" type="text" id="name" required class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input v-model="form.email" type="email" id="email" class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
        </div>
        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700">Nomor Telepon</label>
          <input v-model="form.phone_number" type="tel" id="phone" class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
        </div>
        <div>
          <label for="address" class="block text-sm font-medium text-gray-700">Alamat</label>
          <textarea v-model="form.address" id="address" rows="3" class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"></textarea>
        </div>

        <div class="pt-4 flex justify-end space-x-3">
          <button type="button" @click="$emit('close')" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Batal</button>
          <button type="submit" class="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90">Simpan</button>
        </div>
      </form>
    </div>
  </div>
</template>