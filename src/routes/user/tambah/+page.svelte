<script lang="ts">
  import { Card, CardContent } from "$lib/components/ui/card";
  import { Input, Select } from "$lib/components/ui/forms";
  import Button from "$lib/components/ui/button/Button.svelte";
  import { toastStore } from "$lib/stores/toast.svelte";
  import { apiClient } from "$lib/utils/api";
  import { API_ENDPOINTS } from "$lib/constans/endpoints";
  import { goto } from "$app/navigation";
  import { User, Mail, Lock, Save, ArrowLeft } from "lucide-svelte";

  let nama = $state("");
  let email = $state("");
  let password = $state("");
  let role_id = $state("");
  let cabang_id = $state("");
  let tim_id = $state("");
  let status = $state("aktif");
  
  let isLoading = $state(false);

  // Master Data Options
  let roleOptions = $state<{label: string, value: string}[]>([]);
  let cabangOptions = $state<{label: string, value: string}[]>([]);
  let timOptions = $state<{label: string, value: string}[]>([]);
  const statusOptions = [
    { label: "Aktif", value: "aktif" },
    { label: "Tidak Aktif", value: "tidak aktif" } 
  ];

  $effect(() => {
    async function fetchMasters() {
      try {
        // Tarik data secara paralel agar jauh lebih cepat
        const [resRole, resCabang, resTim] = await Promise.all([
          apiClient.get(API_ENDPOINTS.ROLE.LIST),
          apiClient.get(API_ENDPOINTS.CABANG.LIST),
          apiClient.get(API_ENDPOINTS.TIM.LIST) // Asumsi endpoint ini mengembalikan semua tim
        ]);

        roleOptions = (resRole.data || []).map((r: any) => ({ label: r.nama_role, value: r.id }));
        cabangOptions = (resCabang.data || []).map((c: any) => ({ label: c.nama_cabang, value: c.id }));
        // Tim bersifat opsional, tambahkan opsi kosong di awal
        timOptions = [
          { label: "-- Tanpa Tim --", value: "" },
          ...(resTim.data || []).map((t: any) => ({ label: `${t.nama_tim} (${t.cabang?.nama_cabang || 'Pusat'})`, value: t.id }))
        ];
      } catch (error) {
        toastStore.error("Gagal memuat data master (Role/Cabang/Tim).");
      }
    }
    fetchMasters();
  });

  const isValid = $derived(
    nama.trim() !== "" && 
    email.includes("@") && 
    password.length >= 6 && 
    role_id !== "" && 
    cabang_id !== ""
  );

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!isValid) return;
    isLoading = true;

    try {
      await apiClient.post(API_ENDPOINTS.USER.CREATE, {
        nama,
        email,
        password,
        role_id,
        cabang_id,
        tim_id: tim_id === "" ? null : tim_id, // Kirim null jika kosong
        status
      });
      
      toastStore.success("Pengguna baru berhasil ditambahkan.", "Berhasil");
      goto("/user");
    } catch (error: any) {
      toastStore.error(error.message || "Gagal menyimpan data pengguna.");
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="max-w-2xl mx-auto flex flex-col gap-6 w-full pb-20 md:pb-6">
  <div class="flex items-center gap-4">
    <Button variant="outline" size="sm" onclick={() => goto("/user")} class="px-2">
      <ArrowLeft size={18} />
    </Button>
    <div>
      <h1 class="text-xl font-bold text-gray-900">Tambah Pengguna</h1>
      <p class="text-sm text-gray-500">Buat akun staf dan atur otorisasi mereka.</p>
    </div>
  </div>

  <Card>
    <CardContent class="pt-6">
      <form onsubmit={handleSubmit} class="flex flex-col gap-6">
        
        <div class="flex flex-col gap-5">
          <p class="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">Informasi Akun</p>
          <Input label="Nama Lengkap *" iconLeft={User} bind:value={nama} placeholder="Contoh: Fulan" />
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Alamat Email *" type="email" iconLeft={Mail} bind:value={email} placeholder="fulan@sidaq.id" />
            <Input label="Kata Sandi *" type="password" iconLeft={Lock} bind:value={password} helper="Minimal 6 karakter." />
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
          <Button type="submit" variant="primary" disabled={!isValid || isLoading} {isLoading} class="flex items-center gap-2">
            {#if isLoading} Menyimpan... {:else} <Save size={18} /> Simpan Pengguna {/if}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</div>