<script lang="ts">
  // ===========================================================================
  // --- 1. IMPORTS
  // ===========================================================================
  import { Card, CardHeader, CardContent, CardFooter, SummaryCard, MobileOverviewCard } from "$lib/components/ui/card";
  import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableToolbar } from "$lib/components/ui/table";
  import { Select, MultiSelect, CurrencyInput, DateRangePicker } from "$lib/components/ui/forms";
  import { Dropdown, DropdownItem } from "$lib/components/ui/dropdown";
  import Pagination from "$lib/components/ui/pagination/Pagination.svelte";
  import Button from "$lib/components/ui/button/Button.svelte";
  import Modal from "$lib/components/ui/modal/Modal.svelte";
  import Badge from "$lib/components/ui/badge/Badge.svelte";
  import LoadingBars from "$lib/components/ui/loading/LoadingBars.svelte";
  
  import { toastStore } from "$lib/stores/toast.svelte";
  import { formatNumber, formatTrend } from "$lib/utils/formatter";
  import { apiClient } from "$lib/utils/api";
  import { API_ENDPOINTS } from "$lib/constans/endpoints";
  
  import { MoreHorizontal, Edit, Trash2, Eye, TriangleAlert, Download, Users, Mail, Phone, MapPin, Activity, History, HandCoins } from "lucide-svelte";

  // ===========================================================================
  // --- 2. STATE: CORE DATA & PAGINATION
  // ===========================================================================
  let donaturs = $state<any[]>([]);
  let meta = $state({ page: 1, limit: 10, total_page: 1, total_data: 0 });
  let isLoading = $state(true);
  let isAppending = $state(false);

  // ===========================================================================
  // --- 3. STATE: SUMMARY ANALYTICS
  // ===========================================================================
  let summary = $state({
    total_donatur: 0,
    tingkat_aktif: 0,
    rata_rata_clv: 0,
    rata_rata_frekuensi: 0,
    trend_total_donatur: 0,
    trend_tingkat_aktif: 0,
    trend_clv: 0,
    trend_frekuensi: 0.0,
  });

  // ===========================================================================
  // --- 4. STATE: FILTERS & OPTIONS
  // ===========================================================================
  let startDate = $state("");
  let endDate = $state("");
  let searchValue = $state("");
  
  let selectedDomisilis = $state<string[]>([]);
  let selectedLabels = $state<string[]>([]);
  let selectedChurnLabel = $state("");

  let domisiliOptions = $state<any[]>([]);
  let labelOptions = $state<any[]>([]);

  let selectedNominalOperator = $state("");
  let nominalValue = $state<number | null>(null);
  let nominalFrom = $state<number | null>(null);
  let nominalTo = $state<number | null>(null);

  let selectedTrxOperator = $state("");
  let trxValue = $state<number | null>(null);
  let trxFrom = $state<number | null>(null);
  let trxTo = $state<number | null>(null);

  const churnOptions = [
    { label: "Semua Status Retensi", value: "" },
    { label: "Aman", value: "Aman" },
    { label: "Warning", value: "Warning" },
    { label: "Bahaya", value: "Bahaya" },
  ];

  const numericOperators = [
    { label: "Tanpa Filter", value: "" },
    { label: "=", value: "=" },
    { label: "<", value: "<" },
    { label: ">", value: ">" },
    { label: "<=", value: "<=" },
    { label: ">=", value: ">=" },
    { label: "Rentang", value: "between" },
  ];

  // ===========================================================================
  // --- 5. STATE: INLINE EDIT LABEL & UI MODALS
  // ===========================================================================
  let showDeleteModal = $state(false);
  let selectedItemToDelete = $state<string | null>(null);

  let editingLabelId = $state<string | null>(null);
  let inlineTags = $state<string[]>([]);
  let inlineInputValue = $state("");
  let isSavingLabel = $state(false);

  // ===========================================================================
  // --- 6. DERIVED STATE (COMPUTED VALUES)
  // ===========================================================================
  const trendText = $derived(startDate === endDate ? "dari kemarin" : "vs periode sebelumnya");
  
  const isNominalFilterActive = $derived(
    selectedNominalOperator === "between" ? nominalFrom !== null || nominalTo !== null : selectedNominalOperator !== "" && nominalValue !== null
  );
  
  const isTrxFilterActive = $derived(
    selectedTrxOperator === "between" ? trxFrom !== null || trxTo !== null : selectedTrxOperator !== "" && trxValue !== null
  );

  // ===========================================================================
  // --- 7. API FETCHING & URL BUILDER
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

    if (selectedDomisilis.length > 0) params.append("domisili", selectedDomisilis.join(","));
    if (selectedLabels.length > 0) params.append("label", selectedLabels.join(","));
    if (selectedChurnLabel) params.append("label_churn", selectedChurnLabel);

    if (selectedNominalOperator === "between") {
      if (nominalFrom !== null) params.append("nominal_from", nominalFrom.toString());
      if (nominalTo !== null) params.append("nominal_to", nominalTo.toString());
      if (nominalFrom !== null || nominalTo !== null) params.append("nominal_operator", "between");
    } else if (selectedNominalOperator && nominalValue !== null) {
      params.append("nominal_operator", selectedNominalOperator);
      params.append("nominal_value", nominalValue.toString());
    }

    if (selectedTrxOperator === "between") {
      if (trxFrom !== null) params.append("transaksi_from", trxFrom.toString());
      if (trxTo !== null) params.append("transaksi_to", trxTo.toString());
      if (trxFrom !== null || trxTo !== null) params.append("transaksi_operator", "between");
    } else if (selectedTrxOperator && trxValue !== null) {
      params.append("transaksi_operator", selectedTrxOperator);
      params.append("transaksi_value", trxValue.toString());
    }

    return params.toString();
  }

  async function fetchMasterData() {
    try {
      const [domisiliRes, labelRes] = await Promise.all([
        apiClient.get(API_ENDPOINTS.DOMISILI.LIST), 
        apiClient.get(API_ENDPOINTS.LABEL.LIST)
      ]);

      domisiliOptions = (domisiliRes.data || []).map((item: any) => ({ value: item.nama_domisili, label: item.nama_domisili }));
      labelOptions = (labelRes.data || []).map((item: any) => ({ value: item.nama_label, label: item.nama_label }));
    } catch (error) {
      console.error("Gagal mengambil master data filter", error);
    }
  }

  async function fetchDonaturs(append = false) {
    isLoading = true;
    try {
      const qs = buildQueryParams();
      const response = await apiClient.get(`${API_ENDPOINTS.DONATUR.LIST}?${qs}`);

      if (append) {
        donaturs = [...donaturs, ...(response.data || [])];
      } else {
        donaturs = response.data || [];
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
  // --- 8. FILTER & LIST HANDLERS
  // ===========================================================================
  function loadMore() {
    if (meta.page < meta.total_page) {
      isAppending = true;
      meta.page++;
    }
  }

  function handleFilterChange() {
    meta.page = 1;
    fetchDonaturs();
  }

  function applyModalFilter() {
    if (selectedNominalOperator === "between" && nominalFrom !== null && nominalTo !== null && nominalFrom > nominalTo) {
      [nominalFrom, nominalTo] = [nominalTo, nominalFrom];
    }
    if (selectedTrxOperator === "between" && trxFrom !== null && trxTo !== null && trxFrom > trxTo) {
      [trxFrom, trxTo] = [trxTo, trxFrom];
    }
    handleFilterChange();
  }

  function resetFilters() {
    selectedDomisilis = [];
    selectedLabels = [];
    selectedChurnLabel = "";
    selectedNominalOperator = "";
    nominalValue = null;
    nominalFrom = null;
    nominalTo = null;
    selectedTrxOperator = "";
    trxValue = null;
    trxFrom = null;
    trxTo = null;
  }

  function handleExport() {
    const qs = buildQueryParams(true);
    window.location.href = `http://localhost:8080/api/donatur/export?${qs}`;
  }

  function confirmDelete(id: string | null = null) {
    selectedItemToDelete = id;
    showDeleteModal = true;
  }

  function executeDelete() {
    showDeleteModal = false;
    toastStore.success(`Data donatur berhasil dihapus dari sistem.`, "Terhapus");
    selectedItemToDelete = null;
    fetchDonaturs();
  }

  // ===========================================================================
  // --- 9. INLINE EDIT HANDLERS (LABEL)
  // ===========================================================================
  function startInlineEdit(donatur: any) {
    editingLabelId = donatur.id;
    inlineTags = donatur.label ? donatur.label.split(",").map((l: string) => l.trim().toUpperCase()).filter((l: string) => l !== "") : [];
    inlineInputValue = "";
  }

  function handleInlineKeydown(e: KeyboardEvent, donaturId: string) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = inlineInputValue.trim().toUpperCase();

      if (newTag) {
        if (!inlineTags.includes(newTag)) inlineTags = [...inlineTags, newTag];
        inlineInputValue = "";
      } else if (e.key === "Enter") {
        saveInlineEdit(donaturId);
      }
    } else if (e.key === "Escape") {
      cancelInlineEdit();
    }
  }

  function removeInlineTag(tagToRemove: string) {
    inlineTags = inlineTags.filter((t) => t !== tagToRemove);
  }

  function cancelInlineEdit() {
    editingLabelId = null;
    inlineInputValue = "";
  }

  async function saveInlineEdit(donaturId: string) {
    if (isSavingLabel) return;
    isSavingLabel = true;

    let finalTags = [...inlineTags];
    const pendingTag = inlineInputValue.trim().toUpperCase();
    if (pendingTag && !finalTags.includes(pendingTag)) finalTags.push(pendingTag);

    const finalLabelString = finalTags.join(", ");

    try {
      const endpoint = API_ENDPOINTS.DONATUR.UPDATE_LABEL(donaturId);
      await apiClient.patch(endpoint, { label: finalLabelString });
      toastStore.success(`Label berhasil diperbarui!`, "Sukses");
      donaturs = donaturs.map((d) => (d.id === donaturId ? { ...d, label: finalLabelString } : d));
      editingLabelId = null;
    } catch (error) {
      toastStore.error("Gagal memperbarui label.");
    } finally {
      isSavingLabel = false;
    }
  }

  // ===========================================================================
  // --- 10. HELPERS & SVELTE ACTIONS
  // ===========================================================================
  function getChurnData(prob: number) {
    if (prob < 0.5) return { color: "bg-green-500", label: "Aman" };
    if (prob < 0.8) return { color: "bg-yellow-500", label: "Warning" };
    return { color: "bg-red-500", label: "Bahaya" };
  }

  function clickOutside(node: HTMLElement, callback: () => void) {
    const handleClick = (event: Event) => {
      if (event.target && !document.body.contains(event.target as Node)) return;
      if (!node.contains(event.target as Node)) callback();
    };
    document.addEventListener("pointerdown", handleClick);
    return {
      destroy() { document.removeEventListener("pointerdown", handleClick); },
    };
  }

  function focusOnMount(node: HTMLInputElement) {
    setTimeout(() => { if (node) node.focus(); }, 10);
  }

  // ===========================================================================
  // --- 11. REACTIVE EFFECTS ($effect)
  // ===========================================================================
  
  // Initial Fetch Master Data
  $effect(() => {
    if (domisiliOptions.length === 0 && labelOptions.length === 0) fetchMasterData();
  });

  // Debounce Search Filter
  let searchTimeout: ReturnType<typeof setTimeout>;
  $effect(() => {
    const query = searchValue;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => { handleFilterChange(); }, 500);
  });

  // Auto-apply Date Filter
  let prevStart = "";
  let prevEnd = "";
  $effect(() => {
    if (startDate !== prevStart || endDate !== prevEnd) {
      prevStart = startDate;
      prevEnd = endDate;
      handleFilterChange();
    }
  });

  // Pagination & Limit Change Handler
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
      fetchDonaturs(isAppending);
      isAppending = false;
    }
  });
