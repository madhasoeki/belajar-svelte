<script lang="ts">
  import type { PageData } from "./$types";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { ROUTES } from "$lib/constans/routes";
  import { API_ENDPOINTS } from "$lib/constans/endpoints";
  import { Button } from "$lib/components/ui/button";
  import Badge from "$lib/components/ui/badge/Badge.svelte";
  import { Card, CardContent, CardHeader } from "$lib/components/ui/card";
  import LoadingBars from "$lib/components/ui/loading/LoadingBars.svelte";
  import { toastStore } from "$lib/stores/toast.svelte";
  import { formatNumber } from "$lib/utils/formatter";
  import { apiClient } from "$lib/utils/api";
  import {
    ArrowLeft,
    CalendarDays,
    CircleDollarSign,
    Pencil,
    ReceiptText,
    User,
    WalletCards,
  } from "lucide-svelte";

  let { data }: { data: PageData } = $props();
  const idTransaksi = $derived(data.idTransaksi);

  let isLoading = $state(true);
  let detail = $state<any | null>(null);
  type BadgeVariant =
    | "success"
    | "warning"
    | "danger"
    | "secondary"
    | "info"
    | "primary"
    | "outline";

  const statusLabels: Record<string, string> = {
    pending: "Pending",
    success: "Berhasil",
    failed: "Gagal",
    duplicate: "Duplikat",
  };

  const statusVariant: Record<string, BadgeVariant> = {
    pending: "warning",
    success: "success",
    failed: "danger",
    duplicate: "secondary",
  };

  const donorName = $derived(
    detail?.donatur?.nama_donatur || detail?.nama_donatur || "Hamba Allah",
  );

  const donorPhone = $derived(
    detail?.donatur?.nomor_hp_donatur || detail?.nomor_hp_donatur || "-",
  );

  const statusValue = $derived(String(detail?.status || "-").toLowerCase());
  const currentStatusVariant = $derived<BadgeVariant>(
    statusVariant[statusValue] || "secondary",
  );

  function formatDate(isoString: string) {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  async function fetchDetail() {
    isLoading = true;
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.TRANSAKSI.LIST}/${idTransaksi}`,
      );
      const dataTrx = response.data || response;
      detail = Array.isArray(dataTrx) ? dataTrx[0] : dataTrx;
    } catch (error: any) {
      toastStore.error(
        error?.message || "Gagal mengambil detail transaksi.",
        "Data Tidak Ditemukan",
      );
      goto(ROUTES.TRANSAKSI.INDEX);
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    if (!idTransaksi) return;
    fetchDetail();
  });
</script>

<div class="max-w-full mx-auto flex flex-col gap-6 w-full pb-20 md:pb-6">
  <div class="flex items-center justify-between gap-3">
    <Button
      variant="ghost"
      class="flex items-center gap-2"
      onclick={() => goto(ROUTES.TRANSAKSI.INDEX)}
    >
      <ArrowLeft size={16} />
      Kembali
    </Button>

    <Button
      variant="primary"
      class="flex items-center gap-2"
      onclick={() => goto(ROUTES.TRANSAKSI.EDIT(idTransaksi))}
    >
      <Pencil size={16} />
      Edit Transaksi
    </Button>
  </div>

  {#if isLoading}
    <Card>
      <CardContent class="py-12 flex flex-col items-center gap-3">
        <LoadingBars size={34} class="text-(--color-primary)" />
        <span class="text-sm text-gray-500">Memuat detail transaksi...</span>
      </CardContent>
    </Card>
  {:else if detail}
    <Card>
      <CardHeader
        title="Detail Transaksi"
        description={`Informasi lengkap transaksi ${detail.id || idTransaksi}`}
        icon={ReceiptText}
        iconColor="text-(--color-primary)"
      />
      <CardContent class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div
          class="rounded-xl border border-gray-200 p-4 flex flex-col gap-3 bg-white"
        >
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <User size={16} />
            Donatur
          </div>
          <p class="text-base font-semibold text-gray-900">{donorName}</p>
          <p class="text-sm text-gray-600">{donorPhone}</p>
          <p class="text-xs text-gray-500">
            Sapaan: {detail.sapaan || detail.donatur?.sapaan || "-"}
          </p>
        </div>

        <div
          class="rounded-xl border border-gray-200 p-4 flex flex-col gap-3 bg-white"
        >
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <CalendarDays size={16} />
            Tanggal
          </div>
          <p class="text-base font-semibold text-gray-900">
            {formatDate(detail.tanggal_transaksi)}
          </p>
          <p class="text-xs text-gray-500">ID: {detail.id || idTransaksi}</p>
        </div>

        <div
          class="rounded-xl border border-gray-200 p-4 flex flex-col gap-3 bg-white"
        >
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <CircleDollarSign size={16} />
            Nominal dan Status
          </div>
          <p class="text-2xl font-bold text-(--color-primary)">
            Rp {formatNumber(Number(detail.nominal || 0), "standard")}
          </p>
          <div>
            <Badge
              variant={currentStatusVariant}
              size="sm"
              class="text-[10px] uppercase tracking-wider"
            >
              {statusLabels[statusValue] || detail.status || "-"}
            </Badge>
          </div>
        </div>

        <div
          class="rounded-xl border border-gray-200 p-4 flex flex-col gap-3 bg-white"
        >
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <WalletCards size={16} />
            Kategori Transaksi
          </div>
          <div class="space-y-1.5 text-sm">
            <p>
              <span class="text-gray-500">Program:</span>
              <span class="font-medium text-gray-900"
                >{detail.program?.nama_program || "-"}</span
              >
            </p>
            <p>
              <span class="text-gray-500">Rekening:</span>
              <span class="font-medium text-gray-900"
                >{detail.rekening?.alias ||
                  detail.rekening?.nama_bank ||
                  "-"}</span
              >
            </p>
            <p>
              <span class="text-gray-500">Sumber:</span>
              <span class="font-medium text-gray-900"
                >{detail.sumber?.nama_sumber ||
                  detail.sumber?.sumber_transaksi ||
                  "-"}</span
              >
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  {:else}
    <Card>
      <CardContent class="py-12 text-center text-sm text-gray-500">
        Detail transaksi tidak ditemukan.
      </CardContent>
    </Card>
  {/if}
</div>
