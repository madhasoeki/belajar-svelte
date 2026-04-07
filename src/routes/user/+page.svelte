<script lang="ts">
  import { Card, CardHeader, CardContent, SimpleTableCard, CardFooter, SummaryCard } from "$lib/components/ui/card";
  import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableToolbar } from "$lib/components/ui/table";
  import Pagination from "$lib/components/ui/pagination/Pagination.svelte";
  import Button from "$lib/components/ui/button/Button.svelte";
  import Modal from "$lib/components/ui/modal/Modal.svelte";
  import Badge from "$lib/components/ui/badge/Badge.svelte";
  import LoadingBars from "$lib/components/ui/loading/LoadingBars.svelte";
  import Dropdown from "$lib/components/ui/dropdown/Dropdown.svelte";
  import DropdownItem from "$lib/components/ui/dropdown/DropdownItem.svelte";
  
  import { toastStore } from "$lib/stores/toast.svelte";
  import { debounce } from "$lib/utils/helpers";
  import { apiClient } from "$lib/utils/api";
  import { API_ENDPOINTS } from "$lib/constans/endpoints";
  
  import { Trash2, Eye, Pencil, UserCog, ShieldCheck, Building2, Users, Ellipsis } from "lucide-svelte";
  import { goto } from "$app/navigation";

  let users = $state<any[]>([]);
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

  async function fetchUsers(append = false) {
    isLoading = true;
    try {
      const qs = buildQueryParams();
      const response = await apiClient.get(`${API_ENDPOINTS.USER.LIST}?${qs}`);

      if (append) {
        users = [...users, ...(response.data || [])];
      } else {
        users = response.data || [];
      }
      if (response.meta) meta = response.meta;
    } catch (error) {
      toastStore.error("Gagal mengambil data user dari server.", "Error");
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
    fetchUsers();
  }

  function confirmDelete(id: string) {
    selectedItemToDelete = id;
    showDeleteModal = true;
  }

  async function executeDelete() {
    showDeleteModal = false;
    try {
      await apiClient.delete(`${API_ENDPOINTS.USER.DELETE}/${selectedItemToDelete}`);
      toastStore.success(`Data user berhasil dihapus.`, "Terhapus");
      selectedItemToDelete = null;
      fetchUsers();
    } catch (error) {
      toastStore.error("Gagal menghapus data user.");
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
      fetchUsers(isAppending);
      isAppending = false;
    }
  });

  function getStatusVariant(status: string) {
    return status.toLowerCase() === "aktif" ? "success" : "danger";
  }
</script>

<div class="max-w-full mx-auto flex flex-col gap-4 md:gap-6">
  
  <div class="w-full min-w-0">
    <div class="hidden md:grid lg:grid-cols-2 md:gap-4 lg:gap-6 w-full">
      <SummaryCard label="Total Pengguna" value={meta.total_data} icon={UserCog} variant="primary" />
    </div>
  </div>

  <Card>
    <CardHeader title="Manajemen Pengguna" description="Kelola hak akses, afiliasi cabang, dan status aktif staf." icon={UserCog} iconColor="text-(--color-primary)" />
    <CardContent class="pb-3">
      
      <TableToolbar bind:searchValue searchPlaceholder="Cari nama atau email..." class="mb-4 flex flex-row gap-3 items-center justify-between" searchWrapperClass="w-full md:w-1/2" searchInputClass="w-full">
        {#snippet extraActions()}
          <Button variant="primary" onclick={() => goto("/user/tambah")} class="flex items-center gap-2">
            <span class="hidden sm:inline">Tambah User</span>
          </Button>
        {/snippet}
      </TableToolbar>

      <div class="hidden md:block mb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Identitas Pengguna</TableHead>
              <TableHead>Role / Hak Akses</TableHead>
              <TableHead>Afiliasi Cabang & Tim</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {#each users as user (user.id)}
              <TableRow>
                <TableCell>
                  <div class="flex flex-col gap-0.5">
                    <span class="font-bold text-sm text-gray-900 leading-none">{user.nama}</span>
                    <span class="text-xs text-gray-500 font-medium">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-1.5 text-gray-700">
                    <ShieldCheck size={16} class="text-emerald-500" />
                    <span class="font-bold text-sm">{user.role?.nama_role || "-"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-1.5 text-xs text-gray-600">
                      <Building2 size={14} /> <span>{user.cabang?.nama_cabang || "Pusat"}</span>
                    </div>
                    <div class="flex items-center gap-1.5 text-xs text-gray-600">
                      <Users size={14} /> <span>{user.tim?.nama_tim || "Tanpa Tim"}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(user.status)} size="sm" class="uppercase text-[10px] tracking-wider">
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell class="text-right">
                  <Dropdown width="w-36" align="right">
                    {#snippet trigger()}
                      <Button variant="ghost" size="sm" class="p-0!">
                        <Ellipsis size={20} />
                      </Button>
                    {/snippet}
                    <DropdownItem icon={Pencil} onclick={() => goto(`/user/edit/${user.id}`)}>Ubah Data</DropdownItem>
                    <div class="border-t border-(--color-border) my-1"></div>
                    <DropdownItem icon={Trash2} variant="danger" onclick={() => confirmDelete(user.id)}>Hapus</DropdownItem>
                  </Dropdown>
                </TableCell>
              </TableRow>
            {:else}
              <TableRow>
                <TableCell colspan={5} class="h-40 text-center text-gray-500">
                  {#if isLoading}
                    <LoadingBars size={50} class="text-(--color-primary)" />
                  {:else}
                    <span class="text-sm">Tidak ada data user yang ditemukan.</span>
                  {/if}
                </TableCell>
              </TableRow>
            {/each}
          </TableBody>
        </Table>
      </div>

      <div class="md:hidden flex flex-col bg-gray-50/30 gap-3">
        {#each users as user (user.id)}
          <SimpleTableCard 
            name={user.nama} 
            phone={user.email}
            program={user.role?.nama_role || "-"} 
            amount={user.cabang?.nama_cabang || "Pusat"} 
            amountPrefix=""
            statusLabel={user.status}
            statusVariant={getStatusVariant(user.status)}
          />
        {/each}
      </div>
    </CardContent>

    <CardFooter class="p-3! md:px-6!">
      {#if users.length > 0}
        <div class="hidden md:block w-full">
          <Pagination bind:currentPage={meta.page} bind:pageSize={meta.limit} totalPages={meta.total_page} totalData={meta.total_data} />
        </div>
      {/if}
    </CardFooter>
  </Card>
</div>

{#if showDeleteModal}
  <Modal title="Konfirmasi Hapus" open={showDeleteModal}>
    <p class="text-sm text-gray-600 mb-6">Apakah Anda yakin ingin menghapus user ini? Akses mereka ke sistem akan dicabut permanen.</p>
    <div class="flex justify-end gap-3">
      <Button variant="outline" onclick={() => (showDeleteModal = false)}>Batal</Button>
      <Button variant="danger" onclick={executeDelete}>Ya, Hapus User</Button>
    </div>
  </Modal>
{/if}