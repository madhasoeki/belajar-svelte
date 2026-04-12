<script lang="ts">
  import { ChevronDown, X, Check, Search } from "lucide-svelte";
  import { fade, slide } from "svelte/transition";

  interface Option {
    value: string | number;
    label: string;
  }

  interface MultiSelectProps {
    label?: string;
    options?: Option[];
    values?: (string | number)[];
    placeholder?: string;
    searchPlaceholder?: string;
    class?: string;
    error?: string;
    disabled?: boolean;
    maxItems?: number;
    emptyMessage?: string;
  }

  let {
    label = "",
    options = [],
    values = $bindable([]),
    placeholder = "Pilih opsi...",
    searchPlaceholder = "Cari...",
    class: className = "",
    error = "",
    disabled = false,
    maxItems = 50,
    emptyMessage = "Data tidak ditemukan.",
  }: MultiSelectProps = $props();

  let isOpen = $state(false);
  const overlayId = `multiselect-${Math.random().toString(36).slice(2, 9)}`;
  let searchQuery = $state("");
  let inputRef = $state<HTMLInputElement | null>(null);
  let triggerButton = $state<HTMLButtonElement | null>(null);
  let dropdownStyle = $state("");
  let multiSelectId = `multiselect-${Math.random().toString(36).slice(2, 9)}`;

  // Derivasi data untuk daftar pilihan dan daftar yang terpilih
  let filteredOptions = $derived(
    options
      .filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, maxItems) 
  );

  let selectedOptions = $derived(
    options.filter(opt => values.includes(opt.value))
  );

  function toggleOption(val: string | number) {
    if (values.includes(val)) {
      values = values.filter(v => v !== val); // Hapus jika sudah ada
    } else {
      values = [...values, val]; // Tambah jika belum ada
    }
  }

  function removeOption(e: MouseEvent, val: string | number) {
    e.stopPropagation(); // Mencegah dropdown terbuka saat klik (x)
    values = values.filter(v => v !== val);
  }

  function clearAll(e: MouseEvent) {
    e.stopPropagation();
    values = [];
  }

  function openDropdown() {
    if (disabled) return;
    const nextOpen = !isOpen;
    if (nextOpen && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("ui:overlay-open", {
          detail: { id: overlayId, type: "multiselect" },
        }),
      );
    }
    isOpen = nextOpen;
    if (nextOpen) {
      searchQuery = ""; // Reset pencarian saat dibuka
      updateDropdownPosition();
      requestAnimationFrame(() => inputRef?.focus()); // Fokus ke search bar otomatis
    }
  }

  function handleOverlayOpen(event: Event) {
    const detail = (event as CustomEvent<{ id?: string }>).detail;
    if (!detail || detail.id === overlayId) return;
    isOpen = false;
  }

  function updateDropdownPosition() {
    if (!isOpen || !triggerButton) return;

    const rect = triggerButton.getBoundingClientRect();
    const gap = 6;
    const viewportPadding = 8;
    const preferredHeight = 320;

    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
    const spaceAbove = rect.top - viewportPadding;
    const openUpward =
      spaceBelow < Math.min(220, preferredHeight) && spaceAbove > spaceBelow;

    const availableSpace = openUpward ? spaceAbove : spaceBelow;
    const maxHeight = Math.max(
      140,
      Math.min(preferredHeight, availableSpace - gap),
    );

    const width = rect.width;
    const left = Math.max(
      viewportPadding,
      Math.min(rect.left, window.innerWidth - viewportPadding - width),
    );
    const top = openUpward ? rect.top - gap : rect.bottom + gap;

    dropdownStyle = `position:fixed;left:${Math.round(left)}px;top:${Math.round(top)}px;width:${Math.round(width)}px;max-height:${Math.round(maxHeight)}px;${openUpward ? "transform:translateY(-100%);" : ""}`;
  }

  function clickOutside(node: HTMLElement) {
    const handleClick = (e: MouseEvent) => {
      if (!node.contains(e.target as Node)) isOpen = false;
    };
    document.addEventListener("click", handleClick, true);
    return { destroy() { document.removeEventListener("click", handleClick, true); } };
  }

  $effect(() => {
    if (!isOpen) return;

    const syncPosition = () => updateDropdownPosition();
    requestAnimationFrame(syncPosition);

    window.addEventListener("resize", syncPosition);
    window.addEventListener("scroll", syncPosition, true);

    return () => {
      window.removeEventListener("resize", syncPosition);
      window.removeEventListener("scroll", syncPosition, true);
    };
  });

  $effect(() => {
    const onOverlayOpen = (event: Event) => handleOverlayOpen(event);
    window.addEventListener("ui:overlay-open", onOverlayOpen as EventListener);
    return () =>
      window.removeEventListener("ui:overlay-open", onOverlayOpen as EventListener);
  });
