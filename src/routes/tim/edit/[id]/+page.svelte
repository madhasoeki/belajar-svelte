<script lang="ts">
  import type { PageData } from "./$types";
  import { Card, CardHeader, CardContent } from "$lib/components/ui/card";
  import { Input, Select, MultiSelect } from "$lib/components/ui/forms";
  import Button from "$lib/components/ui/button/Button.svelte";
  import LoadingBars from "$lib/components/ui/loading/LoadingBars.svelte";
  import { toastStore } from "$lib/stores/toast.svelte";
  import { ROUTES } from "$lib/constans/routes";
  import { apiClient } from "$lib/utils/api";
  import { getMasterDropdownOptions } from "$lib/utils/helpers";
  import { API_ENDPOINTS } from "$lib/constans/endpoints";
  import { goto } from "$app/navigation";
  import { Users, Save } from "lucide-svelte";

  let { data }: { data: PageData } = $props();
  const idTim = $derived(data.idTim);

  let nama_tim = $state("");
  let cabang_id = $state("");
  let program_ids = $state<string[]>([]);
  let rekening_ids = $state<string[]>([]);
  let status = $state("");

  let isSaving = $state(false);
  let isFetching = $state(true);

  let cabangOptions = $state<{ label: string; value: string }[]>([]);
  let programOptions = $state<{ label: string; value: string }[]>([]);
  let rekeningOptions = $state<{ label: string; value: string }[]>([]);

  // [UPDATE] Nilai diganti menjadi nonaktif
  const statusOptions = [
    { label: "Aktif", value: "aktif" },
    { label: "Tidak Aktif", value: "nonaktif" },
  ];

  const isValid = $derived(
    nama_tim.trim() !== "" && cabang_id.trim() !== "" && status !== "",
  );

  $effect(() => {
    async function loadData() {
      try {
        const resCabang = await apiClient.get(API_ENDPOINTS.CABANG.LIST);
        cabangOptions = (resCabang.data || []).map((c: any) => ({
          label: c.nama_cabang,
          value: c.id,
        }));

        const resMaster = await getMasterDropdownOptions();
        programOptions = resMaster.programs;
        rekeningOptions = resMaster.rekenings;

        const resTim = await apiClient.get(
          `${API_ENDPOINTS.TIM.LIST}/${idTim}`,
        );

        const result = resTim.data || resTim;
        const detail = Array.isArray(result) ? result[0] : result;

        nama_tim = detail.nama_tim || "";
        cabang_id = detail.cabang_id || "";
        // Pastikan normalisasi di client side jika backend masih mengirim "tidak aktif"
        status =
          detail.status?.toLowerCase() === "aktif" ? "aktif" : "nonaktif";

        program_ids = (detail.programs || []).map((p: any) => p.id);
        rekening_ids = (detail.rekenings || []).map((r: any) => r.id);
      } catch (error) {
        toastStore.error("Gagal memuat data tim atau master data.");
        goto(ROUTES.TIM.INDEX);
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
        rekening_ids,
        status, // Kirim status dalam PUT
      });

      toastStore.success("Data tim berhasil diperbarui.", "Berhasil");
      goto(ROUTES.TIM.INDEX);
    } catch (error: any) {
      toastStore.error(error.message || "Gagal memperbarui data tim.");
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="max-w-full mx-auto flex flex-col gap-6 w-full pb-20 md:pb-6">
  <Card>
    <CardHeader
      title="Form Edit Tim"
      description="Perbarui informasi tim, status operasional, dan hak akses relasional."
      icon={Users}
      iconColor="text-(--color-primary)"
    />
    <CardContent>
      {#if isFetching}
        <div class="py-12 flex flex-col items-center justify-center gap-3">
          <LoadingBars size={30} class="text-(--color-primary)" />
          <span class="text-sm text-gray-500"
            >Memuat detail tim dan data master...</span
          >
        </div>
      {:else}
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
              searchable={true}
            />
          </div>

          <div class="h-px bg-gray-100 my-2"></div>
          <p class="text-sm font-semibold text-gray-700">
            Akses Modul Transaksi & Status
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Select
              label="Status Operasional *"
              options={statusOptions}
              bind:value={status}
            />
          </div>

          <MultiSelect
            label="Program yang Dikelola"
            options={programOptions}
            bind:values={program_ids}
            searchPlaceholder="Cari program..."
          />
          <MultiSelect
            label="Rekening yang Dikelola"
            options={rekeningOptions}
            bind:values={rekening_ids}
            searchPlaceholder="Cari rekening..."
          />

          <div
            class="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100"
          >
            <Button
              type="button"
              variant="ghost"
              onclick={() => goto(ROUTES.TIM.INDEX)}>Batal</Button
            >
            <Button
              type="submit"
              variant="primary"
              disabled={!isValid || isSaving}
              isLoading={isSaving}
              class="flex items-center gap-2"
            >
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
