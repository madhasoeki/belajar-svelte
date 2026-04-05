<script lang="ts">
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    SimpleTableCard,
    CardFooter,
  } from "$lib/components/ui/card";

  // Import Table Ecosystem
  import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    TableToolbar,
  } from "$lib/components/ui/table";
  import Pagination from "$lib/components/ui/pagintaion/Pagination.svelte";

  // Import UI Components lainnya
  import Button from "$lib/components/ui/button/Button.svelte";
  import Select from "$lib/components/ui/forms/Select.svelte"; // Untuk Status tunggal
  import MultiSelect from "$lib/components/ui/forms/MultiSelect.svelte";
  import CurrencyInput from "$lib/components/ui/forms/CurrencyInput.svelte";
  import DateRangePicker from "$lib/components/ui/forms/DateRangePicker.svelte";
  import Dropdown from "$lib/components/ui/dropdown/Dropdown.svelte";
  import DropdownItem from "$lib/components/ui/dropdown/DropdownItem.svelte";
  import Modal from "$lib/components/ui/modal/Modal.svelte";
  import Badge from "$lib/components/ui/badge/Badge.svelte";
  import { toastStore } from "$lib/stores/toast.svelte";

  import {
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    TriangleAlert,
    Download,
    ReceiptText,
  } from "lucide-svelte";

  import { formatNumber } from "$lib/utils/formatter";
  import { apiClient } from "$lib/utils/api";
  import { API_ENDPOINTS } from "$lib/constans/endpoints";

  // --- STATE TANGGAL DEFAULT (HARI INI - WAKTU LOKAL) ---
const now = new Date();
const year = now.getFullYear(); // Mengambil tahun lokal
const month = String(now.getMonth() + 1).padStart(2, '0'); // Mengambil bulan lokal (ditambah 1 karena index mulai dari 0)
const day = String(now.getDate()).padStart(2, '0'); // Mengambil tanggal lokal

const todayStr = `${year}-${month}-${day}`;

