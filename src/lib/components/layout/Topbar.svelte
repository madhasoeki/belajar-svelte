<script lang="ts">
  import { Bell, User, Settings, LogOut } from "lucide-svelte";

  type Notification = {
    id: number;
    text: string;
    time: string;
    read?: boolean;
  };

  let {
    title = "Dashboard",
    notifications = [],
    user = { name: "Admin", avatar: "https://i.pravatar.cc/40" },
  }: {
    title?: string;
    notifications?: Notification[];
    user?: { name: string; avatar: string };
  } = $props();

  let showNotif = $state(false);
  let showProfile = $state(false);

  const unreadCount = $derived(notifications.filter((n) => !n.read).length);
</script>

<header
  class="h-16 bg-white border-b border-(--color-border) flex items-center justify-between px-6"
>
  <!-- LEFT : PAGE TITLE -->
  <h1 class="text-lg font-semibold text-(--color-text-primary)">
    {title}
  </h1>

  <!-- RIGHT -->
  <div class="flex items-center gap-4 relative">
    <!-- NOTIFICATION -->
    <div class="relative">
      <button
        onclick={() => {
          showNotif = !showNotif;
          showProfile = false;
        }}
        class="relative p-2 rounded-lg hover:bg-gray-100 transition"
      >
        <Bell size={20} />

        {#if unreadCount > 0}
          <span
            class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full"
          >
            {unreadCount}
          </span>
        {/if}
      </button>

      {#if showNotif}
        <div
          class="absolute right-0 mt-2 w-72 bg-white border border-(--color-border) rounded-xl shadow-sm"
        >
          <div class="p-3 border-b border-(--color-border)">
            <p class="text-sm font-semibold">Notifications</p>
          </div>

          <div class="max-h-72 overflow-y-auto">
            {#each notifications as notif}
              <div
                class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
              >
                <p class="text-sm text-(--color-text-primary)">
                  {notif.text}
                </p>

                <p class="text-xs text-(--color-text-muted)">
                  {notif.time}
                </p>
              </div>
            {/each}

            {#if notifications.length === 0}
              <p class="p-4 text-sm text-(--color-text-muted)">
                Tidak ada notifikasi
              </p>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <!-- PROFILE -->
    <div class="relative">
      <button
        onclick={() => {
          showProfile = !showProfile;
          showNotif = false;
        }}
        class="flex items-center gap-2"
      >
        <img src={user.avatar} alt="avatar" class="w-8 h-8 rounded-full" />
      </button>

      {#if showProfile}
        <div
          class="absolute right-0 mt-1 w-48 bg-white border border-(--color-border) rounded-xl shadow-sm"
        >
          <div class="p-3 border-b border-(--color-border)">
            <p class="text-sm font-semibold">{user.name}</p>
          </div>
          <button
            class="flex items-center gap-2 w-full p-3 hover:bg-gray-50 text-sm"
          >
            <User size={16} />
            Profile
          </button>

          <button
            class="flex items-center gap-2 w-full p-3 hover:bg-gray-50 text-sm"
          >
            <Settings size={16} />
            Settings
          </button>

          <div class="border-t border-(--color-border)"></div>

          <button
            class="flex items-center gap-2 w-full p-3 hover:bg-gray-50 text-sm text-red-500"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      {/if}
    </div>
  </div>
</header>
