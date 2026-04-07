<script lang="ts">
  import Button from "$lib/components/ui/button/Button.svelte";
  import Avatar from "$lib/components/ui/avatar/Avatar.svelte";
  import Dropdown from "$lib/components/ui/dropdown/Dropdown.svelte";
  import DropdownItem from "$lib/components/ui/dropdown/DropdownItem.svelte";
  import { Bell, User, Settings, LogOut, Info } from "lucide-svelte";
  import { toastStore } from "$lib/stores/toast.svelte";
    import { goto } from "$app/navigation";

  interface TopbarProps {
    title: string;
    notifications: Array<{ id: number; text: string; time: string; read: boolean }>;
    user: { name: string; avatar?: string };
  }

  let { 
    title = "Dashboard", 
    notifications = [], 
    user 
  }: TopbarProps = $props();

  const unreadCount = $derived(notifications.filter(n => !n.read).length);

  function handleLogout() {
    // 1. Hapus token dari localStorage
    localStorage.removeItem("admin_token");

    // 2. Beri notifikasi singkat
    toastStore.success("Berhasil keluar dari sistem.", "Logout");

    // 3. Tendang ke halaman login
    // Menggunakan goto agar perpindahan mulus tanpa reload full page
    goto("/login");
  }
</script>

<header class="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-(--color-border) bg-white/80 px-4 md:px-8 backdrop-blur-md">
  
  <div class="flex items-center gap-4">
    <h1 class="text-xl font-bold text-gray-900 tracking-tight">
      {title}
    </h1>
  </div>

  <div class="flex items-center gap-2 sm:gap-4">
    
    <Dropdown width="w-80" align="right">
      {#snippet trigger()}
        <Button 
          variant="ghost" 
          size="icon"
          icon={Bell} 
          badge={unreadCount > 0 ? unreadCount : undefined} 
          class="rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 [&>svg]:w-6 [&>svg]:h-6"
          aria-label="Notifikasi"
        />
      {/snippet}
      
      <div class="flex items-center justify-between border-b border-(--color-border) px-4 py-3">
        <span class="text-xs font-bold uppercase tracking-wider text-gray-500">Notifikasi</span>
        {#if unreadCount > 0}
          <button class="text-[10px] font-semibold text-(--color-primary) hover:underline">
            Tandai semua dibaca
          </button>
        {/if}
      </div>

      <div class="max-h-80 overflow-y-auto custom-scrollbar">
        {#if notifications.length === 0}
          <div class="py-6 text-center text-sm text-gray-500">Tidak ada notifikasi baru</div>
        {:else}
          {#each notifications as notif}
            <DropdownItem 
              class={`items-start gap-3 border-b border-gray-50 p-3 last:border-0 ${!notif.read ? 'bg-blue-50/30' : ''}`}
            >
              <div class={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${!notif.read ? 'bg-(--color-primary-soft) text-(--color-primary)' : 'bg-gray-100 text-gray-500'}`}>
                <Info size={16} />
              </div>
              <div class="flex flex-col gap-1 text-left">
                <p class={`text-sm leading-tight ${!notif.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'}`}>
                  {notif.text}
                </p>
                <p class="text-[10px] font-medium text-gray-400">{notif.time}</p>
              </div>
            </DropdownItem>
          {/each}
        {/if}
      </div>

      <div class="border-t border-(--color-border) bg-gray-50 p-2">
        <Button variant="ghost" size="sm" class="w-full text-xs text-gray-600">
          Lihat Semua Notifikasi
        </Button>
      </div>
    </Dropdown>

    <div class="hidden h-6 w-px bg-gray-200 sm:block"></div>

    <Dropdown width="w-56" align="right">
      {#snippet trigger()}
        <button class="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-(--color-primary-soft)">
          {#if user.avatar}
            <img src={user.avatar} alt={user.name} class="h-8 w-8 rounded-full object-cover" />
          {:else}
            <Avatar name={user.name} size="sm" shape="circle" />
          {/if}
          <div class="hidden text-left sm:block pr-2">
            <p class="text-xs font-bold leading-none text-gray-900">{user.name}</p>
          </div>
        </button>
      {/snippet}

      <div class="border-b border-(--color-border) px-4 py-3">
        <p class="text-sm font-medium text-gray-900">{user.name}</p>
        <p class="text-xs text-gray-500 truncate">admin@simgudang.id</p>
      </div>
      
      <div class="py-1">
        <DropdownItem icon={User}>Profil Saya</DropdownItem>
        <DropdownItem icon={Settings}>Pengaturan</DropdownItem>
      </div>
      
      <div class="my-1 border-t border-(--color-border)"></div>
      
      <DropdownItem icon={LogOut} variant="danger" onclick={handleLogout}>
        Keluar Sistem
      </DropdownItem>
    </Dropdown>
    
  </div>
</header>