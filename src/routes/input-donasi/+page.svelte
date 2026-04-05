<script lang="ts">
  import { Card, CardHeader, CardContent } from "$lib/components/ui/card";
  import { toastStore } from "$lib/stores/toast.svelte";
  import { Button } from "$lib/components/ui/button";
  import {
    Input,
    CurrencyInput,
    Select,
    Radio,
    DatePicker,
    PhoneAutocomplete, // [BARU] Impor komponen baru
  } from "$lib/components/ui/forms";

  import { User, Phone, Wallet, FileText, CheckCircle2 } from "lucide-svelte";
  import { formatNumber } from "$lib/utils/formatter";
  import { apiClient } from "$lib/utils/api";

  import { API_ENDPOINTS } from "$lib/constans/endpoints";

  // --- STATE FORMULIR ---
  let donorGreeting = $state("Kak");
  let donorName = $state("");
  let donorPhone = $state("");
  let selectedProgram = $state("");
  let selectedRekening = $state("");
  let selectedSumber = $state("");
  let rawAmount = $state<number | null>(null);
  let donaturId = $state("");
  let lastSelectedPhone = $state("");

  import { getLocalDateString } from "$lib/utils/date";

  let todayLocal = getLocalDateString();
  let donationDate = $state(todayLocal);

  $effect(() => {
    if (donorPhone !== lastSelectedPhone) {
      donaturId = "";
    }
  });

  const greetings = ["Kak", "Ayah", "Bunda", "Bapak", "Ibu"];

  const programs = [
    { label: "Wakaf Sumur", value: "Wakaf Sumur" },
    { label: "Pembangunan Masjid", value: "Pembangunan Masjid" },
    { label: "Beasiswa Tahfidz", value: "Beasiswa Tahfidz" },
    { label: "Indonesia Cetak Huffadz", value: "Indonesia Cetak Huffadz" },
    { label: "Zakat Fitrah", value: "Zakat Fitrah" },
    { label: "Infaq Umum", value: "Infaq Umum" },
  ];

  const rekenings = [
    { label: "BCA - 1234567890", value: "BCA - 1234567890" },
    { label: "BSI - 7123456789", value: "BSI - 7123456789" },
    { label: "BNI - 0987654321", value: "BNI - 0987654321" },
    { label: "MANDIRI - 1122334455", value: "MANDIRI - 1122334455" },
  ];

  const sumber = [
    { label: "Iklan", value: "Iklan" },
    { label: "Broadcast WhatsApp", value: "Broadcast WhatsApp" },
    { label: "Broadcast Email", value: "Broadcast Email" },
    { label: "Story WhatsApp", value: "Story WhatsApp" },
  ];

  const quickAmounts = [5000, 10000, 25000, 50000, 100000];

  // --- VALIDASI ---
  const phoneError = $derived(
    donorPhone.trim() !== "" && !donorPhone.startsWith("628")
      ? "Nomor harus diawali dengan 628 (bukan 08)"
      : "",
  );

  const isValid = $derived(
    donorName.trim() !== "" &&
      donorPhone.startsWith("628") &&
      donorPhone.length >= 10 &&
      selectedProgram !== "" &&
      selectedRekening !== "" &&
      selectedSumber !== "" &&
      rawAmount !== null &&
      rawAmount > 0 &&
      donationDate !== "",
  );

  function setQuickAmount(val: number) {
    rawAmount = val;
  }

  function handleSelectDonatur(donatur: {
    id: string;
    sapaan: string;
    nama_donatur: string; 
    nomor_hp_donatur: string;
    transaksi?: Array<{
      tanggal_transaksi: string;
      program: string;
      rekening: string;
      nominal: number;
    }>;
  }) {
    donaturId = donatur.id;
    // Gunakan fallback jaga-jaga kalau mapping dari komponennya beda
    lastSelectedPhone = donatur.nomor_hp_donatur; 

    donorName = donatur.nama_donatur;
    donorGreeting = donatur.sapaan || "Kak";

    let toastMessage = `Data ${donorGreeting} ${donorName} otomatis diisi.`;

    // [BARU] Logika Autofill Transaksi Terakhir
    if (donatur.transaksi && donatur.transaksi.length > 0) {
      const lastTrx = donatur.transaksi[0]; // Mengambil data pertama dari array

      selectedProgram = lastTrx.program;
      selectedRekening = lastTrx.rekening;
      rawAmount = lastTrx.nominal;

      toastMessage = `Data donatur dan riwayat donasi terakhir berhasil dimuat.`;
    } else {
      // Jika tidak ada riwayat, reset field transaksi
      selectedProgram = "";
      selectedRekening = "";
      rawAmount = null;
    }

    toastStore.info(toastMessage, "Donatur Ditemukan");
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!isValid) return;

    let isLoading = true;

    const payload = {
      donatur_id: donaturId, // Terisi jika klik dropdown, kosong jika baru
      nama_donatur: donorName, // Tetap dikirim agar backend bisa insert jika donatur_id kosong
      sapaan: donorGreeting, // Tetap dikirim
      nomor_hp_donatur: donorPhone, // Tetap dikirim

      tanggal_transaksi: donationDate, // Sesuai JSON Golang
      program: selectedProgram, // Sesuai JSON Golang
      rekening: selectedRekening, // Sesuai JSON Golang
      nominal: rawAmount, // Sesuai JSON Golang
      sumber: selectedSumber, // Sesuai JSON Golang
      status: "success", // Langsung "success" seperti kesepakatan
    };

    try {
      const response = await apiClient.post(
        API_ENDPOINTS.DONASI.CREATE,
        payload,
      );
      console.log("Response dari server:", response);

      toastStore.success(
        `Donasi Rp ${formatNumber(Number(rawAmount), "standard")} atas nama ${donorName} telah dicatat.`,
        "Berhasil!",
      );

      donaturId = "";
      lastSelectedPhone = "";
      donorName = "";
      donorPhone = "";
      selectedProgram = "";
      selectedRekening = "";
      selectedSumber = "";
      rawAmount = null;
      donorGreeting = "Kak";

      // Kembalikan fokus ke nomor HP (karena sekarang posisinya pertama)
      document.getElementById("phone-auto")?.focus();
    } catch (error: any) {
      toastStore.error(
        error.message ||
          "Gagal menyimpan donasi. Periksa koneksi atau validasi server.",
        "Input Gagal",
      );
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="max-w-full mx-auto flex flex-col gap-6 w-full pb-20 md:pb-6">
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
              {#each greetings as greet}
                <Radio label={greet} value={greet} bind:group={donorGreeting} />
              {/each}
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PhoneAutocomplete
              id="phone-auto"
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
          title="Detail Donasi"
          icon={Wallet}
          iconColor="text-emerald-500"
          class="pb-2 border-b border-gray-50"
        />
        <CardContent class="pt-4 flex flex-col gap-5">
          <DatePicker
            label="Tanggal Transaksi *"
            bind:value={donationDate}
            maxDate={todayLocal}
          />

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

          <div class="flex flex-col gap-2">
            <CurrencyInput
              label="Nominal Donasi *"
              bind:value={rawAmount}
              currencyPrefix="Rp"
              placeholder="Rp 0"
            />

            <div class="flex flex-wrap gap-2 mt-1">
              {#each quickAmounts as qAmt}
                <Button
                  variant="outline"
                  size="sm"
                  onclick={() => setQuickAmount(qAmt)}
                  class="text-xs font-medium text-gray-600 cursor-pointer"
                >
                  {formatNumber(qAmt, "compact")}
                </Button>
              {/each}
            </div>
          </div>

          <Select
            label="Sumber *"
            options={sumber}
            bind:value={selectedSumber}
            searchable={true}
          />
        </CardContent>
      </Card>
    </form>

    <div class="lg:col-span-1 sticky top-20 flex flex-col gap-4">
      <Card class="shadow-md border-(--color-primary)/20">
        <CardHeader
          title="Ringkasan Transaksi"
          class="pb-3 border-b border-gray-100"
        />
        <CardContent class="pt-4 flex flex-col gap-4">
          <div class="flex flex-col gap-3 text-sm">
            <div class="flex justify-between items-start gap-4">
              <span class="text-gray-500">Tanggal</span>
              <span class="font-semibold text-gray-900 text-right"
                >{donationDate || "-"}</span
              >
            </div>
            <div class="flex justify-between items-start gap-4">
              <span class="text-gray-500">Donatur</span>
              <span class="font-semibold text-gray-900 text-right">
                {donorName ? `${donorGreeting} ${donorName}` : "-"}
              </span>
            </div>
            <div class="flex justify-between items-start gap-4">
              <span class="text-gray-500">Program</span>
              <span class="font-semibold text-gray-900 text-right"
                >{selectedProgram || "-"}</span
              >
            </div>
            <div class="flex justify-between items-start gap-4">
              <span class="text-gray-500">Rekening</span>
              <span class="font-semibold text-gray-900 text-right"
                >{selectedRekening || "-"}</span
              >
            </div>
          </div>

          <div
            class="h-px w-full bg-gray-100 border-dashed border-t border-gray-300"
          ></div>

          <div class="flex justify-between items-end">
            <span
              class="text-sm font-semibold text-gray-500 uppercase tracking-wider"
              >Total</span
            >
            <div class="flex flex-col items-end">
              <span class="text-xs text-gray-400 font-medium leading-none mb-1"
                >Rp</span
              >
              <span
                class="text-2xl font-bold text-(--color-primary) leading-none"
              >
                {rawAmount ? formatNumber(rawAmount, "standard") : "0"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div class="flex flex-col gap-2">
        <Button
          variant="primary"
          class="w-full py-3.5 text-base shadow-sm opacity-100 transition-all flex justify-center gap-2"
          disabled={!isValid}
          onclick={handleSubmit}
        >
          <CheckCircle2 size={20} />
          Simpan Transaksi
        </Button>

        {#if !isValid}
          <p class="text-[11px] text-center text-gray-400 font-medium px-2">
            Pastikan semua kolom bertanda (*) terisi dan format Nomor WhatsApp
            diawali 628.
          </p>
        {/if}
      </div>
    </div>
  </div>
</div>
