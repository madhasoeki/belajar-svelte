<script lang="ts">
  // ===========================================================================
  // --- 1. IMPORTS
  // ===========================================================================
  import { Card, CardHeader, CardContent, CardFooter, EntityCard } from "$lib/components/ui/card";
  import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableToolbar } from "$lib/components/ui/table";
  import { Select, MultiSelect } from "$lib/components/ui/forms"; // [UPDATE] Import MultiSelect
  import Pagination from "$lib/components/ui/pagination/Pagination.svelte";
  import Button from "$lib/components/ui/button/Button.svelte";
  import Modal from "$lib/components/ui/modal/Modal.svelte";
  import LoadingBars from "$lib/components/ui/loading/LoadingBars.svelte";
  import ToggleSwitch from "$lib/components/ui/forms/ToggleSwitch.svelte"; 

  import { toastStore } from "$lib/stores/toast.svelte";
  import { debounce } from "$lib/utils/helpers";
  import { apiClient } from "$lib/utils/api";
  import { API_ENDPOINTS } from "$lib/constans/endpoints";

  import { Trash2, Pencil, UserCog, ShieldCheck, Building2, Users, Ellipsis, Plus, Phone, Mail } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import { Dropdown, DropdownItem } from "$lib/components/ui/dropdown";

  // ===========================================================================
  // --- 2. STATE: CORE DATA & PAGINATION
  // ===========================================================================
  let users = $state<any[]>([]);
  let meta = $state({ page: 1, limit: 10, total_page: 1, total_data: 0 });
  let isLoading = $state(true);
  let isAppending = $state(false);

  let togglingIds = $state<Set<string>>(new Set());

  // ===========================================================================
  // --- 3. STATE: FILTERS
  // ===========================================================================
  let searchValue = $state("");
  let selectedStatus = $state("");
  
  // [UPDATE] Filter multiselect menggunakan array
  let selectedRole = $state<string[]>([]);
  let selectedCabang = $state<string[]>([]); 
  let selectedTim = $state<string[]>([]); 

  const statusOptions = [
    { label: "Aktif", value: "aktif" },
    { label: "Tidak Aktif", value: "nonaktif" },
  ];

  let roleOptions = $state<{label: string, value: string}[]>([]);
  let cabangOptions = $state<{label: string, value: string}[]>([]); 
  let timOptions = $state<{label: string, value: string}[]>([]); 

  // ===========================================================================
  // --- 4. MODALS
  // ===========================================================================
  let showDeleteModal = $state(false);
  let selectedItemToDelete = $state<string | null>(null);

  // ===========================================================================
  // --- 5. API FETCHING & URL BUILDER
  // ===========================================================================
  $effect(() => {
    async function fetchFilterMasters() {
      try {
        const [resRole, resCabang, resTim] = await Promise.all([
          apiClient.get(API_ENDPOINTS.ROLE.LIST),
          apiClient.get(API_ENDPOINTS.CABANG.LIST),
          apiClient.get(API_ENDPOINTS.TIM.LIST)
        ]);
        
        roleOptions = (resRole.data || []).map((r: any) => ({ label: r.nama_role, value: r.id }));
        cabangOptions = (resCabang.data || []).map((c: any) => ({ label: c.nama_cabang, value: c.id }));
        timOptions = (resTim.data || []).map((t: any) => ({ label: t.nama_tim, value: t.id }));
      } catch (error) {
        console.error("Gagal memuat opsi filter.");
      }
    }
    if (roleOptions.length === 0) fetchFilterMasters();
  });

  function buildQueryParams() {
    const params = new URLSearchParams();
    params.append("page", meta.page.toString());
    params.append("limit", meta.limit.toString());
    if (searchValue) params.append("q", searchValue);
    if (selectedStatus) params.append("status", selectedStatus); 
    
    // [UPDATE] Gabungkan array id menjadi string dengan pemisah koma
    if (selectedRole.length > 0) params.append("role_id", selectedRole.join(",")); 
    if (selectedCabang.length > 0) params.append("cabang_id", selectedCabang.join(",")); 
    if (selectedTim.length > 0) params.append("tim_id", selectedTim.join(",")); 
    
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
    fetchUsers();
  }

  function resetFilters() {
    selectedStatus = "";
    selectedRole = [];
    selectedCabang = []; 
    selectedTim = [];
    handleFilterChange();
  }

  function applyModalFilter() {
    handleFilterChange();
  }

  async function handleToggleStatus(user: any, newChecked: boolean) {
    const newStatus = newChecked ? "aktif" : "nonaktif";

    togglingIds.add(user.id);
    togglingIds = new Set(togglingIds);

    try {
      await apiClient.patch(`${API_ENDPOINTS.USER.UPDATE}/${user.id}/status`, {
        status: newStatus,
      });

      user.status = newStatus;
      toastStore.success(`Status ${user.nama_lengkap} kini ${newStatus}.`);
    } catch (error) {
      toastStore.error("Gagal mengubah status operasional user.");
    } finally {
      togglingIds.delete(user.id);
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
      await apiClient.delete(`${API_ENDPOINTS.USER.DELETE}/${selectedItemToDelete}`);
      toastStore.success(`Data user berhasil dihapus.`, "Terhapus");
      selectedItemToDelete = null;
      fetchUsers();
    } catch (error) {
      toastStore.error("Gagal menghapus data user.");
    }
  }

  // ===========================================================================
  // --- 7. REACTIVE EFFECTS ($effect)
  // ===========================================================================
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
</script>

