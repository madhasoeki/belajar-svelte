<script lang="ts">
  import { Card, CardContent } from "$lib/components/ui/card";
  import { Input, Select, MultiSelect } from "$lib/components/ui/forms";
  import Button from "$lib/components/ui/button/Button.svelte";
  import LoadingBars from "$lib/components/ui/loading/LoadingBars.svelte";
  import { toastStore } from "$lib/stores/toast.svelte";
  import { apiClient } from "$lib/utils/api";
  import { getMasterDropdownOptions } from "$lib/utils/helpers";
  import { API_ENDPOINTS } from "$lib/constans/endpoints";
  import { goto } from "$app/navigation";
  import { Users, Save, ArrowLeft } from "lucide-svelte";

  let { data } = $props();
  const idTim = $derived(data.idTim);

  let nama_tim = $state("");
  let cabang_id = $state("");
  let program_ids = $state<string[]>([]);
  let rekening_ids = $state<string[]>([]);
  
  let isSaving = $state(false);
  let isFetching = $state(true);

  let cabangOptions = $state<{label: string, value: string}[]>([]);
  let programOptions = $state<{label: string, value: string}[]>([]);
  let rekeningOptions = $state<{label: string, value: string}[]>([]);

  const isValid = $derived(nama_tim.trim() !== "" && cabang_id.trim() !== "");

  $effect(() => {
    async function loadData() {
      try {
        // 1. Ambil Master Data untuk Dropdown
        const resCabang = await apiClient.get(API_ENDPOINTS.CABANG.LIST);
        cabangOptions = (resCabang.data || []).map((c: any) => ({ label: c.nama_cabang, value: c.id }));

        const resMaster = await getMasterDropdownOptions();
        programOptions = resMaster.programs;
        rekeningOptions = resMaster.rekenings;

        // 2. Ambil Detail Tim
        const resTim = await apiClient.get(`${API_ENDPOINTS.TIM.LIST}/${idTim}`);
        const detail = Array.isArray(resTim.data || resTim) ? (resTim.data || resTim)[0] : (resTim.data || resTim);

        nama_tim = detail.nama_tim || "";
        cabang_id = detail.cabang_id || "";
        
        // [EKSTRAKSI RELASI]: Petakan array objek dari Golang menjadi array ID murni
        program_ids = (detail.programs || []).map((p: any) => p.id);
        rekening_ids = (detail.rekenings || []).map((r: any) => r.id);

      } catch (error) {
        toastStore.error("Gagal memuat data tim atau master data.");
        goto("/tim");
      } finally {
        isFetching = false;
      }
    }
    
    if (idTim) loadData();
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!isValid) return;
    isSaving = true;

    try {
      await apiClient.put(`${API_ENDPOINTS.TIM.UPDATE}/${idTim}`, {
        nama_tim,
        cabang_id,
        program_ids, 
        rekening_ids 
      });
      
      toastStore.success("Data tim berhasil diperbarui.", "Berhasil");
      goto("/tim");
    } catch (error: any) {
      toastStore.error(error.message || "Gagal memperbarui data tim.");
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="max-w-2xl mx-auto flex flex-col gap-6 w-full pb-20 md:pb-6">
  <div class="flex items-center gap-4">
    <Button variant="outline" size="sm" onclick={() => goto("/tim")} class="px-2">
      <ArrowLeft size={18} />
    </Button>
    <div>
      <h1 class="text-xl font-bold text-gray-900">Edit Data Tim</h1>
      <p class="text-sm text-gray-500">Perbarui informasi tim dengan ID: {idTim}</p>
    </div>
  </div>

  <Card>
    <CardContent class="pt-6">
      {#if isFetching}
        <div class="py-12 flex flex-col items-center justify-center gap-3">
          <LoadingBars size={30} class="text-(--color-primary)" />
          <span class="text-sm text-gray-500">Memuat detail tim dan data master...</span>
        </div>
      {:else}
        <form onsubmit={handleSubmit} class="flex flex-col gap-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Nama Tim *" iconLeft={Users} bind:value={nama_tim} />
            <Select label="Cabang Induk *" options={cabangOptions} bind:value={cabang_id} searchable={true} />
          </div>

          <div class="h-px bg-gray-100 my-2"></div>
          <p class="text-sm font-semibold text-gray-700">Akses Modul Transaksi</p>

          <MultiSelect label="Program yang Dikelola" options={programOptions} bind:values={program_ids} searchPlaceholder="Cari program..." />
          <MultiSelect label="Rekening yang Dikelola" options={rekeningOptions} bind:values={rekening_ids} searchPlaceholder="Cari rekening..." />

          <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onclick={() => goto("/tim")}>Batal</Button>
            <Button type="submit" variant="primary" disabled={!isValid || isSaving} isLoading={isSaving} class="flex items-center gap-2">
              {#if isSaving} Menyimpan... {:else} <Save size={18} /> Simpan Perubahan {/if}
            </Button>
          </div>
        </form>
      {/if}
    </CardContent>
  </Card>
</div>