<template>
  <div
    class="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-purple-600 via-blue-500 to-teal-400"
  >
    <div
      class="w-full max-w-md p-8 space-y-8 rounded-2xl shadow-2xl bg-white/20 backdrop-blur-lg border border-white/30"
    >
      <div class="text-center text-white">
        <img
          src="/logo.png"
          alt="Logo"
          class="w-24 h-24 mx-auto mb-4 drop-shadow-lg"
          v-if="logoExists"
        />
        <h2 class="text-3xl font-bold drop-shadow-md">Login</h2>
        <p class="mt-2 text-gray-200">Silakan masuk untuk melanjutkan</p>
      </div>

      <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
        <div class="relative">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3">
            <Mail class="w-5 h-5 text-gray-300" />
          </span>
          <input
            v-model="email"
            id="email"
            type="email"
            required
            class="w-full pl-10 pr-4 py-2.5 rounded-lg shadow-sm transition text-white bg-slate-900/40 border border-white/20 placeholder:text-gray-300 focus:ring-2 focus:ring-white/50 focus:border-transparent"
            placeholder="Alamat Email"
          />
        </div>

        <div class="relative">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3">
            <Lock class="w-5 h-5 text-gray-300" />
          </span>
          <input
            v-model="password"
            id="password"
            type="password"
            required
            class="w-full pl-10 pr-4 py-2.5 rounded-lg shadow-sm transition text-white bg-slate-900/40 border border-white/20 placeholder:text-gray-300 focus:ring-2 focus:ring-white/50 focus:border-transparent"
            placeholder="Password"
          />
        </div>

        <div class="pt-2">
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center py-3 rounded-lg transition-all duration-300 ease-in-out group text-white font-bold bg-white/30 hover:bg-white/40 disabled:bg-gray-400/50"
          >
            {{ loading ? "Masuk..." : "Login" }}
            <ArrowRight
              class="w-5 h-5 ml-2 transition-transform transform group-hover:translate-x-1"
            />
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../lib/supabaseClient"; // <-- Ini butuh file pendukung
import Swal from "sweetalert2";
import { Mail, Lock, ArrowRight } from "lucide-vue-next";

// State untuk form
const email = ref("");
const password = ref("");
const loading = ref(false);
const router = useRouter();
const logoExists = ref(true); // Ganti jadi false jika tidak ada logo.png di folder public

// Fungsi untuk menangani login
const handleLogin = async () => {
  if (!email.value || !password.value) {
    Swal.fire({
      icon: "warning",
      title: "Oops...",
      text: "Harap isi email dan password!",
    });
    return;
  }

  loading.value = true;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) throw error;

    Swal.fire({
      icon: "success",
      title: "Login Berhasil!",
      showConfirmButton: false,
      timer: 1500,
    });

    // Nanti akan kita arahkan ke dashboard
    // router.push('/dashboard');
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Login Gagal",
      text: error.message,
    });
  } finally {
    loading.value = false;
  }
};
</script>