</script>

<div class="max-w-full mx-auto flex flex-col gap-4 md:gap-6">
  <div class="flex justify-end md:hidden">
    <DateRangePicker bind:startDate bind:endDate align="right" />
  </div>
  <div class="w-full min-w-0">
    <div class="hidden md:grid lg:grid-cols-4 md:gap-4 lg:gap-6 w-full">
      <SummaryCard
        label="Total Donatur"
        value={formatNumber(summary.total_donatur, "standard")}
        icon={Users}
        trend={summary.trend_total_donatur > 0 ? "up" : summary.trend_total_donatur < 0 ? "down" : null}
        trendValue={summary.trend_total_donatur !== 0 ? `${formatTrend(summary.trend_total_donatur)} ${trendText}` : undefined}
        variant="primary"
      />
      
      <SummaryCard 
        label="Tingkat Aktif Donatur" 
        value={`${summary.tingkat_aktif}%`} 
        icon={Activity} 
        trend={summary.trend_tingkat_aktif > 0 ? "up" : summary.trend_tingkat_aktif < 0 ? "down" : null} 
        trendValue={summary.trend_tingkat_aktif !== 0 ? `${formatTrend(summary.trend_tingkat_aktif)} ${trendText}` : undefined} 
        variant="default" 
      />
      
      <SummaryCard 
        label="Rata-Rata Donasi (CLV)" 
        value={formatNumber(summary.rata_rata_clv, "currency")} 
        icon={HandCoins} 
        trend={summary.trend_clv > 0 ? "up" : summary.trend_clv < 0 ? "down" : null} 
        trendValue={summary.trend_clv !== 0 ? `${formatTrend(summary.trend_clv)} ${trendText}` : undefined} 
        variant="warning" 
      />
      
      <SummaryCard 
        label="Frekuensi Donasi" 
        value={`${summary.rata_rata_frekuensi}x`} 
        icon={History} 
        trend={summary.trend_frekuensi > 0 ? "up" : summary.trend_frekuensi < 0 ? "down" : null} 
        trendValue={summary.trend_frekuensi !== 0 ? `${formatTrend(summary.trend_frekuensi)} ${trendText}` : undefined} 
        variant="success" 
      />
    </div>

    <div class="block md:hidden w-full">
      <MobileOverviewCard
        title="Total Donatur"
        value={formatNumber(summary.total_donatur, "standard")}
        icon={Users}
        metrics={[
          {
            label: "Keaktifan",
            value: `${summary.tingkat_aktif}%`,
            trendText: summary.trend_tingkat_aktif !== 0 ? formatTrend(summary.trend_tingkat_aktif) : undefined,
            trendUp: summary.trend_tingkat_aktif > 0 ? true : summary.trend_tingkat_aktif < 0 ? false : undefined,
          },
          {
            label: "Rata-Rata",
            value: `Rp ${formatNumber(summary.rata_rata_clv, "compact")}`,
            trendText: summary.trend_clv !== 0 ? formatTrend(summary.trend_clv) : undefined,
            trendUp: summary.trend_clv > 0 ? true : summary.trend_clv < 0 ? false : undefined,
          },
          {
            label: "Frekuensi",
            value: `${summary.rata_rata_frekuensi}x`,
            trendText: summary.trend_frekuensi !== 0 ? formatTrend(summary.trend_frekuensi) : undefined,
            trendUp: summary.trend_frekuensi > 0 ? true : summary.trend_frekuensi < 0 ? false : undefined,
          },
        ]}
      />
    </div>
  </div>
  <Card>
    <CardHeader title="Daftar Donatur" description="Kelola dan pantau analitik perilaku donatur secara real-time." icon={Users} iconColor="text-blue-600" class="hidden md:block">
      {#snippet action()}
        <DateRangePicker bind:startDate bind:endDate align="right" class="flex-1 md:flex-none" />
      {/snippet}
    </CardHeader>
    <CardHeader title="Daftar Donatur" description="Kelola dan pantau analitik perilaku donatur secara real-time." icon={Users} iconColor="text-blue-600" class="block md:hidden" />

    <CardContent class="pb-3">
      <TableToolbar
        bind:searchValue
        searchPlaceholder="Cari nama atau no HP..."
        class="mb-4 flex flex-row gap-3 items-start md:items-center justify-between"
        searchWrapperClass="w-full"
        searchInputClass="w-full"
        actionsClass="flex items-center gap-2"
        filterButtonClass="flex items-center gap-2"
        filterLabelClass="hidden sm:inline"
        filterActive={selectedDomisilis.length > 0 || selectedLabels.length > 0 || isNominalFilterActive || isTrxFilterActive || selectedChurnLabel !== ""}
        onResetFilter={resetFilters}
        onApplyFilter={applyModalFilter}
      >
        {#snippet extraActions()}
          <Button variant="primary" onclick={handleExport} class="flex items-center gap-2">
            <Download size={16} /> <span class="hidden sm:inline">Ekspor</span>
          </Button>
        {/snippet}

        {#snippet filterContent()}
          <div class="flex flex-col gap-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MultiSelect label="Label Donatur" options={labelOptions} bind:values={selectedLabels} placeholder="Pilih label" searchPlaceholder="Cari label..." emptyMessage="Data belum ada" />
              <Select label="Status Retensi" options={churnOptions} bind:value={selectedChurnLabel} placeholder="Semua Status" />
            </div>

            <div class="w-full">
              <MultiSelect label="Domisili" options={domisiliOptions} bind:values={selectedDomisilis} placeholder="Pilih domisili" searchPlaceholder="Cari domisili..." />
            </div>

            <div class="flex flex-col gap-2">
              <span class="text-sm font-medium text-(--color-text-secondary)">Total Donasi (CLV)</span>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select options={numericOperators} bind:value={selectedNominalOperator} placeholder="Operator" />

                {#if selectedNominalOperator === "between"}
                  <CurrencyInput bind:value={nominalFrom} placeholder="Dari (Rp)" currencyPrefix="Rp" />
                  <CurrencyInput bind:value={nominalTo} placeholder="Sampai (Rp)" currencyPrefix="Rp" />
                {:else}
                  <div class="sm:col-span-2">
                    <CurrencyInput bind:value={nominalValue} placeholder="Masukkan nominal" currencyPrefix="Rp" disabled={!selectedNominalOperator} />
                  </div>
                {/if}
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <span class="text-sm font-medium text-(--color-text-secondary)">Jumlah Transaksi</span>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select options={numericOperators} bind:value={selectedTrxOperator} placeholder="Operator" />

                {#if selectedTrxOperator === "between"}
                  <CurrencyInput bind:value={trxFrom} placeholder="Dari (Kali)" currencyPrefix="" />
                  <CurrencyInput bind:value={trxTo} placeholder="Sampai (Kali)" currencyPrefix="" />
                {:else}
                  <div class="sm:col-span-2">
                    <CurrencyInput bind:value={trxValue} placeholder="Masukkan jumlah" currencyPrefix="" disabled={!selectedTrxOperator} />
                  </div>
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
              <TableHead>Donatur</TableHead>
              <TableHead>Kontak</TableHead>
              <TableHead>Domisili</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Analitik Transaksi</TableHead>
              <TableHead>Total Donasi (CLV)</TableHead>
              <TableHead class="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {#each donaturs as dnt (dnt.id)}
              {@const churn = getChurnData(dnt.probabilitas_churn || 0)}
              <TableRow>
                <TableCell>
                  <div class="flex flex-col gap-1.5 items-start">
                    <span class="font-bold text-sm text-gray-900 leading-none">
                      {dnt.sapaan ? `${dnt.sapaan} ` : ""}{dnt.nama_donatur}
                    </span>
                    {#if dnt.pola_donasi}
                      <Badge variant="secondary" size="sm" shape="pill" class="text-[9px] py-0">{dnt.pola_donasi}</Badge>
                    {/if}
                  </div>
                </TableCell>

                <TableCell>
                  <div class="flex flex-col gap-1">
                    <span class="text-xs text-gray-800 font-medium">{dnt.nomor_hp_donatur}</span>
                    <span class="text-[11px] text-gray-500">{dnt.email || "-"}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <span class="font-semibold text-sm leading-none text-gray-900">{dnt.domisili || "-"}</span>
                </TableCell>

                <TableCell>
                  {#if editingLabelId === dnt.id}
                    <div class="flex flex-wrap gap-1 items-center bg-white border border-blue-400 shadow-sm rounded-md p-1.5 min-w-55 relative z-10" use:clickOutside={() => saveInlineEdit(dnt.id)}>
                      {#each inlineTags as tag (tag)}
                        <Badge variant="info" size="sm" class="flex items-center gap-1 text-[10px] py-0 px-1.5 leading-tight">
                          {tag}
                          <button
                            type="button"
                            onpointerdown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              removeInlineTag(tag);
                            }}
                            class="hover:text-red-500 rounded-full p-0.5 transition-colors cursor-pointer">&#10005;</button
                          >
                        </Badge>
                      {/each}
                      <input type="text" bind:value={inlineInputValue} onkeydown={(e) => handleInlineKeydown(e, dnt.id)} placeholder="Ketik lalu Enter..." class="flex-1 min-w-22.5 outline-none text-xs text-gray-700 bg-transparent placeholder:text-gray-300" use:focusOnMount />
                    </div>
                  {:else}
                    <button type="button" class="flex flex-wrap items-center gap-1 p-1.5 -ml-1.5 rounded-md hover:bg-blue-50 transition-colors cursor-pointer group text-left min-w-30" onclick={() => startInlineEdit(dnt)}>
                      {#if dnt.label}
                        {#each dnt.label
                          .split(",")
                          .map((l: string) => l.trim())
                          .filter((l: string) => l) as lbl}
                          <Badge variant="info" size="sm" class="text-[10px] py-0 leading-tight">{lbl}</Badge>
                        {/each}
                      {:else}
                        <span class="text-xs text-gray-400 italic border border-dashed border-gray-300 rounded px-2 py-0.5 group-hover:border-blue-400 group-hover:text-blue-500 transition-colors"> + Tambah Label </span>
                      {/if}
                      <span class="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5">
                        <Edit size={12} />
                      </span>
                    </button>
                  {/if}
                </TableCell>

                <TableCell>
                  <div class="flex flex-col gap-1">
                    <span class="text-sm font-semibold text-gray-900 leading-none">{dnt.total_transaksi || 0} Kali Transaksi</span>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span class={`w-2 h-2 rounded-full ${churn.color}`}></span>
                      <span class="text-xs text-gray-500 font-medium">{churn.label}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <span class="font-bold text-sm text-blue-600">
                    Rp {formatNumber(dnt.total_donasi || 0, "standard")}
                  </span>
                </TableCell>

                <TableCell class="text-right">
                  <Dropdown width="w-36" align="right">
                    {#snippet trigger()}
                      <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                        <MoreHorizontal size={16} />
                      </Button>
                    {/snippet}
                    <DropdownItem icon={Eye} onclick={() => console.log("Detail", dnt.id)}>Lihat Detail</DropdownItem>
                    <DropdownItem icon={Edit} onclick={() => console.log("Edit", dnt.id)}>Ubah Data</DropdownItem>
                    <div class="border-t border-(--color-border) my-1"></div>
                    <DropdownItem icon={Trash2} variant="danger" onclick={() => confirmDelete(dnt.id)}>Hapus</DropdownItem>
                  </Dropdown>
                </TableCell>
              </TableRow>
            {:else}
              <TableRow>
                <TableCell colspan={7} class="h-60 text-center text-gray-500">
                  {#if isLoading}
                    <LoadingBars size={50} class="text-(--color-primary)" />
                  {:else}
                    <div class="flex flex-col items-center justify-center text-gray-400">
                      <span class="text-sm">Tidak ada donatur yang ditemukan.</span>
                    </div>
                  {/if}
                </TableCell>
              </TableRow>
            {/each}
          </TableBody>
        </Table>
      </div>

      <div class="md:hidden flex flex-col bg-gray-50/30 gap-3">
        {#each donaturs as dnt (dnt.id)}
          {@const churn = getChurnData(dnt.probabilitas_churn || 0)}
          <div class="bg-white border border-gray-100 p-4 rounded-xl shadow-sm flex flex-col gap-3">
            <div class="flex justify-between items-start">
              <div class="flex flex-col gap-2">
                <span class="font-bold text-sm text-gray-900 leading-none">
                  {dnt.sapaan ? `${dnt.sapaan} ` : ""}{dnt.nama_donatur}
                </span>

                <div class="flex flex-col gap-1.5 mt-0.5">
                  <div class="flex items-center gap-2 text-gray-600">
                    <Phone size={12} class="shrink-0" />
                    <span class="text-xs font-medium">{dnt.nomor_hp_donatur}</span>
                  </div>

                  {#if dnt.email}
                    <div class="flex items-center gap-2 text-gray-500">
                      <Mail size={12} class="shrink-0" />
                      <span class="text-[11px]">{dnt.email}</span>
                    </div>
                  {/if}

                  <div class="flex items-center gap-2 text-gray-500">
                    <MapPin size={12} class="shrink-0" />
                    <span class="text-[11px]">{dnt.domisili || "Domisili tidak diketahui"}</span>
                  </div>
                </div>
              </div>

              <Dropdown width="w-32" align="right">
                {#snippet trigger()}
                  <button class="text-gray-400 hover:text-gray-700 p-1"><MoreHorizontal size={18} /></button>
                {/snippet}
                <DropdownItem icon={Eye}>Detail</DropdownItem>
                <DropdownItem icon={Edit}>Edit</DropdownItem>
              </Dropdown>
            </div>

            <div class="pt-1 pb-2">
              {#if editingLabelId === dnt.id}
                <div class="flex flex-wrap gap-1 items-center bg-white border border-blue-400 shadow-sm rounded-md p-1.5 min-h-9" use:clickOutside={() => saveInlineEdit(dnt.id)}>
                  {#each inlineTags as tag (tag)}
                    <Badge variant="info" size="sm" class="flex items-center gap-1 text-[9px] py-0 px-1.5">
                      {tag}
                      <button
                        type="button"
                        onpointerdown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          removeInlineTag(tag);
                        }}
                        class="hover:text-red-500 rounded-full p-0.5">&#10005;</button
                      >
                    </Badge>
                  {/each}
                  <input type="text" bind:value={inlineInputValue} onkeydown={(e) => handleInlineKeydown(e, dnt.id)} placeholder="Ketik..." class="flex-1 min-w-15 outline-none text-[11px] bg-transparent" use:focusOnMount />
                </div>
              {:else}
                <button type="button" class="flex items-center gap-1.5 flex-wrap p-1.5 -mx-1.5 rounded-md hover:bg-gray-50 text-left cursor-pointer group" onclick={() => startInlineEdit(dnt)}>
                  {#if dnt.pola_donasi}
                    <Badge variant="secondary" size="sm" shape="pill" class="text-[9px] py-0">{dnt.pola_donasi}</Badge>
                  {/if}
                  {#if dnt.label}
                    {#each dnt.label
                      .split(",")
                      .map((l: string) => l.trim())
                      .filter((l: string) => l) as lbl}
                      <Badge variant="info" size="sm" class="text-[9px] py-0">{lbl}</Badge>
                    {/each}
                  {:else}
                    <span class="text-[10px] text-gray-400 italic border border-dashed border-gray-300 rounded px-1.5 py-0.5">+ Tambah Label</span>
                  {/if}
                  <span class="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"><Edit size={10} /></span>
                </button>
              {/if}
            </div>

            <div class="bg-gray-50 p-2.5 rounded-lg grid grid-cols-2 gap-2 mt-1">
              <div class="flex flex-col">
                <span class="text-[10px] text-gray-400 font-medium">Total Transaksi</span>
                <span class="text-xs font-semibold text-gray-800">{dnt.total_transaksi || 0} Kali</span>
              </div>
              <div class="flex flex-col items-end text-right">
                <span class="text-[10px] text-gray-400 font-medium">Total Donasi</span>
                <span class="text-xs font-bold text-blue-600">Rp {formatNumber(dnt.total_donasi || 0, "compact")}</span>
              </div>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-gray-50">
              <span class="text-[10px] text-gray-400">Status Retensi</span>
              <div class="flex items-center gap-1.5">
                <span class={`w-2 h-2 rounded-full ${churn.color}`}></span>
                <span class="text-[10px] font-medium text-gray-600">{churn.label}</span>
              </div>
            </div>
          </div>
        {:else}
          <div class="py-16 flex justify-center text-center text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
            {#if isLoading}
              <LoadingBars size={40} class="text-(--color-primary)" />
            {:else}
              Tidak ada donatur.
            {/if}
          </div>
        {/each}
      </div>
    </CardContent>

    <CardFooter class="p-3! md:px-6!">
      {#if donaturs.length > 0}
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
    <h3 class="text-lg font-bold text-gray-900 mb-2">Hapus Donatur?</h3>
    <p class="text-sm text-gray-500">Semua data riwayat donasi juga mungkin akan terpengaruh. Lanjutkan?</p>
  </div>
  {#snippet footer()}
    <Button variant="outline" class="w-full" onclick={() => (showDeleteModal = false)}>Batal</Button>
    <Button variant="danger" class="w-full" onclick={executeDelete}>Ya, Hapus Data</Button>
  {/snippet}
</Modal>
