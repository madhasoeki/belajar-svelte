<script lang="ts">
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
  } from "$lib/components/ui/card";

  // Import semua komponen Forms
  import Input from "$lib/components/ui/forms/Input.svelte";
  import CurrencyInput from "$lib/components/ui/forms/CurrencyInput.svelte";
  import Textarea from "$lib/components/ui/forms/Textarea.svelte";
  import Select from "$lib/components/ui/forms/Select.svelte";
  import Checkbox from "$lib/components/ui/forms/Checkbox.svelte";
  import Radio from "$lib/components/ui/forms/Radio.svelte";
  import {
    User,
    Mail,
    Lock,
    Search,
    CreditCard,
    AlertCircle,
    DollarSign,
    Hash,
    MessageSquare,
  } from "lucide-svelte";

  // State untuk Input Text
  let textValue = $state("");
  let emailValue = $state("");
  let passwordValue = $state("");
  let errorValue = $state("mada@domain");

  // State untuk Angka & Mata Uang
  let stockValue = $state<number | null>(null);
  let moneyValue = $state<number | null>(null);
  let donationValue = $state<number | null>(null);

  // State untuk Textarea
  let notesValue = $state("");
  let errorNotesValue = $state("");

  // State & Options untuk Select
  let roleValue = $state("");
  const roleOptions = [
    { value: "admin", label: "Administrator" },
    { value: "manager", label: "Manajer Gudang" },
    { value: "staff", label: "Staf Operasional" },
  ];

  let statusValue = $state("");
  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
  ];

  // State untuk Checkbox & Radio
  let agreeTerms = $state(false);
  let isSubscribed = $state(true);
  let errorCheckbox = $state(false);

  let metodePembayaran = $state("transfer"); // Default value untuk radio
  let errorRadio = $state("");
</script>

