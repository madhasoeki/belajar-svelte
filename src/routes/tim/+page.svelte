<script lang="ts">
  import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
    MobileOverviewCard,
    EntityCard,
  } from "$lib/components/ui/card";
  import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    TableToolbar,
  } from "$lib/components/ui/table";
  import { Select } from "$lib/components/ui/forms";
  import Pagination from "$lib/components/ui/pagination/Pagination.svelte";
  import Button from "$lib/components/ui/button/Button.svelte";
  import Modal from "$lib/components/ui/modal/Modal.svelte";
  import LoadingBars from "$lib/components/ui/loading/LoadingBars.svelte";
  import ToggleSwitch from "$lib/components/ui/forms/ToggleSwitch.svelte";

  import { toastStore } from "$lib/stores/toast.svelte";
  import { ROUTES } from "$lib/constans/routes";
  import { debounce } from "$lib/utils/helpers";
  import { apiClient } from "$lib/utils/api";
  import { API_ENDPOINTS } from "$lib/constans/endpoints";

  import {
    Trash2,
    Eye,
    Pencil,
    Users,
    User,
    Building2,
    Layers,
    CreditCard,
    Ellipsis,
    Plus,
  } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import { Dropdown, DropdownItem } from "$lib/components/ui/dropdown";

  let tims = $state<any[]>([]);
  let meta = $state({ page: 1, limit: 10, total_page: 1, total_data: 0 });
  let isLoading = $state(true);
  let isAppending = $state(false);

  let togglingIds = $state<Set<string>>(new Set());

  let searchValue = $state("");
  let selectedStatus = $state("");
  let selectedCabang = $state("");

  // [UPDATE]: Value diubah jadi "nonaktif" sesuai kontrak API
  const statusOptions = [
    { label: "Aktif", value: "aktif" },
    { label: "Tidak Aktif", value: "nonaktif" },
  ];

  let cabangOptions = $state<{ label: string; value: string }[]>([]);

  let showDeleteModal = $state(false);
  let selectedItemToDelete = $state<string | null>(null);

  $effect(() => {
    async function fetchCabangMaster() {
      try {
        const res = await apiClient.get(API_ENDPOINTS.CABANG.LIST);
        cabangOptions = (res.data || []).map((c: any) => ({
          label: c.nama_cabang,
          value: c.id,
        }));
      } catch (error) {
        console.error("Gagal memuat opsi cabang untuk filter.");
      }
    }
    if (cabangOptions.length === 0) fetchCabangMaster();
  });

  function buildQueryParams() {
    const params = new URLSearchParams();
    params.append("page", meta.page.toString());
    params.append("limit", meta.limit.toString());
    if (searchValue) params.append("q", searchValue);
    if (selectedStatus) params.append("status", selectedStatus);
    if (selectedCabang) params.append("cabang_id", selectedCabang);
    return params.toString();
  }

  async function fetchTims(append = false) {
    isLoading = true;
    try {
      const qs = buildQueryParams();
      const response = await apiClient.get(`${API_ENDPOINTS.TIM.LIST}?${qs}`);

      if (append) {
        tims = [...tims, ...(response.data || [])];
      } else {
        tims = response.data || [];
      }

      if (response.meta) meta = response.meta;
    } catch (error) {
      toastStore.error("Gagal mengambil data tim dari server.", "Error");
    } finally {
      isLoading = false;
    }
  }

  function loadMore() {
    if (meta.page < meta.total_page) {
      isAppending = true;
      meta.page++;
    }
  }

  function handleFilterChange() {
    meta.page = 1;
    fetchTims();
  }

  function resetFilters() {
    selectedStatus = "";
    selectedCabang = "";
    handleFilterChange();
  }

  function applyModalFilter() {
    handleFilterChange();
  }

  // [UPDATE]: Menyesuaikan Endpoint PATCH dan value nonaktif
  async function handleToggleStatus(tim: any, newChecked: boolean) {
    const newStatus = newChecked ? "aktif" : "nonaktif";

    togglingIds.add(tim.id);
    togglingIds = new Set(togglingIds);

    try {
      // Endpoint ditambah /status di ujungnya
      await apiClient.patch(`${API_ENDPOINTS.TIM.UPDATE}/${tim.id}/status`, {
        status: newStatus,
      });

      tim.status = newStatus;
      toastStore.success(`Tim ${tim.nama_tim} kini ${newStatus}.`);
    } catch (error) {
      toastStore.error("Gagal mengubah status operasional tim.");
    } finally {
      togglingIds.delete(tim.id);
      togglingIds = new Set(togglingIds);
    }
  }

  function confirmDelete(id: string) {
    selectedItemToDelete = id;
    showDeleteModal = true;
  }

  async function executeDelete() {
    showDeleteModal = false;
    try {
      await apiClient.delete(
        `${API_ENDPOINTS.TIM.DELETE}/${selectedItemToDelete}`,
      );
      toastStore.success(`Data tim berhasil dihapus.`, "Terhapus");
      selectedItemToDelete = null;
      fetchTims();
    } catch (error) {
      toastStore.error("Gagal menghapus data tim.");
    }
  }

  const applySearch = debounce(() => handleFilterChange(), 500);
  $effect(() => {
    searchValue;
    applySearch();
  });

  let prevPage = 1;
  let prevLimit = 10;
  $effect(() => {
    let shouldFetch = false;
    if (meta.limit !== prevLimit) {
      prevLimit = meta.limit;
      meta.page = 1;
      prevPage = 1;
      shouldFetch = true;
      isAppending = false;
    } else if (meta.page !== prevPage) {
      prevPage = meta.page;
      shouldFetch = true;
    }
    if (shouldFetch) {
      fetchTims(isAppending);
      isAppending = false;
    }
  });
