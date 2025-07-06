<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'; // [BARU] Import useRouter
import { supabase } from '../lib/supabaseClient';
import Swal from 'sweetalert2';
import { UploadCloud, Trash2, User, Mail, ArrowLeft } from 'lucide-vue-next'; // [BARU] Import ArrowLeft

const router = useRouter(); // [BARU] Inisialisasi router

const loading = ref(true);
const uploading = ref(false);
const name = ref('');
const avatarUrl = ref('');
const userEmail = ref('');

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

async function uploadAvatar(event) {
  const file = event.target.files[0];
  if (!file) return;
  uploading.value = true;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
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

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Foto profil berhasil diperbarui',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });

  } catch (error) {
    console.error('Error uploading avatar:', error);
    Swal.fire('Error', `Gagal mengunggah gambar: ${error.message}`, 'error');
  } finally {
    uploading.value = false;
  }
}

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
    uploading.value = true;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const filePath = avatarUrl.value.split('/avatars/')[1];
      const { error: removeError } = await supabase.storage.from('avatars').remove([filePath]);
      if (removeError) throw removeError;
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
      if (updateError) throw updateError;
      avatarUrl.value = null;
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
  <div class="container mx-auto p-4 md:p-6">
    <div class="flex items-center mb-6">
      <button @click="router.back()" class="p-2 mr-4 rounded-full hover:bg-gray-200 transition" title="Kembali">
        <ArrowLeft class="w-6 h-6 text-gray-700" />
      </button>
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Profil Saya</h1>
        <p class="mt-1 text-sm text-gray-500">Lihat informasi akun dan foto profil Anda.</p>
      </div>
    </div>
    
    <div class="bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8">
      <div class="flex flex-col md:flex-row gap-8">

        <div class="md:w-2/5 w-full flex flex-col items-center">
          <div class="relative w-36 h-36 mb-4">
            <img 
              :src="avatarUrl || `https://ui-avatars.com/api/?name=${name || userEmail}&background=1976D2&color=fff&size=144`" 
              alt="Foto Profil" 
              class="w-full h-full rounded-full object-cover border-2 border-gray-200"
            >
            <div v-if="uploading || loading" class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
              <div class="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>

      
          <div class="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
            <label for="file-upload"
              class="flex-1 px-6 py-2 text-white bg-primary hover:bg-opacity-90 transition-colors font-semibold rounded-lg cursor-pointer flex items-center justify-center gap-2 text-center">
              <UploadCloud class="w-5 h-5" />
              <span>Ubah Foto</span>
            </label>
            <input id="file-upload" type="file" class="hidden" @change="uploadAvatar" accept="image/png, image/jpeg" :disabled="uploading" />

            <button @click="deleteAvatar" :disabled="!avatarUrl || uploading"
              class="flex-1 px-6 py-2 bg-white text-red-600 border border-red-600 hover:bg-red-50 transition-colors font-semibold rounded-lg flex items-center justify-center gap-2 text-center disabled:border-gray-300 disabled:text-gray-400 disabled:bg-white disabled:cursor-not-allowed">
              <Trash2 class="w-5 h-5" />
              <span>Hapus</span>
            </button>
          </div>
        </div>

        <div class="md:w-3/5 w-full">
          <h3 class="text-lg font-semibold text-gray-700 border-b pb-2 mb-6">Informasi Akun</h3>

          <div class="space-y-6">
            <div>
              <label class="text-sm font-medium text-gray-600">Nama Lengkap</label>
              <div class="mt-1 flex items-center w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <User class="w-5 h-5 text-primary" />
                <span class="ml-3 text-base text-gray-900 font-semibold">
                  {{ name || 'Belum diatur' }}
                </span>
              </div>
            </div>

            <div>
              <label class="text-sm font-medium text-gray-600">Alamat Email</label>
              <div class="mt-1 flex items-center w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <Mail class="w-5 h-5 text-primary" />
                <span class="ml-3 text-base text-gray-900 font-semibold">
                  {{ userEmail }}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>