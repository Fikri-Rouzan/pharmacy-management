<script setup>
import { ref, computed, watch } from 'vue';
import { Search, X } from 'lucide-vue-next';

const props = defineProps({
  modelValue: [String, Number, null],
  options: {
    type: Array,
    required: true,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: 'Ketik untuk mencari...',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const searchTerm = ref('');

// Filter options based on what user types in the input
const filteredOptions = computed(() => {
  if (!searchTerm.value) {
    return props.options;
  }
  return props.options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

// Function to handle selecting an option from the list
function selectOption(option) {
  emit('update:modelValue', option.id);
  searchTerm.value = option.name; // Show the selected name in the input
  isOpen.value = false;
}

// Function to clear the selection
function clearSelection() {
  emit('update:modelValue', null);
  searchTerm.value = '';
}

// Watch for changes from the parent component (e.g., when resetting the form)
// and update the displayed text in the input
watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    searchTerm.value = '';
  } else {
    const selected = props.options.find(opt => opt.id === newValue);
    if (selected) {
      searchTerm.value = selected.name;
    }
  }
}, { immediate: true });
</script>

<template>
  <div class="relative" v-click-outside="() => isOpen = false">
    <div class="relative">
      <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search class="h-5 w-5 text-gray-400" />
      </span>

      <input
        type="text"
        v-model="searchTerm"
        :placeholder="placeholder"
        :disabled="disabled"
        @focus="isOpen = true"
        @input="isOpen = true"
        class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
      />

      <span v-if="searchTerm" class="absolute inset-y-0 right-0 flex items-center pr-3">
        <button type="button" @click="clearSelection" class="p-1 text-gray-400 hover:text-gray-600 rounded-full">
          <X class="h-4 w-4" />
        </button>
      </span>
    </div>

    <transition name="fade">
      <ul
        v-if="isOpen && filteredOptions.length > 0"
        class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
      >
        <li
          v-for="option in filteredOptions"
          :key="option.id"
          @click="selectOption(option)"
          :class="{'bg-secondary text-primary': modelValue === option.id}"
          class="relative cursor-default select-none py-2 px-4 text-gray-900 hover:bg-blue-100"
        >
          {{ option.name }}
        </li>
      </ul>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>