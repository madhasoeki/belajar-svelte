<script lang="ts">
  import "../app.css";
  import { page } from "$app/state";
  import Sidebar from "$lib/components/layout/Sidebar.svelte";
  import Topbar from "$lib/components/layout/Topbar.svelte";
  import BottomNav from "$lib/components/layout/BottomNav.svelte";
  import { toastStore } from "$lib/stores/toast.svelte";
  import Toast from "$lib/components/ui/toast/Toast.svelte";
  import LoadingBars from "$lib/components/ui/loading/LoadingBars.svelte";
  import { goto } from "$app/navigation";
  
  // [BARU] 1. Import Svelte Query
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';

  let { children } = $props();

  // [BARU] 2. Setup Konfigurasi Enterprise (Circuit Breaker & Caching)
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3, // Maksimal coba ulang 3 kali jika API gagal
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Jeda makin lama (1s, 2s, 4s)
        staleTime: 5 * 60 * 1000, // Data dianggap "segar" selama 5 menit, jangan tembak API berulang
        refetchOnWindowFocus: false, // Jangan tembak API otomatis pas ganti tab browser
      },
    },
  });

  // Deteksi apakah rute saat ini adalah halaman login
  const isAuthPage = $derived(page.url.pathname.startsWith("/login"));
  let isCheckingAuth = $state(true);

  $effect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("admin_token");
      
      if (!token && !isAuthPage) {
        goto("/login");
      } else if (token && isAuthPage) {
        goto("/dashboard");
      } else {
        isCheckingAuth = false;
      }
    }
  });

  const active = $derived(
    page.url.pathname.split("/").filter(Boolean)[0] ?? null,
  );

  let isCollapsed = $state(false);

  const notifications = [
    { id: 1, text: "Donasi baru masuk", time: "2 menit lalu", read: false },
    { id: 2, text: "Campaign berhasil dibuat", time: "1 jam lalu", read: true },
    { id: 3, text: "User baru mendaftar", time: "3 jam lalu", read: false },
  ];

  const user = {
    name: "Mada",
    avatar: "https://argon-dashboard-pro-svelte.creative-tim.com/img/theme/team-4.jpg",
  };
  
  const currentTitle = $derived(page.data.title || "Dashboard");
</script>

<svelte:head>
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<QueryClientProvider client={queryClient}>
  {#if isCheckingAuth}
    <div class="min-h-screen w-full flex items-center justify-center bg-(--color-bg-page)">
      <LoadingBars size={40} class="text-(--color-primary)" />
    </div>
  {:else}
    {#if isAuthPage}
      <main class="min-h-screen w-full bg-(--color-bg-page)">
        {@render children()}
      </main>
    {:else}
      <div class="flex min-h-screen w-full overflow-x-clip bg-(--color-bg-page)">
        <Sidebar active={active} bind:isCollapsed={isCollapsed} />
        
        <div class="min-w-0 flex-1 flex flex-col transition-all duration-300 ease-in-out pb-24 md:pb-0 {isCollapsed ? 'md:ml-20' : 'md:ml-64'}">
          <Topbar title={currentTitle} notifications={notifications} user={user} />
          <main class="p-4 md:p-8 w-full min-w-0 flex-1">
            {@render children()}
          </main>
        </div>

        <BottomNav />
      </div>
    {/if}
  {/if}
</QueryClientProvider>

<div class="fixed top-6 right-6 z-100 flex flex-col gap-3 pointer-events-none">
  {#each toastStore.all as item (item.id)}
    <Toast {item} />
  {/each}
</div>