// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from '../lib/supabaseClient';

// Import Layout dan semua Halaman (Views)
import MainLayout from '../layouts/MainLayout.vue';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import Profile from '../views/Profile.vue';
import Medicines from '../views/Medicines.vue';
import Sales from '../views/Sales.vue';
import SaleForm from '../views/SaleForm.vue';
import Purchases from '../views/Purchases.vue';
import PurchaseForm from '../views/PurchaseForm.vue';
import Suppliers from '../views/Suppliers.vue'; // <-- IMPORT HALAMAN BARU

const routes = [
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' }, 
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      { path: 'profile', name: 'Profile', component: Profile },
      { path: 'medicines', name: 'Medicines', component: Medicines },
      { path: 'sales', name: 'Sales', component: Sales },
      { path: 'sales/new', name: 'SaleForm', component: SaleForm },
      { path: 'purchases', name: 'Purchases', component: Purchases },
      { path: 'purchases/new', name: 'PurchaseForm', component: PurchaseForm },
      { path: 'suppliers', name: 'Suppliers', component: Suppliers }, // <-- GANTI DENGAN KOMPONEN ASLI
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

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