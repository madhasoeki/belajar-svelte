<script>
  import "../app.css";
  import { page } from "$app/state";
  import Sidebar from "$lib/components/layout/Sidebar.svelte";
  import Topbar from "$lib/components/layout/Topbar.svelte";
  import { toastStore } from "$lib/stores/toast.svelte";
  import Toast from "$lib/components/ui/toast/Toast.svelte";

  let { children } = $props();

  const active = $derived(
    page.url.pathname.split("/").filter(Boolean)[0] ?? null,
  );

  let isCollapsed = $state(false);

  const notifications = [
    {
      id: 1,
      text: "Donasi baru masuk",
      time: "2 menit lalu",
      read: false,
    },
    {
      id: 2,
      text: "Campaign berhasil dibuat",
      time: "1 jam lalu",
      read: true,
    },
    {
      id: 3,
      text: "User baru mendaftar",
      time: "3 jam lalu",
      read: false,
    },
  ];

  const user = {
    name: "Madha",
    avatar:
      "https://argon-dashboard-pro-svelte.creative-tim.com/img/theme/team-4.jpg",
  };
  const currentTitle = $derived(page.data.title || "Dashboard");
</script>

<svelte:head>
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="flex">
  <Sidebar {active} bind:isCollapsed />
  <div
    class="flex-1 transition-all duration-300 ease-in-out {isCollapsed
      ? 'ml-20'
      : 'ml-55'}"
  >
    <Topbar title={currentTitle} {notifications} {user} />
    <main class="p-8 w-full">
      {@render children()}
    </main>
  </div>
  <div
    class="fixed top-6 right-6 z-100 flex flex-col gap-3 pointer-events-none"
  >
    {#each toastStore.all as item (item.id)}
      <Toast {item} />
    {/each}
  </div>
</div>
