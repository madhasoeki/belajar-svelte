<script lang="ts">
  import { Card, CardHeader, CardContent, SimpleTableCard, CardFooter, MobileOverviewCard, SummaryCard } from "$lib/components/ui/card";
  import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableToolbar } from "$lib/components/ui/table";
  import Pagination from "$lib/components/ui/pagination/Pagination.svelte";
  import Button from "$lib/components/ui/button/Button.svelte";
  import Modal from "$lib/components/ui/modal/Modal.svelte";
  import LoadingBars from "$lib/components/ui/loading/LoadingBars.svelte";
  import Dropdown from "$lib/components/ui/dropdown/Dropdown.svelte";
  import DropdownItem from "$lib/components/ui/dropdown/DropdownItem.svelte";
  
  import { toastStore } from "$lib/stores/toast.svelte";
  import { debounce } from "$lib/utils/helpers";
  import { apiClient } from "$lib/utils/api";
  import { API_ENDPOINTS } from "$lib/constans/endpoints";
  
  import { Trash2, Eye, Pencil, Users, Building2, Layers, CreditCard, Ellipsis } from "lucide-svelte";
  import { goto } from "$app/navigation";

  let tims = $state<any[]>([]);
  let meta = $state({ page: 1, limit: 10, total_page: 1, total_data: 0 });
  let isLoading = $state(true);
  let isAppending = $state(false);
  let searchValue = $state("");

  let showDeleteModal = $state(false);
  let selectedItemToDelete = $state<string | null>(null);

  function buildQueryParams() {
    const params = new URLSearchParams();
    params.append("page", meta.page.toString());
    params.append("limit", meta.limit.toString());
    if (searchValue) params.append("q", searchValue);
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

  function confirmDelete(id: string) {
    selectedItemToDelete = id;
    showDeleteModal = true;
  }

  async function executeDelete() {
    showDeleteModal = false;
    try {
      await apiClient.delete(`${API_ENDPOINTS.TIM.DELETE}/${selectedItemToDelete}`);
      toastStore.success(`Data tim berhasil dihapus.`, "Terhapus");
      selectedItemToDelete = null;
      fetchTims();
    } catch (error) {
      toastStore.error("Gagal menghapus data tim.");
    }
  }

  const applySearch = debounce(() => handleFilterChange(), 500);
  $effect(() => { searchValue; applySearch(); });

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
  
  <div class="w-full min-w-0">
    <div class="hidden md:grid lg:grid-cols-2 md:gap-4 lg:gap-6 w-full">
      <SummaryCard label="Total Tim Aktif" value={meta.total_data} icon={Users} variant="primary" />
    </div>
  </div>

  <Card>
    <CardHeader title="Manajemen Tim" description="Kelola tim operasional, afiliasi cabang, dan hak akses program/rekening." icon={Users} iconColor="text-(--color-primary)" />
    <CardContent class="pb-3">
      
      <TableToolbar bind:searchValue searchPlaceholder="Cari nama tim..." class="mb-4 flex flex-row gap-3 items-center justify-between" searchWrapperClass="w-full md:w-1/2" searchInputClass="w-full">
        {#snippet extraActions()}
          <Button variant="primary" onclick={() => goto("/tim/tambah")} class="flex items-center gap-2">
            <span class="hidden sm:inline">Tambah Tim</span>
          </Button>
        {/snippet}
      </TableToolbar>

      <div class="hidden md:block mb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Tim</TableHead>
              <TableHead>Cabang Induk</TableHead>
              <TableHead>Akses Modul</TableHead>
              <TableHead class="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {#each tims as tim (tim.id)}
              <TableRow>
                <TableCell>
                  <span class="font-bold text-sm text-gray-900">{tim.nama_tim}</span>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-1.5 text-gray-600">
                    <Building2 size={16} />
                    <span class="text-sm font-medium">{tim.cabang?.nama_cabang || "-"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-1.5 text-xs text-gray-500">
                      <Layers size={14} /> <span>{tim.programs?.length || 0} Program</span>
                    </div>
                    <div class="flex items-center gap-1.5 text-xs text-gray-500">
                      <CreditCard size={14} /> <span>{tim.rekenings?.length || 0} Rekening</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell class="text-right">
                  <Dropdown width="w-36" align="right">
                    {#snippet trigger()}
                      <Button variant="ghost" size="sm" class="p-0!">
                        <Ellipsis size={20} />
                      </Button>
                    {/snippet}
                    <DropdownItem icon={Eye} onclick={() => console.log("Detail", tim.id)}>Lihat Detail</DropdownItem>
                    <DropdownItem icon={Pencil} onclick={() => goto(`/tim/edit/${tim.id}`)}>Ubah Data</DropdownItem>
                    <div class="border-t border-(--color-border) my-1"></div>
                    <DropdownItem icon={Trash2} variant="danger" onclick={() => confirmDelete(tim.id)}>Hapus</DropdownItem>
                  </Dropdown>
                </TableCell>
              </TableRow>
            {:else}
              <TableRow>
                <TableCell colspan={4} class="h-40 text-center text-gray-500">
                  {#if isLoading}
                    <LoadingBars size={50} class="text-(--color-primary)" />
                  {:else}
                    <span class="text-sm">Tidak ada data tim yang ditemukan.</span>
                  {/if}
                </TableCell>
              </TableRow>
            {/each}
          </TableBody>
        </Table>
      </div>

      <div class="md:hidden flex flex-col bg-gray-50/30 gap-3">
        {#each tims as tim (tim.id)}
          <SimpleTableCard 
            name={tim.nama_tim} 
            program={tim.cabang?.nama_cabang || "-"} 
            amount={`${tim.programs?.length || 0} Program`} 
            amountPrefix="" 
          />
        {/each}
      </div>
    </CardContent>

    <CardFooter class="p-3! md:px-6!">
      {#if tims.length > 0}
        <div class="hidden md:block w-full">
          <Pagination bind:currentPage={meta.page} bind:pageSize={meta.limit} totalPages={meta.total_page} totalData={meta.total_data} />
        </div>
      {/if}
    </CardFooter>
  </Card>
</div>

{#if showDeleteModal}
  <Modal title="Konfirmasi Hapus" open={showDeleteModal}>
    <p class="text-sm text-gray-600 mb-6">Apakah Anda yakin ingin menghapus data tim ini? Akses mereka ke program dan rekening akan terputus.</p>
    <div class="flex justify-end gap-3">
      <Button variant="outline" onclick={() => (showDeleteModal = false)}>Batal</Button>
      <Button variant="danger" onclick={executeDelete}>Ya, Hapus Tim</Button>
    </div>
  </Modal>
{/if}