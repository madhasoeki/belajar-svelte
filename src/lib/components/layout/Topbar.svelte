<script lang="ts">
  import Button from "$lib/components/ui/button/Button.svelte";
  import Avatar from "$lib/components/ui/avatar/Avatar.svelte";
  import { Bell, User, Settings, LogOut, Info } from "lucide-svelte";
  import { toastStore } from "$lib/stores/toast.svelte";
  import { ROUTES } from "$lib/constans/routes";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";

  interface TopbarProps {
    title: string;
    notifications: Array<{
      id: number;
      text: string;
      time: string;
      read: boolean;
    }>;
    user: { name: string; team?: string; avatar?: string }; // Ubah role jadi team opsional
  }

  let { title = "Dashboard", notifications = [], user }: TopbarProps = $props();

  const unreadCount = $derived(notifications.filter((n) => !n.read).length);

  // State untuk mengontrol buka/tutup menu
  let isNotifOpen = $state(false);
  let isProfileOpen = $state(false);

  // Referensi elemen untuk deteksi klik di luar
  let notifContainer: HTMLDivElement;
  let profileContainer: HTMLDivElement;

  function handleLogout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user"); // [BARU] Bersihkan data user
    toastStore.success("Berhasil keluar dari sistem.", "Logout");
    goto(ROUTES.LOGIN);
  }

  // Logika deteksi klik di luar elemen untuk menutup panel
  $effect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (isNotifOpen && notifContainer && !notifContainer.contains(target)) {
        isNotifOpen = false;
      }
      if (
        isProfileOpen &&
        profileContainer &&
        !profileContainer.contains(target)
      ) {
        isProfileOpen = false;
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  });

  // Fungsi toggle agar saling menutup
  function toggleNotif() {
    isNotifOpen = !isNotifOpen;
    if (isNotifOpen) isProfileOpen = false;
  }

  function toggleProfile() {
    isProfileOpen = !isProfileOpen;
    if (isProfileOpen) isNotifOpen = false;
  }
</script>

<header
  class="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-(--color-border) bg-white/80 px-4 md:px-8 backdrop-blur-md"
>
  <div class="flex items-center gap-4">
    <h1 class="text-xl font-bold text-gray-900 tracking-tight">
      {title}
    </h1>
  </div>

  <div class="flex items-center gap-2 sm:gap-4">
    <div class="relative" bind:this={notifContainer}>
      <Button
        variant="ghost"
        size="icon"
        icon={Bell}
        badge={unreadCount > 0 ? unreadCount : undefined}
        class={`rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 [&>svg]:w-6 [&>svg]:h-6 ${isNotifOpen ? "bg-gray-100 text-gray-900" : ""}`}
        aria-label="Notifikasi"
        onclick={toggleNotif}
      />

      {#if isNotifOpen}
        <div
          transition:fade={{ duration: 150 }}
          class="fixed left-4 right-4 top-[72px] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 bg-white border border-(--color-border) rounded-xl shadow-xl overflow-hidden z-50"
        >
          <div
            class="flex items-center justify-between border-b border-(--color-border) px-4 py-3 bg-gray-50/50"
          >
            <span
              class="text-xs font-bold uppercase tracking-wider text-gray-500"
              >Notifikasi</span
            >
            {#if unreadCount > 0}
              <button
                class="text-[10px] font-semibold text-(--color-primary) hover:underline"
              >
                Tandai semua dibaca
              </button>
            {/if}
          </div>

          <div class="max-h-[60vh] overflow-y-auto custom-scrollbar">
            {#if notifications.length === 0}
              <div class="py-8 text-center text-sm text-gray-500">
                Tidak ada notifikasi baru
              </div>
            {:else}
              <div class="flex flex-col">
                {#each notifications as notif}
                  <button
                    class={`flex items-start gap-3 border-b border-gray-50 p-4 last:border-0 hover:bg-gray-50/50 transition-colors text-left w-full ${!notif.read ? "bg-blue-50/20" : ""}`}
                  >
                    <div
                      class={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${!notif.read ? "bg-(--color-primary-soft) text-(--color-primary)" : "bg-gray-100 text-gray-500"}`}
                    >
                      <Info size={16} />
                    </div>
                    <div class="flex flex-col gap-1">
                      <p
                        class={`text-sm leading-snug ${!notif.read ? "font-semibold text-gray-900" : "font-medium text-gray-600"}`}
                      >
                        {notif.text}
                      </p>
                      <p class="text-[10px] font-medium text-gray-400">
                        {notif.time}
                      </p>
                    </div>
                  </button>
                {/each}
              </div>
            {/if}
          </div>

          <div class="border-t border-(--color-border) bg-gray-50 p-2">
            <Button
              variant="ghost"
              size="sm"
              class="w-full text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
            >
              Lihat Semua Notifikasi
            </Button>
          </div>
        </div>
      {/if}
    </div>

    <div class="hidden h-6 w-px bg-gray-200 sm:block"></div>

    <div class="relative" bind:this={profileContainer}>
      <button
        class={`flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-(--color-primary-soft) ${isProfileOpen ? "bg-gray-100" : ""}`}
        onclick={toggleProfile}
      >
        {#if user.avatar}
          <img
            src={user.avatar}
            alt={user.name}
            class="h-8 w-8 rounded-full object-cover"
          />
        {:else}
          <Avatar name={user.name} size="sm" shape="circle" />
        {/if}
        <div class="hidden text-left sm:block">
          <p class="text-sm font-semibold leading-none text-gray-900">
            {user.name}
          </p>
        </div>
      </button>

      {#if isProfileOpen}
        <div
          transition:fade={{ duration: 150 }}
          class="absolute right-0 top-full mt-2 w-56 bg-white border border-(--color-border) rounded-xl shadow-xl overflow-hidden z-50 flex flex-col p-1.5"
        >
          <div
            class="border-b border-(--color-border) px-3 py-3 mb-1 bg-gray-50/50 rounded-t-lg"
          >
            <p class="text-sm font-bold text-gray-900">{user.name}</p>
            {#if user.team}
              <p class="text-xs font-medium text-gray-500 truncate mt-0.5">
                {user.team}
              </p>
            {/if}
          </div>

          <button
            class="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors w-full text-left"
          >
            <User size={16} strokeWidth={2} />
            <span>Profil Saya</span>
          </button>

          <button
            class="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors w-full text-left"
          >
            <Settings size={16} strokeWidth={2} />
            <span>Pengaturan</span>
          </button>

          <div class="my-1 border-t border-(--color-border)"></div>

          <button
            class="flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-md transition-colors w-full text-left"
            onclick={handleLogout}
          >
            <LogOut size={16} strokeWidth={2} />
            <span class="font-medium">Keluar Sistem</span>
          </button>
        </div>
      {/if}
    </div>
  </div>
</header>