</script>

<div class="max-w-full mx-auto flex flex-col gap-4 md:gap-6">
  <Card>
    <CardHeader
      title="Manajemen Tim"
      description="Kelola tim operasional, afiliasi cabang, dan hak akses program/rekening."
      icon={Users}
      iconColor="text-(--color-primary)"
    />
    <CardContent class="pb-3">
      <TableToolbar
        bind:searchValue
        searchPlaceholder="Cari nama tim..."
        class="mb-4 flex flex-row gap-3 items-start md:items-center justify-between"
        searchWrapperClass="flex-1"
        actionsClass="flex items-center gap-2 shrink-0"
        filterLabelClass="hidden sm:inline"
        filterActive={!!selectedStatus || !!selectedCabang}
        onResetFilter={resetFilters}
        onApplyFilter={applyModalFilter}
      >
        {#snippet extraActions()}
          <Button
            variant="primary"
            onclick={() => goto(ROUTES.TIM.CREATE)}
            class="whitespace-nowrap"
          >
            <Plus size={16} /> <span class="hidden sm:inline">Tambah Tim</span>
          </Button>
        {/snippet}

        {#snippet filterContent()}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <Select
                label="Status Operasional"
                options={statusOptions}
                bind:value={selectedStatus}
                placeholder="Semua Status"
              />
            </div>
            <div class="flex flex-col gap-2">
              <Select
                label="Filter Cabang"
                options={cabangOptions}
                bind:value={selectedCabang}
                placeholder="Semua Cabang"
                searchable={true}
              />
            </div>
          </div>
        {/snippet}
      </TableToolbar>

      <div class="hidden md:block mb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Tim</TableHead>
              <TableHead>Cabang Induk</TableHead>
              <TableHead>Akses Modul</TableHead>
              <TableHead>Jumlah User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {#each tims as tim (tim.id)}
              <TableRow>
                <TableCell>
                  <span class="font-bold text-sm text-gray-900"
                    >{tim.nama_tim}</span
                  >
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-1.5 text-gray-600">
                    <Building2 size={16} />
                    <span class="text-sm font-medium"
                      >{tim.cabang?.nama_cabang || "-"}</span
                    >
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex flex-col gap-1">
                    <div
                      class="flex items-center gap-1.5 text-xs text-gray-500"
                    >
                      <Layers size={14} />
                      <span>{tim.programs?.length || 0} Program</span>
                    </div>
                    <div
                      class="flex items-center gap-1.5 text-xs text-gray-500"
                    >
                      <CreditCard size={14} />
                      <span>{tim.rekenings?.length || 0} Rekening</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-1.5 text-gray-600">
                    <User size={16} />
                    <span class="font-bold text-sm text-gray-900"
                      >{tim.user_count || 0} User</span
                    >
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <ToggleSwitch
                      size="sm"
                      checked={tim.status?.toLowerCase() === "aktif"}
                      isLoading={togglingIds.has(tim.id)}
                      onchange={(newChecked) =>
                        handleToggleStatus(tim, newChecked)}
                    />
                    <span
                      class={`text-xs font-semibold uppercase tracking-wide ${tim.status?.toLowerCase() === "aktif" ? "text-emerald-600" : "text-gray-400"}`}
                    >
                      {tim.status === "aktif" ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                </TableCell>
                <TableCell class="text-right">
                  <Dropdown width="w-36" align="right">
                    {#snippet trigger()}
                      <Button variant="ghost" size="sm" class="p-0!">
                        <Ellipsis size={20} />
                      </Button>
                    {/snippet}
                    <DropdownItem
                      icon={Pencil}
                      onclick={() => goto(ROUTES.TIM.EDIT(tim.id))}
                      >Ubah Data</DropdownItem
                    >
                    <div class="border-t border-(--color-border) my-1"></div>
                    <DropdownItem
                      icon={Trash2}
                      variant="danger"
                      onclick={() => confirmDelete(tim.id)}>Hapus</DropdownItem
                    >
                  </Dropdown>
                </TableCell>
              </TableRow>
            {:else}
              <TableRow>
                <TableCell colspan={6} class="h-40 text-center text-gray-500">
                  {#if isLoading}
                    <LoadingBars size={50} class="text-(--color-primary)" />
                  {:else}
                    <span class="text-sm"
                      >Tidak ada data tim yang ditemukan.</span
                    >
                  {/if}
                </TableCell>
              </TableRow>
            {/each}
          </TableBody>
        </Table>
      </div>

      <div class="md:hidden flex flex-col bg-gray-50/30 gap-3">
        {#each tims as tim (tim.id)}
          <EntityCard
            title={tim.nama_tim}
            subtitle={tim.cabang?.nama_cabang || "-"}
            titleIcon={Users}
            metrics={[
              {
                label: "Program",
                value: `${tim.programs?.length || 0}`,
                icon: Layers,
              },
              {
                label: "Rekening",
                value: `${tim.rekenings?.length || 0}`,
                icon: CreditCard,
              },
              { label: "User", value: `${tim.user_count || 0}`, icon: User },
            ]}
            hasToggle={true}
            statusLabel={tim.status === "aktif" ? "Aktif" : "Nonaktif"}
            isToggling={togglingIds.has(tim.id)}
            onToggle={(newChecked) => handleToggleStatus(tim, newChecked)}
          >
            {#snippet actions()}
              <Dropdown width="w-32" align="right">
                {#snippet trigger()}
                  <button class="text-gray-400 hover:text-gray-700 p-1"
                    ><Ellipsis size={18} /></button
                  >
                {/snippet}
                <DropdownItem
                  icon={Pencil}
                  onclick={() => goto(`/tim/edit/${tim.id}`)}>Edit</DropdownItem
                >
                <div class="border-t border-(--color-border) my-1"></div>
                <DropdownItem
                  icon={Trash2}
                  variant="danger"
                  onclick={() => confirmDelete(tim.id)}>Hapus</DropdownItem
                >
              </Dropdown>
            {/snippet}
          </EntityCard>
        {:else}
          <div
            class="py-10 flex justify-center text-center text-sm text-gray-500 border border-dashed rounded-lg"
          >
            {#if isLoading}
              <LoadingBars size={35} class="text-(--color-primary)" />
            {:else}
              Tidak ada data tim yang ditemukan.
            {/if}
          </div>
        {/each}
      </div>
    </CardContent>

    <CardFooter class="p-3! md:px-6!">
      {#if tims.length > 0}
        <div class="md:hidden w-full">
          {#if meta.page < meta.total_page}
            <Button
              variant="outline"
              class="w-full py-2.5 text-sm"
              onclick={loadMore}
              disabled={isLoading}
            >
              {isLoading ? "Memuat..." : "Tampilkan Lebih Banyak"}
            </Button>
          {:else}
            <p class="text-center text-xs text-gray-400">
              Semua data telah ditampilkan
            </p>
          {/if}
        </div>
        <div class="hidden md:block w-full">
          <Pagination
            bind:currentPage={meta.page}
            bind:pageSize={meta.limit}
            totalPages={meta.total_page}
            totalData={meta.total_data}
          />
        </div>
      {/if}
    </CardFooter>
  </Card>
</div>

{#if showDeleteModal}
  <Modal title="Konfirmasi Hapus" open={showDeleteModal}>
    <p class="text-sm text-gray-600 mb-6">
      Apakah Anda yakin ingin menghapus data tim ini? Akses mereka ke program
      dan rekening akan terputus.
    </p>
    <div class="flex justify-end gap-3">
      <Button variant="outline" onclick={() => (showDeleteModal = false)}
        >Batal</Button
      >
      <Button variant="danger" onclick={executeDelete}>Ya, Hapus Tim</Button>
    </div>
  </Modal>
{/if}
