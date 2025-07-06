// File: scripts/seed.js
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

async function createAdminUser() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!supabaseUrl || !serviceKey || !adminEmail || !adminPassword) {
    console.error("Error: Pastikan semua variabel (SUPABASE_SERVICE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD) ada di file .env Anda.");
    process.exit(1);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log("Mencoba membuat user admin...");

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Langsung konfirmasi email
    });

    if (error) {
      if (error.message.includes("User already exists")) {
        console.warn("Info: User admin dengan email tersebut sudah ada. Proses dilewati.");
        return;
      }
      throw error;
    }

    console.log("✅ Admin berhasil dibuat dengan email:", data.user.email);
  } catch (error) {
    console.error("❌ Gagal membuat admin:", error.message);
    process.exit(1);
  }
}

createAdminUser();