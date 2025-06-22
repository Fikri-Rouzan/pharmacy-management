<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../lib/supabaseClient';
import Swal from 'sweetalert2';
import { UploadCloud, Trash2 } from 'lucide-vue-next'; // <-- Tambahkan ikon Trash2

const loading = ref(true);
const uploading = ref(false);

// State untuk data profil
const name = ref('');
const avatarUrl = ref('');
const userEmail = ref('');

// Fungsi untuk mengambil data profil saat halaman dimuat
async function getProfile() {
  loading.value = true;
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      userEmail.value = user.email;
      const { data, error, status } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', user.id)
        .single();

      if (error && status !== 406) throw error;

      if (data) {
        name.value = data.name;
        avatarUrl.value = data.avatar_url;
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  } finally {
    loading.value = false;
  }
}

// Fungsi untuk mengunggah foto profil (tetap sama)
async function uploadAvatar(event) {
  const file = event.target.files[0];
  if (!file) return;

  uploading.value = true;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Jika sudah ada avatar lama, hapus dulu
    if (avatarUrl.value) {
      const oldFilePath = avatarUrl.value.split('/avatars/')[1];
      await supabase.storage.from('avatars').remove([oldFilePath]);
    }

    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const newAvatarUrl = urlData.publicUrl;
    
    const { error: updateError } = await supabase.from('profiles').update({ avatar_url: newAvatarUrl }).eq('id', user.id);
    if (updateError) throw updateError;
    
    avatarUrl.value = newAvatarUrl;
    Swal.fire('Sukses!', 'Foto profil berhasil diperbarui.', 'success');

  } catch (error) {
    console.error('Error uploading avatar:', error);
    Swal.fire('Error', `Gagal mengunggah gambar: ${error.message}`, 'error');
  } finally {
    uploading.value = false;
  }
}

// --- FUNGSI BARU UNTUK MENGHAPUS FOTO ---
async function deleteAvatar() {
  if (!avatarUrl.value) {
    Swal.fire('Info', 'Tidak ada foto profil untuk dihapus.', 'info');
    return;
  }

  const { isConfirmed } = await Swal.fire({
    title: 'Anda yakin?',
    text: "Foto profil Anda akan dihapus secara permanen!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal'
  });

  if (isConfirmed) {
    uploading.value = true; // Gunakan state uploading untuk menunjukkan proses
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const filePath = avatarUrl.value.split('/avatars/')[1];

      // 1. Hapus file dari Storage
      const { error: removeError } = await supabase.storage.from('avatars').remove([filePath]);
      if (removeError) throw removeError;
      
      // 2. Hapus URL dari tabel profiles
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
      if (updateError) throw updateError;

      avatarUrl.value = null; // Hapus dari tampilan
      Swal.fire('Terhapus!', 'Foto profil Anda telah dihapus.', 'success');
      
    } catch (error) {
      console.error('Error deleting avatar:', error);
      Swal.fire('Error', `Gagal menghapus foto: ${error.message}`, 'error');
    } finally {
      uploading.value = false;
    }
  }
}

onMounted(getProfile);
</script>

<template>
  <div class="container mx-auto">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="md:col-span-1 flex flex-col items-center">
        <div class="relative">
          <img 
            :src="avatarUrl || `https://ui-avatars.com/api/?name=${name || userEmail}&background=4a86c5&color=fff&size=160`" 
            alt="Profile Picture" 
            class="w-40 h-40 rounded-full object-cover ring-4 ring-offset-2 ring-primary"
          >
          <div v-if="uploading || loading" class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
             <div class="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        
        <div class="flex items-center space-x-2 mt-4">
          <label for="file-upload" class="px-4 py-2 bg-primary text-white rounded-lg shadow-md cursor-pointer hover:bg-opacity-90 transition flex items-center">
            <UploadCloud class="w-4 h-4 mr-2" />
            Change
          </label>
          <input id="file-upload" type="file" class="hidden" @change="uploadAvatar" accept="image/png, image/jpeg" :disabled="uploading" />

          <button @click="deleteAvatar" :disabled="!avatarUrl || uploading" class="px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition flex items-center disabled:bg-red-300 disabled:cursor-not-allowed">
            <Trash2 class="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-2">Pilih file JPG atau PNG.</p>
      </div>
      
      <div class="md:col-span-2 p-8 bg-white rounded-lg shadow-lg">
        <div class="space-y-6">
            <div>
              <h3 class="text-sm font-semibold text-gray-400">Full Name</h3>
              <p class="text-lg text-gray-900 mt-1">{{ name || 'Belum diatur' }}</p>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-400">Email</h3>
              <p class="text-lg text-gray-900 mt-1">{{ userEmail }}</p>
            </div>
        </div>
        </div>
    </div>
  </div>
</template>