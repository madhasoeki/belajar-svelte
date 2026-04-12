<script lang="ts">
  import { Card, CardHeader, CardContent } from "$lib/components/ui/card";
  import { Input, Select } from "$lib/components/ui/forms";
  import Button from "$lib/components/ui/button/Button.svelte";
  import { toastStore } from "$lib/stores/toast.svelte";
  import { ROUTES } from "$lib/constans/routes";
  import { apiClient } from "$lib/utils/api";
  import { API_ENDPOINTS } from "$lib/constans/endpoints";
  import { goto } from "$app/navigation";

  // [UPDATE] Tambahkan icon User untuk nama panggilan
  import { UserCog, User, Mail, Lock, Save, Phone } from "lucide-svelte";

  let nama_lengkap = $state("");
  let nama_panggilan = $state(""); // [BARU] State nama panggilan
  let email = $state("");
  let nomor_hp = $state("628");
  let password = $state("");
  let role_id = $state("");
  let cabang_id = $state("");
  let tim_id = $state("");
  let status = $state("aktif");

  let isLoading = $state(false);

  let roleOptions = $state<{ label: string; value: string }[]>([]);
  let cabangOptions = $state<{ label: string; value: string }[]>([]);
  let timOptions = $state<{ label: string; value: string }[]>([]);

  const statusOptions = [
    { label: "Aktif", value: "aktif" },
    { label: "Tidak Aktif", value: "nonaktif" },
  ];

  $effect(() => {
    async function fetchMasters() {
      try {
        const [resRole, resCabang, resTim] = await Promise.all([
          apiClient.get(API_ENDPOINTS.ROLE.LIST),
          apiClient.get(API_ENDPOINTS.CABANG.LIST),
          apiClient.get(API_ENDPOINTS.TIM.LIST),
        ]);

        roleOptions = (resRole.data || []).map((r: any) => ({
          label: r.nama_role,
          value: r.id,
        }));
        cabangOptions = (resCabang.data || []).map((c: any) => ({
          label: c.nama_cabang,
          value: c.id,
        }));

        timOptions = [
          { label: "-- Tanpa Tim --", value: "" },
          ...(resTim.data || []).map((t: any) => ({
            label: `${t.nama_tim} (${t.cabang?.nama_cabang || "Pusat"})`,
            value: t.id,
          })),
        ];
      } catch (error) {
        toastStore.error("Gagal memuat data master (Role/Cabang/Tim).");
      }
    }
    fetchMasters();
  });

  const isValid = $derived(
    nama_lengkap.trim() !== "" &&
      email.includes("@") &&
      nomor_hp.startsWith("628") &&
      nomor_hp.length >= 10 &&
      password.length >= 6 &&
      role_id !== "" &&
      cabang_id !== "",
  );

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!isValid) return;
    isLoading = true;

    try {
      await apiClient.post(API_ENDPOINTS.USER.CREATE, {
        nama_lengkap,
        nama_panggilan, // [BARU] Kirim ke backend
        email,
        nomor_hp,
        password,
        role_id,
        cabang_id,
        tim_id: tim_id === "" ? null : tim_id,
        status,
      });

      toastStore.success("Pengguna baru berhasil ditambahkan.", "Berhasil");
      goto(ROUTES.USER.INDEX);
    } catch (error: any) {
      toastStore.error(error.message || "Gagal menyimpan data pengguna.");
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="max-w-full mx-auto flex flex-col gap-6 w-full pb-20 md:pb-6">
  <Card>
    <CardHeader
      title="Form Tambah User"
      description="Buat akun staf, atur kontak, serta berikan otorisasi akses sistem."
      icon={UserCog}
      iconColor="text-(--color-primary)"
    />
    <CardContent>
      <form onsubmit={handleSubmit} class="flex flex-col gap-6">
        <div class="flex flex-col gap-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Nama Lengkap *"
              iconLeft={UserCog}
              bind:value={nama_lengkap}
              placeholder="Contoh: Fulan bin Fulan"
            />
            <Input
              label="Nama Panggilan"
              iconLeft={User}
              bind:value={nama_panggilan}
              placeholder="Contoh: Fulan"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Alamat Email *"
              type="email"
              iconLeft={Mail}
              bind:value={email}
              placeholder="fulan@sidaq.id"
            />
            <Input
              label="Nomor Handphone *"
              type="tel"
              iconLeft={Phone}
              bind:value={nomor_hp}
              helper="Wajib diawali dengan 628"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Kata Sandi *"
              type="password"
              iconLeft={Lock}
              bind:value={password}
              helper="Minimal 6 karakter."
            />
          </div>
        </div>

        <div class="h-px bg-gray-100 my-2"></div>
        <p class="text-sm font-semibold text-gray-700">
          Otorisasi & Penempatan
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Select
            label="Role (Hak Akses) *"
            options={roleOptions}
            bind:value={role_id}
            searchable={true}
          />
          <Select
            label="Status *"
            options={statusOptions}
            bind:value={status}
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Select
            label="Cabang Penempatan *"
            options={cabangOptions}
            bind:value={cabang_id}
            searchable={true}
          />
          <Select
            label="Tim Spesifik (Opsional)"
            options={timOptions}
            bind:value={tim_id}
            searchable={true}
          />
        </div>

        <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="ghost"
            onclick={() => goto(ROUTES.USER.INDEX)}>Batal</Button
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
              <Save size={18} /> Simpan Pengguna
            {/if}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</div>
