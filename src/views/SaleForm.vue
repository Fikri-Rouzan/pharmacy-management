<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../lib/supabaseClient';
import Swal from 'sweetalert2';
import { ArrowLeft, Plus, Trash2 } from 'lucide-vue-next';
import SearchableSelect from '../components/SearchableSelect.vue'; // <-- 1. Import komponen baru

const router = useRouter();
const loading = ref(false);

const medicines = ref([]);
const selectedMedicineId = ref(null);
const quantity = ref(1);
const cart = ref([]);

async function fetchMedicines() {
  const { data, error } = await supabase
    .from('medicines')
    .select('id, name, selling_price, stock_quantity')
    .gt('stock_quantity', 0)
    .order('name');
  if (error) console.error('Error fetching medicines:', error);
  else medicines.value = data;
}

// Menyiapkan data untuk komponen SearchableSelect, termasuk info stok
const medicineOptions = computed(() => {
  return medicines.value.map(med => ({
    id: med.id,
    name: `${med.name} (Stok: ${med.stock_quantity})`
  }));
});

const grandTotal = computed(() => {
  return cart.value.reduce((total, item) => total + item.subtotal, 0);
});

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);
}

function addToCart() {
  if (!selectedMedicineId.value || quantity.value <= 0) {
    Swal.fire('Info', 'Pilih obat dan masukkan jumlah yang valid.', 'info');
    return;
  }
  const selected = medicines.value.find(m => m.id === selectedMedicineId.value);
  if (selected.stock_quantity < quantity.value) {
    Swal.fire('Stok Tidak Cukup', `Stok ${selected.name} hanya tersisa ${selected.stock_quantity}.`, 'error');
    return;
  }
  cart.value.push({
    medicine_id: selected.id,
    name: selected.name,
    quantity: quantity.value,
    price: selected.selling_price,
    subtotal: selected.selling_price * quantity.value
  });
  selectedMedicineId.value = null;
  quantity.value = 1;
}

function removeFromCart(index) {
  cart.value.splice(index, 1);
}

async function saveSale() {
  if (cart.value.length === 0) {
    Swal.fire('Keranjang Kosong', 'Tambahkan setidaknya satu obat ke keranjang.', 'warning');
    return;
  }
  loading.value = true;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: saleData, error: saleError } = await supabase.from('sales').insert({ employee_id: user.id, total_amount: grandTotal.value }).select('id').single();
    if (saleError) throw saleError;
    const saleId = saleData.id;
    const itemsToInsert = cart.value.map(item => ({ sale_id: saleId, medicine_id: item.medicine_id, quantity: item.quantity, price: item.price }));
    const { error: itemsError } = await supabase.from('sale_items').insert(itemsToInsert);
    if (itemsError) throw itemsError;
    Swal.fire('Sukses!', 'Transaksi penjualan berhasil disimpan.', 'success');
    router.push('/sales');
  } catch (error) {
    console.error('Error saving sale:', error);
    Swal.fire('Error', `Gagal menyimpan transaksi: ${error.message}`, 'error');
  } finally {
    loading.value = false;
  }
}

onMounted(fetchMedicines);
</script>

<template>
  <div class="container mx-auto">
    <div class="flex items-center mb-6">
      <button @click="router.back()" class="p-2 mr-4 rounded-full hover:bg-gray-200" title="Kembali">
        <ArrowLeft class="w-6 h-6 text-gray-700" />
      </button>
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Catat Penjualan Baru</h1>
        <p class="mt-1 text-sm text-gray-500">Pilih obat, tambahkan ke keranjang, lalu simpan transaksi.</p>
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
              placeholder="-- Cari & pilih obat --"
              class="mt-1"
            />
          </div>
          <div>
            <label for="quantity" class="block text-sm font-medium text-gray-700">Jumlah</label>
            <input v-model.number="quantity" type="number" id="quantity" min="1" class="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
          </div>
        </div>
        <button @click="addToCart" class="mt-4 flex items-center w-full justify-center px-4 py-2 bg-secondary text-primary rounded-lg shadow-sm hover:bg-blue-200 transition font-semibold">
          <Plus class="w-5 h-5 mr-2" />
          Tambah ke Keranjang
        </button>
      </div>
      
      <div class="lg:col-span-1 bg-white rounded-lg shadow-lg">
        <div class="p-4 bg-gray-50 border-b -m-6 mb-6">
          <h3 class="text-xl font-semibold">Keranjang</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4 max-h-64 overflow-y-auto pr-2">
            <p v-if="cart.length === 0" class="text-gray-500 text-center py-4">Keranjang kosong.</p>
            <div v-for="(item, index) in cart" :key="index" class="flex justify-between items-center">
              <div>
                <p class="font-semibold">{{ item.name }}</p>
                <p class="text-sm text-gray-500">{{ item.quantity }} x {{ formatCurrency(item.price) }}</p>
              </div>
              <div class="flex items-center">
                 <p class="font-semibold mr-4">{{ formatCurrency(item.subtotal) }}</p>
                 <button @click="removeFromCart(index)" class="p-1 text-red-500 hover:bg-red-100 rounded-full"><Trash2 class="w-4 h-4" /></button>
              </div>
            </div>
          </div>
          <hr class="my-4">
          <div class="flex justify-between items-center font-bold text-xl">
            <span>Total Belanja:</span>
            <span>{{ formatCurrency(grandTotal) }}</span>
          </div>
           <button @click="saveSale" :disabled="cart.length === 0 || loading" class="mt-4 w-full flex justify-center py-3 text-white rounded-lg transition-colors group bg-primary hover:bg-opacity-90 disabled:bg-blue-300">
              {{ loading ? 'Menyimpan...' : 'Simpan Transaksi' }}
           </button>
        </div>
      </div>
    </div>
  </div>
</template>