<div class="p-8 max-w-7xl mx-auto pb-20">
  <div class="border-b pb-4 mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Komponen Forms Showcase</h1>
    <p class="text-gray-500">
      Dokumentasi variasi, state, dan anatomi seluruh komponen form dasar.
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
    <div class="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>1. Input Dasar</CardTitle>
          <CardDescription
            >Penggunaan input standar untuk data teks pendek.</CardDescription
          >
        </CardHeader>
        <CardContent class="grid grid-cols-1 gap-6">
          <Input
            label="Teks Standar"
            placeholder="Masukkan nama lengkap..."
            bind:value={textValue}
          />

          <Input
            label="Alamat Email"
            type="email"
            placeholder="nama@perusahaan.com"
            bind:value={emailValue}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Textarea</CardTitle>
          <CardDescription
            >Komponen untuk input teks panjang (multiline).</CardDescription
          >
        </CardHeader>
        <CardContent class="grid grid-cols-1 gap-6">
          <Textarea
            label="Catatan Fix (Tidak bisa di-resize)"
            rows={3}
            resizable={false}
            placeholder="Ukuran textarea ini dikunci..."
          />

          <Textarea
            label="Komentar (Disabled)"
            rows={2}
            value="Fitur komentar sedang ditutup."
            disabled={true}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Select Dropdown</CardTitle>
          <CardDescription
            >Komponen untuk memilih satu opsi dari daftar statis.</CardDescription
          >
        </CardHeader>
        <CardContent class="grid grid-cols-1 gap-6">
          <Select
            label="Peran Pengguna"
            bind:value={roleValue}
            options={roleOptions}
            placeholder="Pilih peran..."
            helper="Value terpilih: {roleValue || 'Belum ada'}"
          />

          <Select
            label="Provinsi (Disabled)"
            options={[{ value: "jkt", label: "DKI Jakarta" }]}
            value="jkt"
            disabled={true}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Radio Buttons</CardTitle>
          <CardDescription
            >Pilihan tunggal dalam sebuah grup (Single Choice).</CardDescription
          >
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <div class="space-y-3">
            <p class="text-sm font-medium text-(--color-text-secondary)">
              Pilih Metode Pembayaran
            </p>
            <Radio
              name="payment"
              value="transfer"
              bind:group={metodePembayaran}
              label="Transfer Bank (BCA/BSI)"
            />
            <Radio
              name="payment"
              value="ewallet"
              bind:group={metodePembayaran}
              label="E-Wallet (OVO/Dana)"
            />
            <Radio
              name="payment"
              value="cc"
              bind:group={metodePembayaran}
              label="Kartu Kredit (Sedang Gangguan)"
              disabled={true}
            />
          </div>
          <p class="text-xs text-(--color-text-muted) border-t pt-3 mt-1">
            Value aktif: <strong>{metodePembayaran}</strong>
          </p>
        </CardContent>
      </Card>
    </div>

    <div class="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>5. Checkbox & Toggles</CardTitle>
          <CardDescription
            >Implementasi opsi boolean mandiri (Multiple Choice / True-False).</CardDescription
          >
        </CardHeader>
        <CardContent class="grid grid-cols-1 gap-4">
          <Checkbox
            id="terms"
            label="Saya menyetujui syarat dan ketentuan sistem"
            bind:checked={agreeTerms}
          />

          <Checkbox
            id="subscribe"
            label="Berlangganan notifikasi email"
            helper="Kami hanya akan mengirimkan informasi penting."
            bind:checked={isSubscribed}
          />

          <Checkbox
            id="disabled_check"
            label="Opsi terkunci (Disabled)"
            checked={true}
            disabled={true}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Ikonografi & Numerik</CardTitle>
          <CardDescription
            >Input dengan ikon dan format angka khusus.</CardDescription
          >
        </CardHeader>
        <CardContent class="grid grid-cols-1 gap-6">
          <Input
            label="Kombinasi Dua Ikon"
            iconLeft={CreditCard}
            iconRight={AlertCircle}
            placeholder="Nomor rekening..."
          />

          <Input
            label="Kata Sandi (Password Toggle)"
            type="password"
            iconLeft={Lock}
            placeholder="Masukkan sandi rahasia"
            bind:value={passwordValue}
          />

          <Input
            label="Stok Barang (Tanpa Spin Button)"
            type="number"
            hideSpinButtons={true}
            iconLeft={Hash}
            bind:value={stockValue}
            placeholder="0"
          />

          <CurrencyInput
            label="Nominal Transaksi"
            bind:value={donationValue}
            currencyPrefix="Rp"
            placeholder="Rp 0"
          />
        </CardContent>
      </Card>

      <Card class="border-l-4 border-red-500 bg-red-50/30">
        <CardHeader>
          <CardTitle class="text-red-700">7. State Error Handling</CardTitle>
          <CardDescription
            >Simulasi tampilan error pada semua jenis form.</CardDescription
          >
        </CardHeader>
        <CardContent class="grid grid-cols-1 gap-6">
          <Input
            label="Email Pribadi"
            iconLeft={Mail}
            bind:value={errorValue}
            error="Format email tidak valid. Pastikan mengandung '@'."
          />

          <Textarea
            label="Alasan Pembatalan"
            rows={2}
            bind:value={errorNotesValue}
            error="Alasan pembatalan wajib diisi minimal 20 karakter."
          />

          <Select
            label="Status Publikasi"
            bind:value={statusValue}
            options={statusOptions}
            error="Anda harus memilih status sebelum menyimpan data."
          />

          <Checkbox
            id="error_check"
            label="Konfirmasi Data"
            bind:checked={errorCheckbox}
            error="Anda harus mencentang kotak ini untuk melanjutkan."
          />

          <Radio
            name="error_radio_demo"
            value="pilih"
            bind:group={errorRadio}
            label="Persetujuan Aturan Main"
            error="Pilihan ini wajib dipilih untuk memproses pendaftaran."
          />
        </CardContent>
      </Card>
    </div>
  </div>
</div>
