<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../lib/supabaseClient";
import Swal from "sweetalert2";
import { Mail, Lock, ArrowRight } from "lucide-vue-next";

// State untuk form
const email = ref("");
const password = ref("");
const loading = ref(false);
const router = useRouter();
const logoExists = ref(true);

// Fungsi untuk menangani login
const handleLogin = async () => {
  if (!email.value || !password.value) {
    Swal.fire({
      icon: "warning",
      title: "Oops...",
      text: "Harap isi email dan password!",
      confirmButtonColor: '#4a86c5'
    });
    return;
  }
  loading.value = true;
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    if (error) throw error;
    router.push('/dashboard');
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Login Gagal",
      text: error.message,
      confirmButtonColor: '#4a86c5'
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-secondary to-primary">
    
    <div class="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl">
      
      <div class="text-center">
        <img src="/logo.png" alt="Logo" class="w-20 h-20 mx-auto mb-4" v-if="logoExists" />
        <h2 class="text-3xl font-bold text-gray-800">
          Selamat Datang
        </h2>
        <p class="mt-2 text-gray-500">
          Login untuk mengakses sistem inventaris
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
        <div class="relative">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3">
            <Mail class="w-5 h-5 text-gray-400"/>
          </span>
          <input
            v-model="email"
            id="email"
            type="email"
            required
            class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
            placeholder="Alamat Email"
          />
        </div>

        <div class="relative">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3">
            <Lock class="w-5 h-5 text-gray-400"/>
          </span>
          <input
            v-model="password"
            id="password"
            type="password"
            required
            class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
            placeholder="Password"
          />
        </div>

        <div class="pt-2">
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center py-3 text-white rounded-lg transition-all duration-300 ease-in-out group bg-primary hover:bg-opacity-90 disabled:bg-blue-300"
          >
            {{ loading ? "Masuk..." : "Login" }}
            <ArrowRight class="w-5 h-5 ml-2 transition-transform transform group-hover:translate-x-1" />
          </button>
        </div>
      </form>
    </div>
  </div>
</template>