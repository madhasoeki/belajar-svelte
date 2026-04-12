<script lang="ts">
  import type { PageData } from "./$types";
  import { Card, CardHeader, CardContent } from "$lib/components/ui/card";
  import { Input, Select } from "$lib/components/ui/forms";
  import Button from "$lib/components/ui/button/Button.svelte";
  import LoadingBars from "$lib/components/ui/loading/LoadingBars.svelte";
  import { toastStore } from "$lib/stores/toast.svelte";
  import { ROUTES } from "$lib/constans/routes";
  import { apiClient } from "$lib/utils/api";
  import { API_ENDPOINTS } from "$lib/constans/endpoints";
  import { goto } from "$app/navigation";

  // [UPDATE] Tambah icon User
  import { UserCog, User, Mail, Lock, Save, Phone } from "lucide-svelte";

  let { data }: { data: PageData } = $props();
  const idUser = $derived(data.idUser);

  let nama_lengkap = $state("");
  let nama_panggilan = $state(""); // [BARU] State nama panggilan
  let email = $state("");
  let nomor_hp = $state("");
  let password = $state("");
  let role_id = $state("");
  let cabang_id = $state("");
  let tim_id = $state("");
  let status = $state("");

  let isSaving = $state(false);
  let isFetching = $state(true);

  let roleOptions = $state<{ label: string; value: string }[]>([]);
  let cabangOptions = $state<{ label: string; value: string }[]>([]);
  let timOptions = $state<{ label: string; value: string }[]>([]);

  const statusOptions = [
    { label: "Aktif", value: "aktif" },
    { label: "Tidak Aktif", value: "nonaktif" },
  ];

  const isValid = $derived(
    nama_lengkap.trim() !== "" &&
      email.includes("@") &&
      nomor_hp.startsWith("628") &&
      nomor_hp.length >= 10 &&
      (password === "" || password.length >= 6) &&
      role_id !== "" &&
      cabang_id !== "" &&
      status !== "",
  );

  $effect(() => {
    async function loadData() {
      try {
        const [resRole, resCabang, resTim, resDetail] = await Promise.all([
          apiClient.get(API_ENDPOINTS.ROLE.LIST),
          apiClient.get(API_ENDPOINTS.CABANG.LIST),
          apiClient.get(API_ENDPOINTS.TIM.LIST),
          apiClient.get(`${API_ENDPOINTS.USER.LIST}/${idUser}`),
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

        const detail = Array.isArray(resDetail.data || resDetail)
          ? (resDetail.data || resDetail)[0]
          : resDetail.data || resDetail;

        nama_lengkap = detail.nama_lengkap || detail.nama || "";
        nama_panggilan = detail.nama_panggilan || ""; // [BARU] Tarik data
        email = detail.email || "";
        nomor_hp = detail.nomor_hp || "628";
        role_id = detail.role_id || "";
        cabang_id = detail.cabang_id || "";
        tim_id = detail.tim_id || "";
        status =
          detail.status?.toLowerCase() === "aktif" ? "aktif" : "nonaktif";
      } catch (error) {
        toastStore.error("Gagal memuat data pengguna.");
        goto(ROUTES.USER.INDEX);
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

    const payload: any = {
      nama_lengkap,
      nama_panggilan, // [BARU] Kirim di payload
      email,
      nomor_hp,
      role_id,
      cabang_id,
      tim_id: tim_id === "" ? null : tim_id,
      status,
    };

    if (password.trim() !== "") {
      payload.password = password;
    }

    try {
      await apiClient.put(`${API_ENDPOINTS.USER.UPDATE}/${idUser}`, payload);

      toastStore.success("Data pengguna berhasil diperbarui.", "Berhasil");
      goto(ROUTES.USER.INDEX);
    } catch (error: any) {
      toastStore.error(error.message || "Gagal memperbarui data pengguna.");
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="max-w-full mx-auto flex flex-col gap-6 w-full pb-20 md:pb-6">
  <Card>
    <CardHeader
      title="Form Edit User"
      description="Perbarui profil, kontak, serta otorisasi akses staf terkait."
      icon={UserCog}
      iconColor="text-(--color-primary)"
    />
    <CardContent>
      {#if isFetching}
        <div class="py-12 flex flex-col items-center justify-center gap-3">
          <LoadingBars size={30} class="text-(--color-primary)" />
          <span class="text-sm text-gray-500">Memuat detail pengguna...</span>
        </div>
      {:else}
        <form onsubmit={handleSubmit} class="flex flex-col gap-6">
          <div class="flex flex-col gap-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Nama Lengkap *"
                iconLeft={UserCog}
                bind:value={nama_lengkap}
              />
              <Input
                label="Nama Panggilan"
                iconLeft={User}
                bind:value={nama_panggilan}
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Alamat Email *"
                type="email"
                iconLeft={Mail}
                bind:value={email}
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
                label="Ubah Kata Sandi (Opsional)"
                type="password"
                iconLeft={Lock}
                bind:value={password}
                helper="Kosongkan jika tidak ingin mengubah sandi."
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

          <div
            class="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100"
          >
            <Button
              type="button"
              variant="ghost"
              onclick={() => goto(ROUTES.USER.INDEX)}>Batal</Button
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
