<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte"; // Atau pakai $effect di Svelte 5

  // 1. Menangkap ID dari URL
  // Nama '.id' ini menyesuaikan dengan nama folder '[id]' yang kamu buat
  const idTransaksi = $page.params.id; 

  let isLoading = $state(true);
  let detailTransaksi = $state(null);

  // 2. Gunakan ID tersebut untuk fetch data dari Golang
  $effect(() => {
    async function fetchDetail() {
      try {
        // Contoh pemanggilan API: GET /api/transaksi/TRX-123
        // const response = await apiClient.get(`/transaksi/${idTransaksi}`);
        // detailTransaksi = response.data;
        console.log("ID yang mau diedit:", idTransaksi);
      } catch (error) {
        console.error("Gagal mengambil data", error);
      } finally {
        isLoading = false;
      }
    }

    fetchDetail();
  });
</script>

<div class="p-6">
  <h2>Edit Transaksi: <span class="font-bold text-blue-500">{idTransaksi}</span></h2>
  
  {#if isLoading}
    <p>Memuat data...</p>
  {:else}
    <h1>Test</h1>
  {/if}
</div>