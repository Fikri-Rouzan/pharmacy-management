import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from '../lib/supabaseClient';

// --- PATH IMPORT DIPERBARUI SESUAI STRUKTUR FOLDER BARU ---
import MainLayout from '../layouts/MainLayout.vue';
import Login from '../views/auth/Login.vue';
import Dashboard from '../views/dashboard/Dashboard.vue';
import Profile from '../views/profile/Profile.vue';
import Guide from '../views/guide/Guide.vue';
import Medicines from '../views/medicines/Medicines.vue';
import Sales from '../views/sales/Sales.vue';
import SaleForm from '../views/sales/SaleForm.vue';
import Purchases from '../views/purchases/Purchases.vue';
import PurchaseForm from '../views/purchases/PurchaseForm.vue';
import Suppliers from '../views/suppliers/Suppliers.vue';
import InactiveSuppliers from '../views/suppliers/InactiveSuppliers.vue'; 

const routes = [
  { 
    path: '/login', 
    name: 'Login', 
    component: Login 
  },
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
      { path: 'suppliers', name: 'Suppliers', component: Suppliers },
      { path: 'suppliers/inactive', name: 'InactiveSuppliers', component: InactiveSuppliers },
      { path: 'guide', name: 'Guide', component: Guide },
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