<script setup>
import { LayoutDashboard, Pill, ShoppingCart, Archive, Truck } from 'lucide-vue-next';

defineProps({
  isOpen: Boolean,
});
</script>

<template>
  <aside
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
    class="fixed inset-y-0 left-0 z-30 w-64 px-4 py-7 overflow-y-auto bg-white border-r-2 shadow-sm transition-transform duration-300 ease-in-out md:relative md:translate-x-0"
  >
    <div class="flex items-center justify-center px-6">
       <img src="/logo.png" alt="Logo" class="w-10 h-10">
       <span class="ml-3 text-xl font-bold text-gray-800">PharmaSys</span>
    </div>

    <nav class="mt-10">
      <router-link to="/dashboard" class="flex items-center px-6 py-3 mt-2 text-gray-700 rounded-lg hover:bg-secondary hover:text-primary transition-colors" active-class="bg-secondary text-primary font-bold">
         <LayoutDashboard class="w-5 h-5"/>
         <span class="mx-4">Dashboard</span>
      </router-link>

      <router-link to="/medicines" class="flex items-center px-6 py-3 mt-2 text-gray-700 rounded-lg hover:bg-secondary hover:text-primary transition-colors" active-class="bg-secondary text-primary font-bold">
         <Pill class="w-5 h-5"/>
         <span class="mx-4">Data Obat</span>
      </router-link>

      <router-link to="/sales" class="flex items-center px-6 py-3 mt-2 text-gray-700 rounded-lg hover:bg-secondary hover:text-primary transition-colors" active-class="bg-secondary text-primary font-bold">
         <ShoppingCart class="w-5 h-5"/>
         <span class="mx-4">Data Penjualan</span>
      </router-link>

      <router-link to="/purchases" class="flex items-center px-6 py-3 mt-2 text-gray-700 rounded-lg hover:bg-secondary hover:text-primary transition-colors" active-class="bg-secondary text-primary font-bold">
         <Archive class="w-5 h-5"/>
         <span class="mx-4">Data Pembelian</span>
      </router-link>

      <router-link to="/suppliers" class="flex items-center px-6 py-3 mt-2 text-gray-700 rounded-lg hover:bg-secondary hover:text-primary transition-colors" active-class="bg-secondary text-primary font-bold">
         <Truck class="w-5 h-5"/>
         <span class="mx-4">Data Supplier</span>
      </router-link>
    </nav>
  </aside>
</template>