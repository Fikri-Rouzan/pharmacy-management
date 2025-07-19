<!-- src/components/layout/BottomNavBar.vue -->
<script setup>
import { LayoutDashboard, Pill, ShoppingCart, Archive, Truck } from 'lucide-vue-next';
</script>

<template>
  <!-- Navigasi Bawah, hanya muncul di mobile (hidden on medium screens and up) -->
  <nav class="md:hidden fixed bottom-0 inset-x-0 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)] z-40">
    <div class="flex justify-around">
      
      <!-- Semua class dari <style> dipindahkan langsung ke sini -->
      <!-- 'active-class' dari vue-router akan menangani style saat link aktif -->
      <router-link 
        to="/dashboard" 
        class="flex-1 flex flex-col items-center justify-center pt-2 pb-1 text-gray-500 transition-colors"
        active-class="text-primary font-semibold"
      >
        <LayoutDashboard class="w-6 h-6 mx-auto" />
        <span class="text-xs mt-1">Dashboard</span>
      </router-link>
      
      <router-link 
        to="/medicines" 
        class="flex-1 flex flex-col items-center justify-center pt-2 pb-1 text-gray-500 transition-colors"
        active-class="text-primary font-semibold"
      >
        <Pill class="w-6 h-6 mx-auto" />
        <span class="text-xs mt-1">Obat</span>
      </router-link>
      
      <router-link 
        to="/sales" 
        class="flex-1 flex flex-col items-center justify-center pt-2 pb-1 text-gray-500 transition-colors"
        active-class="text-primary font-semibold"
      >
        <ShoppingCart class="w-6 h-6 mx-auto" />
        <span class="text-xs mt-1">Penjualan</span>
      </router-link>
      
      <router-link 
        to="/purchases" 
        class="flex-1 flex flex-col items-center justify-center pt-2 pb-1 text-gray-500 transition-colors"
        active-class="text-primary font-semibold"
      >
        <Archive class="w-6 h-6 mx-auto" />
        <span class="text-xs mt-1">Pembelian</span>
      </router-link>
      
      <router-link 
        to="/suppliers" 
        class="flex-1 flex flex-col items-center justify-center pt-2 pb-1 text-gray-500 transition-colors"
        active-class="text-primary font-semibold"
      >
        <Truck class="w-6 h-6 mx-auto" />
        <span class="text-xs mt-1">Supplier</span>
      </router-link>
      
    </div>
  </nav>
</template>

