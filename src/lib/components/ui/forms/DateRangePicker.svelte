<script lang="ts">
  import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from "lucide-svelte";
  import { fade } from "svelte/transition";
  import Button from "$lib/components/ui/button/Button.svelte";
  import Select from "$lib/components/ui/forms/Select.svelte";

  interface DateRangeProps {
    startDate?: string;
    endDate?: string;
    granularity?: "day" | "month" | "year";
    enabledGranularities?: Array<"day" | "month" | "year">; 
    label?: string;
    class?: string;
  }

  let {
    startDate = $bindable(""),
    endDate = $bindable(""),
    granularity = $bindable("day"),
    enabledGranularities = ["day", "month", "year"],
    label = "Pilih Tanggal",
    class: className = ""
  }: DateRangeProps = $props();

  let isOpen = $state(false);

  // [NEW] Dictionary untuk menerjemahkan key preset menjadi label di tombol
  const presetLabels: Record<string, string> = {
    today: "Hari Ini",
    yesterday: "Kemarin",
    last7: "7 Hari Terakhir",
    last30: "30 Hari Terakhir",
    thisMonth: "Bulan Ini",
    lastMonth: "Bulan Lalu",
    thisYear: "Tahun Ini",
    lastYear: "Tahun Lalu"
  };

  // [NEW] State untuk melacak preset
  let pendingPreset = $state("");
  let appliedPreset = $state("");

  let prevGranularity = $state(granularity);
  $effect(() => {
    if (granularity !== prevGranularity) {
      isOpen = false;
      appliedPreset = ""; // Reset label preset jika pindah mode
      prevGranularity = granularity;
    }
  });

  const granularityMap = { day: "Harian", month: "Bulanan", year: "Tahunan" };
  const granularityOptions = $derived(
    enabledGranularities.map(g => ({ value: g, label: granularityMap[g] }))
  );

  // --- 1. STATE HARIAN (DAY) ---
  let pendingStart = $state(startDate);
  let pendingEnd = $state(endDate);
  let selectingEnd = $state(false);
  let viewDate = $state(startDate ? new Date(startDate) : new Date());
  let viewMonth = $derived(viewDate.getMonth());
  let viewYear = $derived(viewDate.getFullYear());

  // --- 2. STATE BULANAN (MONTH) ---
  let monthPickerYear = $state(new Date().getFullYear());
  let pendingMonthStart = $state("");
  let pendingMonthEnd = $state("");
  let selectingMonthEnd = $state(false);

  // --- 3. STATE TAHUNAN (YEAR) ---
  let yearPickerBase = $state(Math.floor(new Date().getFullYear() / 12) * 12);
  let pendingYearStart = $state("");
  let pendingYearEnd = $state("");
  let selectingYearEnd = $state(false);

  // --- UTILITIES UMUM ---
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  function fmt(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  function fmtMonth(y: number, m: number) {
    return `${y}-${String(m + 1).padStart(2, '0')}`;
  }

  function formatDisplay(dateStr: string) {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`; 
    if (parts.length === 2) return `${parts[1]}-${parts[0]}`; 
    return dateStr; 
  }

  // --- LOGIKA DAY PICKER ---
  const calendarDays = $derived.by(() => {
    const days = [];
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const pad = firstDay.getDay();
    const prevLastDay = new Date(viewYear, viewMonth, 0).getDate();

    for (let i = pad - 1; i >= 0; i--) days.push({ date: fmt(viewMonth === 0 ? viewYear - 1 : viewYear, viewMonth === 0 ? 11 : viewMonth - 1, prevLastDay - i), day: prevLastDay - i, outside: true });
    for (let d = 1; d <= lastDay.getDate(); d++) days.push({ date: fmt(viewYear, viewMonth, d), day: d, outside: false });
    for (let d = 1; days.length < 42; d++) days.push({ date: fmt(viewMonth === 11 ? viewYear + 1 : viewYear, viewMonth === 11 ? 0 : viewMonth + 1, d), day: d, outside: true });
    return days;
  });

  function selectDate(dateStr: string) {
    pendingPreset = ""; // [NEW] Reset preset jika user klik manual
    if (selectingEnd && pendingStart) {
      if (dateStr < pendingStart) { pendingEnd = pendingStart; pendingStart = dateStr; } 
      else { pendingEnd = dateStr; }
      selectingEnd = false;
    } else {
      pendingStart = dateStr; pendingEnd = ""; selectingEnd = true;
    }
  }

  function applyPreset(presetType: string) {
    pendingPreset = presetType; // [NEW] Ingat preset yang diklik
    const now = new Date(); let start = new Date(); let end = new Date();
    switch (presetType) {
      case 'today': break;
      case 'yesterday': start.setDate(now.getDate() - 1); end.setDate(now.getDate() - 1); break;
      case 'last7': start.setDate(now.getDate() - 6); break;
      case 'last30': start.setDate(now.getDate() - 29); break;
      case 'thisMonth': start = new Date(now.getFullYear(), now.getMonth(), 1); end = new Date(now.getFullYear(), now.getMonth() + 1, 0); break;
      case 'lastMonth': start = new Date(now.getFullYear(), now.getMonth() - 1, 1); end = new Date(now.getFullYear(), now.getMonth(), 0); break;
      case 'thisYear': start = new Date(now.getFullYear(), 0, 1); end = new Date(now.getFullYear(), 11, 31); break;
      case 'lastYear': start = new Date(now.getFullYear() - 1, 0, 1); end = new Date(now.getFullYear() - 1, 11, 31); break;
    }
    pendingStart = fmt(start.getFullYear(), start.getMonth(), start.getDate());
    pendingEnd = fmt(end.getFullYear(), end.getMonth(), end.getDate());
    selectingEnd = false; viewDate = new Date(pendingStart);
  }

  // --- LOGIKA MONTH PICKER ---
  function selectMonthGrid(monthVal: string) {
    pendingPreset = ""; // [NEW] Reset
    if (selectingMonthEnd && pendingMonthStart) {
      if (monthVal < pendingMonthStart) { pendingMonthEnd = pendingMonthStart; pendingMonthStart = monthVal; } 
      else { pendingMonthEnd = monthVal; }
      selectingMonthEnd = false;
    } else {
      pendingMonthStart = monthVal; pendingMonthEnd = ""; selectingMonthEnd = true;
    }
  }

  // --- LOGIKA YEAR PICKER ---
  const yearList = $derived(Array.from({ length: 12 }, (_, i) => yearPickerBase + i));
  
  function selectYearGrid(yearVal: string) {
    pendingPreset = ""; // [NEW] Reset
    if (selectingYearEnd && pendingYearStart) {
      if (yearVal < pendingYearStart) { pendingYearEnd = pendingYearStart; pendingYearStart = yearVal; } 
      else { pendingYearEnd = yearVal; }
      selectingYearEnd = false;
    } else {
      pendingYearStart = yearVal; pendingYearEnd = ""; selectingYearEnd = true;
    }
  }

  // --- GLOBAL APPLY ---
  function applySelection() {
    appliedPreset = pendingPreset; // [NEW] Kunci preset untuk ditampilkan di tombol
    
    if (granularity === 'day') { startDate = pendingStart; endDate = pendingEnd || pendingStart; }
    else if (granularity === 'month') { startDate = pendingMonthStart; endDate = pendingMonthEnd || pendingMonthStart; }
    else if (granularity === 'year') { startDate = pendingYearStart; endDate = pendingYearEnd || pendingYearStart; }
    isOpen = false;
  }

  // [NEW] Fungsi buka popover sekaligus sinkronisasi state
  function openPopover() {
    isOpen = !isOpen;
    if (isOpen) {
      pendingStart = startDate;
      pendingEnd = endDate;
      pendingPreset = appliedPreset;
    }
  }

  function clickOutside(node: HTMLElement) {
    const handleClick = (e: MouseEvent) => { if (!node.contains(e.target as Node)) isOpen = false; };
    document.addEventListener("click", handleClick, true);
    return { destroy() { document.removeEventListener("click", handleClick, true); } };
  }
</script>

<div class={`relative inline-flex items-center gap-2 ${className}`} use:clickOutside>
  
  {#if enabledGranularities.length > 1}
    <div class="w-32">
      <Select bind:value={granularity} options={granularityOptions} />
    </div>
  {/if}

  <button 
    type="button" 
    onclick={openPopover}
    class="flex items-center gap-2 px-4 py-2 bg-white border border-(--color-border) rounded-lg text-sm font-medium text-(--color-text-secondary) hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-(--color-primary-soft) transition-colors h-10"
  >
    <CalendarIcon size={18} class="text-gray-400" />
    <span>
      {#if appliedPreset}
        {presetLabels[appliedPreset]}
      {:else if startDate && endDate}
        {#if startDate === endDate}
          {formatDisplay(startDate)}
        {:else}
          {formatDisplay(startDate)} <span class="mx-1 text-gray-300">-</span> {formatDisplay(endDate)}
        {/if}
      {:else}
        {label}
      {/if}
    </span>
  </button>

  {#if isOpen}
    <div transition:fade={{ duration: 150 }} class="absolute left-0 top-12 mt-1 z-50 flex bg-white border border-(--color-border) rounded-xl shadow-xl overflow-hidden w-max">
      
      {#if granularity === 'day'}
        <div class="w-36 border-r border-gray-100 p-2 flex flex-col gap-1 bg-gray-50/50">
           <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 pt-1 mb-1">Harian</p>
           <button onclick={() => applyPreset('today')} class="text-left px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors">Hari Ini</button>
           <button onclick={() => applyPreset('yesterday')} class="text-left px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors">Kemarin</button>
           <button onclick={() => applyPreset('last7')} class="text-left px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors">7 Hari Terakhir</button>
           <button onclick={() => applyPreset('last30')} class="text-left px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors">30 Hari Terakhir</button>
           
           {#if !enabledGranularities.includes('month')}
             <div class="h-px bg-gray-200 my-1"></div>
             <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 pt-1 mb-1">Bulanan</p>
             <button onclick={() => applyPreset('thisMonth')} class="text-left px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors">Bulan Ini</button>
             <button onclick={() => applyPreset('lastMonth')} class="text-left px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors">Bulan Lalu</button>
           {/if}

           {#if !enabledGranularities.includes('year')}
             <div class="h-px bg-gray-200 my-1"></div>
             <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 pt-1 mb-1">Tahunan</p>
             <button onclick={() => applyPreset('thisYear')} class="text-left px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors">Tahun Ini</button>
             <button onclick={() => applyPreset('lastYear')} class="text-left px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors">Tahun Lalu</button>
           {/if}
        </div>

        <div class="p-4 flex-1 w-72">
          <div class="flex items-center justify-between mb-4">
            <button onclick={() => viewDate = new Date(viewYear, viewMonth - 1, 1)} class="p-1.5 rounded-md hover:bg-gray-100"><ChevronLeft size={18} /></button>
            <span class="text-sm font-bold text-(--color-text-primary)">{monthNames[viewMonth]} {viewYear}</span>
            <button onclick={() => viewDate = new Date(viewYear, viewMonth + 1, 1)} class="p-1.5 rounded-md hover:bg-gray-100"><ChevronRight size={18} /></button>
          </div>
          <div class="grid grid-cols-7 mb-2">
            {#each dayNames as day} <div class="text-center text-[11px] font-semibold text-gray-400">{day}</div> {/each}
          </div>
          <div class="grid grid-cols-7 gap-y-1">
            {#each calendarDays as day}
              {@const isStart = day.date === pendingStart} {@const isEnd = day.date === pendingEnd}
              {@const inRange = pendingStart && pendingEnd && day.date > pendingStart && day.date < pendingEnd}
              <button onclick={() => selectDate(day.date)} class={`h-8 w-8 mx-auto flex items-center justify-center text-xs transition-all relative ${day.outside ? 'text-gray-300' : 'text-gray-700'} ${!isStart && !isEnd && !inRange ? 'rounded-full hover:bg-(--color-primary-soft) hover:text-(--color-primary)' : ''} ${inRange ? 'bg-(--color-primary-soft) text-(--color-primary) w-full rounded-none' : ''} ${isStart && pendingEnd ? 'bg-(--color-primary) text-white rounded-l-full rounded-r-none w-full hover:bg-(--color-primary-hover)' : ''} ${isStart && !pendingEnd ? 'bg-(--color-primary) text-white rounded-full shadow-sm hover:bg-(--color-primary-hover)' : ''} ${isEnd ? 'bg-(--color-primary) text-white rounded-r-full rounded-l-none w-full shadow-sm hover:bg-(--color-primary-hover)' : ''}`}>{day.day}</button>
            {/each}
          </div>
          <div class="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-3"><Button variant="primary" size="sm" onclick={applySelection} disabled={!pendingStart}>Terapkan</Button></div>
        </div>

      {:else if granularity === 'month'}
        <div class="p-4 w-72">
          <div class="flex items-center justify-between mb-4">
            <button onclick={() => monthPickerYear--} class="p-1.5 rounded-md hover:bg-gray-100"><ChevronLeft size={18} /></button>
            <span class="text-sm font-bold">{monthPickerYear}</span>
            <button onclick={() => monthPickerYear++} class="p-1.5 rounded-md hover:bg-gray-100"><ChevronRight size={18} /></button>
          </div>
          <div class="grid grid-cols-3 gap-2">
            {#each monthNames as mName, i}
              {@const mVal = fmtMonth(monthPickerYear, i)}
              {@const isStart = mVal === pendingMonthStart} {@const isEnd = mVal === pendingMonthEnd}
              {@const inRange = pendingMonthStart && pendingMonthEnd && mVal > pendingMonthStart && mVal < pendingMonthEnd}
              <button onclick={() => selectMonthGrid(mVal)} class={`h-10 text-sm font-medium rounded-lg transition-colors ${!isStart && !isEnd && !inRange ? 'text-gray-600 hover:bg-(--color-primary-soft) hover:text-(--color-primary)' : ''} ${inRange ? 'bg-(--color-primary-soft) text-(--color-primary)' : ''} ${isStart || isEnd ? 'bg-(--color-primary) text-white' : ''}`}>{mName}</button>
            {/each}
          </div>
          <div class="mt-4 flex justify-end border-t border-gray-100 pt-3"><Button variant="primary" size="sm" onclick={applySelection} disabled={!pendingMonthStart}>Terapkan</Button></div>
        </div>

      {:else if granularity === 'year'}
        <div class="p-4 w-72">
          <div class="flex items-center justify-between mb-4">
            <button onclick={() => yearPickerBase -= 12} class="p-1.5 rounded-md hover:bg-gray-100"><ChevronLeft size={18} /></button>
            <span class="text-sm font-bold">{yearPickerBase} - {yearPickerBase + 11}</span>
            <button onclick={() => yearPickerBase += 12} class="p-1.5 rounded-md hover:bg-gray-100"><ChevronRight size={18} /></button>
          </div>
          <div class="grid grid-cols-3 gap-2">
            {#each yearList as yVal}
              {@const yStr = String(yVal)}
              {@const isStart = yStr === pendingYearStart} {@const isEnd = yStr === pendingYearEnd}
              {@const inRange = pendingYearStart && pendingYearEnd && yStr > pendingYearStart && yStr < pendingYearEnd}
              <button onclick={() => selectYearGrid(yStr)} class={`h-10 text-sm font-medium rounded-lg transition-colors ${!isStart && !isEnd && !inRange ? 'text-gray-600 hover:bg-(--color-primary-soft) hover:text-(--color-primary)' : ''} ${inRange ? 'bg-(--color-primary-soft) text-(--color-primary)' : ''} ${isStart || isEnd ? 'bg-(--color-primary) text-white' : ''}`}>{yStr}</button>
            {/each}
          </div>
          <div class="mt-4 flex justify-end border-t border-gray-100 pt-3"><Button variant="primary" size="sm" onclick={applySelection} disabled={!pendingYearStart}>Terapkan</Button></div>
        </div>
      {/if}

    </div>
  {/if}
</div>