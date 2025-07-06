<script setup>
import { ref, onMounted } from 'vue';
import { Pill, ShoppingCart, Archive, Truck } from 'lucide-vue-next';
import { supabase } from '../lib/supabaseClient';

const medicineCount = ref(0);
const supplierCount = ref(0);
const purchaseCount = ref(0);
const saleCount = ref(0);

const fetchSummaryData = async () => {
  // Hitungan untuk obat, pembelian, dan penjualan
  const { count: medCount } = await supabase.from('medicines').select('*', { count: 'exact', head: true });
  medicineCount.value = medCount || 0;

  const { count: purCount } = await supabase.from('purchases').select('*', { count: 'exact', head: true });
  purchaseCount.value = purCount || 0;

  const { count: salCount } = await supabase.from('sales').select('*', { count: 'exact', head: true });
  saleCount.value = salCount || 0;

  // Hitungan untuk supplier dimodifikasi untuk hanya mengambil yang aktif
  const { count: supCount } = await supabase
    .from('suppliers')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active'); // <-- Filter hanya status 'active'
    
  supplierCount.value = supCount || 0;
}

onMounted(fetchSummaryData);
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
    <p class="mt-1 text-base text-gray-500">Ringkasan data inventaris dan penjualan Anda.</p>
    
    <div class="grid grid-cols-1 gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-4">
        
      <router-link 
        to="/medicines" 
        class="block p-6 rounded-xl transition-all duration-300 transform hover:-translate-y-2 shadow-lg bg-sky-100 hover:shadow-sky-200/50"
      >
        <Pill class="w-10 h-10 mb-4 text-[#1976D2]"/>
        <p class="text-base font-semibold text-slate-600">Total Obat</p>
        <p class="text-4xl font-bold text-slate-800">{{ medicineCount }}</p>
      </router-link>

      <router-link 
        to="/sales" 
        class="block p-6 rounded-xl transition-all duration-300 transform hover:-translate-y-2 shadow-lg bg-emerald-100 hover:shadow-emerald-200/50"
      >
        <ShoppingCart class="w-10 h-10 mb-4 text-emerald-600"/>
        <p class="text-base font-semibold text-slate-600">Total Penjualan</p>
        <p class="text-4xl font-bold text-slate-800">{{ saleCount }}</p>
      </router-link>

      <router-link 
        to="/purchases" 
        class="block p-6 rounded-xl transition-all duration-300 transform hover:-translate-y-2 shadow-lg bg-amber-100 hover:shadow-amber-200/50"
      >
        <Archive class="w-10 h-10 mb-4 text-amber-600"/>
        <p class="text-base font-semibold text-slate-600">Total Pembelian</p>
        <p class="text-4xl font-bold text-slate-800">{{ purchaseCount }}</p>
      </router-link>

      <router-link 
        to="/suppliers" 
        class="block p-6 rounded-xl transition-all duration-300 transform hover:-translate-y-2 shadow-lg bg-violet-100 hover:shadow-violet-200/50"
      >
        <Truck class="w-10 h-10 mb-4 text-violet-600"/>
        <p class="text-base font-semibold text-slate-600">Total Pemasok Aktif</p>
        <p class="text-4xl font-bold text-slate-800">{{ supplierCount }}</p>
      </router-link>

    </div>
  </div>
</template>