<div class="max-w-full mx-auto flex flex-col gap-4 md:gap-6">

  <Card>
    <CardHeader title="Manajemen Pengguna" description="Kelola hak akses, penempatan, dan status operasional staf." icon={UserCog} iconColor="text-(--color-primary)" />
    <CardContent class="pb-3">
      
      <TableToolbar 
        bind:searchValue 
        searchPlaceholder="Cari nama atau email..." 
        class="mb-4 flex flex-row gap-3 items-start md:items-center justify-between" 
        searchWrapperClass="flex-1" 
        actionsClass="flex items-center gap-2 shrink-0" 
        filterLabelClass="hidden sm:inline" 
        filterActive={!!selectedStatus || selectedRole.length > 0 || selectedCabang.length > 0 || selectedTim.length > 0} 
        onResetFilter={resetFilters} 
        onApplyFilter={applyModalFilter}
      >
        {#snippet extraActions()}
          <Button variant="primary" onclick={() => goto("/user/tambah")} class="whitespace-nowrap">
            <Plus size={16} /> <span class="hidden sm:inline">Tambah User</span>
          </Button>
        {/snippet}

        {#snippet filterContent()}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="flex flex-col gap-2">
              <Select label="Status" options={statusOptions} bind:value={selectedStatus} placeholder="Semua Status" />
            </div>
            <div class="flex flex-col gap-2 z-30">
              <MultiSelect label="Role Akses" options={roleOptions} bind:values={selectedRole} placeholder="Semua Role" searchPlaceholder="Cari role..." />
            </div>
            <div class="flex flex-col gap-2 z-20">
              <MultiSelect label="Cabang" options={cabangOptions} bind:values={selectedCabang} placeholder="Semua Cabang" searchPlaceholder="Cari cabang..." />
            </div>
            <div class="flex flex-col gap-2 z-10">
              <MultiSelect label="Tim" options={timOptions} bind:values={selectedTim} placeholder="Semua Tim" searchPlaceholder="Cari tim..." />
            </div>
          </div>
        {/snippet}
      </TableToolbar>

      <div class="hidden md:block mb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pengguna & Role</TableHead>
              <TableHead>Kontak</TableHead>
              <TableHead>Penempatan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {#each users as user (user.id)}
              <TableRow>
                <TableCell>
                  <div class="flex flex-col gap-1">
                    <span class="font-bold text-sm text-gray-900 leading-none">{user.nama_lengkap}</span>
                    <div class="flex items-center gap-1.5 text-emerald-600 font-medium text-[11px] mt-0.5">
                      <ShieldCheck size={12} /> <span>{user.role?.nama_role || "Tanpa Role"}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex flex-col gap-1.5">
                    <div class="flex items-center gap-1.5 text-gray-600">
                      <Phone size={14} class="shrink-0" />
                      <span class="text-xs font-medium">{user.nomor_hp || "-"}</span>
                    </div>
                    <div class="flex items-center gap-1.5 text-gray-600">
                      <Mail size={14} class="shrink-0" />
                      <span class="text-xs">{user.email || "-"}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex flex-col gap-1.5">
                    <div class="flex items-center gap-1.5 text-xs text-gray-700">
                      <Building2 size={14} /> <span>{user.cabang?.nama_cabang || "Pusat"}</span>
                    </div>
                    {#if user.tim}
                      <div class="flex items-center gap-1.5 text-xs text-gray-500">
                        <Users size={14} /> <span>{user.tim.nama_tim}</span>
                      </div>
                    {/if}
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <ToggleSwitch 
                      size="sm" 
                      checked={user.status?.toLowerCase() === "aktif"} 
                      isLoading={togglingIds.has(user.id)} 
                      onchange={(newChecked) => handleToggleStatus(user, newChecked)} 
                    />
                    <span class={`text-xs font-semibold uppercase tracking-wide ${user.status?.toLowerCase() === "aktif" ? "text-emerald-600" : "text-gray-400"}`}>
                      {user.status === "aktif" ? "Aktif" : "Nonaktif"}
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
          <EntityCard
            title={user.nama_lengkap}
            subtitle={user.email || "Tanpa Email"}
            titleIcon={UserCog}
            metrics={[
              { label: "Nomor HP", value: user.nomor_hp || "-", icon: Phone },
              { label: "Cabang", value: user.cabang?.nama_cabang || "Pusat", icon: Building2 },
              { label: "Email", value: user.role?.nama_role || "Tanpa Role", icon: ShieldCheck },
              { label: "Tim", value: user.tim?.nama_tim || "Tanpa Tim", icon: Users }
            ]}
            hasToggle={true}
            statusLabel={user.status === "aktif" ? "Aktif" : "Nonaktif"}
            isToggling={togglingIds.has(user.id)}
            onToggle={(newChecked) => handleToggleStatus(user, newChecked)}
          >
            {#snippet actions()}
              <Dropdown width="w-32" align="right">
                {#snippet trigger()}
                  <button class="text-gray-400 hover:text-gray-700 p-1"><Ellipsis size={18} /></button>
                {/snippet}
                <DropdownItem icon={Pencil} onclick={() => goto(`/user/edit/${user.id}`)}>Edit</DropdownItem>
                <div class="border-t border-(--color-border) my-1"></div>
                <DropdownItem icon={Trash2} variant="danger" onclick={() => confirmDelete(user.id)}>Hapus</DropdownItem>
              </Dropdown>
            {/snippet}
          </EntityCard>
        {:else}
          <div class="py-10 flex justify-center text-center text-sm text-gray-500 border border-dashed rounded-lg">
            {#if isLoading}
              <LoadingBars size={35} class="text-(--color-primary)" />
            {:else}
              Tidak ada data user yang ditemukan.
            {/if}
          </div>
        {/each}
      </div>
    </CardContent>

    <CardFooter class="p-3! md:px-6!">
      {#if users.length > 0}
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
    <p class="text-sm text-gray-600 mb-6">Apakah Anda yakin ingin menghapus user ini? Akses mereka ke sistem akan dicabut permanen.</p>
    <div class="flex justify-end gap-3">
      <Button variant="outline" onclick={() => (showDeleteModal = false)}>Batal</Button>
      <Button variant="danger" onclick={executeDelete}>Ya, Hapus User</Button>
    </div>
  </Modal>
{/if}