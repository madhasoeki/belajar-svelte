<script lang="ts">
  import { appMenus } from "$lib/data/menu";
  import { MoreHorizontal, X, ChevronRight } from "lucide-svelte";
  import { fade, fly } from "svelte/transition";
  import { page } from "$app/state";

  let showMore = $state(false);
  
  // State untuk melacak menu parent mana yang sedang dibuka children-nya di mobile
  let activeSubMenu = $state<any>(null);

  const currentPath = $derived(page.url.pathname);

  const MAX_VISIBLE = 4;
  const visibleMenus = appMenus.slice(0, MAX_VISIBLE);
  const hiddenMenus = appMenus.slice(MAX_VISIBLE);
  const hasMore = hiddenMenus.length > 0;

  // Fungsi penanganan klik cerdas untuk mobile
  function handleMenuClick(e: Event, menu: any) {
    if (menu.children) {
      e.preventDefault(); // Jangan pindah halaman dulu
      activeSubMenu = menu; // Buka panel sub-menu
      showMore = false; // Tutup panel 'Lainnya' jika sedang terbuka
    } else {
      showMore = false;
      activeSubMenu = null;
    }
  }

  function closeAllModals() {
    showMore = false;
    activeSubMenu = null;
  }
</script>

<nav class="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-(--color-border) z-50 pb-safe">
  <div class="flex justify-around items-center h-16 px-2">
    
    {#each visibleMenus as menu}
      <a 
        href={menu.href || '#'}
        onclick={(e) => handleMenuClick(e, menu)}
        class={`flex flex-col items-center justify-center w-full h-full gap-1 
          ${currentPath.startsWith(menu.href || menu.id) ? "text-(--color-primary)" : "text-gray-500 hover:text-gray-900"}
        `}
      >
        <menu.icon size={20} strokeWidth={currentPath.startsWith(menu.href || menu.id) ? 2.5 : 2} />
        <span class="text-[10px] font-medium">{menu.label}</span>
      </a>
    {/each}

    {#if hasMore}
      <button 
        onclick={() => { showMore = !showMore; activeSubMenu = null; }}
        class={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors
          ${showMore ? "text-(--color-primary)" : "text-gray-500"}
        `}
      >
        {#if showMore}
          <X size={20} strokeWidth={2.5} />
        {:else}
          <MoreHorizontal size={20} strokeWidth={2} />
        {/if}
        <span class="text-[10px] font-medium">Lainnya</span>
      </button>
    {/if}

  </div>
</nav>

{#if showMore || activeSubMenu}
  <div 
    class="md:hidden fixed inset-0 bg-black/20 z-40"
    in:fade={{ duration: 150 }}
    out:fade={{ duration: 150 }}
    onclick={closeAllModals}
    aria-hidden="true"
  ></div>
{/if}

{#if showMore}
  <div class="md:hidden fixed bottom-16 left-0 w-full bg-white rounded-t-2xl shadow-lg z-40 overflow-hidden" in:fly={{ y: 50, duration: 250 }} out:fly={{ y: 50, duration: 200 }}>
    <div class="p-4 grid grid-cols-3 gap-4">
      {#each hiddenMenus as menu}
        <a 
          href={menu.href || '#'}
          onclick={(e) => handleMenuClick(e, menu)}
          class={`flex flex-col items-center justify-center p-3 rounded-xl gap-2
            ${currentPath.startsWith(menu.href || menu.id) ? "bg-(--color-primary-soft) text-(--color-primary)" : "bg-gray-50 text-gray-700"}
          `}
        >
          <menu.icon size={24} strokeWidth={2} />
          <span class="text-xs font-medium text-center">{menu.label}</span>
        </a>
      {/each}
    </div>
  </div>
{/if}

{#if activeSubMenu}
  <div class="md:hidden fixed bottom-16 left-0 w-full bg-white rounded-t-2xl shadow-lg z-40 overflow-hidden flex flex-col" in:fly={{ y: 50, duration: 250 }} out:fly={{ y: 50, duration: 200 }}>
    
    <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
      <div class="flex items-center gap-2 text-(--color-primary)">
        <activeSubMenu.icon size={20} strokeWidth={2.5} />
        <h3 class="font-bold">{activeSubMenu.label}</h3>
      </div>
      <button onclick={closeAllModals} class="p-1 rounded-full bg-gray-100 text-gray-500">
        <X size={16} />
      </button>
    </div>

    <div class="p-2">
      {#each activeSubMenu.children as child}
        <a 
          href={child.href}
          onclick={closeAllModals}
          class="flex items-center justify-between w-full p-3 rounded-xl hover:bg-gray-50 text-gray-700"
        >
          <span class="text-sm font-medium">{child.label}</span>
          <ChevronRight size={16} class="text-gray-400" />
        </a>
      {/each}
    </div>
  </div>
{/if}