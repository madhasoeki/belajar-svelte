<script lang="ts">
  import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-svelte";
  import { fade } from "svelte/transition";

  interface DatePickerProps {
    value?: string; // Format: YYYY-MM-DD
    label?: string;
    class?: string;
    align?: "left" | "right";
    disabled?: boolean;
    error?: string;
    helper?: string;
    maxDate?: string;
  }

  let {
    value = $bindable(""),
    label = "Pilih Tanggal",
    align = "left",
    disabled = false,
    error = "",
    helper = "",
    maxDate = "",
    class: className = ""
  }: DatePickerProps = $props();

  let isOpen = $state(false);
  const overlayId = `datepicker-${Math.random().toString(36).slice(2, 9)}`;
  let triggerId = `datepicker-${Math.random().toString(36).slice(2, 9)}`;
  let triggerButton: HTMLButtonElement | null = null;
  let popoverStyle = $state("");

  let pendingDate = $state(value);
  let viewDate = $state(value ? new Date(value) : new Date());
  let viewMonth = $derived(viewDate.getMonth());
  let viewYear = $derived(viewDate.getFullYear());

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  function fmt(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  function formatDisplay(dateStr: string) {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) return `${parts[2]} ${monthNames[parseInt(parts[1]) - 1]} ${parts[0]}`; 
    return dateStr; 
  }

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
    pendingDate = dateStr;
    value = pendingDate;
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
    const width = Math.min(320, window.innerWidth - sidePadding * 2);

    let left = align === "right" ? triggerRect.right - width : triggerRect.left;
    left = Math.max(sidePadding, Math.min(left, window.innerWidth - sidePadding - width));
    const top = triggerRect.bottom + verticalGap;

    popoverStyle = `top:${Math.round(top)}px;left:${Math.round(left)}px;width:${Math.round(width)}px;`;
  }

  function openPopover() {
    if (disabled) return;
    const nextOpen = !isOpen;
    if (nextOpen && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("ui:overlay-open", {
          detail: { id: overlayId, type: "datepicker" },
        }),
      );
    }

    isOpen = nextOpen;
    if (nextOpen) {
      pendingDate = value;
      viewDate = value ? new Date(value) : new Date();
      updatePopoverPosition();
      requestAnimationFrame(updatePopoverPosition);
    }
  }

  function handleOverlayOpen(event: Event) {
    const detail = (event as CustomEvent<{ id?: string }>).detail;
    if (!detail || detail.id === overlayId) return;
    isOpen = false;
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

  $effect(() => {
    const onOverlayOpen = (event: Event) => handleOverlayOpen(event);
    window.addEventListener("ui:overlay-open", onOverlayOpen as EventListener);
    return () =>
      window.removeEventListener("ui:overlay-open", onOverlayOpen as EventListener);
  });

  function clickOutside(node: HTMLElement) {
    const handleClick = (e: MouseEvent) => { if (!node.contains(e.target as Node)) isOpen = false; };
    document.addEventListener("click", handleClick, true);
    return { destroy() { document.removeEventListener("click", handleClick, true); } };
  }
</script>

<div class={`flex flex-col gap-1.5 w-full ${className}`} use:clickOutside>
  {#if label}
    <label for={triggerId} class="text-sm font-medium text-(--color-text-secondary)">{label}</label>
  {/if}

  <div class="relative w-full">
    <button 
      id={triggerId}
      type="button" 
      bind:this={triggerButton}
      onclick={openPopover}
      {disabled}
      class={`
        flex items-center justify-between w-full px-3 py-2 bg-white border rounded-lg text-sm transition-all text-left
        ${error ? "border-(--color-danger)" : "border-(--color-border)"}
        ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50 text-(--color-text-muted)" : "cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-(--color-primary-soft)"}
        ${isOpen ? "border-(--color-primary) ring-2 ring-(--color-primary-soft)" : ""}
      `}
    >
      <span class={!value ? "text-(--color-text-muted)" : "text-(--color-text-secondary) text-sm"}>
        {value ? formatDisplay(value) : "Pilih Tanggal..."}
      </span>
      <CalendarIcon size={18} class={`transition-colors ${isOpen ? "text-(--color-primary)" : "text-gray-400"}`} />
    </button>

    {#if isOpen}
      <div 
        transition:fade={{ duration: 150 }}
        class={`fixed z-60 overflow-hidden bg-white border border-(--color-border) rounded-xl shadow-xl
          md:absolute md:inset-x-auto md:bottom-auto md:top-[calc(100%+8px)] md:w-72
          ${align === 'right' ? 'md:right-0' : 'md:left-0'} 
        `}
        style={popoverStyle}
      >  
        <div class="p-4 w-full">
          <div class="flex items-center justify-between mb-4">
            <button type="button" onclick={() => viewDate = new Date(viewYear, viewMonth - 1, 1)} class="p-1.5 rounded-md hover:bg-gray-100 cursor-pointer">
              <ChevronLeft size={18} />
            </button>
            <span class="text-sm font-bold text-(--color-text-primary)">{monthNames[viewMonth]} {viewYear}</span>
            <button type="button" onclick={() => viewDate = new Date(viewYear, viewMonth + 1, 1)} class="p-1.5 rounded-md hover:bg-gray-100 cursor-pointer">
              <ChevronRight size={18} />
            </button>
          </div>
          
          <div class="grid grid-cols-7 mb-2">
            {#each dayNames as day (day)} 
              <div class="text-center text-[11px] font-semibold text-gray-400">{day}</div> 
            {/each}
          </div>
          
          <div class="grid grid-cols-7 gap-y-1">
            {#each calendarDays as day (day.date)}
              {@const isSelected = day.date === pendingDate}
              {@const isDisabledDate = maxDate ? day.date > maxDate : false} 
              
              <button 
                type="button"
                disabled={isDisabledDate}
                onclick={() => !isDisabledDate && selectDate(day.date)} 
                class={`
                  h-8 w-8 mx-auto flex items-center justify-center text-xs transition-all rounded-full
                  ${isDisabledDate ? 'text-gray-300 cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  ${!isDisabledDate && day.outside ? 'text-gray-300' : ''}
                  ${!isDisabledDate && !day.outside ? 'text-gray-700' : ''}
                  ${isSelected && !isDisabledDate ? 'bg-(--color-primary) text-white font-bold shadow-sm' : ''}
                  ${!isSelected && !isDisabledDate ? 'hover:bg-(--color-primary-soft) hover:text-(--color-primary)' : ''}
                `}
              >
                {day.day}
              </button>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </div>

  {#if error}
    <p class="text-xs text-(--color-danger) mt-1">{error}</p>
  {:else if helper}
    <p class="text-xs text-(--color-text-muted) mt-1">{helper}</p>
  {/if}
</div>