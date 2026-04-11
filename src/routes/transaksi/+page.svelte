<script lang="ts">
  // ===========================================================================
  // --- 1. IMPORTS
  // ===========================================================================
  import { Card, CardHeader, CardContent, SimpleTableCard, CardFooter, MobileOverviewCard, SummaryCard, ProgressCard } from "$lib/components/ui/card";
  import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableToolbar } from "$lib/components/ui/table";
  import { Select, MultiSelect, CurrencyInput, DateRangePicker } from "$lib/components/ui/forms";
  import { Dropdown, DropdownItem } from "$lib/components/ui/dropdown";
  import Pagination from "$lib/components/ui/pagination/Pagination.svelte";
  import Button from "$lib/components/ui/button/Button.svelte";
  import SegmentedControl from "$lib/components/ui/button/SegmentedControl.svelte";
  import Modal from "$lib/components/ui/modal/Modal.svelte";
  import Badge from "$lib/components/ui/badge/Badge.svelte";
  import LoadingBars from "$lib/components/ui/loading/LoadingBars.svelte";
  
  import { toastStore } from "$lib/stores/toast.svelte";
  import { formatNumber, formatTrend } from "$lib/utils/formatter";
  import { getMasterDropdownOptions, debounce } from "$lib/utils/helpers";
  import { apiClient } from "$lib/utils/api";
  import { API_ENDPOINTS } from "$lib/constans/endpoints";
  import { goto } from "$app/navigation";
  
  import { Trash2, Eye, TriangleAlert, Download, ReceiptText, Ellipsis, CircleDollarSign, CreditCard, Users, Activity, Pencil } from "lucide-svelte";

  // [BARU] Import TanStack Query
  import { createQuery } from '@tanstack/svelte-query';

  // ===========================================================================
  // --- 2. SETUP TANGGAL HARI INI
  // ===========================================================================
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;

  // ===========================================================================
  // --- 3. STATE: CORE DATA & PAGINATION
  // ===========================================================================
  let transactions = $state<any[]>([]);
  let meta = $state({ page: 1, limit: 20, total_page: 1, total_data: 0 });
  let isLoading = $state(true);
  let isAppending = $state(false);

  // ===========================================================================
  // --- 4. STATE: SUMMARY ANALYTICS
  // ===========================================================================
  let summary = $state({
    total_donasi: 0,
    total_transaksi: 0,
    donatur_unik: 0,
    rata_rata_donasi: 0,
    trend_donasi: 0,
    trend_transaksi: 0,
    trend_donatur: 0,
    trend_rata_rata: 0,
  });

  // ===========================================================================
  // --- 5. STATE: FILTERS & OPTIONS
  // ===========================================================================
  let startDate = $state(todayStr);
  let endDate = $state(todayStr);
  let searchValue = $state("");
  let selectedStatus = $state("");
  let selectedScopeMode = $state(""); // [BARU] State untuk filter Scope
  let roleName = $state("");
  let viewMode = $state("self");
  
  let selectedPrograms = $state<string[]>([]);
  let selectedRekenings = $state<string[]>([]);
  let selectedSumbers = $state<string[]>([]);

  let selectedNominalOperator = $state("");
  let nominalValue = $state<number | null>(null);
  let nominalFrom = $state<number | null>(null);
  let nominalTo = $state<number | null>(null);

  // [UPDATE] Menggunakan TanStack Query untuk Mencegah Infinite Loop
  const masterQuery = createQuery(() => ({
    queryKey: ['masterDropdownOptions'],
    queryFn: async () => await getMasterDropdownOptions(),
  }));

  const programOptions = $derived(masterQuery.data?.programs || []);
  const rekeningOptions = $derived(masterQuery.data?.rekenings || []);
  const sumberOptions = $derived(masterQuery.data?.sumbers || []);

  // [UPDATE] Constants Baku sesuai Kontrak API Baru
  const statuses = [
    { label: "Semua Status", value: "" },
    { label: "Berhasil", value: "success" },
    { label: "Duplikat", value: "duplicate" },
  ];

  const scopeOptions = [
    { label: "Semua Akses", value: "" },
    { label: "Transaksi Saya (Self)", value: "self" },
    { label: "Transaksi Tim (Team)", value: "team" },
  ];

  const coordinatorViewOptions = [
    { label: "Lihat Personal", value: "self" },
    { label: "Lihat Tim", value: "team" },
  ];

  const nominalOperators = [
    { label: "Tanpa Filter", value: "" },
    { label: "=", value: "=" },
    { label: "<", value: "<" },
    { label: ">", value: ">" },
    { label: "<=", value: "<=" },
    { label: ">=", value: ">=" },
    { label: "Rentang", value: "between" },
  ];

  // ===========================================================================
  // --- 6. STATE: MODALS & UI ACTIONS
  // ===========================================================================
  let showDeleteModal = $state(false);
  let selectedItemToDelete = $state<string | null>(null);

  // ===========================================================================
  // --- 7. DERIVED STATE (COMPUTED VALUES)
  // ===========================================================================
  const trendText = $derived(startDate === endDate ? "dari kemarin" : "vs periode sebelumnya");
  
  const isNominalFilterActive = $derived(
    selectedNominalOperator === "between" 
      ? nominalFrom !== null || nominalTo !== null 
      : selectedNominalOperator !== "" && nominalValue !== null
  );

  const isKoordinatorCS = $derived(
    roleName
      .toLowerCase()
      .replace(/[_-]/g, " ")
      .replace(/\s+/g, " ")
      .trim() === "koordinator cs",
  );

  function decodeRoleFromToken(token: string): string {
    try {
      const payloadBase64 = token.split(".")[1];
      if (!payloadBase64) return "";

      const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(normalized));
      return payload?.role || payload?.user?.role || "";
    } catch {
      return "";
    }
  }

  // ===========================================================================
  // --- 8. API FETCHING & URL BUILDER
  // ===========================================================================
  function buildQueryParams(isExport = false) {
    const params = new URLSearchParams();

    if (!isExport) {
      params.append("page", meta.page.toString());
      params.append("limit", meta.limit.toString());
    }

    if (searchValue) params.append("q", searchValue);
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    
    // [BARU] Kirim parameter Scope
    if (selectedScopeMode) params.append("scope_mode", selectedScopeMode);

    if (selectedPrograms.length > 0) params.append("program_id", selectedPrograms[0]);
    if (selectedRekenings.length > 0) params.append("rekening_id", selectedRekenings[0]);
    if (selectedSumbers.length > 0) params.append("sumber_id", selectedSumbers[0]);
    if (selectedStatus) params.append("status", selectedStatus);

    if (selectedNominalOperator === "between") {
      if (nominalFrom !== null) params.append("nominal_from", nominalFrom.toString());
      if (nominalTo !== null) params.append("nominal_to", nominalTo.toString());
      if (nominalFrom !== null || nominalTo !== null) params.append("nominal_operator", "between");
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

      if (append) {
        transactions = [...transactions, ...(response.data || [])];
      } else {
        transactions = response.data || [];
      }

      if (response.meta) meta = response.meta;
      if (response.summary) summary = response.summary;
    } catch (error) {
      toastStore.error("Gagal mengambil data dari server.", "Error");
      console.error(error);
    } finally {
      isLoading = false;
    }
  }

  // ===========================================================================
  // --- 9. FILTER & LIST HANDLERS
  // ===========================================================================
  function loadMore() {
    if (meta.page < meta.total_page) {
      isAppending = true;
      meta.page++;
    }
  }

  function handleFilterChange() {
    meta.page = 1;
    fetchTransactions();
  }

  function applyModalFilter() {
    if (selectedNominalOperator === "between" && nominalFrom !== null && nominalTo !== null && nominalFrom > nominalTo) {
      [nominalFrom, nominalTo] = [nominalTo, nominalFrom];
    }
    handleFilterChange();
  }

  function resetFilters() {
    selectedScopeMode = isKoordinatorCS ? viewMode : "";
    selectedPrograms = [];
    selectedRekenings = [];
    selectedSumbers = [];
    selectedStatus = "";
    selectedNominalOperator = "";
    nominalValue = null;
    nominalFrom = null;
    nominalTo = null;
  }

  // ===========================================================================
  // --- 10. EXPORT & DELETE ACTIONS
  // ===========================================================================
  async function handleExport() {
    const qs = buildQueryParams(true);

    try {
      const blob = await apiClient.getBlob(`${API_ENDPOINTS.TRANSAKSI.EXPORT}?${qs}`);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const today = new Date().toISOString().slice(0, 10);

      link.href = url;
      link.download = `Laporan_Transaksi_${today}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toastStore.error(
        error instanceof Error ? error.message : "Gagal mengekspor data transaksi.",
        "Ekspor Gagal",
      );
    }
  }

  function confirmDelete(id: string | null = null) {
    selectedItemToDelete = id;
    showDeleteModal = true;
  }

  async function executeDelete() {
    showDeleteModal = false;
    
    try {
      await apiClient.delete(`${API_ENDPOINTS.TRANSAKSI.DELETE}/${selectedItemToDelete}`);
      toastStore.success(`Data transaksi berhasil dihapus dari sistem.`, "Terhapus");
      selectedItemToDelete = null;
      fetchTransactions();
    } catch (error) {
      toastStore.error("Gagal menghapus transaksi dari sistem.");
      console.error(error);
    }
  }

  // ===========================================================================
  // --- 11. UI FORMATTING HELPERS
  // ===========================================================================
  // [UPDATE] Label & Badge sesuai API Baru
  const statusLabels: Record<string, string> = {
    pending: "Pending",
    success: "Berhasil",
    failed: "Gagal",
    duplicate: "Duplikat",
  };

  const getBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "success": return "success";
      case "pending": return "warning";
      case "failed": return "danger";
      case "duplicate": return "secondary";
      default: return "secondary";
    }
  };

  function formatDate(isoString: string) {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
  }

  // ===========================================================================
  // --- 12. REACTIVE EFFECTS ($effect)
  // ===========================================================================
  
  // Debounce Search
  const applySearch = debounce(() => handleFilterChange(), 500);
  $effect(() => {
    searchValue; 
    applySearch(); 
  });

  // Auto-apply Date Range
  let prevStart = todayStr;
  let prevEnd = todayStr;
  $effect(() => {
    if (startDate !== prevStart || endDate !== prevEnd) {
      prevStart = startDate;
      prevEnd = endDate;
      handleFilterChange();
    }
  });

  // Pagination & Limit Change Handler
  let prevPage = 1;
  let prevLimit = 20;
  let prevScopeMode = "";
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
      fetchTransactions(isAppending);
      isAppending = false;
    }
  });

  $effect(() => {
    if (selectedScopeMode !== prevScopeMode) {
      prevScopeMode = selectedScopeMode;
      handleFilterChange();
    }
  });

  $effect(() => {
    if (typeof window === "undefined") return;

    const rawUser = localStorage.getItem("admin_user");
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        roleName = parsed?.role || "";
      } catch {
        roleName = "";
      }
    }

    if (!roleName) {
      const token = localStorage.getItem("admin_token") || "";
      roleName = decodeRoleFromToken(token);
    }
  });

  $effect(() => {
    if (isKoordinatorCS) {
      selectedScopeMode = viewMode;
    }
  });
</script>

<div class="max-w-full mx-auto flex flex-col gap-4 md:gap-6">
  {#if isKoordinatorCS}
    <div class="flex justify-end">
      <SegmentedControl
        options={coordinatorViewOptions}
        bind:selected={viewMode}
        class="w-full md:w-auto"
      />
    </div>
  {/if}

  <div class="flex justify-end md:hidden">
    <DateRangePicker bind:startDate bind:endDate align="right" />
  </div>
  <div class="w-full min-w-0">
    <div class="hidden md:grid lg:grid-cols-4 md:gap-4 lg:gap-6 w-full">
      <SummaryCard label="Total Donasi" value={formatNumber(summary.total_donasi, "currency")} icon={CircleDollarSign} trend={summary.trend_donasi >= 0 ? "up" : "down"} trendValue={`${formatTrend(summary.trend_donasi)} ${trendText}`} variant="primary" />
      <SummaryCard label="Total Transaksi" value={summary.total_transaksi} icon={CreditCard} trend={summary.trend_transaksi >= 0 ? "up" : "down"} trendValue={`${formatTrend(summary.trend_transaksi)} ${trendText}`} variant="default" />
      <SummaryCard label="Donatur Unik" value={summary.donatur_unik} icon={Users} trend={summary.trend_donatur >= 0 ? "up" : "down"} trendValue={`${formatTrend(summary.trend_donatur)} ${trendText}`} variant="warning" />
      <SummaryCard label="Rata-rata / Transaksi" value={formatNumber(summary.rata_rata_donasi, "currency")} icon={Activity} trend={summary.trend_rata_rata >= 0 ? "up" : "down"} trendValue={`${formatTrend(summary.trend_rata_rata)} ${trendText}`} variant="success" />
    </div>

    <div class="block md:hidden w-full">
      <MobileOverviewCard
        title="Total Donasi"
        value={formatNumber(summary.total_donasi, "currency")}
        icon={CircleDollarSign}
        metrics={[
          {
            label: "Transaksi",
            value: summary.total_transaksi,
            trendText: formatTrend(summary.trend_transaksi),
            trendUp: summary.trend_transaksi >= 0,
          },
          {
            label: "Donatur",
            value: summary.donatur_unik,
            trendText: formatTrend(summary.trend_donatur),
            trendUp: summary.trend_donatur >= 0,
          },
          {
            label: "Rata-rata",
            value: formatNumber(summary.rata_rata_donasi, "compact"),
            trendText: formatTrend(summary.trend_rata_rata),
            trendUp: summary.trend_rata_rata >= 0,
          },
        ]}
      />
    </div>
  </div>
  <Card>
    <CardHeader title="Tabel Transaksi" description="Lihat dan kelola semua transaksi donasi yang telah masuk." icon={ReceiptText} iconColor="text-(--color-primary)" class="hidden md:block">
      {#snippet action()}
        <DateRangePicker bind:startDate bind:endDate align="right" class="flex-1 md:flex-none" />
      {/snippet}
    </CardHeader>
    <CardHeader title="Tabel Transaksi" description="Lihat dan kelola semua transaksi donasi yang telah masuk." icon={ReceiptText} iconColor="text-(--color-primary)" class="block md:hidden" />
    <CardContent class="pb-3">
      <TableToolbar
        bind:searchValue
        searchPlaceholder="Cari transaksi..."
        class="mb-4 flex flex-row gap-3 items-start md:items-center justify-between"
        searchWrapperClass="w-full"
        actionsClass="flex items-center gap-2"
        filterButtonClass="flex items-center gap-2"
        filterLabelClass="hidden sm:inline"
        filterActive={selectedPrograms.length > 0 || selectedRekenings.length > 0 || selectedSumbers.length > 0 || !!selectedStatus || !!selectedScopeMode || isNominalFilterActive}
        onResetFilter={resetFilters}
        onApplyFilter={applyModalFilter}
      >
        {#snippet extraActions()}
          <Button variant="primary" onclick={handleExport} class="flex items-center gap-2">
            <Download size={16} /> <span class="hidden sm:inline">Ekspor</span>
          </Button>
        {/snippet}

        {#snippet filterContent()}
          <div class="grid grid-cols-1 gap-4">
            <div class="flex flex-col gap-4">
              {#if !isKoordinatorCS}
                <div class="flex flex-col gap-2">
                  <Select label="Filter Cakupan" options={scopeOptions} bind:value={selectedScopeMode} placeholder="Semua Scope" />
                </div>
              {/if}

              <div class="flex flex-col gap-2">
                <Select label="Status Transaksi" options={statuses} bind:value={selectedStatus} placeholder="Semua Status" />
              </div>

              <div class="flex flex-col gap-2">
                <MultiSelect label="Program" options={programOptions} bind:values={selectedPrograms} placeholder="Pilih program" searchPlaceholder="Cari program..." />
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <MultiSelect label="Rekening" options={rekeningOptions} bind:values={selectedRekenings} placeholder="Pilih rekening" searchPlaceholder="Cari rekening..." />
            </div>

            <div class="flex flex-col gap-2">
              <MultiSelect label="Sumber Transaksi" options={sumberOptions} bind:values={selectedSumbers} placeholder="Pilih sumber" searchPlaceholder="Cari sumber..." />
            </div>

            <div class="flex flex-col gap-2">
              <span class="text-sm font-medium text-(--color-text-secondary)">Nominal</span>
              <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Select options={nominalOperators} bind:value={selectedNominalOperator} placeholder="Pilih operator" />

                {#if selectedNominalOperator === "between"}
                  <CurrencyInput bind:value={nominalFrom} placeholder="Nominal dari" currencyPrefix="Rp" />
                  <CurrencyInput bind:value={nominalTo} placeholder="Nominal sampai" currencyPrefix="Rp" />
                {:else}
                  <CurrencyInput bind:value={nominalValue} placeholder="Masukkan nominal" currencyPrefix="Rp" class="md:col-span-2" disabled={!selectedNominalOperator} />
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
                    <span class="font-bold text-sm text-gray-900 leading-none">{formatDate(trx.tanggal_transaksi)}</span>
                    <span class="text-xs text-gray-500 font-medium">{trx.id}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex flex-col gap-0.5">
                    <span class="font-semibold text-sm leading-none text-gray-900">{trx.donatur?.nama_donatur || trx.nama_donatur || "Hamba Allah"}</span>
                    <span class="text-xs text-gray-600">{trx.donatur?.nomor_hp_donatur || trx.nomor_hp_donatur || "-"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex flex-col items-start gap-1.5">
                    <span class="font-bold text-sm text-gray-900 leading-none">Rp {formatNumber(trx.nominal, "standard")}</span>
                    <Badge variant={getBadgeVariant(trx.status)} size="sm" class="text-[10px] uppercase tracking-wider">
                      {statusLabels[trx.status?.toLowerCase()] || trx.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex flex-col gap-0.5">
                    <span class="font-semibold text-sm leading-none text-gray-900">{trx.program?.nama_program || "-"}</span>
                    <span class="text-[10px] text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded w-max mt-0.5">
                      {trx.sumber?.nama_sumber || trx.sumber?.sumber_transaksi || "-"}
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
                    <DropdownItem icon={Eye} onclick={() => console.log("Detail", trx.id)}>Lihat Detail</DropdownItem>
                    <DropdownItem icon={Pencil} onclick={() => goto(`/transaksi/edit/${trx.id}`)}>Ubah Data</DropdownItem>
                    <div class="border-t border-(--color-border) my-1"></div>
                    <DropdownItem icon={Trash2} variant="danger" onclick={() => confirmDelete(trx.id)}>Hapus</DropdownItem>
                  </Dropdown>
                </TableCell>
              </TableRow>
            {:else}
              <TableRow>
                <TableCell colspan={5} class="h-40 text-center text-gray-500">
                  {#if isLoading}
                    <LoadingBars size={50} class="text-(--color-primary)" />
                  {:else}
                    <div class="flex flex-col items-center justify-center text-gray-400">
                      <span class="text-sm">Tidak ada transaksi yang ditemukan.</span>
                    </div>
                  {/if}
                </TableCell>
              </TableRow>
            {/each}
          </TableBody>
        </Table>
      </div>

      <div class="md:hidden flex flex-col bg-gray-50/30 gap-3">
        {#each transactions as trx (trx.id)}
          <SimpleTableCard name={trx.donatur?.nama_donatur || trx.nama_donatur || "Hamba Allah"} phone={trx.donatur?.nomor_hp_donatur || trx.nomor_hp_donatur || "-"} program={trx.program?.nama_program || "-"} date={formatDate(trx.tanggal_transaksi)} amount={formatNumber(trx.nominal, "standard")} statusLabel={statusLabels[trx.status?.toLowerCase()] || trx.status} statusVariant={getBadgeVariant(trx.status)} />
        {:else}
          <div class="py-10 flex justify-center text-center text-sm text-gray-500 border border-dashed rounded-lg">
            {#if isLoading}
              <LoadingBars size={35} class="text-(--color-primary)" />
            {:else}
              Tidak ada transaksi yang ditemukan.
            {/if}
          </div>
        {/each}
      </div>
    </CardContent>
    <CardFooter class="p-3! md:px-6!">
      {#if transactions.length > 0}
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

<Modal bind:open={showDeleteModal} size="sm">
  <div class="flex flex-col items-center text-center pt-4 pb-2">
    <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
      <TriangleAlert size={24} strokeWidth={2} />
    </div>
    <h3 class="text-lg font-bold text-gray-900 mb-2">Hapus Transaksi?</h3>
  </div>

  {#snippet footer()}
    <Button variant="outline" class="w-full" onclick={() => (showDeleteModal = false)}>Batal</Button>
    <Button variant="danger" class="w-full" onclick={executeDelete}>Ya, Hapus Data</Button>
  {/snippet}
</Modal>