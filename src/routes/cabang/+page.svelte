<script lang="ts">
  // ===========================================================================
  // --- 1. IMPORTS
  // ===========================================================================
  import { Card, CardHeader, CardContent, SimpleTableCard, CardFooter, MobileOverviewCard, SummaryCard, EntityCard } from "$lib/components/ui/card";
  import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableToolbar } from "$lib/components/ui/table";
  import { Select } from "$lib/components/ui/forms";
  import Pagination from "$lib/components/ui/pagination/Pagination.svelte";
  import Button from "$lib/components/ui/button/Button.svelte";
  import Modal from "$lib/components/ui/modal/Modal.svelte";
  import LoadingBars from "$lib/components/ui/loading/LoadingBars.svelte";
  import ToggleSwitch from "$lib/components/ui/forms/ToggleSwitch.svelte"; // [BARU] Import Toggle
  import Badge from "$lib/components/ui/badge/Badge.svelte";

  import { toastStore } from "$lib/stores/toast.svelte";
  import { debounce } from "$lib/utils/helpers";
  import { apiClient } from "$lib/utils/api";
  import { API_ENDPOINTS } from "$lib/constans/endpoints";

  import { Trash2, Eye, Pencil, Building2, MapPin, Users, Ellipsis, Plus } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import { Dropdown, DropdownItem } from "$lib/components/ui/dropdown";

  // ===========================================================================
  // --- 2. STATE: CORE DATA & PAGINATION
  // ===========================================================================
  let cabangs = $state<any[]>([]);
  let meta = $state({ page: 1, limit: 10, total_page: 1, total_data: 0 });
  let isLoading = $state(true);
  let isAppending = $state(false);

  // Menyimpan ID cabang yang sedang diproses toggle-nya (mencegah double click)
  let togglingIds = $state<Set<string>>(new Set());

  // ===========================================================================
  // --- 3. STATE: SUMMARY & FILTERS
  // ===========================================================================
  let summary = $state({ total_cabang: 0, total_tim: 0, trend_cabang: 0, trend_tim: 0 });
  let searchValue = $state("");
  let selectedStatus = $state(""); // [BARU] State untuk filter status

  const statusOptions = [
    { label: "Aktif", value: "aktif" },
    { label: "Tidak Aktif", value: "tidak aktif" },
  ];

  // ===========================================================================
  // --- 4. STATE: MODALS
  // ===========================================================================
  let showDeleteModal = $state(false);
  let selectedItemToDelete = $state<string | null>(null);

  // ===========================================================================
  // --- 5. API FETCHING & URL BUILDER
  // ===========================================================================
  function buildQueryParams() {
    const params = new URLSearchParams();
    params.append("page", meta.page.toString());
    params.append("limit", meta.limit.toString());
    if (searchValue) params.append("q", searchValue);
    if (selectedStatus) params.append("status", selectedStatus); // [BARU] Sisipkan status ke query
    return params.toString();
  }

  async function fetchCabangs(append = false) {
    isLoading = true;
    try {
      const qs = buildQueryParams();
      const response = await apiClient.get(`${API_ENDPOINTS.CABANG.LIST}?${qs}`);

      if (append) {
        cabangs = [...cabangs, ...(response.data || [])];
      } else {
        cabangs = response.data || [];
      }

      if (response.meta) meta = response.meta;
      if (response.summary) summary = response.summary;
    } catch (error) {
      toastStore.error("Gagal mengambil data cabang dari server.", "Error");
    } finally {
      isLoading = false;
    }
  }

  // ===========================================================================
  // --- 6. HANDLERS (FILTERS & ACTIONS)
  // ===========================================================================
  function loadMore() {
    if (meta.page < meta.total_page) {
      isAppending = true;
      meta.page++;
    }
  }

  function handleFilterChange() {
    meta.page = 1;
    fetchCabangs();
  }

  // [BARU] Handler untuk reset dan apply filter dari Toolbar
  function resetFilters() {
    selectedStatus = "";
    handleFilterChange();
  }

  function applyModalFilter() {
    handleFilterChange();
  }

  // [BARU] Handler untuk Toggle Status di tabel
  async function handleToggleStatus(cabang: any, newChecked: boolean) {
    const newStatus = newChecked ? "aktif" : "tidak aktif";

    togglingIds.add(cabang.id);
    togglingIds = new Set(togglingIds); // Pancing reaktivitas svelte

    try {
      // Kita gunakan PATCH karena hanya mengubah sebagian data (status saja)
      await apiClient.patch(`${API_ENDPOINTS.CABANG.UPDATE_STATUS(cabang.id)}`, {
        status: newStatus,
      });

      // Update data di UI secara instan jika API sukses
      cabang.status = newStatus;
      toastStore.success(`Cabang ${cabang.nama_cabang} kini ${newStatus}.`);
    } catch (error) {
      toastStore.error("Gagal mengubah status operasional cabang.");
    } finally {
      togglingIds.delete(cabang.id);
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
      await apiClient.delete(`${API_ENDPOINTS.CABANG.DELETE}/${selectedItemToDelete}`);
      toastStore.success(`Data cabang berhasil dihapus dari sistem.`, "Terhapus");
      selectedItemToDelete = null;
      fetchCabangs();
    } catch (error) {
      toastStore.error("Gagal menghapus cabang.");
    }
  }

  // ===========================================================================
  // --- 7. REACTIVE EFFECTS ($effect)
  // ===========================================================================
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
      fetchCabangs(isAppending);
      isAppending = false;
    }
  });

  // Helper status visual
  function getStatusVariant(status: string) {
    return status?.toLowerCase() === "aktif" ? "success" : "danger";
  }
