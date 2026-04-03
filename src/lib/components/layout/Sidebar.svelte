<script lang="ts">
  import { appMenus } from "$lib/data/menu"; 
  import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-svelte";
  import { slide } from "svelte/transition"; // Import animasi slide

  interface SidebarProps {
    active?: string | null;
    isCollapsed?: boolean;
  }

  let { 
    active = null, 
    isCollapsed = $bindable(false) 
  }: SidebarProps = $props();

  // State untuk menyimpan ID menu parent yang sedang terbuka
  let expandedMenu = $state<string | null>(null);

  function toggleMenu(menuId: string) {
    // Jika sidebar terlipat, paksa buka dulu
    if (isCollapsed) isCollapsed = false;
    
    // Toggle (buka/tutup)
    expandedMenu = expandedMenu === menuId ? null : menuId;
  }
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
      onclick={() => { isCollapsed = !isCollapsed; if(isCollapsed) expandedMenu = null; }}
      class={`p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none ${isCollapsed ? 'mx-auto' : ''}`}
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
      
      {#if menu.children}
        {@const isExpanded = expandedMenu === menu.id}
        <button 
          onclick={() => toggleMenu(menu.id)}
          class={`w-full flex items-center justify-between rounded-lg transition-all duration-200 group
            ${isCollapsed ? 'p-3' : 'px-3 py-2.5'}
            ${isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50'}
          `}
          title={isCollapsed ? menu.label : ""}
        >
          <div class="flex items-center gap-3 text-(--color-text-secondary) group-hover:text-(--color-text-primary)">
            <menu.icon size={20} strokeWidth={2} class="shrink-0" />
            {#if !isCollapsed}
              <span class="text-sm font-medium whitespace-nowrap">{menu.label}</span>
            {/if}
          </div>
          {#if !isCollapsed}
            <ChevronDown size={16} class={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          {/if}
        </button>

        {#if isExpanded && !isCollapsed}
          <div class="flex flex-col gap-1 pl-9 pr-2 overflow-hidden" transition:slide={{ duration: 200 }}>
            {#each menu.children as child}
              {@const isChildActive = active === child.id || active === child.href.substring(1)}
              <a 
                href={child.href}
                class={`py-2 px-3 rounded-md text-sm transition-colors
                  ${isChildActive 
                    ? "bg-(--color-primary-soft) text-(--color-primary) font-semibold" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }
                `}
              >
                {child.label}
              </a>
            {/each}
          </div>
        {/if}

      {:else}
        {@const isActive = active === menu.id || active === menu.href?.substring(1)}
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
      {/if}

    {/each}
  </nav>
</aside>