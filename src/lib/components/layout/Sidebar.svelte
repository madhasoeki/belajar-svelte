<script>
    import { 
        Landmark,
        LayoutDashboard, 
        UserSearch, 
        HandCoins, 
        Receipt, 
        ClipboardCheck, 
        Users, 
        Trophy, 
        LineChart, 
        Megaphone,
        ChevronLeft, 
        ChevronRight 
    } from 'lucide-svelte';

    let { active = null, isCollapsed = $bindable(false) } = $props();

    const menus = [
        { id: 'dashboard', href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'cards', href: '/cards', icon: LayoutDashboard , label: 'Cards' },
        { id: 'button', href: '/button', icon: LayoutDashboard , label: 'Button' },
        { id: 'forms', href: '/forms', icon: LayoutDashboard , label: 'Forms' },
        { id: 'badge', href: '/badge', icon: LayoutDashboard , label: 'Badge' },
        { id: 'avatar', href: '/avatar', icon: LayoutDashboard , label: 'Avatar' },
        { id: 'alert', href: '/alert', icon: LayoutDashboard , label: 'Alert' },
        { id: 'toast', href: '/toast', icon: LayoutDashboard , label: 'Toast' },
        { id: 'modal', href: '/modal', icon: LayoutDashboard , label: 'Modal' },
        { id: 'dropdown', href: '/dropdown', icon: LayoutDashboard , label: 'Dropdown' },
        { id: 'table', href: '/table', icon: LayoutDashboard , label: 'Table' },
        { id: 'leads', href: '/leads', icon: UserSearch, label: 'Leads' },
        { id: 'donasi', href: '/donasi', icon: HandCoins, label: 'Input Donasi' },
        { id: 'transaksi', href: '/transaksi', icon: Receipt, label: 'Transaksi' },
        { id: 'duplicates', href: '/duplicates', icon: ClipboardCheck, label: 'Review Duplikat' },
        { id: 'donatur', href: '/donatur', icon: Users, label: 'Donatur' },
        { id: 'leaderboard', href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
        { id: 'stats', href: '/stats', icon: LineChart, label: 'Statistik' },
        { id: 'campaigns', href: '/campaigns', icon: Megaphone, label: 'Campaigns' },
    ];
</script>

<aside class="h-screen fixed left-0 top-0 bg-white border-r border-(--color-border) flex flex-col z-50 transition-all duration-300 ease-in-out {isCollapsed ? 'w-20' : 'w-56'}">

    <!-- Logo -->
    <div class="p-4 flex items-center gap-3 border-b border-(--color-border)">
        <div class="w-10 h-10 bg-(--color-primary) rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
            <Landmark size={22} />
        </div>

        {#if !isCollapsed}
            <div class="whitespace-nowrap">
                <h1 class="text-lg font-semibold text-(--color-text-primary) leading-none">
                    SAMS
                </h1>
                <p class="text-[10px] uppercase tracking-wider text-(--color-text-muted) mt-1">
                    by SIDAQ
                </p>
            </div>
        {/if}
    </div>

    <!-- Menu -->
    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">

        {#each menus as menu}
            <a 
                href={menu.href}
                title={isCollapsed ? menu.label : ''} 
                class="flex items-center px-3 py-2 rounded-lg transition-all duration-200
                {active === menu.id 
                    ? 'bg-(--color-primary) text-white font-medium shadow-sm' 
                    : 'text-(--color-text-secondary) hover:bg-(--color-primary-soft) hover:text-(--color-primary-hover)'}
                {isCollapsed ? 'justify-center' : 'gap-3'}"
            >

                <menu.icon size={20} class="shrink-0" />

                {#if !isCollapsed}
                    <span class="text-sm whitespace-nowrap">
                        {menu.label}
                    </span>
                {/if}

            </a>
        {/each}

    </nav>

    <!-- Collapse Button -->
    <div class="p-3 border-t border-(--color-border)">

        <button 
            onclick={() => isCollapsed = !isCollapsed}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            class="w-full flex items-center px-3 py-2 text-(--color-text-secondary) hover:bg-(--color-primary-soft) hover:text-(--color-primary-hover) transition-all duration-200 rounded-lg {isCollapsed ? 'justify-center' : 'gap-3'}"
        >

            <div class="shrink-0">
                {#if isCollapsed}
                    <ChevronRight size={20} />
                {:else}
                    <ChevronLeft size={20} />
                {/if}
            </div>

            {#if !isCollapsed}
                <span class="text-sm whitespace-nowrap">
                    Sembunyikan Sidebar
                </span>
            {/if}

        </button>

    </div>

</aside>