</script>

<div class={`flex flex-col gap-1.5 ${className}`} use:clickOutside>
  {#if label}
    <label for={multiSelectId} class="text-sm font-medium text-(--color-text-secondary)">
      {label}
    </label>
  {/if}

  <div class="relative">
    <button
      id={multiSelectId}
      type="button"
      bind:this={triggerButton}
      onclick={openDropdown}
      {disabled}
      class={`w-full min-h-10.5 px-3 py-1.5 flex flex-wrap items-center gap-1.5 bg-white border text-left text-sm rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-(--color-primary-soft)
        ${error ? 'border-red-500 focus:border-red-500' : 'border-(--color-border) focus:border-(--color-primary)'}
        ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-70' : 'hover:border-gray-300 cursor-pointer'}
      `}
    >
      {#if selectedOptions.length === 0}
        <span class="text-(--color-text-muted) py-1">{placeholder}</span>
      {:else}
        {#each selectedOptions as opt (opt.value)}
          <span class="inline-flex items-center gap-1 bg-(--color-primary-soft) text-(--color-primary) px-2 py-1 rounded-md text-xs font-medium border border-(--color-primary)/20 animate-in fade-in zoom-in duration-200">
            {opt.label}
            <div 
              role="button"
              tabindex="0"
              onclick={(e) => removeOption(e, opt.value)}
              onkeydown={(e) => e.key === 'Enter' && removeOption(e as any, opt.value)}
              class="hover:bg-(--color-primary)/20 rounded-full p-0.5 cursor-pointer transition-colors"
            >
              <X size={12} strokeWidth={3} />
            </div>
          </span>
        {/each}
      {/if}

      <div class="ml-auto flex items-center gap-1">
        {#if selectedOptions.length > 0 && !disabled}
          <div 
            role="button"
            tabindex="0"
            onclick={clearAll} 
            onkeydown={(e) => e.key === 'Enter' && clearAll(e as any)}
            class="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-red-500 transition-colors" 
            title="Hapus Semua"
          >
            <X size={14} />
          </div>
        {/if}
        <ChevronDown size={16} class={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
    </button>

    {#if isOpen}
      <div 
        transition:fade={{ duration: 150 }}
        class="z-1200 bg-white border border-(--color-border) rounded-xl shadow-xl overflow-hidden flex flex-col"
        style={dropdownStyle}
      >
        <div class="p-2 border-b border-gray-100 bg-gray-50/50">
          <div class="relative">
            <Search size={14} class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              bind:this={inputRef}
              bind:value={searchQuery}
              type="text"
              placeholder={searchPlaceholder}
              class="w-full pl-8 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
            />
          </div>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto p-1 custom-scrollbar">
          {#if filteredOptions.length === 0}
            <div class="px-3 py-4 text-center text-sm text-gray-500">
              {emptyMessage} </div>
          {:else}
            {#each filteredOptions as option (option.value)}
              {@const isSelected = values.includes(option.value)}
              <button
                type="button"
                onclick={() => toggleOption(option.value)}
                class={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors
                  ${isSelected ? 'bg-(--color-primary-soft) text-(--color-primary) font-medium' : 'text-(--color-text-secondary) hover:bg-gray-100 hover:text-(--color-text-primary)'}
                `}
              >
                <span>{option.label}</span>
                {#if isSelected}
                  <Check size={16} class="text-(--color-primary)" />
                {/if}
              </button>
            {/each}
          {/if}
        </div>
      </div>
    {/if}
  </div>

  {#if error}
    <p class="text-xs text-red-500 mt-0.5">{error}</p>
  {/if}
</div>