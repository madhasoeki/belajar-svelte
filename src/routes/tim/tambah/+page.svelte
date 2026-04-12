<script lang="ts">
  import { Card, CardHeader, CardContent } from "$lib/components/ui/card";
  import { Input, Select, MultiSelect } from "$lib/components/ui/forms";
  import Button from "$lib/components/ui/button/Button.svelte";
  import { toastStore } from "$lib/stores/toast.svelte";
  import { ROUTES } from "$lib/constans/routes";
  import { apiClient } from "$lib/utils/api";
  import { getMasterDropdownOptions } from "$lib/utils/helpers";
  import { API_ENDPOINTS } from "$lib/constans/endpoints";
  import { goto } from "$app/navigation";
  import { Users, Save } from "lucide-svelte";

  let nama_tim = $state("");
  let cabang_id = $state("");
  let status = $state("aktif"); // [BARU] Default aktif
  let program_ids = $state<string[]>([]);
  let rekening_ids = $state<string[]>([]);

  let isLoading = $state(false);

  let cabangOptions = $state<{ label: string; value: string }[]>([]);
  let programOptions = $state<{ label: string; value: string }[]>([]);
  let rekeningOptions = $state<{ label: string; value: string }[]>([]);

  // [BARU] Opsi status dengan nonaktif
  const statusOptions = [
    { label: "Aktif", value: "aktif" },
    { label: "Tidak Aktif", value: "nonaktif" },
  ];

  $effect(() => {
    async function fetchMasters() {
      try {
        const resCabang = await apiClient.get(API_ENDPOINTS.CABANG.LIST);
        cabangOptions = (resCabang.data || []).map((c: any) => ({
          label: c.nama_cabang,
          value: c.id,
        }));

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
      // [UPDATE] Kirim status di payload
      await apiClient.post(API_ENDPOINTS.TIM.CREATE, {
        nama_tim,
        cabang_id,
        status,
        program_ids,
        rekening_ids,
      });

      toastStore.success("Tim baru berhasil dibuat.", "Berhasil");
      goto(ROUTES.TIM.INDEX);
    } catch (error: any) {
      toastStore.error(error.message || "Gagal menyimpan data tim.");
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="max-w-full mx-auto flex flex-col gap-6 w-full pb-20 md:pb-6">
  <Card>
    <CardHeader
      title="Form Tambah Tim"
      description="Pastikan semua data dan hak akses relasional sudah diisi dengan benar."
      icon={Users}
      iconColor="text-(--color-primary)"
    />
    <CardContent>
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
          <Button
            type="button"
            variant="ghost"
            onclick={() => goto(ROUTES.TIM.INDEX)}>Batal</Button
          >
          <Button
            type="submit"
            variant="primary"
            disabled={!isValid || isLoading}
            {isLoading}
            class="flex items-center gap-2"
          >
            {#if isLoading}
              Menyimpan...
            {:else}
              <Save size={18} /> Simpan Tim
            {/if}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</div>
