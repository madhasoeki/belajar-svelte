<script lang="ts">
  // 1. Import ekosistem Card
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
  } from "$lib/components/ui/card";

  // 2. Import komponen Badge (sesuaikan path-nya jika berbeda)
  import Badge from "$lib/components/ui/badge/Badge.svelte";
  import Button from "$lib/components/ui/button/Button.svelte"; // Untuk tombol reset

  // 3. Import Icon
  import {
    CheckCircle,
    AlertTriangle,
    Info,
    Clock,
    Tag,
    ArrowRight,
    RotateCcw,
  } from "lucide-svelte";

  // State untuk demonstrasi interaktif (Fitur Dismissable)
  let activeFilters = $state(["Pop!_OS", "Svelte", "Golang", "Laravel"]);

  function removeFilter(filterToRemove: string) {
    activeFilters = activeFilters.filter((f) => f !== filterToRemove);
  }

  function resetFilters() {
    activeFilters = ["Pop!_OS", "Svelte", "Golang", "Laravel"];
  }
</script>

<div class="p-8 space-y-8 max-w-4xl mx-auto">
  <div class="border-b pb-4 mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Badge & Tag Showcase</h1>
    <p class="text-gray-500">
      Dokumentasi penggunaan komponen Badge untuk indikator status, label, dan
      filter interaktif.
    </p>
  </div>

  <Card>
    <CardHeader>
      <CardTitle>1. Varian Status (Variants)</CardTitle>
      <CardDescription>
        Warna latar menggunakan pendekatan "soft" agar data di tabel tetap mudah
        dibaca dan tidak menyebabkan mata cepat lelah (eye fatigue).
      </CardDescription>
    </CardHeader>
    <CardContent class="flex flex-wrap gap-4">
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Berhasil</Badge>
      <Badge variant="warning">Menunggu Konfirmasi</Badge>
      <Badge variant="danger">Gagal / Dibatalkan</Badge>
      <Badge variant="info">Informasi</Badge>
      <Badge variant="outline">Draft</Badge>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>2. Bentuk (Shapes)</CardTitle>
      <CardDescription>
        Dua variasi bentuk. Gunakan 'square' (default) untuk label
        teknis/status, dan 'pill' untuk tag, kategori, atau filter.
      </CardDescription>
    </CardHeader>
    <CardContent class="flex flex-wrap gap-4">
      <div class="flex flex-col gap-2 border-r pr-6 border-gray-100">
        <span class="text-xs text-gray-400 mb-1">Square (Default)</span>
        <Badge shape="square" variant="info">CRM Data</Badge>
        <Badge shape="square" variant="warning">Stok Menipis</Badge>
      </div>
      <div class="flex flex-col gap-2 pl-2">
        <span class="text-xs text-gray-400 mb-1">Pill</span>
        <Badge shape="pill" variant="primary">Kategori: Donasi</Badge>
        <Badge shape="pill" variant="secondary">Role: Admin</Badge>
      </div>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>3. Ukuran (Sizes)</CardTitle>
      <CardDescription>
        Hierarki ukuran. Gunakan 'sm' (default) untuk di dalam tabel, dan
        'md'/'lg' untuk highlight di halaman detail.
      </CardDescription>
    </CardHeader>
    <CardContent class="flex flex-wrap items-end gap-4">
      <Badge size="sm" variant="outline">Small (Tabel)</Badge>
      <Badge size="md" variant="outline">Medium (Detail)</Badge>
      <Badge size="lg" variant="outline">Large (Highlight)</Badge>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>4. Penggunaan Ikon (Icons)</CardTitle>
      <CardDescription>
        Memperkuat pemahaman konteks tanpa perlu membaca teks secara penuh.
        Proporsi ikon menyesuaikan ukuran badge secara otomatis.
      </CardDescription>
    </CardHeader>
    <CardContent class="flex flex-wrap gap-4">
      <Badge iconLeft={CheckCircle} variant="success">Selesai</Badge>
      <Badge iconLeft={Clock} variant="warning">Pending</Badge>
      <Badge iconLeft={AlertTriangle} variant="danger">Error</Badge>
      <Badge iconLeft={Info} variant="info">Info Sistem</Badge>

      <Badge iconRight={ArrowRight} variant="primary" shape="pill">
        Lanjut
      </Badge>

      <Badge size="lg" iconLeft={Tag} variant="secondary">Label Spesial</Badge>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>5. Tag Interaktif (Dismissable)</CardTitle>
      <CardDescription>
        Digunakan untuk elemen yang bisa dihapus oleh user, seperti sistem
        filter pencarian aktif atau tag input.
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="flex flex-wrap items-center gap-2 min-h-8">
        {#if activeFilters.length === 0}
          <span class="text-sm text-gray-500 italic"
            >Tidak ada filter aktif.</span
          >
        {:else}
          {#each activeFilters as filter (filter)}
            <Badge
              variant="secondary"
              shape="pill"
              dismissable={true}
              ondismiss={() => removeFilter(filter)}
            >
              {filter}
            </Badge>
          {/each}
        {/if}
      </div>

      {#if activeFilters.length < 4}
        <div class="pt-4 border-t border-gray-50">
          <Button
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onclick={resetFilters}
          >
            Reset Filter
          </Button>
        </div>
      {/if}
    </CardContent>
  </Card>
</div>
