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
    align?: "left" | "right";
  }

  let {
    startDate = $bindable(""),
    endDate = $bindable(""),
    granularity = $bindable("day"),
    enabledGranularities = ["day", "month", "year"],
    label = "Pilih Tanggal",
    align = "left",
    class: className = ""
  }: DateRangeProps = $props();

  let isOpen = $state(false);
  let triggerButton: HTMLButtonElement | null = null;
  let popoverStyle = $state("");

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
      
      // --- LOGIKA TRANSFORMASI RENTANG OTOMATIS ---
      if (startDate) {
        // Ambil tahun dan bulan dari startDate yang sedang aktif
        const d = new Date(startDate);
        const y = d.getFullYear();
        const m = d.getMonth();

        if (granularity === 'month') {
          // Perluas jadi full satu bulan
          const lastDay = new Date(y, m + 1, 0).getDate();
          startDate = fmt(y, m, 1);
          endDate = fmt(y, m, lastDay);
          
          // Sinkronisasi state di dalam kalender
          pendingMonthStart = fmtMonth(y, m);
          pendingMonthEnd = fmtMonth(y, m);
        } 
        else if (granularity === 'year') {
          // Perluas jadi full satu tahun
          startDate = `${y}-01-01`;
          endDate = `${y}-12-31`;
          
          // Sinkronisasi state di dalam kalender
          pendingYearStart = String(y);
          pendingYearEnd = String(y);
        } 
        else if (granularity === 'day') {
          // Kembalikan ke "Hari Ini" (menggunakan waktu lokal perangkat)
          const now = new Date();
          const todayLocal = fmt(now.getFullYear(), now.getMonth(), now.getDate());
          
          startDate = todayLocal;
          endDate = todayLocal;
          
          // Sinkronisasi state di dalam kalender
          pendingStart = todayLocal;
          pendingEnd = todayLocal;
        }
      }
      
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

  // --- FUNGSI FORMAT VISUAL ---
  function getVisualLabel() {
    // 1. Jika ada preset (Misal: "Hari Ini", "Bulan Lalu"), langsung gunakan
    if (appliedPreset) return presetLabels[appliedPreset];
    
    // 2. Pastikan start dan end terisi
    if (!startDate || !endDate) return label;

    const startParts = startDate.split("-");
    const endParts = endDate.split("-");

    const sy = startParts[0], sm = parseInt(startParts[1]) - 1, sd = startParts[2];
    const ey = endParts[0], em = parseInt(endParts[1]) - 1, ed = endParts[2];

    // -- MODE TAHUNAN (Hanya tampilkan tahun) --
    if (granularity === "year") {
      if (sy === ey) return sy; // Contoh: "2026"
      return `${sy} - ${ey}`;   // Contoh: "2024 - 2026"
    }

    // -- MODE BULANAN (Tampilkan Nama Bulan + Tahun) --
    if (granularity === "month") {
      const startLabel = `${monthNames[sm]} ${sy}`;
      const endLabel = `${monthNames[em]} ${ey}`;
      
      if (startLabel === endLabel) return startLabel; // Contoh: "Apr 2026"
      
      // Jika tahunnya sama, cukup panggil tahunnya di akhir (Contoh: "Jan - Apr 2026")
      if (sy === ey) return `${monthNames[sm]} - ${monthNames[em]} ${sy}`;
      
      // Jika tahun berbeda (Contoh: "Des 2025 - Apr 2026")
      return `${startLabel} - ${endLabel}`;
    }

    // -- MODE HARIAN (Tampilkan tanggal lengkap) --
    const startStr = `${sd} ${monthNames[sm]} ${sy}`;
    const endStr = `${ed} ${monthNames[em]} ${ey}`;

    if (startDate === endDate) return startStr;
    return `${startStr} - ${endStr}`;
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
    appliedPreset = pendingPreset; 
    
    if (granularity === 'day') {
      startDate = pendingStart;
      endDate = pendingEnd || pendingStart;
    } 
    else if (granularity === 'month') {
      // Normalisasi: YYYY-MM menjadi YYYY-MM-01
      const [y, m] = pendingMonthStart.split("-").map(Number);
      startDate = fmt(y, m - 1, 1); // Awal bulan

      const endVal = pendingMonthEnd || pendingMonthStart;
      const [ey, em] = endVal.split("-").map(Number);
      const lastDay = new Date(ey, em, 0).getDate(); // Ambil tanggal terakhir bulan tsb
      endDate = fmt(ey, em - 1, lastDay);
    } 
    else if (granularity === 'year') {
      // Normalisasi: YYYY menjadi YYYY-01-01
      startDate = `${pendingYearStart}-01-01`;
      
      const endVal = pendingYearEnd || pendingYearStart;
      endDate = `${endVal}-12-31`;
    }
    
    isOpen = false;
  }

  function updatePopoverPosition() {
    if (!isOpen || !triggerButton) return;

    if (window.innerWidth >= 768) {
      popoverStyle = "";
      return;
    }

    const triggerRect = triggerButton.getBoundingClientRect();
    const sidePadding = 12;
    const verticalGap = 8;
    const mobileBottomOffset = 88;
    const width = Math.min(360, window.innerWidth - sidePadding * 2);

    let left = align === "right"
      ? triggerRect.right - width
      : triggerRect.left;

    left = Math.max(sidePadding, Math.min(left, window.innerWidth - sidePadding - width));

    const top = triggerRect.bottom + verticalGap;
    const maxHeight = Math.max(220, window.innerHeight - top - mobileBottomOffset);

    popoverStyle = `top:${Math.round(top)}px;left:${Math.round(left)}px;width:${Math.round(width)}px;max-height:${Math.round(maxHeight)}px;`;
  }

  function openPopover() {
    isOpen = !isOpen;
    if (isOpen) {
      if (granularity === 'day') {
        pendingStart = startDate;
        pendingEnd = endDate;
      } else if (granularity === 'month' && startDate) {
        // Ambil YYYY-MM dari YYYY-MM-DD
        pendingMonthStart = startDate.substring(0, 7);
        pendingMonthEnd = endDate.substring(0, 7);
      } else if (granularity === 'year' && startDate) {
        // Ambil YYYY dari YYYY-MM-DD
        pendingYearStart = startDate.substring(0, 4);
        pendingYearEnd = endDate.substring(0, 4);
      }
      
      pendingPreset = appliedPreset;
      updatePopoverPosition();
    }
  }

  $effect(() => {
    if (!isOpen) return;

    const handleViewportChange = () => updatePopoverPosition();
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  });

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
    bind:this={triggerButton}
    onclick={openPopover}
    class="flex items-center gap-2 px-4 py-2 bg-white border border-(--color-border) rounded-lg text-sm font-medium text-(--color-text-secondary) hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-(--color-primary-soft) transition-colors h-10"
  >
    <CalendarIcon size={18} class="text-gray-400" />
    <span>
      {getVisualLabel()}
    </span>
  </button>

  {#if isOpen}
    <div 
      transition:fade={{ duration: 150 }}
      class={`fixed z-60 overflow-y-auto bg-white border border-(--color-border) rounded-xl shadow-xl flex flex-col
        md:absolute md:inset-x-auto md:bottom-auto md:top-[calc(100%+8px)] md:max-h-none md:overflow-visible md:flex-row
        ${align === 'right' ? 'md:right-0' : 'md:left-0'} 
      `}
      style={popoverStyle}
    >  
      {#if granularity === 'day'}
        <div class="order-2 md:order-1 w-full md:w-36 border-t border-gray-100 md:border-t-0 md:border-r p-2 md:pt-4 bg-gray-50/50">
          <div class="grid grid-cols-2 gap-1 md:flex md:flex-col">
            <button onclick={() => applyPreset('today')} class="text-left px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors">Hari Ini</button>
            <button onclick={() => applyPreset('yesterday')} class="text-left px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors">Kemarin</button>
            <button onclick={() => applyPreset('last7')} class="text-left px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors">7 Hari Terakhir</button>
            <button onclick={() => applyPreset('last30')} class="text-left px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors">30 Hari Terakhir</button>
            
            {#if !enabledGranularities.includes('month')}
              <button onclick={() => applyPreset('thisMonth')} class="text-left px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors">Bulan Ini</button>
              <button onclick={() => applyPreset('lastMonth')} class="text-left px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors">Bulan Lalu</button>
            {/if}

            {#if !enabledGranularities.includes('year')}
              <button onclick={() => applyPreset('thisYear')} class="text-left px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors">Tahun Ini</button>
              <button onclick={() => applyPreset('lastYear')} class="text-left px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors">Tahun Lalu</button>
            {/if}
          </div>
        </div>

        <div class="order-1 md:order-2 p-4 flex-1 w-full md:w-72">
          <div class="flex items-center justify-between mb-4">
            <button onclick={() => viewDate = new Date(viewYear, viewMonth - 1, 1)} class="p-1.5 rounded-md hover:bg-gray-100"><ChevronLeft size={18} /></button>
            <span class="text-sm font-bold text-(--color-text-primary)">{monthNames[viewMonth]} {viewYear}</span>
            <button onclick={() => viewDate = new Date(viewYear, viewMonth + 1, 1)} class="p-1.5 rounded-md hover:bg-gray-100"><ChevronRight size={18} /></button>
          </div>
          <div class="grid grid-cols-7 mb-2">
            {#each dayNames as day (day)} <div class="text-center text-[11px] font-semibold text-gray-400">{day}</div> {/each}
          </div>
          <div class="grid grid-cols-7 gap-y-1">
            {#each calendarDays as day (day.date)}
              {@const isStart = day.date === pendingStart} {@const isEnd = day.date === pendingEnd}
              {@const inRange = pendingStart && pendingEnd && day.date > pendingStart && day.date < pendingEnd}
              <button onclick={() => selectDate(day.date)} class={`h-8 w-8 mx-auto flex items-center justify-center text-xs transition-all relative ${day.outside ? 'text-gray-300' : 'text-gray-700'} ${!isStart && !isEnd && !inRange ? 'rounded-full hover:bg-(--color-primary-soft) hover:text-(--color-primary)' : ''} ${inRange ? 'bg-(--color-primary-soft) text-(--color-primary) w-full rounded-none' : ''} ${isStart && pendingEnd ? 'bg-(--color-primary) text-white rounded-l-full rounded-r-none w-full hover:bg-(--color-primary-hover)' : ''} ${isStart && !pendingEnd ? 'bg-(--color-primary) text-white rounded-full shadow-sm hover:bg-(--color-primary-hover)' : ''} ${isEnd ? 'bg-(--color-primary) text-white rounded-r-full rounded-l-none w-full shadow-sm hover:bg-(--color-primary-hover)' : ''}`}>{day.day}</button>
            {/each}
          </div>
          <div class="mt-4 flex justify-end gap-2 "><Button variant="primary" size="sm" onclick={applySelection} disabled={!pendingStart}>Terapkan</Button></div>
        </div>

      {:else if granularity === 'month'}
        <div class="p-4 w-full md:w-72">
          <div class="flex items-center justify-between mb-4">
            <button onclick={() => monthPickerYear--} class="p-1.5 rounded-md hover:bg-gray-100"><ChevronLeft size={18} /></button>
            <span class="text-sm font-bold">{monthPickerYear}</span>
            <button onclick={() => monthPickerYear++} class="p-1.5 rounded-md hover:bg-gray-100"><ChevronRight size={18} /></button>
          </div>
          <div class="grid grid-cols-3 gap-2">
            {#each monthNames as mName, i (mName)}
              {@const mVal = fmtMonth(monthPickerYear, i)}
              {@const isStart = mVal === pendingMonthStart} {@const isEnd = mVal === pendingMonthEnd}
              {@const inRange = pendingMonthStart && pendingMonthEnd && mVal > pendingMonthStart && mVal < pendingMonthEnd}
              <button onclick={() => selectMonthGrid(mVal)} class={`h-10 text-sm font-medium rounded-lg transition-colors ${!isStart && !isEnd && !inRange ? 'text-gray-600 hover:bg-(--color-primary-soft) hover:text-(--color-primary)' : ''} ${inRange ? 'bg-(--color-primary-soft) text-(--color-primary)' : ''} ${isStart || isEnd ? 'bg-(--color-primary) text-white' : ''}`}>{mName}</button>
            {/each}
          </div>
          <div class="mt-4 flex justify-end border-t border-gray-100 pt-3"><Button variant="primary" size="sm" onclick={applySelection} disabled={!pendingMonthStart}>Terapkan</Button></div>
        </div>

      {:else if granularity === 'year'}
        <div class="p-4 w-full md:w-72">
          <div class="flex items-center justify-between mb-4">
            <button onclick={() => yearPickerBase -= 12} class="p-1.5 rounded-md hover:bg-gray-100"><ChevronLeft size={18} /></button>
            <span class="text-sm font-bold">{yearPickerBase} - {yearPickerBase + 11}</span>
            <button onclick={() => yearPickerBase += 12} class="p-1.5 rounded-md hover:bg-gray-100"><ChevronRight size={18} /></button>
          </div>
          <div class="grid grid-cols-3 gap-2">
            {#each yearList as yVal (yVal)}
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