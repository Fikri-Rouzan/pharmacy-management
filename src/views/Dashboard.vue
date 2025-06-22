<script setup>
import { ref, onMounted } from 'vue';
import { Pill, ShoppingCart, Archive, Truck } from 'lucide-vue-next';
import { supabase } from '../lib/supabaseClient';

const medicineCount = ref(0);
const supplierCount = ref(0);
const purchaseCount = ref(0);
const saleCount = ref(0);

const fetchSummaryData = async () => {
  const { count: medCount } = await supabase.from('medicines').select('*', { count: 'exact', head: true });
  medicineCount.value = medCount || 0;

  const { count: supCount } = await supabase.from('suppliers').select('*', { count: 'exact', head: true });
  supplierCount.value = supCount || 0;
  
  const { count: purCount } = await supabase.from('purchases').select('*', { count: 'exact', head: true });
  purchaseCount.value = purCount || 0;

  const { count: salCount } = await supabase.from('sales').select('*', { count: 'exact', head: true });
  saleCount.value = salCount || 0;
}

onMounted(fetchSummaryData);
</script>

<template>
  <div class="container mx-auto">
    <h1 class="text-3xl font-semibold text-gray-800">Dashboard</h1>
    <p class="mt-2 text-sm text-gray-500">Ringkasan data inventaris Anda</p>
    
    <div class="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-4">
       
      <router-link to="/medicines" class="p-5 bg-white rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
        <div class="flex items-center">
            <div class="p-3 bg-primary rounded-full">
                <Pill class="w-6 h-6 text-white"/>
            </div>
            <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Data Obat</p>
                <p class="text-2xl font-bold text-gray-800">{{ medicineCount }}</p>
            </div>
        </div>
      </router-link>

      <router-link to="/sales" class="p-5 bg-white rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
        <div class="flex items-center">
            <div class="p-3 bg-red-500 rounded-full">
                <ShoppingCart class="w-6 h-6 text-white"/>
            </div>
            <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Data Penjualan</p>
                <p class="text-2xl font-bold text-gray-800">{{ saleCount }}</p>
            </div>
        </div>
      </router-link>

      <router-link to="/purchases" class="p-5 bg-white rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
        <div class="flex items-center">
            <div class="p-3 bg-amber-500 rounded-full">
                <Archive class="w-6 h-6 text-white"/>
            </div>
            <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Data Pembelian</p>
                <p class="text-2xl font-bold text-gray-800">{{ purchaseCount }}</p>
            </div>
        </div>
      </router-link>

      <router-link to="/suppliers" class="p-5 bg-white rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
        <div class="flex items-center">
            <div class="p-3 bg-emerald-500 rounded-full">
                <Truck class="w-6 h-6 text-white"/>
            </div>
            <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Data Supplier</p>
                <p class="text-2xl font-bold text-gray-800">{{ supplierCount }}</p>
            </div>
        </div>
      </router-link>

    </div>
  </div>
</template>