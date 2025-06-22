<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Sidebar from '../components/Sidebar.vue';
import { Menu, LogOut, UserCircle2 } from 'lucide-vue-next';
import Swal from 'sweetalert2';
import { supabase } from '../lib/supabaseClient';

const router = useRouter();
const isSidebarOpen = ref(false);
const userName = ref('');

const handleLogout = async () => {
  Swal.fire({
    title: 'Apakah Anda yakin?',
    text: "Anda akan keluar dari aplikasi.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#4a86c5',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Ya, Keluar!',
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      await supabase.auth.signOut();
      router.push('/login');
    }
  });
};

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();
    userName.value = profile ? profile.name : user.email;
  }
});
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <Sidebar :isOpen="isSidebarOpen" />

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="flex items-center justify-between px-6 py-4 bg-white border-b-2">
        <button @click="isSidebarOpen = !isSidebarOpen" class="text-gray-500 focus:outline-none md:hidden">
          <Menu class="w-6 h-6"/>
        </button>

        <div class="flex-1"></div>

        <div class="flex items-center">
          <router-link to="/profile" class="flex items-center mr-4 group">
            <UserCircle2 class="w-8 h-8 text-gray-500 group-hover:text-primary transition-colors" />
            <span class="ml-2 text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">{{ userName }}</span>
          </router-link>

          <button @click="handleLogout" title="Logout" class="text-gray-500 rounded-full p-2 hover:bg-red-100 hover:text-red-500 transition-colors">
            <LogOut class="w-5 h-5"/>
          </button>
        </div>
      </header>

      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>