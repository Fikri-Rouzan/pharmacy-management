require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// --- FUNGSI BARU: Untuk membuat user admin & profilnya ---
async function seedAdminUser() {
  console.log('Memeriksa dan membuat user admin...');
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL dan ADMIN_PASSWORD harus ada di file .env');
  }

  // [DIUBAH] Menggunakan metode listUsers yang benar untuk mencari user berdasarkan email
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({
    email: adminEmail,
  });

  if (listError) {
    throw listError;
  }
  
  // Jika user ditemukan (array tidak kosong), langsung kembalikan user tersebut
  if (users.length > 0) {
    console.log('User admin sudah ada.');
    return users[0];
  }
  
  // Jika belum ada, buat user baru
  console.log('User admin tidak ditemukan, membuat user baru...');
  const { data, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true, // Langsung aktif tanpa perlu verifikasi email
  });

  if (error) throw error;
  
  // Buat profil untuk user baru
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({ id: data.user.id, name: 'Admin Utama', email: adminEmail });
  
  if (profileError) throw profileError;

  console.log('User admin dan profil berhasil dibuat.');
  return data.user;
}


async function clearTables() {
  console.log('Menghapus data lama...');
  await supabase.from('sale_items').delete().neq('id', 0);
  await supabase.from('sales').delete().neq('id', 0);
  await supabase.from('purchase_items').delete().neq('id', 0);
  await supabase.from('purchases').delete().neq('id', 0);
  await supabase.from('medicines').delete().neq('id', 0);
  await supabase.from('suppliers').delete().neq('id', 0);
  console.log('Data operasional lama berhasil dihapus.');
}

// --- FUNGSI UTAMA ---
async function main() {
  try {
    const adminUser = await seedAdminUser();
    
    // Uncomment baris di bawah ini jika Anda ingin MENGHAPUS semua data transaksi
    // setiap kali seeding dijalankan.
    // await clearTables();
    
    console.log(`\n✅ Proses seeding user [${adminUser.email}] berhasil diselesaikan!`);

  } catch (err) {
    console.error('\n❌ Terjadi error saat seeding:', err.message);
  }
}

main();