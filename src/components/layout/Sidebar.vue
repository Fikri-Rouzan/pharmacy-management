<script setup>
import { 
  LayoutDashboard, Pill, ShoppingCart, Archive, Truck, X, HelpCircle, LogOut // <-- 1. Tambahkan ikon LogOut
} from 'lucide-vue-next';

// 2. Tambahkan 'logout' ke dalam emits
const emit = defineEmits(['close', 'logout']); 
defineProps({ isOpen: Boolean });

const closeSidebar = () => {
  emit('close');
};
</script>

<template>
  <div :class="isOpen ? 'fixed inset-0 z-40' : ''">
    <div v-if="isOpen" @click="closeSidebar" class="absolute inset-0 bg-black opacity-50 transition-opacity md:hidden"></div>
    <aside :class="isOpen ? 'translate-x-0' : '-translate-x-full'" class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out flex flex-col h-full md:relative md:translate-x-0">
      
      <div class="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
        <router-link to="/dashboard" @click="closeSidebar" class="flex items-center focus:outline-none">
          <img src="/logo.png" alt="Logo" class="w-9 h-9">
          <span class="ml-3 text-xl font-bold text-primary">PharmaSys</span>
        </router-link>
        <button @click="closeSidebar" class="p-2 rounded-full md:hidden hover:bg-gray-200">
          <X class="w-6 h-6 text-gray-600"/>
        </button>
      </div>

      <nav class="flex-grow px-4 py-4 overflow-y-auto">
        <router-link to="/dashboard" @click="closeSidebar" class="nav-link">
          <LayoutDashboard class="w-6 h-6"/>
          <span class="ml-4">Dashboard</span>
        </router-link>
        <router-link to="/medicines" @click="closeSidebar" class="nav-link">
          <Pill class="w-6 h-6"/>
          <span class="ml-4">Data Obat</span>
        </router-link>
        <router-link to="/sales" @click="closeSidebar" class="nav-link">
          <ShoppingCart class="w-6 h-6"/>
          <span class="ml-4">Data Penjualan</span>
        </router-link>
        <router-link to="/purchases" @click="closeSidebar" class="nav-link">
          <Archive class="w-6 h-6"/>
          <span class="ml-4">Data Pembelian</span>
        </router-link>
        <router-link to="/suppliers" @click="closeSidebar" class="nav-link">
          <Truck class="w-6 h-6"/>
          <span class="ml-4">Data Pemasok</span>
        </router-link>
      </nav>
      
      <div class="px-4 py-4 mt-auto border-t border-gray-200">
        <router-link to="/guide" @click="closeSidebar" class="flex items-center p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors">
          <HelpCircle class="w-6 h-6"/>
          <span class="ml-4">Panduan</span>
        </router-link>
        <button @click="$emit('logout')" class="w-full flex items-center p-2 mt-2 rounded-md text-red-600 hover:bg-red-50 transition-colors">
          <LogOut class="w-6 h-6"/>
          <span class="ml-4">Keluar</span>
        </button>
      </div>

    </aside>
  </div>
</template>

<style scoped>
.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  margin-top: 0.5rem;
  border-radius: 0.5rem;
  color: #4B5563; /* text-gray-600 */
  transition: all 0.2s;
}

.nav-link:hover {
  background-color: #EBF5FF; /* Warna biru muda */
  color: #1976D2; /* Warna primary */
}

.nav-link.router-link-exact-active {
  background-color: #1976D2; /* Warna primary */
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

nav .nav-link:first-child {
  margin-top: 0;
}
</style>