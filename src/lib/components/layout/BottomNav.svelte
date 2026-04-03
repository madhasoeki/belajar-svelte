<script lang="ts">
  import { appMenus } from "$lib/data/menu";
  import { MoreHorizontal, X } from "lucide-svelte";
  import { fade, fly } from "svelte/transition";
  import { page } from "$app/state"; // Import state router bawaan SvelteKit

  let showMore = $state(false);

  // Derivasi path yang aktif langsung dari URL SvelteKit
  const currentPath = $derived(page.url.pathname);

  // Pisahkan menu utama (maks 4) dan menu sisanya
  const MAX_VISIBLE = 4;
  const visibleMenus = appMenus.slice(0, MAX_VISIBLE);
  const hiddenMenus = appMenus.slice(MAX_VISIBLE);
  
  const hasMore = hiddenMenus.length > 0;
</script>

<nav class="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-(--color-border) z-50 pb-safe">
  <div class="flex justify-around items-center h-16 px-2">
    
    {#each visibleMenus as menu}
      <a 
        href={menu.href}
        onclick={() => showMore = false}
        class={`flex flex-col items-center justify-center w-full h-full gap-1 
          ${currentPath.startsWith(menu.href) ? "text-(--color-primary)" : "text-gray-500 hover:text-gray-900"}
        `}
      >
        <menu.icon size={20} strokeWidth={currentPath.startsWith(menu.href) ? 2.5 : 2} />
        <span class="text-[10px] font-medium">{menu.label}</span>
      </a>
    {/each}

    {#if hasMore}
      <button 
        onclick={() => (showMore = !showMore)}
        class={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors
          ${showMore ? "text-(--color-primary)" : "text-gray-500 hover:text-gray-900"}
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

{#if showMore}
  <div 
    class="md:hidden fixed inset-0 bg-black/20 z-40"
    in:fade={{ duration: 150 }}
    out:fade={{ duration: 150 }}
    onclick={() => (showMore = false)}
    aria-hidden="true"
  ></div>

  <div 
    class="md:hidden fixed bottom-16 left-0 w-full bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-40 overflow-hidden"
    in:fly={{ y: 50, duration: 250 }}
    out:fly={{ y: 50, duration: 200 }}
  >
    <div class="p-4 grid grid-cols-4 gap-3">
      {#each hiddenMenus as menu}
        <a 
          href={menu.href}
          onclick={() => showMore = false}
          class={`flex flex-col items-center justify-center p-3 rounded-xl gap-2
            ${currentPath.startsWith(menu.href) ? "bg-(--color-primary-soft) text-(--color-primary)" : "bg-gray-50 text-gray-700"}
          `}
        >
          <menu.icon size={24} strokeWidth={2} />
          <span class="text-xs font-medium text-center">{menu.label}</span>
        </a>
      {/each}
    </div>
  </div>
{/if}

<style>
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
</style>