<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "$lib/components/ui/card";
  import Button from "$lib/components/ui/button/Button.svelte";
  import Avatar from "$lib/components/ui/avatar/Avatar.svelte";
  import Dropdown from "$lib/components/ui/dropdown/Dropdown.svelte";
  import DropdownItem from "$lib/components/ui/dropdown/DropdownItem.svelte";
  import { 
    User, Settings, LogOut, MoreHorizontal, 
    FileEdit, Trash2, Eye, Bell, ChevronDown, Info, Filter, Download 
  } from "lucide-svelte";
  import { toastStore } from "$lib/stores/toast.svelte";

  function handleAction(msg: string) {
    toastStore.info(msg);
  }
</script>

<div class="p-8 max-w-7xl mx-auto pb-20">
  <div class="border-b pb-4 mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Dropdown Menu Showcase</h1>
    <p class="text-gray-500">Komponen menu melayang untuk navigasi sekunder dan kumpulan aksi tersembunyi.</p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
    
    <Card>
      <CardHeader>
        <CardTitle>1. Identitas & Profil</CardTitle>
        <CardDescription>Penggunaan pada Topbar untuk pengaturan akun pengguna.</CardDescription>
      </CardHeader>
      <CardContent class="flex justify-center pt-6 rounded-lg pb-32">
        <Dropdown width="w-56">
          {#snippet trigger()}
            <button class="flex items-center gap-3 p-1 pr-3 hover:bg-gray-200/50 rounded-full transition">
              <Avatar name="Ramadhan Mada" size="sm" indicator="online" />
              <div class="text-left hidden sm:block">
                <p class="text-xs font-bold leading-none">Mada</p>
                <p class="text-[10px] text-gray-500">Administrator</p>
              </div>
              <ChevronDown size={14} class="text-gray-400" />
            </button>
          {/snippet}

          <DropdownItem icon={User} onclick={() => handleAction("Buka Profil")}>Profil Saya</DropdownItem>
          <DropdownItem icon={Settings} onclick={() => handleAction("Buka Pengaturan")}>Pengaturan Akun</DropdownItem>
          <div class="border-t border-(--color-border) my-1"></div>
          <DropdownItem icon={LogOut} variant="danger" onclick={() => handleAction("Logout...")}>Keluar Sistem</DropdownItem>
        </Dropdown>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>2. Aksi Dasar & Filter</CardTitle>
        <CardDescription>Penggunaan standar dengan komponen Button sebagai pemicu (trigger).</CardDescription>
      </CardHeader>
      <CardContent class="flex gap-4 pb-32">
        <Dropdown width="w-48" align="left">
          {#snippet trigger()}
            <Button variant="outline" icon={Filter}>Filter Status</Button>
          {/snippet}
          
          <DropdownItem onclick={() => handleAction("Semua")}>Semua Status</DropdownItem>
          <DropdownItem onclick={() => handleAction("Aktif")}>Aktif</DropdownItem>
          <DropdownItem onclick={() => handleAction("Tertunda")}>Tertunda (Pending)</DropdownItem>
          <div class="border-t border-(--color-border) my-1"></div>
          <DropdownItem onclick={() => handleAction("Batal")} variant="danger">Dibatalkan</DropdownItem>
        </Dropdown>

        <Dropdown width="w-56" align="left">
          {#snippet trigger()}
            <Button variant="primary" icon={ChevronDown} iconPosition="right">Aksi Massal</Button>
          {/snippet}
          
          <DropdownItem icon={Eye}>Tandai Dibaca</DropdownItem>
          <DropdownItem icon={Download}>Ekspor ke Excel</DropdownItem>
        </Dropdown>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>3. Aksi Baris Data (Table)</CardTitle>
        <CardDescription>Menghemat ruang pada tabel dengan menyembunyikan aksi di ikon titik tiga.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        {#each [1, 2] as item}
          <div class="flex items-center justify-between p-4 border border-(--color-border) rounded-lg bg-white">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs font-bold">#{item}</div>
              <p class="text-sm font-medium">Laporan Transaksi_00{item}.pdf</p>
            </div>

            <Dropdown width="w-40">
              {#snippet trigger()}
                <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                  <MoreHorizontal size={18} />
                </Button>
              {/snippet}

              <DropdownItem icon={Eye}>Lihat</DropdownItem>
              <DropdownItem icon={FileEdit}>Ubah</DropdownItem>
              <div class="border-t border-(--color-border) my-1"></div>
              <DropdownItem icon={Trash2} variant="danger">Hapus</DropdownItem>
            </Dropdown>
          </div>
        {/each}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>4. Notifikasi Kompleks</CardTitle>
        <CardDescription>Menampilkan elemen kaya seperti avatar dan waktu.</CardDescription>
      </CardHeader>
      <CardContent>
        <Dropdown width="w-80" align="left">
          {#snippet trigger()}
            <Button variant="outline" icon={Bell} badge={3} />
          {/snippet}
          
          <div class="px-3 py-2 flex items-center justify-between mb-1">
            <p class="text-xs font-bold uppercase tracking-wider text-gray-500">Notifikasi</p>
            <button class="text-[10px] text-(--color-primary) font-semibold hover:underline">Tandai dibaca</button>
          </div>

          <DropdownItem class="items-start gap-3 p-3" onclick={() => {}}>
            <Avatar name="Eleana" shape="circle" size="md" indicator="online" />
            <div class="flex flex-col gap-1 text-left">
              <p class="text-sm font-semibold text-gray-900 leading-none">Donasi SAMS Masuk</p>
              <p class="text-xs text-gray-600 line-clamp-2">Terra baru saja menyetujui donasi sebesar Rp 1.500.000 melalui bank.</p>
              <p class="text-[10px] text-(--color-primary) font-medium mt-0.5">Baru saja</p>
            </div>
          </DropdownItem>

          <DropdownItem class="items-start gap-3 p-3" onclick={() => {}}>
            <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Info size={16} class="text-blue-500" />
            </div>
            <div class="flex flex-col gap-1 text-left">
              <p class="text-sm font-semibold text-gray-900 leading-none">Pembaruan Sistem</p>
              <p class="text-xs text-gray-600">Pemeliharaan selesai dilakukan.</p>
              <p class="text-[10px] text-gray-400 mt-0.5">2 jam yang lalu</p>
            </div>
          </DropdownItem>

          <div class="mt-1 pt-1 border-t border-(--color-border)">
            <Button variant="ghost" size="sm" class="w-full text-xs text-gray-600">Lihat Semua</Button>
          </div>
        </Dropdown>
      </CardContent>
    </Card>

  </div>
</div>