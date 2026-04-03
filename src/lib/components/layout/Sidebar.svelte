<script lang="ts">
  // Sesuaikan path ini dengan letak file menu.ts yang kamu buat sebelumnya
  import { appMenus } from "$lib/data/menu"; 
  import { ChevronLeft, ChevronRight } from "lucide-svelte";

  interface SidebarProps {
    active?: string | null;
    isCollapsed?: boolean;
  }

  // [KUNCI FIX ERROR]: Gunakan $bindable() agar komponen luar bisa mengubah nilainya
  let { 
    active = null, 
    isCollapsed = $bindable(false) 
  }: SidebarProps = $props();
</script>

<aside 
  class={`hidden md:flex flex-col h-screen border-r border-(--color-border) bg-white fixed top-0 left-0 transition-all duration-300 z-40
    ${isCollapsed ? 'w-20' : 'w-64'}
  `}
>
  <div class="h-16 flex items-center justify-between px-4 border-b border-(--color-border)">
    {#if !isCollapsed}
      <span class="text-xl font-bold text-(--color-primary) whitespace-nowrap overflow-hidden animate-in fade-in duration-200">
        SIMGUDANG
      </span>
    {/if}
    
    <button 
      type="button"
      onclick={() => isCollapsed = !isCollapsed}
      class={`p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-(--color-primary-soft)
        ${isCollapsed ? 'mx-auto' : ''}
      `}
      aria-label={isCollapsed ? "Buka Sidebar" : "Lipat Sidebar"}
    >
      {#if isCollapsed}
        <ChevronRight size={20} strokeWidth={2.5} />
      {:else}
        <ChevronLeft size={20} strokeWidth={2.5} />
      {/if}
    </button>
  </div>

  <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 custom-scrollbar">
    {#each appMenus as menu}
      {@const isActive = active === menu.id || active === menu.href.substring(1)}
      
      <a 
        href={menu.href}
        class={`flex items-center rounded-lg transition-all duration-200 group
          ${isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5 gap-3'}
          ${isActive 
            ? "bg-(--color-primary-soft) text-(--color-primary)" 
            : "text-(--color-text-secondary) hover:bg-gray-100 hover:text-(--color-text-primary)"
          }
        `}
        title={isCollapsed ? menu.label : ""}
      >
        <menu.icon size={20} strokeWidth={isActive ? 2.5 : 2} class="shrink-0" />
        
        {#if !isCollapsed}
          <span class="text-sm font-medium whitespace-nowrap overflow-hidden">
            {menu.label}
          </span>
        {/if}
      </a>
    {/each}
  </nav>
</aside>