</script>

<div class="max-w-full mx-auto">
  <Card>
    <CardHeader title="Manajemen Cabang" description="Lihat dan kelola seluruh cabang dan status operasionalnya." icon={Building2} iconColor="text-(--color-primary)" />
    <CardContent class="pb-3">
      <TableToolbar bind:searchValue searchPlaceholder="Cari nama cabang atau lokasi..." class="mb-4 flex flex-row gap-3 items-start md:items-center justify-between" searchWrapperClass="flex-1" actionsClass="flex items-center gap-2 shrink-0" filterLabelClass="hidden sm:inline" filterActive={!!selectedStatus} onResetFilter={resetFilters} onApplyFilter={applyModalFilter}>
        {#snippet extraActions()}
          <Button variant="primary" onclick={() => goto("/cabang/tambah")} class="whitespace-nowrap">
            <Plus size={16} /> <span class="hidden sm:inline">Tambah Cabang</span>
          </Button>
        {/snippet}

        {#snippet filterContent()}
          <div class="grid grid-cols-1 gap-4">
            <div class="flex flex-col gap-2">
              <Select label="Status Operasional" options={statusOptions} bind:value={selectedStatus} placeholder="Semua Status" />
            </div>
          </div>
        {/snippet}
      </TableToolbar>

      <div class="hidden md:block mb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Cabang</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Jumlah Tim</TableHead>
              <TableHead>Jumlah User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {#each cabangs as cabang (cabang.id)}
              <TableRow>
                <TableCell>
                  <span class="font-bold text-sm text-gray-900">{cabang.nama_cabang}</span>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-1.5 text-gray-600">
                    <MapPin size={16} />
                    <span class="text-sm font-medium">{cabang.alamat || "-"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-1.5 text-gray-600">
                    <Users size={16} />
                    <span class="font-bold text-sm text-gray-900">{cabang.tim_count || 0} Tim</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-1.5 text-gray-600">
                    <Users size={16} />
                    <span class="font-bold text-sm text-gray-900">{cabang.user_count || 0} User</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <ToggleSwitch size="sm" checked={cabang.status?.toLowerCase() === "aktif"} isLoading={togglingIds.has(cabang.id)} onchange={(newChecked) => handleToggleStatus(cabang, newChecked)} />
                    <span class={`text-xs font-semibold uppercase tracking-wide ${cabang.status?.toLowerCase() === "aktif" ? "text-emerald-600" : "text-gray-400"}`}>
                      {cabang.status || "Tidak Aktif"}
                    </span>
                  </div>
                </TableCell>
                <TableCell class="text-right">
                  <Dropdown width="w-36" align="right">
                    {#snippet trigger()}
                      <Button variant="ghost" size="sm" class="p-0!"><Ellipsis size={20} /></Button>
                    {/snippet}
                    <DropdownItem icon={Pencil} onclick={() => goto(`/cabang/edit/${cabang.id}`)}>Ubah Data</DropdownItem>
                    <div class="border-t border-(--color-border) my-1"></div>
                    <DropdownItem icon={Trash2} variant="danger" onclick={() => confirmDelete(cabang.id)}>Hapus</DropdownItem>
                  </Dropdown>
                </TableCell>
              </TableRow>
            {:else}
              <TableRow>
                <TableCell colspan={5} class="h-40 text-center text-gray-500">
                  {#if isLoading}
                    <LoadingBars size={50} class="text-(--color-primary)" />
                  {:else}
                    <span class="text-sm">Tidak ada data cabang yang ditemukan.</span>
                  {/if}
                </TableCell>
              </TableRow>
            {/each}
          </TableBody>
        </Table>
      </div>

      <div class="md:hidden flex flex-col bg-gray-50/30 gap-3">
        {#each cabangs as cabang (cabang.id)}
          <EntityCard
            title={cabang.nama_cabang}
            subtitle={cabang.alamat || "-"}
            titleIcon={Building2}
            metrics={[
              { label: "Jumlah Tim", value: `${cabang.jumlah_tim || 0} Tim`, icon: Users }
            ]}
            hasToggle={true}
            statusLabel={cabang.status}
            isToggling={togglingIds.has(cabang.id)}
            onToggle={(newChecked) => handleToggleStatus(cabang, newChecked)}
          >
            {#snippet actions()}
              <Dropdown width="w-32" align="right">
                {#snippet trigger()}
                  <button class="text-gray-400 hover:text-gray-700 p-1">
                    <Ellipsis size={18} />
                  </button>
                {/snippet}
                <DropdownItem icon={Pencil} onclick={() => goto(`/cabang/edit/${cabang.id}`)}>Edit</DropdownItem>
                <div class="border-t border-(--color-border) my-1"></div>
                <DropdownItem icon={Trash2} variant="danger" onclick={() => confirmDelete(cabang.id)}>Hapus</DropdownItem>
              </Dropdown>
            {/snippet}
          </EntityCard>
        {:else}
          <div class="py-10 flex justify-center text-center text-sm text-gray-500 border border-dashed rounded-lg">
            {#if isLoading}
              <LoadingBars size={35} class="text-(--color-primary)" />
            {:else}
              Tidak ada data cabang yang ditemukan.
            {/if}
          </div>
        {/each}
      </div>
    </CardContent>

    <CardFooter class="p-3! md:px-6!">
      {#if cabangs.length > 0}
        <div class="md:hidden w-full">
          {#if meta.page < meta.total_page}
            <Button variant="outline" class="w-full py-2.5 text-sm" onclick={loadMore} disabled={isLoading}>
              {isLoading ? "Memuat..." : "Tampilkan Lebih Banyak"}
            </Button>
          {:else}
            <p class="text-center text-xs text-gray-400">Semua data telah ditampilkan</p>
          {/if}
        </div>
        <div class="hidden md:block w-full">
          <Pagination bind:currentPage={meta.page} bind:pageSize={meta.limit} totalPages={meta.total_page} totalData={meta.total_data} />
        </div>
      {/if}
    </CardFooter>
  </Card>
</div>

{#if showDeleteModal}
  <Modal title="Konfirmasi Hapus" open={showDeleteModal}>
    <p class="text-sm text-gray-600 mb-6">Apakah Anda yakin ingin menghapus data cabang ini? Tindakan ini tidak dapat dibatalkan.</p>
    <div class="flex justify-end gap-3">
      <Button variant="outline" onclick={() => (showDeleteModal = false)}>Batal</Button>
      <Button variant="danger" onclick={executeDelete}>Ya, Hapus Cabang</Button>
    </div>
  </Modal>
{/if}