let startDate = $state(todayStr);
let endDate = $state(todayStr);

  // --- STATE DATA & META (DARI API) ---
  let transactions = $state<any[]>([]);
  let meta = $state({
    page: 1,
    limit: 10,
    total_page: 1,
    total_data: 0,
  });
  let isLoading = $state(false);

  // --- STATE FILTER & PENCARIAN ---
  let searchValue = $state("");

  // Array untuk Multi-select
  let selectedPrograms = $state<string[]>([]);
  let selectedRekenings = $state<string[]>([]);
  let selectedStatus = $state(""); // Status biasanya tunggal, tapi bisa diubah array jika mau
  let selectedNominalOperator = $state("");
  let nominalValue = $state<number | null>(null);
  let nominalFrom = $state<number | null>(null);
  let nominalTo = $state<number | null>(null);

  const programs = [
    "Wakaf Sumur",
    "Pembangunan Masjid",
    "Infaq Umum",
    "Indonesia Cetak Huffadz",
  ];
  const rekenings = [
    "BCA - 1234567890",
    "MANDIRI - 1122334455",
    "BSI - 7123456789",
  ];
  const statuses = [
    { label: "Semua Status", value: "" },
    { label: "Berhasil", value: "success" },
    { label: "Duplikat", value: "duplicate" },
  ];

  const programOptions = programs.map((program) => ({
    label: program,
    value: program,
  }));

  const rekeningOptions = rekenings.map((rekening) => ({
    label: rekening,
    value: rekening,
  }));

  const nominalOperators = [
    { label: "Tanpa Filter", value: "" },
    { label: "=", value: "=" },
    { label: "<", value: "<" },
    { label: ">", value: ">" },
    { label: "<=", value: "<=" },
    { label: ">=", value: ">=" },
    { label: "Rentang", value: "between" },
  ];

  const isNominalFilterActive = $derived(
    selectedNominalOperator === "between"
      ? nominalFrom !== null || nominalTo !== null
      : selectedNominalOperator !== "" && nominalValue !== null,
  );

  // --- STATE BULK ACTIONS & DELETE ---
  let showDeleteModal = $state(false);
  let selectedItemToDelete = $state<string | null>(null);
    let isAppending = false;

  // --- FUNGSI API GOLANG ---
  function buildQueryParams(isExport = false) {
    const params = new URLSearchParams();

    if (!isExport) {
      params.append("page", meta.page.toString());
      params.append("limit", meta.limit.toString());
    }

    if (searchValue) params.append("q", searchValue);
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    // Konversi array multi-select menjadi string pisah koma (misal: "Wakaf Sumur,Infaq Umum")
    if (selectedPrograms.length > 0)
      params.append("program", selectedPrograms.join(","));
    if (selectedRekenings.length > 0)
      params.append("rekening", selectedRekenings.join(","));
    if (selectedStatus) params.append("status", selectedStatus);

    if (selectedNominalOperator === "between") {
      if (nominalFrom !== null)
        params.append("nominal_from", nominalFrom.toString());
      if (nominalTo !== null) params.append("nominal_to", nominalTo.toString());
      if (nominalFrom !== null || nominalTo !== null) {
        params.append("nominal_operator", "between");
      }
    } else if (selectedNominalOperator && nominalValue !== null) {
      params.append("nominal_operator", selectedNominalOperator);
      params.append("nominal_value", nominalValue.toString());
    }

    return params.toString();
  }

  async function fetchTransactions(append = false) {
    isLoading = true;
    try {
      const qs = buildQueryParams();
      const response = await apiClient.get(`${API_ENDPOINTS.TRANSAKSI.LIST}?${qs}`);

      // Jika Load More (append), gabungkan array. Jika bukan, timpa array.
      if (append) {
        transactions = [...transactions, ...(response.data || [])];
      } else {
        transactions = response.data || [];
      }

      if (response.meta) meta = response.meta;
    } catch (error) {
      toastStore.error("Gagal mengambil data dari server.", "Error");
      console.error(error);
    } finally {
      isLoading = false;
    }
  }

  function loadMore() {
    if (meta.page < meta.total_page) {
      isAppending = true; // Nyalakan penanda nambah ke bawah
      meta.page++;        // Cukup naikkan halamannya, biarkan $effect yang bekerja
    }
  }

  function handleFilterChange() {
    meta.page = 1;
    fetchTransactions();
  }

  function applyModalFilter() {
    if (
      selectedNominalOperator === "between" &&
      nominalFrom !== null &&
      nominalTo !== null &&
      nominalFrom > nominalTo
    ) {
      [nominalFrom, nominalTo] = [nominalTo, nominalFrom];
    }

    handleFilterChange();
  }

  function resetFilters() {
    selectedPrograms = [];
    selectedRekenings = [];
    selectedStatus = "";
    selectedNominalOperator = "";
    nominalValue = null;
    nominalFrom = null;
    nominalTo = null;
  }

  function handleExport() {
    const qs = buildQueryParams(true);
    window.location.href = `http://localhost:8080/api/transaksi/export?${qs}`;
  }

  // --- LOGIKA REAKTIF (AUTO-APPLY) ---

  // 1. Debounce untuk Kotak Pencarian
// --- LOGIKA REAKTIF (AUTO-APPLY) ---

  // 1. Debounce untuk Kotak Pencarian (BIARKAN)
  let searchTimeout: ReturnType<typeof setTimeout>;
  $effect(() => {
    const query = searchValue; 
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      handleFilterChange();
    }, 500);
  });

  // 2. Auto-Apply saat DateRangePicker di-klik "Terapkan" (BIARKAN)
  let prevStart = todayStr; 
  let prevEnd = todayStr; 
  $effect(() => {
    if (startDate !== prevStart || endDate !== prevEnd) {
      prevStart = startDate;
      prevEnd = endDate;
      handleFilterChange();
    }
  });

  // 3. Auto-Fetch saat Halaman atau Limit ditekan
  let prevPage = 1; 
  let prevLimit = 5;

  $effect(() => {
    let shouldFetch = false;

    // Jika user mengubah dropdown limit (misal dari 5 ke 10)
    if (meta.limit !== prevLimit) {
      prevLimit = meta.limit;
      meta.page = 1; 
      prevPage = 1;
      shouldFetch = true;
      isAppending = false; // Pastikan kalau limit berubah, datanya ditimpa (replace)
    } 
    // Jika user mengeklik tombol prev/next page atau Load More
    else if (meta.page !== prevPage) {
      prevPage = meta.page;
      shouldFetch = true;
    }

    if (shouldFetch) {
      fetchTransactions(isAppending); // Kirim status append-nya ke sini
      isAppending = false; // [PENTING] Langsung reset ke false agar klik dari desktop pagination tetap me-replace data
    }
  });

  // --- FUNGSI UI (CENTANG & MODAL) ---

  function confirmDelete(id: string | null = null) {
    selectedItemToDelete = id; // Jika null, berarti hapus massal (Bulk Delete)
    showDeleteModal = true;
  }

  function executeDelete() {
    showDeleteModal = false;
    const isBulk = selectedItemToDelete === null;

    toastStore.success(
      `Data transaksi berhasil dihapus dari sistem.`,
      "Terhapus",
    );

    selectedItemToDelete = null;
    fetchTransactions(); // Panggil API lagi untuk refresh tabel
  }

  // Helper UI
  // [DIUBAH] Ubah menjadi map yang mengembalikan nama variant Badge
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "success": return "success";
      case "duplicate": return "warning";
      default: return "secondary";
    }
  };

  const statusLabels: Record<string, string> = {
    success: "Berhasil",
    duplicate: "Duplikat",
  };

  function formatDate(isoString: string) {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }
