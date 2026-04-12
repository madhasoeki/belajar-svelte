<script lang="ts">
  import type { PageData } from "./$types";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { ROUTES } from "$lib/constans/routes";
  import { API_ENDPOINTS } from "$lib/constans/endpoints";
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent, CardHeader } from "$lib/components/ui/card";
  import {
    CurrencyInput,
    DatePicker,
    Input,
    PhoneAutocomplete,
    Radio,
    Select,
  } from "$lib/components/ui/forms";
  import LoadingBars from "$lib/components/ui/loading/LoadingBars.svelte";
  import { toastStore } from "$lib/stores/toast.svelte";
  import { formatNumber } from "$lib/utils/formatter";
  import { getMasterDropdownOptions } from "$lib/utils/helpers";
  import { apiClient } from "$lib/utils/api";
  import {
    ArrowLeft,
    CircleCheck,
    Pencil,
    ReceiptText,
    User,
    Wallet,
  } from "lucide-svelte";

  let { data }: { data: PageData } = $props();
  const idTransaksi = $derived(data.idTransaksi);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const greetings = ["Kak", "Ayah", "Bunda", "Bapak", "Ibu"];
  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Berhasil", value: "success" },
    { label: "Gagal", value: "failed" },
    { label: "Duplikat", value: "duplicate" },
  ];

  let programs = $state<{ label: string; value: string }[]>([]);
  let rekenings = $state<{ label: string; value: string }[]>([]);
  let sumbers = $state<{ label: string; value: string }[]>([]);

  let donaturId = $state("");
  let donorGreeting = $state("Kak");
  let donorName = $state("");
  let donorPhone = $state("");
  let lastSelectedPhone = $state("");

  let donationDate = $state(todayStr);
  let selectedProgram = $state("");
  let selectedRekening = $state("");
  let selectedSumber = $state("");
  let selectedStatus = $state("success");
  let rawAmount = $state<number | null>(null);

  let isFetching = $state(true);
  let isSaving = $state(false);

  const phoneError = $derived(
    donorPhone.trim() !== "" && !donorPhone.startsWith("628")
      ? "Nomor harus diawali dengan 628 (bukan 08)"
      : "",
  );

  const isValid = $derived(
    donorName.trim() !== "" &&
      donorPhone.startsWith("628") &&
      donorPhone.length >= 10 &&
      donationDate !== "" &&
      selectedProgram !== "" &&
      selectedRekening !== "" &&
      selectedSumber !== "" &&
      selectedStatus !== "" &&
      rawAmount !== null &&
      rawAmount > 0,
  );

  const selectedProgramLabel = $derived(
    programs.find((p) => p.value === selectedProgram)?.label || "-",
  );
  const selectedRekeningLabel = $derived(
    rekenings.find((r) => r.value === selectedRekening)?.label || "-",
  );
  const resolvedDonaturId = $derived(
    donorPhone === lastSelectedPhone ? donaturId : "",
  );

  function toDateInput(value: string | null | undefined): string {
    if (!value) return todayStr;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    return value.slice(0, 10);
  }

  function pick<T = string>(...values: T[]): T {
    for (const value of values) {
      if (
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
      ) {
        return value;
      }
    }
    return "" as T;
  }

  function handleSelectDonatur(donatur: {
    id: string;
    sapaan?: string;
    nama_donatur: string;
    nomor_hp_donatur: string;
  }) {
    donaturId = donatur.id;
    donorGreeting = donatur.sapaan || "Kak";
    donorName = donatur.nama_donatur;
    donorPhone = donatur.nomor_hp_donatur;
    lastSelectedPhone = donatur.nomor_hp_donatur;
  }

  async function loadPage() {
    isFetching = true;
    try {
      const [master, trxRes] = await Promise.all([
        getMasterDropdownOptions(),
        apiClient.get(`${API_ENDPOINTS.TRANSAKSI.LIST}/${idTransaksi}`),
      ]);

      programs = master.programs;
      rekenings = master.rekenings;
      sumbers = master.sumbers;

      const dataTrx = trxRes.data || trxRes;
      const detail = Array.isArray(dataTrx) ? dataTrx[0] : dataTrx;

      donaturId = pick(detail.donatur_id, detail.donatur?.id);
      donorGreeting = pick(detail.sapaan, detail.donatur?.sapaan, "Kak");
      donorName = pick(detail.nama_donatur, detail.donatur?.nama_donatur);
      donorPhone = pick(
        detail.nomor_hp_donatur,
        detail.donatur?.nomor_hp_donatur,
      );
      lastSelectedPhone = donorPhone;
      donationDate = toDateInput(detail.tanggal_transaksi);

      selectedProgram = pick(detail.program_id, detail.program?.id);
      selectedRekening = pick(detail.rekening_id, detail.rekening?.id);
      selectedSumber = pick(detail.sumber_id, detail.sumber?.id);
      selectedStatus = pick(detail.status, "success").toLowerCase();

      const nominal = Number(detail.nominal);
      rawAmount = Number.isFinite(nominal) ? nominal : null;
    } catch (error: any) {
      toastStore.error(
        error?.message || "Gagal memuat detail transaksi.",
        "Data Tidak Ditemukan",
      );
      goto(ROUTES.TRANSAKSI.INDEX);
    } finally {
      isFetching = false;
    }
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!isValid) return;

    isSaving = true;
    const payload = {
      donatur_id: resolvedDonaturId,
      sapaan: donorGreeting,
      nama_donatur: donorName,
      nomor_hp_donatur: donorPhone,
      tanggal_transaksi: donationDate,
      program_id: selectedProgram,
      rekening_id: selectedRekening,
      sumber_id: selectedSumber,
      nominal: rawAmount,
      status: selectedStatus,
    };

    try {
      await apiClient.put(
        `${API_ENDPOINTS.TRANSAKSI.LIST}/${idTransaksi}`,
        payload,
      );
      toastStore.success("Data transaksi berhasil diperbarui.", "Berhasil");
      goto(ROUTES.TRANSAKSI.DETAIL(idTransaksi));
    } catch (error: any) {
      toastStore.error(
        error?.message || "Gagal memperbarui transaksi.",
        "Update Gagal",
      );
    } finally {
      isSaving = false;
    }
  }

  onMount(() => {
    if (!idTransaksi) return;
    loadPage();
  });
