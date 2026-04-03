<script lang="ts">
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
  } from "$lib/components/ui/card";

  import Avatar from "$lib/components/ui/avatar/Avatar.svelte";

  // Data tiruan untuk simulasi
  const user1 = "Ramadhan Mada";
  const user2 = "Staf Gudang";
  const dummyImage = "https://i.pravatar.cc/150?u=mada123"; // Placeholder API yang stabil
  const brokenImage = "https://link-rusak.com/foto.jpg"; // Untuk simulasi onerror
</script>

<div class="p-8 max-w-7xl mx-auto pb-20">
  <div class="border-b pb-4 mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Komponen Avatar Showcase</h1>
    <p class="text-gray-500">
      Dokumentasi identitas visual pengguna, sistem fallback gambar, dan indikator status.
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
    <div class="space-y-8">
      
      <Card>
        <CardHeader>
          <CardTitle>1. Graceful Degradation (Fallback Sistem)</CardTitle>
          <CardDescription>
            Avatar akan mencoba memuat gambar. Jika gagal, ia menggunakan inisial nama. Jika nama kosong, ia menampilkan ikon anonim.
          </CardDescription>
        </CardHeader>
        <CardContent class="flex flex-wrap items-center gap-6">
          <div class="flex flex-col items-center gap-2">
            <Avatar src={dummyImage} name={user1} size="lg" />
            <span class="text-xs text-(--color-text-muted)">Valid Image</span>
          </div>

          <div class="flex flex-col items-center gap-2">
            <Avatar src={brokenImage} name={user1} size="lg" />
            <span class="text-xs text-(--color-text-muted)">Broken Image</span>
          </div>

          <div class="flex flex-col items-center gap-2">
            <Avatar name="Admin Sistem" size="lg" />
            <span class="text-xs text-(--color-text-muted)">Initials Only</span>
          </div>

          <div class="flex flex-col items-center gap-2">
            <Avatar size="lg" />
            <span class="text-xs text-(--color-text-muted)">Anonymous</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Variasi Ukuran</CardTitle>
          <CardDescription>Lima ukuran standar yang disesuaikan dengan proporsi layout.</CardDescription>
        </CardHeader>
        <CardContent class="flex items-end gap-6 border-b pb-6 mb-6">
          <Avatar src={dummyImage} size="xs" />
          <Avatar src={dummyImage} size="sm" />
          <Avatar src={dummyImage} size="md" />
          <Avatar src={dummyImage} size="lg" />
          <Avatar src={dummyImage} size="xl" />
        </CardContent>
        <CardContent class="flex items-end gap-6">
          <Avatar name="A B" size="xs" />
          <Avatar name="A B" size="sm" />
          <Avatar name="A B" size="md" />
          <Avatar name="A B" size="lg" />
          <Avatar name="A B" size="xl" />
        </CardContent>
      </Card>

    </div>

    <div class="space-y-8">
      
      <Card>
        <CardHeader>
          <CardTitle>3. Variasi Bentuk (Shape)</CardTitle>
          <CardDescription>Pilihan antara lingkaran (standar profil) atau kotak bersudut tumpul (entitas/institusi).</CardDescription>
        </CardHeader>
        <CardContent class="flex gap-8">
          <div class="space-y-4">
            <h4 class="text-sm font-medium text-(--color-text-secondary)">Circle (Default)</h4>
            <div class="flex gap-4">
              <Avatar src={dummyImage} shape="circle" size="lg" />
              <Avatar name="Yayasan Peduli" shape="circle" size="lg" />
            </div>
          </div>
          
          <div class="space-y-4">
            <h4 class="text-sm font-medium text-(--color-text-secondary)">Square</h4>
            <div class="flex gap-4">
              <Avatar src={dummyImage} shape="square" size="lg" />
              <Avatar name="Yayasan Peduli" shape="square" size="lg" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Indikator Status (Presence)</CardTitle>
          <CardDescription>Menandakan ketersediaan atau aktivitas pengguna dengan variabel warna tema.</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-wrap gap-6">
          <div class="flex flex-col items-center gap-2">
            <Avatar src={dummyImage} indicator="online" size="md" />
            <span class="text-xs text-(--color-text-muted)">Online</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Avatar name="Mada" indicator="offline" size="md" />
            <span class="text-xs text-(--color-text-muted)">Offline</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Avatar src={dummyImage} shape="square" indicator="busy" size="md" />
            <span class="text-xs text-(--color-text-muted)">Busy</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Avatar name={user2} shape="square" indicator="away" size="md" />
            <span class="text-xs text-(--color-text-muted)">Away</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Komposisi: Avatar Group (Preview)</CardTitle>
          <CardDescription>
            Simulasi tumpukan avatar menggunakan flexbox dan negative space (sering dipakai di daftar penugasan/tim).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex items-center">
            <div class="flex -space-x-3">
              <Avatar src={dummyImage} size="md" class="border-2 border-white" />
              <Avatar name="Dewi" size="md" class="border-2 border-white" />
              <Avatar src={brokenImage} name="Samsul" size="md" class="border-2 border-white" />
              <Avatar name="Ahmad" size="md" class="border-2 border-white" />
            </div>
            
            <div class="ml-3 text-sm text-(--color-text-secondary) font-medium">
              +4 Orang lainnya
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  </div>
</div>