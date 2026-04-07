<script lang="ts">
  import { Card, CardContent } from "$lib/components/ui/card";
  import { Input, Select, MultiSelect } from "$lib/components/ui/forms";
  import Button from "$lib/components/ui/button/Button.svelte";
  import { toastStore } from "$lib/stores/toast.svelte";
  import { apiClient } from "$lib/utils/api";
  import { getMasterDropdownOptions } from "$lib/utils/helpers"; // Gunakan utilitasmu
  import { API_ENDPOINTS } from "$lib/constans/endpoints";
  import { goto } from "$app/navigation";
  import { Users, Building2, Save, ArrowLeft } from "lucide-svelte";

  let nama_tim = $state("");
  let cabang_id = $state("");
  let program_ids = $state<string[]>([]);
  let rekening_ids = $state<string[]>([]);
  
  let isLoading = $state(false);

  // Master Data Options
  let cabangOptions = $state<{label: string, value: string}[]>([]);
  let programOptions = $state<{label: string, value: string}[]>([]);
  let rekeningOptions = $state<{label: string, value: string}[]>([]);

  $effect(() => {
    // Fungsi untuk menarik master data
    async function fetchMasters() {
      // Asumsi: getMasterDropdownOptions bisa kamu modifikasi untuk menarik data Cabang juga
      // Atau fetch manual menggunakan apiClient.get()
      try {
        const resCabang = await apiClient.get(API_ENDPOINTS.CABANG.LIST);
        cabangOptions = (resCabang.data || []).map((c: any) => ({ label: c.nama_cabang, value: c.id }));

        const resMaster = await getMasterDropdownOptions();
        programOptions = resMaster.programs;
        rekeningOptions = resMaster.rekenings;
      } catch (error) {
        toastStore.error("Gagal memuat data pilihan (Dropdown).");
      }
    }
    fetchMasters();
  });

  const isValid = $derived(nama_tim.trim() !== "" && cabang_id.trim() !== "");

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!isValid) return;
    isLoading = true;

    try {
      // Catatan: Pastikan payload JSON Golang-mu mengharapkan array ID untuk relasi M2M
      await apiClient.post(API_ENDPOINTS.TIM.CREATE, {
        nama_tim,
        cabang_id,
        program_ids, 
        rekening_ids 
      });
      
      toastStore.success("Tim baru berhasil dibuat.", "Berhasil");
      goto("/tim");
    } catch (error: any) {
      toastStore.error(error.message || "Gagal menyimpan data tim.");
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="max-w-2xl mx-auto flex flex-col gap-6 w-full pb-20 md:pb-6">
  <div class="flex items-center gap-4">
    <Button variant="outline" size="sm" onclick={() => goto("/tim")} class="px-2">
      <ArrowLeft size={18} />
    </Button>
    <div>
      <h1 class="text-xl font-bold text-gray-900">Tambah Tim Baru</h1>
      <p class="text-sm text-gray-500">Buat entitas tim dan berikan hak akses relasional.</p>
    </div>
  </div>

  <Card>
    <CardContent class="pt-6">
      <form onsubmit={handleSubmit} class="flex flex-col gap-6">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input 
            label="Nama Tim *" 
            placeholder="Contoh: Tim Alpha JKT" 
            iconLeft={Users}
            bind:value={nama_tim} 
          />
          <Select 
            label="Cabang Induk *" 
            options={cabangOptions} 
            bind:value={cabang_id} 
            placeholder="Pilih Cabang"
            searchable={true}
          />
        </div>

        <div class="h-px bg-gray-100 my-2"></div>
        <p class="text-sm font-semibold text-gray-700">Akses Modul Transaksi</p>

        <MultiSelect 
          label="Program yang Dikelola" 
          options={programOptions} 
          bind:values={program_ids} 
          placeholder="Pilih program..." 
          searchPlaceholder="Cari program..." 
        />

        <MultiSelect 
          label="Rekening yang Dikelola" 
          options={rekeningOptions} 
          bind:values={rekening_ids} 
          placeholder="Pilih rekening..." 
          searchPlaceholder="Cari rekening..." 
        />

        <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
          <Button type="button" variant="ghost" onclick={() => goto("/tim")}>Batal</Button>
          <Button type="submit" variant="primary" disabled={!isValid || isLoading} {isLoading} class="flex items-center gap-2">
            {#if isLoading} Menyimpan... {:else} <Save size={18} /> Simpan Tim {/if}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</div>