</script>

<div class="max-w-full mx-auto">
  <div class="mb-4 flex justify-end md:hidden">
    <DateRangePicker bind:startDate bind:endDate align="right" />
  </div>
  <Card>
    <CardHeader
      title="Tabel Transaksi"
      description="Lihat dan kelola semua transaksi donasi yang telah masuk."
      icon={ReceiptText}
      iconColor="text-(--color-primary)"
      class="hidden md:block"
    >
      {#snippet action()}
        <DateRangePicker
          bind:startDate
          bind:endDate
          align="right"
          class="flex-1 md:flex-none"
        />
      {/snippet}
    </CardHeader>
    <CardHeader
      title="Tabel Transaksi"
      description="Lihat dan kelola semua transaksi donasi yang telah masuk."
      icon={ReceiptText}
      iconColor="text-(--color-primary)"
      class="block md:hidden"
    />
    <CardContent class="pb-3">
      <TableToolbar
        bind:searchValue
        searchPlaceholder="Cari transaksi..."
        class="mb-4 flex flex-row gap-3 items-start md:items-center justify-between"
        searchWrapperClass="w-full"
        searchInputClass="w-full"
        actionsClass="flex items-center gap-2"
        filterButtonClass="flex items-center gap-2"
        filterLabelClass="hidden sm:inline"
        filterActive={selectedPrograms.length > 0 ||
          selectedRekenings.length > 0 ||
          !!selectedStatus ||
          isNominalFilterActive}
        onResetFilter={resetFilters}
        onApplyFilter={applyModalFilter}
      >
        {#snippet extraActions()}
          <Button
            variant="primary"
            onclick={handleExport}
            class="flex items-center gap-2"
          >
            <Download size={16} /> <span class="hidden sm:inline">Ekspor</span>
          </Button>
        {/snippet}

        {#snippet filterContent()}
          <div class="grid grid-cols-1 gap-4">
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <Select
                  label="Status Transaksi"
                  options={statuses}
                  bind:value={selectedStatus}
                  placeholder="Semua Status"
                />
              </div>

              <div class="flex flex-col gap-2">
                <MultiSelect
                  label="Program"
                  options={programOptions}
                  bind:values={selectedPrograms}
                  placeholder="Pilih program"
                  searchPlaceholder="Cari program..."
                />
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <MultiSelect
                label="Rekening"
                options={rekeningOptions}
                bind:values={selectedRekenings}
                placeholder="Pilih rekening"
                searchPlaceholder="Cari rekening..."
              />
            </div>

            <div class="flex flex-col gap-2">
              <span class="text-sm font-medium text-(--color-text-secondary)"
                >Nominal</span
              >
              <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Select
                  options={nominalOperators}
                  bind:value={selectedNominalOperator}
                  placeholder="Pilih operator"
                />

                {#if selectedNominalOperator === "between"}
                  <CurrencyInput
                    bind:value={nominalFrom}
                    placeholder="Nominal dari"
                    currencyPrefix="Rp"
                  />
                  <CurrencyInput
                    bind:value={nominalTo}
                    placeholder="Nominal sampai"
                    currencyPrefix="Rp"
                  />
                {:else}
                  <CurrencyInput
                    bind:value={nominalValue}
                    placeholder="Masukkan nominal"
                    currencyPrefix="Rp"
                    class="md:col-span-2"
                    disabled={!selectedNominalOperator}
                  />
                {/if}
              </div>
            </div>
          </div>
        {/snippet}

      </TableToolbar>

      <div class="hidden md:block mb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaksi</TableHead>
              <TableHead>Identitas Donatur</TableHead>
              <TableHead>Status & Nominal</TableHead>
              <TableHead>Program & Sumber</TableHead>
              <TableHead class="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {#each transactions as trx (trx.id)}
              <TableRow>
                <TableCell>
                  <div class="flex flex-col gap-1">
                    <span class="font-bold text-sm text-gray-900 leading-none"
                      >{formatDate(trx.tanggal_transaksi)}</span
                    >
                    <span class="text-xs text-gray-500 font-medium"
                      >{trx.id}</span
                    >
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex flex-col gap-0.5">
                    <span
                      class="font-semibold text-sm leading-none text-gray-900"
                      >{trx.donatur?.nama_donatur || "Hamba Allah"}</span
                    >
                    <span class="text-xs text-gray-600"
                      >{trx.donatur?.nomor_hp_donatur || "-"}</span
                    >
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex flex-col items-start gap-1.5">
                    <span class="font-bold text-sm text-gray-900 leading-none"
                      >Rp {formatNumber(trx.nominal, "standard")}</span
                    >
                    <Badge 
  variant={getBadgeVariant(trx.status)} 
  size="sm" 
  class="text-[10px] uppercase tracking-wider"
>
  {statusLabels[trx.status] || trx.status}
</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex flex-col gap-0.5">
                    <span
                      class="font-semibold text-sm leading-none text-gray-900"
                      >{trx.program}</span
                    >
                    <span
                      class="text-[10px] text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded w-max mt-0.5"
                    >
                      {trx.sumber || "-"}
                    </span>
                  </div>
                </TableCell>
                <TableCell class="text-right">
                  <Dropdown width="w-36" align="right">
                    {#snippet trigger()}
                      <Button
                        variant="ghost"
                        size="sm"
                        class="h-8 w-8 p-0 "
                      >
                        <MoreHorizontal size={16} />
                      </Button>
                    {/snippet}
                    <DropdownItem
                      icon={Eye}
                      onclick={() => console.log("Detail", trx.id)}
                      >Lihat Detail</DropdownItem
                    >
                    <DropdownItem
                      icon={Edit}
                      onclick={() => console.log("Edit", trx.id)}
                      >Ubah Data</DropdownItem
                    >
                    <div class="border-t border-(--color-border) my-1"></div>
                    <DropdownItem
                      icon={Trash2}
                      variant="danger"
                      onclick={() => confirmDelete(trx.id)}
                      >Hapus</DropdownItem
                    >
                  </Dropdown>
                </TableCell>
              </TableRow>
            {:else}
              <TableRow>
                <TableCell colspan={5} class="h-40 text-center text-gray-500">
                  {isLoading
                    ? "Menyinkronkan data..."
                    : "Tidak ada transaksi yang ditemukan."}
                </TableCell>
              </TableRow>
            {/each}
          </TableBody>
        </Table>
      </div>

      <div class="md:hidden flex flex-col bg-gray-50/30 gap-3">
        {#each transactions as trx (trx.id)}
          <SimpleTableCard
            name={trx.donatur?.nama_donatur || "Hamba Allah"}
            phone={trx.donatur?.nomor_hp_donatur || "-"}
            program={trx.program}
            date={formatDate(trx.tanggal_transaksi)}
            amount={formatNumber(trx.nominal, "standard")}
            statusLabel={statusLabels[trx.status] || trx.status}
            statusVariant={getBadgeVariant(trx.status)}
          />
        {:else}
          <div
            class="py-10 text-center text-sm text-gray-500 border border-dashed rounded-lg"
          >
            {isLoading ? "Menyinkronkan data..." : "Tidak ada transaksi."}
          </div>
        {/each}
      </div>

    </CardContent>
    <CardFooter class="p-3! md:px-6!">
      {#if transactions.length > 0}
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

<Modal bind:open={showDeleteModal} size="sm">
  <div class="flex flex-col items-center text-center pt-4 pb-2">
    <div
      class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4"
    >
      <TriangleAlert size={24} strokeWidth={2} />
    </div>
    <h3 class="text-lg font-bold text-gray-900 mb-2">Hapus Transaksi?</h3>
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
