<script lang="ts">
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
  } from "$lib/components/ui/card";

  // Import Table Ecosystem
  import Table from "$lib/components/ui/table/Table.svelte";
  import TableHeader from "$lib/components/ui/table/TableHeader.svelte";
  import TableBody from "$lib/components/ui/table/TableBody.svelte";
  import TableRow from "$lib/components/ui/table/TableRow.svelte";
  import TableHead from "$lib/components/ui/table/TableHead.svelte";
  import TableCell from "$lib/components/ui/table/TableCell.svelte";
  import TableToolbar from "$lib/components/ui/table/TableToolbar.svelte";
  import Pagination from "$lib/components/ui/pagintaion/Pagination.svelte";

  // Import UI Components lainnya
  import Button from "$lib/components/ui/button/Button.svelte";
  import Input from "$lib/components/ui/forms/Input.svelte";
  import Checkbox from "$lib/components/ui/forms/Checkbox.svelte";
  import Avatar from "$lib/components/ui/avatar/Avatar.svelte";
  import Dropdown from "$lib/components/ui/dropdown/Dropdown.svelte";
  import DropdownItem from "$lib/components/ui/dropdown/DropdownItem.svelte";
  import Modal from "$lib/components/ui/modal/Modal.svelte";
  import { toastStore } from "$lib/stores/toast.svelte";

  import {
    Search,
    Filter,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    TriangleAlert,
    Download,
  } from "lucide-svelte";

  const users = [
    { id: "TRX-001", name: "Eleana", phone: "0812-3456-7890", email: "eleana@mail.com", status: "success", amount: "Rp 1.500.000", date: "03 Apr 2026" },
    { id: "TRX-002", name: "Ahmad Fauzi", phone: "0856-1122-3344", email: "fauzi.gudang@mail.com", status: "warning", amount: "Rp 250.000", date: "02 Apr 2026" },
    { id: "TRX-003", name: "Samsul Arif", phone: "0811-9988-7766", email: "samsul.relawan@mail.com", status: "danger", amount: "Rp 100.000", date: "01 Apr 2026" },
    { id: "TRX-004", name: "Dewi Lestari", phone: "0822-5555-4444", email: "dewi.l@mail.com", status: "success", amount: "Rp 500.000", date: "31 Mar 2026" },
  ];

  // State Management untuk Bulk Actions & Modal
  let selectedRows = $state<string[]>([]);
  let searchValue = $state("");
  let showDeleteModal = $state(false);
  let selectedItemToDelete = $state<string | null>(null);

  // Derivasi untuk Check All
  const isAllSelected = $derived(
    selectedRows.length === users.length && users.length > 0,
  );
  const isIndeterminate = $derived(
    selectedRows.length > 0 && selectedRows.length < users.length,
  );

  function toggleAll() {
    if (isAllSelected) {
      selectedRows = [];
    } else {
      selectedRows = users.map((u) => u.id);
    }
  }

  function toggleRow(id: string) {
    if (selectedRows.includes(id)) {
      selectedRows = selectedRows.filter((rowId) => rowId !== id);
    } else {
      selectedRows = [...selectedRows, id];
    }
  }

  // Handlers
  function confirmDelete(id: string) {
    selectedItemToDelete = id;
    showDeleteModal = true;
  }

  function executeDelete() {
    showDeleteModal = false;
    toastStore.success(
      `Data transaksi ${selectedItemToDelete} berhasil dihapus dari sistem.`,
      "Terhapus",
    );
    selectedItemToDelete = null;
    // Logika hapus array users dilakukan di sini jika terhubung ke backend
  }

  function handleAction(action: string, id: string) {
    toastStore.info(`Memproses ${action} untuk ${id}`, "Sistem Memproses");
  }

  // Helper untuk Badge Statis (Asumsi kamu memiliki komponen Badge, jika tidak kita pakai span styling)
  const statusStyles: Record<string, string> = {
    success: "bg-green-100 text-green-700 border-green-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    danger: "bg-red-100 text-red-700 border-red-200",
  };
  const statusLabels: Record<string, string> = {
    success: "Berhasil",
    warning: "Pending",
    danger: "Gagal",
  };

  let currentPage = $state(1);
  let perPage = $state(10);
  let totalData = 148; // Misal total data dari API
  let totalPages = $derived(Math.ceil(totalData / perPage));
</script>

