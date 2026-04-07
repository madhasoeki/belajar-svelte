<script lang="ts">
  import { Card, CardHeader, CardContent } from "$lib/components/ui/card";
  import { Input, Select } from "$lib/components/ui/forms"; // [UPDATE] Import Select
  import Button from "$lib/components/ui/button/Button.svelte";
  import { toastStore } from "$lib/stores/toast.svelte";
  import { apiClient } from "$lib/utils/api";
  import { API_ENDPOINTS } from "$lib/constans/endpoints";
  import { goto } from "$app/navigation";
  import { Building2, MapPin, Save, ArrowLeft } from "lucide-svelte";
  import LoadingBars from "$lib/components/ui/loading/LoadingBars.svelte";

  let { data } = $props();
  const idCabang = $derived(data.idCabang);

  let nama_cabang = $state("");
  let alamat = $state("");
  let status = $state(""); // [BARU] State untuk status cabang
  
  let isSaving = $state(false);
  let isFetching = $state(true); 

  // Opsi dropdown untuk status
  const statusOptions = [
    { label: "Aktif", value: "aktif" },
    { label: "Tidak Aktif", value: "tidak aktif" } 
  ];

  const isValid = $derived(nama_cabang.trim() !== "" && alamat.trim() !== "" && status !== "");

  // [LOGIKA TARIK DATA]: Anti-Error & Anti-Undefined
  $effect(() => {
    async function fetchDetail() {
      try {
        const response = await apiClient.get(`${API_ENDPOINTS.CABANG.LIST}/${idCabang}`);
        
        // Ekstraksi paling aman: Jika response.data ada isinya, pakai itu. Jika tidak, pakai response langsung.
        const result = response.data || response;
        
        // Asingkan ke variabel jika result adalah array (kasus anomali), jika tidak pakai langsung
        const detail = Array.isArray(result) ? result[0] : result;

        nama_cabang = detail.nama_cabang || "";
        alamat = detail.alamat || "";
        status = detail.status || "aktif"; // Set default jika kosong

      } catch (error) {
        toastStore.error("Gagal memuat data cabang. Data mungkin tidak ditemukan.");
        goto("/cabang");
      } finally {
        isFetching = false;
      }
    }
    
    if (idCabang) {
      fetchDetail();
    }
  });

  // [LOGIKA UPDATE]: Menggunakan PUT
  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!isValid) return;

    isSaving = true;

    try {
      // [UPDATE] Menggunakan .put() agar sesuai standar, dan bawa status
      await apiClient.put(`${API_ENDPOINTS.CABANG.UPDATE}/${idCabang}`, {
        nama_cabang,
        alamat,
        status // Kirim status ke Golang
      });
      
      toastStore.success("Data cabang berhasil diperbarui.", "Berhasil");
      goto("/cabang");
    } catch (error: any) {
        console.log("Error saat update cabang:", error); // Debug log
        console.log("Payload yang dikirim:", { nama_cabang, alamat, status }); // Debug log payload
        console.log("Endpoint yang dipanggil:", `${API_ENDPOINTS.CABANG.UPDATE}/${idCabang}`); // Debug log endpoint
      toastStore.error(error.message || "Gagal memperbarui data cabang.");
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="max-w-2xl mx-auto flex flex-col gap-6 w-full pb-20 md:pb-6">
  <div class="flex items-center gap-4">
    <Button variant="outline" size="sm" onclick={() => goto("/cabang")} class="px-2">
      <ArrowLeft size={18} />
    </Button>
    <div>
      <h1 class="text-xl font-bold text-gray-900">Edit Data Cabang</h1>
      <p class="text-sm text-gray-500">Perbarui informasi cabang operasional dengan ID: {idCabang}</p>
    </div>
  </div>

  <Card>
    <CardContent class="pt-6">
      {#if isFetching}
        <div class="py-12 flex flex-col items-center justify-center gap-3">
          <LoadingBars size={30} class="text-(--color-primary)" />
          <span class="text-sm text-gray-500">Mengambil data cabang...</span>
        </div>
      {:else}
        <form onsubmit={handleSubmit} class="flex flex-col gap-5">
          <Input 
            label="Nama Cabang *" 
            placeholder="Contoh: Cabang Jakarta Selatan" 
            iconLeft={Building2}
            bind:value={nama_cabang} 
          />
          
          <Input 
            label="Alamat *" 
            placeholder="Contoh: Jl. Merdeka No. 123" 
            iconLeft={MapPin}
            bind:value={alamat} 
          />

          <Select 
            label="Status Cabang *" 
            options={statusOptions} 
            bind:value={status} 
            placeholder="Pilih status operasional"
          />

          <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onclick={() => goto("/cabang")}>Batal</Button>
            <Button type="submit" variant="primary" disabled={!isValid || isSaving} isLoading={isSaving} class="flex items-center gap-2">
              {#if isSaving}
                Menyimpan...
              {:else}
                <Save size={18} /> Simpan Perubahan
              {/if}
            </Button>
          </div>
        </form>
      {/if}
    </CardContent>
  </Card>
</div>