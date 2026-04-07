<script lang="ts">
  import { Card, CardContent } from "$lib/components/ui/card";
  import { Input, Select } from "$lib/components/ui/forms";
  import Button from "$lib/components/ui/button/Button.svelte";
  import LoadingBars from "$lib/components/ui/loading/LoadingBars.svelte";
  import { toastStore } from "$lib/stores/toast.svelte";
  import { apiClient } from "$lib/utils/api";
  import { API_ENDPOINTS } from "$lib/constans/endpoints";
  import { goto } from "$app/navigation";
  import { User, Mail, Lock, Save, ArrowLeft } from "lucide-svelte";

  let { data } = $props();
  const idUser = $derived(data.idUser);

  let nama = $state("");
  let email = $state("");
  let password = $state(""); // Biarkan kosong jika tidak diubah
  let role_id = $state("");
  let cabang_id = $state("");
  let tim_id = $state("");
  let status = $state("");
  
  let isSaving = $state(false);
  let isFetching = $state(true);

  let roleOptions = $state<{label: string, value: string}[]>([]);
  let cabangOptions = $state<{label: string, value: string}[]>([]);
  let timOptions = $state<{label: string, value: string}[]>([]);
  const statusOptions = [
    { label: "Aktif", value: "aktif" },
    { label: "Tidak Aktif", value: "tidak aktif" } 
  ];

  // Password valid jika kosong (tidak diubah) ATAU panjangnya >= 6
  const isValid = $derived(
    nama.trim() !== "" && 
    email.includes("@") && 
    (password === "" || password.length >= 6) && 
    role_id !== "" && 
    cabang_id !== "" && 
    status !== ""
  );

  $effect(() => {
    async function loadData() {
      try {
        // Tarik 4 API sekaligus secara paralel
        const [resRole, resCabang, resTim, resDetail] = await Promise.all([
          apiClient.get(API_ENDPOINTS.ROLE.LIST),
          apiClient.get(API_ENDPOINTS.CABANG.LIST),
          apiClient.get(API_ENDPOINTS.TIM.LIST),
          apiClient.get(`${API_ENDPOINTS.USER.LIST}/${idUser}`)
        ]);

        roleOptions = (resRole.data || []).map((r: any) => ({ label: r.nama_role, value: r.id }));
        cabangOptions = (resCabang.data || []).map((c: any) => ({ label: c.nama_cabang, value: c.id }));
        timOptions = [
          { label: "-- Tanpa Tim --", value: "" },
          ...(resTim.data || []).map((t: any) => ({ label: `${t.nama_tim} (${t.cabang?.nama_cabang || 'Pusat'})`, value: t.id }))
        ];

        // Ekstraksi Detail User
        const detail = Array.isArray(resDetail.data || resDetail) ? (resDetail.data || resDetail)[0] : (resDetail.data || resDetail);
        
        nama = detail.nama || "";
        email = detail.email || "";
        role_id = detail.role_id || "";
        cabang_id = detail.cabang_id || "";
        tim_id = detail.tim_id || ""; // Jika null dari Golang, string "" di Svelte akan masuk ke "-- Tanpa Tim --"
        status = detail.status || "aktif";

      } catch (error) {
        toastStore.error("Gagal memuat data pengguna.");
        goto("/user");
      } finally {
        isFetching = false;
      }
    }
    
    if (idUser) loadData();
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!isValid) return;
    isSaving = true;

    // Siapkan payload, hanya kirim password jika user mengetik sesuatu
    const payload: any = {
      nama,
      email,
      role_id,
      cabang_id,
      tim_id: tim_id === "" ? null : tim_id,
      status
    };

    if (password.trim() !== "") {
      payload.password = password;
    }

    try {
      await apiClient.put(`${API_ENDPOINTS.USER.UPDATE}/${idUser}`, payload);
      
      toastStore.success("Data pengguna berhasil diperbarui.", "Berhasil");
      goto("/user");
    } catch (error: any) {
      toastStore.error(error.message || "Gagal memperbarui data pengguna.");
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="max-w-2xl mx-auto flex flex-col gap-6 w-full pb-20 md:pb-6">
  <div class="flex items-center gap-4">
    <Button variant="outline" size="sm" onclick={() => goto("/user")} class="px-2">
      <ArrowLeft size={18} />
    </Button>
    <div>
      <h1 class="text-xl font-bold text-gray-900">Edit Pengguna</h1>
      <p class="text-sm text-gray-500">Perbarui profil dan akses staf: {nama}</p>
    </div>
  </div>

  <Card>
    <CardContent class="pt-6">
      {#if isFetching}
        <div class="py-12 flex flex-col items-center justify-center gap-3">
          <LoadingBars size={30} class="text-(--color-primary)" />
          <span class="text-sm text-gray-500">Memuat detail pengguna...</span>
        </div>
      {:else}
        <form onsubmit={handleSubmit} class="flex flex-col gap-6">
          
          <div class="flex flex-col gap-5">
            <p class="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">Informasi Akun</p>
            <Input label="Nama Lengkap *" iconLeft={User} bind:value={nama} />
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Alamat Email *" type="email" iconLeft={Mail} bind:value={email} />
              <Input label="Ubah Kata Sandi (Opsional)" type="password" iconLeft={Lock} bind:value={password} helper="Kosongkan jika tidak ingin mengubah sandi." />
            </div>
          </div>

          <div class="flex flex-col gap-5 mt-2">
            <p class="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">Otorisasi & Afiliasi</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Select label="Role (Hak Akses) *" options={roleOptions} bind:value={role_id} searchable={true} />
              <Select label="Status *" options={statusOptions} bind:value={status} />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Select label="Cabang Penempatan *" options={cabangOptions} bind:value={cabang_id} searchable={true} />
              <Select label="Tim Spesifik (Opsional)" options={timOptions} bind:value={tim_id} searchable={true} />
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onclick={() => goto("/user")}>Batal</Button>
            <Button type="submit" variant="primary" disabled={!isValid || isSaving} isLoading={isSaving} class="flex items-center gap-2">
              {#if isSaving} Menyimpan... {:else} <Save size={18} /> Simpan Perubahan {/if}
            </Button>
          </div>
        </form>
      {/if}
    </CardContent>
  </Card>
</div>