</script>

<div class="max-w-full mx-auto flex flex-col gap-6 w-full pb-20 md:pb-6">
  <div class="flex items-center justify-between gap-3">
    <Button
      variant="ghost"
      class="flex items-center gap-2"
      onclick={() => goto(ROUTES.TRANSAKSI.DETAIL(idTransaksi))}
    >
      <ArrowLeft size={16} /> Kembali
    </Button>
    <span class="text-xs md:text-sm text-gray-500">ID: {idTransaksi}</span>
  </div>

  {#if isFetching}
    <Card>
      <CardContent class="py-12 flex flex-col items-center gap-3">
        <LoadingBars size={34} class="text-(--color-primary)" />
        <span class="text-sm text-gray-500">Memuat detail transaksi...</span>
      </CardContent>
    </Card>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <form onsubmit={handleSubmit} class="lg:col-span-2 flex flex-col gap-6">
        <Card>
          <CardHeader
            title="Informasi Donatur"
            icon={User}
            iconColor="text-blue-500"
            class="pb-2"
          />
          <CardContent class="pt-4 flex flex-col gap-4">
            <div class="flex flex-col gap-2.5">
              <span class="text-sm font-medium text-(--color-text-secondary)"
                >Sapaan</span
              >
              <div class="flex flex-wrap items-center gap-4">
                {#each greetings as greet (greet)}
                  <Radio
                    label={greet}
                    value={greet}
                    bind:group={donorGreeting}
                  />
                {/each}
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PhoneAutocomplete
                id="phone-edit-auto"
                label="Nomor WhatsApp *"
                placeholder="6281234567890"
                bind:value={donorPhone}
                error={phoneError}
                onSelectDonatur={handleSelectDonatur}
              />

              <Input
                label="Nama Lengkap *"
                type="text"
                iconLeft={User}
                placeholder="Contoh: Hamba Allah"
                bind:value={donorName}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Detail Transaksi"
            icon={ReceiptText}
            iconColor="text-emerald-500"
            class="pb-2"
          />
          <CardContent class="pt-4 flex flex-col gap-5">
            <DatePicker
              label="Tanggal Transaksi *"
              bind:value={donationDate}
              maxDate={todayStr}
            />

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Program Tujuan *"
                options={programs}
                bind:value={selectedProgram}
                searchable={true}
              />
              <Select
                label="Rekening *"
                options={rekenings}
                bind:value={selectedRekening}
                searchable={true}
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Sumber *"
                options={sumbers}
                bind:value={selectedSumber}
                searchable={true}
              />
              <Select
                label="Status *"
                options={statusOptions}
                bind:value={selectedStatus}
              />
            </div>

            <CurrencyInput
              label="Nominal Donasi *"
              bind:value={rawAmount}
              currencyPrefix="Rp"
              placeholder="Rp 0"
            />
          </CardContent>
        </Card>
      </form>

      <div class="lg:col-span-1 sticky top-20 flex flex-col gap-4">
        <Card class="shadow-md border-(--color-primary)/20">
          <CardHeader
            title="Ringkasan Perubahan"
            icon={Wallet}
            iconColor="text-(--color-primary)"
            class="pb-3 border-b border-gray-100"
          />
          <CardContent class="pt-4 flex flex-col gap-4 text-sm">
            <div class="flex justify-between gap-4">
              <span class="text-gray-500">Donatur</span>
              <span class="font-semibold text-gray-900 text-right"
                >{donorName ? `${donorGreeting} ${donorName}` : "-"}</span
              >
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-gray-500">Tanggal</span>
              <span class="font-semibold text-gray-900 text-right"
                >{donationDate || "-"}</span
              >
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-gray-500">Program</span>
              <span class="font-semibold text-gray-900 text-right"
                >{selectedProgramLabel}</span
              >
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-gray-500">Rekening</span>
              <span class="font-semibold text-gray-900 text-right"
                >{selectedRekeningLabel}</span
              >
            </div>
            <div
              class="h-px w-full bg-gray-100 border-dashed border-t border-gray-300"
            ></div>
            <div class="flex justify-between items-end">
              <span
                class="text-sm font-semibold text-gray-500 uppercase tracking-wider"
                >Nominal</span
              >
              <span
                class="text-2xl font-bold text-(--color-primary) leading-none"
              >
                {rawAmount
                  ? `Rp ${formatNumber(rawAmount, "standard")}`
                  : "Rp 0"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Button
          variant="primary"
          class="w-full py-3.5 text-base shadow-sm opacity-100 transition-all flex justify-center gap-2"
          disabled={!isValid || isSaving}
          onclick={handleSubmit}
          isLoading={isSaving}
        >
          {#if isSaving}
            Menyimpan...
          {:else}
            <CircleCheck size={20} />
            Simpan Perubahan
          {/if}
        </Button>

        <Button
          variant="outline"
          class="w-full flex justify-center gap-2"
          onclick={() => goto(ROUTES.TRANSAKSI.DETAIL(idTransaksi))}
        >
          <Pencil size={16} />
          Lihat Detail Setelah Simpan
        </Button>
      </div>
    </div>
  {/if}
</div>
