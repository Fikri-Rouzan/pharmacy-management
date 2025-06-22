// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabaseClient';

// Import Layout dan Halaman
import MainLayout from '../layouts/MainLayout.vue';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import Profile from '../views/Profile.vue';

const routes = [
  { 
    path: '/login', 
    name: 'Login', 
    component: Login 
  },
  {
    // Rute ini akan menggunakan MainLayout sebagai bungkusnya
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' }, // Redirect / ke /dashboard
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      { path: 'profile', name: 'Profile', component: Profile },
      // Rute lain di dalam layout
      { path: 'medicines', name: 'Medicines', component: { template: '<div>Halaman Data Obat</div>' } },
      { path: 'sales', name: 'Sales', component: { template: '<div>Halaman Data Penjualan</div>' } },
      { path: 'purchases', name: 'Purchases', component: { template: '<div>Halaman Data Pembelian</div>' } },
      { path: 'suppliers', name: 'Suppliers', component: { template: '<div>Halaman Data Supplier</div>' } },
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Penjaga Rute (Navigation Guard)
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !session) {
    next({ name: 'Login' });
  } else if (to.name === 'Login' && session) {
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});

export default router;