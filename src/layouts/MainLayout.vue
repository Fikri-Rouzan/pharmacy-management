<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Sidebar from '../components/layout/Sidebar.vue';
import BottomNavBar from '../components/layout/BottomNavBar.vue'; // <-- Import Navigasi Bawah
import { Menu, LogOut, UserCircle2 } from 'lucide-vue-next';
import Swal from 'sweetalert2';
import { supabase } from '../lib/supabaseClient';

const router = useRouter();
const isSidebarOpen = ref(false);
const isProfileMenuOpen = ref(false);
const userName = ref('');
const avatarUrl = ref(null); // <-- State untuk foto profil
const userMenu = ref(null);

const primaryColor = '#4a86c5';

const openSidebar = () => { isSidebarOpen.value = true; };
const closeSidebar = () => { isSidebarOpen.value = false; };

const toggleProfileMenu = () => {
  isProfileMenuOpen.value = !isProfileMenuOpen.value;
};

const closeProfileMenuOnClickOutside = (event) => {
  if (userMenu.value && !userMenu.value.contains(event.target)) {
    isProfileMenuOpen.value = false;
  }
};

// Fungsi handleLogout ini akan dipanggil oleh event dari Sidebar
const handleLogout = async () => {
  isProfileMenuOpen.value = false;
  Swal.fire({
    title: 'Apakah Anda yakin?',
    text: "Anda akan keluar dari aplikasi.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: primaryColor,
    cancelButtonColor: '#d33',
    confirmButtonText: 'Ya, Keluar!',
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      const nameToSayGoodbye = userName.value;
      await supabase.auth.signOut();
      await Swal.fire({
        title: `Sampai Jumpa, ${nameToSayGoodbye}!`,
        text: 'Anda telah berhasil logout.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      });
      router.push('/login');
    }
  });
};

onMounted(async () => {
  document.addEventListener('click', closeProfileMenuOnClickOutside);
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    // Ambil nama DAN avatar_url
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, avatar_url')
      .eq('id', user.id)
      .single();
      
    const nameToDisplay = profile?.name || user.email;
    userName.value = nameToDisplay;
    avatarUrl.value = profile?.avatar_url; // Simpan URL avatar

    const Toast = Swal.mixin({
      toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true,
      didOpen: (toast) => { toast.onmouseenter = Swal.stopTimer; toast.onmouseleave = Swal.resumeTimer; }
    });
    Toast.fire({ icon: 'success', title: `Selamat Datang, ${nameToDisplay}!` });
  }
});

onUnmounted(() => {
  document.removeEventListener('click', closeProfileMenuOnClickOutside);
});
</script>

<template>
  <div class="flex h-screen bg-gray-100 font-sans">
    <!-- Sidebar sekarang "mendengarkan" event @logout -->
    <Sidebar :isOpen="isSidebarOpen" @close="closeSidebar" @logout="handleLogout" />

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="flex items-center justify-between px-4 sm:px-6 bg-white shadow-sm h-16 flex-shrink-0 z-30">
        <div class="flex items-center">
          <button @click="openSidebar" class="text-gray-600 focus:outline-none md:hidden">
            <Menu class="w-6 h-6"/>
          </button>
          <h1 class="text-lg font-semibold text-gray-800 ml-4 md:ml-0 hidden sm:block">Sistem Inventaris Apotek</h1>
        </div>
        
        <div class="relative" ref="userMenu">
          <button @click="toggleProfileMenu" class="flex items-center focus:outline-none group">
            <span class="mr-3 text-sm font-medium text-gray-700 hidden md:block group-hover:text-primary transition-colors">{{ userName }}</span>
            <!-- Tampilkan foto profil jika ada, jika tidak tampilkan ikon -->
            <img v-if="avatarUrl" :src="avatarUrl" class="w-9 h-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary transition-all">
            <UserCircle2 v-else class="w-9 h-9 text-gray-500 group-hover:text-primary transition-colors" />
          </button>
            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
            <!-- Menu dropdown sekarang hanya berisi link ke Profil -->
            <div v-if="isProfileMenuOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-20">
              <router-link to="/profile" @click="isProfileMenuOpen = false" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <UserCircle2 class="w-5 h-5 mr-3" />
                Profil Saya
              </router-link>
            </div>
          </transition>
        </div>
      </header>
      
      <!-- Tambahkan padding bawah untuk mobile -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6">
        <router-view />
      </main>

      <!-- Panggil komponen navigasi bawah di sini -->
      <BottomNavBar />
    </div>
  </div>
</template>