<div class="p-8 max-w-7xl mx-auto pb-20 space-y-8">
  <div class="border-b pb-4">
    <h1 class="text-2xl font-bold text-gray-900">Table & Integrasi Komponen</h1>
    <p class="text-gray-500">
      Mendemonstrasikan penyatuan Table dengan Avatar, Checkbox, Dropdown,
      Modal, dan Toast.
    </p>
  </div>

  <Card>
    <CardHeader>
      <CardTitle>Master Data Transaksi</CardTitle>
      <CardDescription
        >Simulasi tabel kompleks untuk manajemen data riil.</CardDescription
      >
    </CardHeader>
    <CardContent class="space-y-4">
      <TableToolbar 
        bind:searchValue 
        selectedCount={selectedRows.length}
        onDeleteSelected={() => confirmDelete(selectedRows[0])} 
      >
        {#snippet extraActions()}
          <Button variant="primary" icon={Download}>Ekspor</Button>
        {/snippet}

        {#snippet filterContent()}
          <div class="space-y-4">
            <div>
              <div class="text-sm font-medium text-gray-700 block mb-1">Status Transaksi</div>
              <div class="flex gap-2">
                <Button variant="outline" size="sm" class="flex-1">Semua</Button>
                <Button variant="primary" size="sm" class="flex-1">Berhasil</Button>
                <Button variant="outline" size="sm" class="flex-1">Pending</Button>
              </div>
            </div>
            <div>
              <Input label="Rentang Tanggal" type="date" />
            </div>
          </div>
        {/snippet}
      </TableToolbar>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-12 text-center">
              <input
                type="checkbox"
                class="rounded border-gray-300 text-(--color-primary) focus:ring-(--color-primary)"
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onchange={toggleAll}
              />
            </TableHead>
            <TableHead>Transaksi</TableHead>
            <TableHead>Identitas Donatur</TableHead>
            <TableHead>Status & Nominal</TableHead>
            <TableHead class="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {#each users as user}
            <TableRow data-state={selectedRows.includes(user.id) ? "selected" : undefined}>
              
              <TableCell class="text-center">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-(--color-primary) focus:ring-(--color-primary)"
                  checked={selectedRows.includes(user.id)}
                  onchange={() => toggleRow(user.id)}
                />
              </TableCell>

              <TableCell>
                <div class="flex flex-col gap-1">
                  <span class="font-bold text-sm text-gray-900 leading-none">{user.id}</span>
                  <span class="text-xs text-gray-500 font-medium">{user.date}</span>
                </div>
              </TableCell>

              <TableCell>
                <div class="flex items-start gap-3">
                  <Avatar name={user.name} size="sm" shape="circle" class="mt-0.5" />
                  <div class="flex flex-col gap-0.5">
                    <span class="font-semibold text-sm leading-none text-gray-900">{user.name}</span>
                    <span class="text-xs text-gray-600">{user.phone}</span>
                    <span class="text-xs text-gray-400">{user.email}</span>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div class="flex flex-col items-start gap-1.5">
                  <span class="font-bold text-sm text-gray-900 leading-none">{user.amount}</span>
                  <span class={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusStyles[user.status]}`}>
                    {statusLabels[user.status]}
                  </span>
                </div>
              </TableCell>

              <TableCell class="text-right">
                <Dropdown width="w-36" align="right">
                  {#snippet trigger()}
                    <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                      <MoreHorizontal size={16} />
                    </Button>
                  {/snippet}
                  <DropdownItem icon={Eye} onclick={() => handleAction("lihat detail", user.id)}>Detail</DropdownItem>
                  <DropdownItem icon={Edit} onclick={() => handleAction("edit data", user.id)}>Ubah</DropdownItem>
                  <div class="border-t border-(--color-border) my-1"></div>
                  <DropdownItem icon={Trash2} variant="danger" onclick={() => confirmDelete(user.id)}>Hapus</DropdownItem>
                </Dropdown>
              </TableCell>
            </TableRow>
          {/each}
        </TableBody>
      </Table>

      <div class="pt-6 border-t border-(--color-border) mt-4">
        <Pagination
          bind:currentPage
          bind:pageSize={perPage}
          {totalPages}
          {totalData}
        />
      </div>
    </CardContent>
  </Card>
</div>

<Modal bind:open={showDeleteModal} size="sm">
  <div class="flex flex-col items-center text-center pt-4 pb-2">
    <div
      class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4"
    >
      <TriangleAlert size={24} strokeWidth={2} />
    </div>
    <h3 class="text-lg font-bold text-gray-900 mb-2">Hapus Transaksi?</h3>
    <p class="text-sm text-gray-500 px-4">
      Anda akan menghapus data <strong class="text-gray-900"
        >{selectedItemToDelete}</strong
      >. Data yang dihapus tidak dapat dikembalikan. Lanjutkan?
    </p>
  </div>

  {#snippet footer()}
    <Button
      variant="outline"
      class="w-full"
      onclick={() => (showDeleteModal = false)}>Batal</Button
    >
    <Button variant="danger" class="w-full" onclick={executeDelete}
      >Ya, Hapus Data</Button
    >
  {/snippet}
</Modal>
