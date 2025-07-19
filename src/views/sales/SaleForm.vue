<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../../lib/supabaseClient';
import Swal from 'sweetalert2';
import { ArrowLeft, Plus, Trash2 } from 'lucide-vue-next';
import SearchableSelect from '../../components/common/SearchableSelect.vue';

const router = useRouter();
const loading = ref(false);

// --- State ---
const allMedicines = ref([]);
const selectedMedicineId = ref(null);
const quantityToSell = ref(1);
const cart = ref([]);

// --- Computed Properties ---
const grandTotal = computed(() => {
  return cart.value.reduce((total, item) => total + item.subtotal, 0);
});

const medicineOptions = computed(() => {
  return allMedicines.value.map(med => ({
    id: med.id,
    name: `${med.name} (Stok: ${med.stock_quantity})`
  }));
});

// --- Methods ---
async function fetchData() {
  const { data: medicineData } = await supabase
    .from('medicines')
    .select('id, name, selling_price, stock_quantity')
    .gt('stock_quantity', 0)
    .order('name');
  allMedicines.value = medicineData || [];
}

const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);
const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

// --- FUNGSI DIPERBARUI UNTUK MENCEGAH DUPLIKAT ---
function handleAddToCart() {
  if (!selectedMedicineId.value || quantityToSell.value <= 0) {
    Swal.fire('Info', 'Pilih obat dan masukkan jumlah yang valid.', 'info');
    return;
  }

  const medicine = allMedicines.value.find(m => m.id === selectedMedicineId.value);
  if (!medicine) return;
  
  // Cek apakah item sudah ada di keranjang
  const existingCartItem = cart.value.find(item => item.medicine_id === selectedMedicineId.value);

  // Hitung total kuantitas yang dibutuhkan (yang sudah ada di keranjang + yang baru)
  const totalQuantityNeeded = (existingCartItem ? existingCartItem.quantity : 0) + quantityToSell.value;

  // 1. Cek apakah stok total mencukupi
  if (medicine.stock_quantity < totalQuantityNeeded) {
    Swal.fire('Stok Tidak Cukup', `Stok ${medicine.name} hanya tersisa ${medicine.stock_quantity}. Anda sudah memiliki ${existingCartItem ? existingCartItem.quantity : 0} di keranjang.`, 'error');
    return;
  }

  if (existingCartItem) {
    // Jika sudah ada, perbarui jumlah dan subtotalnya
    existingCartItem.quantity += quantityToSell.value;
    existingCartItem.subtotal = existingCartItem.quantity * existingCartItem.price;
  } else {
    // Jika belum ada, tambahkan sebagai item baru
    cart.value.push({
      medicine_id: selectedMedicineId.value,
      name: medicine.name,
      price: medicine.selling_price,
      quantity: quantityToSell.value,
      subtotal: quantityToSell.value * medicine.selling_price,
      // Kita tidak perlu expiry_date di keranjang penjualan
    });
  }

  // Reset input form
  selectedMedicineId.value = null;
  quantityToSell.value = 1;
}

function removeFromCart(index) {
  cart.value.splice(index, 1);
}

async function saveSale() {
  if (cart.value.length === 0) return;
  loading.value = true;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data: saleData, error: saleError } = await supabase.from('sales').insert({
      employee_id: user.id,
      total_amount: grandTotal.value
    }).select('id').single();
    if (saleError) throw saleError;
    
    const saleId = saleData.id;

    // Kita tidak lagi menyimpan purchase_item_id di sale_items
    const itemsToInsert = cart.value.map(item => ({
      sale_id: saleId,
      medicine_id: item.medicine_id,
      quantity: item.quantity,
      price: item.price
    }));
    const { error: itemsError } = await supabase.from('sale_items').insert(itemsToInsert);
    if (itemsError) throw itemsError;

    // Trigger di database akan menangani pengurangan stok secara otomatis

    Swal.fire('Sukses!', 'Transaksi penjualan berhasil disimpan. Stok telah diperbarui.', 'success');
    router.push('/sales');

  } catch (error) {
    console.error('Error saving sale:', error);
    Swal.fire('Error', `Gagal menyimpan transaksi: ${error.message}`, 'error');
  } finally {
    loading.value = false;
  }
}

onMounted(fetchData);
</script>

<template>
  <div class="container mx-auto p-4 md:p-6">
    <div class="flex items-center mb-6">
      <button @click="router.back()" class="p-2 mr-4 rounded-full hover:bg-gray-200" title="Kembali">
        <ArrowLeft class="w-6 h-6 text-gray-700" />
      </button>
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Catat Penjualan Baru</h1>
        <p class="mt-1 text-sm text-gray-500">Catat obat yang terjual dari pembeli</p>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg">
        <h3 class="text-xl font-semibold mb-4 border-b pb-2">Tambah Item</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <div class="md:col-span-2">
            <label for="medicine" class="block text-sm font-medium text-gray-700">Pilih Obat</label>
            <SearchableSelect
              v-model="selectedMedicineId"
              :options="medicineOptions"
              placeholder="-- Cari & Pilih Obat --"
              class="mt-1"
            />
          </div>
          <div>
            <label for="quantity" class="block text-sm font-medium text-gray-700">Jumlah Jual</label>
            <input v-model.number="quantityToSell" type="number" id="quantity" min="1" class="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
          </div>
        </div>
        <button @click="handleAddToCart" class="mt-4 flex items-center w-full justify-center px-4 py-2 bg-blue-100 text-primary rounded-lg shadow-sm hover:bg-blue-200 transition font-semibold">
          <Plus class="w-5 h-5 mr-2" />
          Tambah ke Keranjang
        </button>
      </div>
      
      <div class="lg:col-span-1 bg-white p-6 rounded-lg shadow-lg">
        <div class="p-4 bg-gray-50 border-b -m-6 mb-6">
          <h3 class="text-xl font-semibold">Keranjang Penjualan</h3>
        </div>
        <div class="space-y-4 max-h-96 overflow-y-auto pr-2">
          <p v-if="cart.length === 0" class="text-gray-500 text-center py-4">Keranjang kosong.</p>
          <div v-for="(item, index) in cart" :key="index" class="flex justify-between items-center">
            <div>
              <p class="font-semibold">{{ item.name }}</p>
              <p class="text-sm text-gray-500">{{ item.quantity }} x {{ formatCurrency(item.price) }}</p>
              <!-- Info ED tidak relevan di keranjang penjualan, jadi dihilangkan -->
            </div>
            <div class="flex items-center">
              <p class="font-semibold mr-4">{{ formatCurrency(item.subtotal) }}</p>
              <button @click="removeFromCart(index)" class="p-1 text-red-500 hover:bg-red-100 rounded-full"><Trash2 class="w-4 h-4" /></button>
            </div>
          </div>
        </div>
        <hr class="my-4">
        <div class="flex justify-between items-center font-bold text-xl">
          <span>Total:</span>
          <span>{{ formatCurrency(grandTotal) }}</span>
        </div>
        <button @click="saveSale" :disabled="cart.length === 0 || loading" class="mt-4 w-full flex justify-center py-3 text-white rounded-lg transition-colors group bg-primary hover:bg-opacity-90 disabled:bg-primary/50 disabled:cursor-not-allowed">
          {{ loading ? 'Menyimpan...' : 'Simpan Transaksi' }}
        </button>
      </div>
    </div>
  </div>
</template>