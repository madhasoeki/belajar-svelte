<script lang="ts">
  import { Card, CardHeader, CardContent } from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/forms";
  import Button from "$lib/components/ui/button/Button.svelte";
  import { toastStore } from "$lib/stores/toast.svelte";
  import { apiClient } from "$lib/utils/api";
  import { API_ENDPOINTS } from "$lib/constans/endpoints";
  import { goto } from "$app/navigation";
  import { Building2, MapPin, Save, ArrowLeft } from "lucide-svelte";

  let nama_cabang = $state("");
  let alamat = $state("");
  let isLoading = $state(false);

  const isValid = $derived(nama_cabang.trim() !== "" && alamat.trim() !== "");

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!isValid) return;

    isLoading = true;

    try {
      await apiClient.post(API_ENDPOINTS.CABANG.CREATE, {
        nama_cabang,
        alamat,
      });

      toastStore.success("Data cabang baru berhasil disimpan.", "Berhasil");
      goto("/cabang"); // Kembali ke tabel
    } catch (error: any) {
      toastStore.error(error.message || "Gagal menyimpan data cabang.");
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="max-w-full mx-auto flex flex-col gap-6 w-full pb-20 md:pb-6">
  <Card>
    <CardHeader title="Form Tambah Cabang" description="Pastikan semua data yang diperlukan sudah diisi dengan benar." icon={Building2} iconColor="text-(--color-primary)" />
    <CardContent>
      <form onsubmit={handleSubmit} class="flex flex-col gap-5">
        <Input label="Nama Cabang *" placeholder="Contoh: Cabang Jakarta Selatan" iconLeft={Building2} bind:value={nama_cabang} />

        <Input label="Alamat *" placeholder="Contoh: Jl. Merdeka No. 123" iconLeft={MapPin} bind:value={alamat} />

        <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
          <Button type="button" variant="ghost" onclick={() => goto("/cabang")}>Batal</Button>
          <Button type="submit" variant="primary" disabled={!isValid || isLoading} {isLoading} class="flex items-center gap-2">
            {#if isLoading}
              Menyimpan...
            {:else}
              <Save size={18} /> Simpan Cabang
            {/if}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</div>
