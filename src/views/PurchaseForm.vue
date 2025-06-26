<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../lib/supabaseClient';
import Swal from 'sweetalert2';
import { ArrowLeft, Plus, Trash2 } from 'lucide-vue-next';

const router = useRouter();
const loading = ref(false);

// State untuk form
const suppliers = ref([]);
const medicines = ref([]);
const selectedSupplierId = ref(null);
const selectedMedicineId = ref(null);
const quantity = ref(1);
const purchasePrice = ref(0);
const cart = ref([]);

// Ambil daftar supplier dan obat saat halaman dimuat
async function fetchData() {
  const { data: supplierData } = await supabase.from('suppliers').select('id, name').order('name');
  suppliers.value = supplierData;

  const { data: medicineData } = await supabase.from('medicines').select('id, name').order('name');
  medicines.value = medicineData;
}

const grandTotal = computed(() => {
  return cart.value.reduce((total, item) => total + item.subtotal, 0);
});

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);
}

function addToCart() {
  if (!selectedMedicineId.value || quantity.value <= 0 || purchasePrice.value <= 0) {
    Swal.fire('Info', 'Pilih obat, lalu isi jumlah dan harga beli yang valid.', 'info');
    return;
  }
  const selected = medicines.value.find(m => m.id === selectedMedicineId.value);
  cart.value.push({
    medicine_id: selected.id,
    name: selected.name,
    quantity: quantity.value,
    purchase_price: purchasePrice.value,
    subtotal: purchasePrice.value * quantity.value
  });
  selectedMedicineId.value = null;
  quantity.value = 1;
  purchasePrice.value = 0;
}

function removeFromCart(index) {
  cart.value.splice(index, 1);
}

async function savePurchase() {
  if (cart.value.length === 0 || !selectedSupplierId.value) {
    Swal.fire('Data Tidak Lengkap', 'Pilih supplier dan tambahkan setidaknya satu obat.', 'warning');
    return;
  }
  loading.value = true;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: purchaseData, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        employee_id: user.id,
        supplier_id: selectedSupplierId.value,
        total_amount: grandTotal.value
      })
      .select('id')
      .single();

    if (purchaseError) throw purchaseError;

    const purchaseId = purchaseData.id;
    const itemsToInsert = cart.value.map(item => ({
      purchase_id: purchaseId,
      medicine_id: item.medicine_id,
      quantity: item.quantity,
      purchase_price: item.purchase_price
    }));

    const { error: itemsError } = await supabase.from('purchase_items').insert(itemsToInsert);
    if (itemsError) throw itemsError;

    Swal.fire('Sukses!', 'Transaksi pembelian berhasil disimpan.', 'success');
    router.push('/purchases');

  } catch (error) {
    console.error('Error saving purchase:', error);
    Swal.fire('Error', `Gagal menyimpan transaksi: ${error.message}`, 'error');
  } finally {
    loading.value = false;
  }
}

onMounted(fetchData);
</script>

<template>
  <div class="container mx-auto">
    <div class="flex items-center mb-6">
      <button @click="router.back()" class="p-2 mr-4 rounded-full hover:bg-gray-200" title="Kembali">
        <ArrowLeft class="w-6 h-6 text-gray-700" />
      </button>
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Catat Pembelian Baru</h1>
        <p class="mt-1 text-sm text-gray-500">Catat obat yang masuk dari supplier.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg space-y-6">
        <div>
          <label for="supplier" class="block text-sm font-medium text-gray-700">Pilih Supplier</label>
          <select v-model="selectedSupplierId" id="supplier" class="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
            <option :value="null" disabled>-- Pilih supplier --</option>
            <option v-for="sup in suppliers" :key="sup.id" :value="sup.id">{{ sup.name }}</option>
          </select>
        </div>
        <hr/>
        <div>
          <h3 class="text-xl font-semibold">Tambah Item Obat</h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mt-4">
            <div class="md:col-span-2">
              <label for="medicine" class="block text-sm font-medium text-gray-700">Pilih Obat</label>
              <select v-model="selectedMedicineId" id="medicine" class="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                <option :value="null" disabled>-- Cari obat --</option>
                <option v-for="med in medicines" :key="med.id" :value="med.id">{{ med.name }}</option>
              </select>
            </div>
            <div>
              <label for="purchasePrice" class="block text-sm font-medium text-gray-700">Harga Beli</label>
              <input v-model.number="purchasePrice" type="number" id="purchasePrice" min="0" class="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
            </div>
            <div>
              <label for="quantity" class="block text-sm font-medium text-gray-700">Jumlah</label>
              <input v-model.number="quantity" type="number" id="quantity" min="1" class="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
            </div>
          </div>
          <button @click="addToCart" class="mt-4 flex items-center w-full justify-center px-4 py-2 bg-blue-100 text-primary rounded-lg shadow-sm hover:bg-blue-200 transition font-semibold">
            <Plus class="w-5 h-5 mr-2" />
            Tambah ke Daftar Pembelian
          </button>
        </div>
      </div>

      <div class="lg:col-span-1 bg-white p-6 rounded-lg shadow-lg">
        <h3 class="text-xl font-semibold mb-4 border-b pb-2">Daftar Pembelian</h3>
        <div class="space-y-4 max-h-64 overflow-y-auto pr-2">
          <p v-if="cart.length === 0" class="text-gray-500 text-center py-4">Belum ada item.</p>
          <div v-for="(item, index) in cart" :key="item.medicine_id" class="flex justify-between items-center">
            <div>
              <p class="font-semibold">{{ item.name }}</p>
              <p class="text-sm text-gray-500">{{ item.quantity }} x {{ formatCurrency(item.purchase_price) }}</p>
            </div>
            <div class="flex items-center">
               <p class="font-semibold mr-4">{{ formatCurrency(item.subtotal) }}</p>
               <button @click="removeFromCart(index)" class="p-1 text-red-500 hover:bg-red-100 rounded-full">
                 <Trash2 class="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>
        <hr class="my-4">
        <div class="flex justify-between items-center font-bold text-xl">
          <span>Total:</span>
          <span>{{ formatCurrency(grandTotal) }}</span>
        </div>
        <button @click="savePurchase" :disabled="cart.length === 0 || loading" class="mt-4 w-full flex justify-center py-3 text-white rounded-lg transition-colors group bg-primary hover:bg-opacity-90 disabled:bg-blue-300">
          {{ loading ? 'Menyimpan...' : 'Simpan Transaksi Pembelian' }}
        </button>
      </div>
    </div>
  </div>
</template>