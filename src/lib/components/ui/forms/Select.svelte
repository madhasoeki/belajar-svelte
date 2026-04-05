<script lang="ts">
  import { ChevronDown, Search } from "lucide-svelte";

  export interface SelectOption {
    value: any;
    label: string;
  }

  interface SelectProps {
    label?: string;
    helper?: string;
    error?: string;
    value?: any;
    options: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    searchable?: boolean;
    class?: string;
    id?: string;
  }

  let {
    id = `select-${Math.random().toString(36).substring(2, 9)}`,
    label,
    helper = "",
    error = "",
    value = $bindable(""),
    options = [],
    placeholder = "Pilih salah satu...",
    disabled = false,
    searchable = false,
    class: wrapperClass = "",
  }: SelectProps = $props();

  let isOpen = $state(false);
  let container: HTMLElement;
  let triggerButton = $state<HTMLButtonElement | null>(null);
  let searchQuery = $state("");
  let searchInputEl = $state<HTMLInputElement | null>(null);
  let dropdownStyle = $state("");

  const filteredOptions = $derived(
    searchQuery.trim() === "" 
      ? options 
      : options.filter((opt) => 
          opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
  );

  const selectedLabel = $derived(
    options.find((opt) => opt.value === value)?.label,
  );

  function toggleOpen() {
    if (!disabled) {
      isOpen = !isOpen;
      if (isOpen) {
        searchQuery = "";
        updateDropdownPosition();
      }
    }
  }

  function selectOption(val: any) {
    value = val;
    isOpen = false;
  }

  function handleClickOutside(event: MouseEvent) {
    if (isOpen && container && !container.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  function updateDropdownPosition() {
    if (!isOpen || !triggerButton) return;

    const rect = triggerButton.getBoundingClientRect();
    const gap = 6;
    const viewportPadding = 8;
    const preferredHeight = searchable ? 320 : 260;

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

  $effect(() => {
    if (isOpen && searchInputEl) {
      requestAnimationFrame(() => searchInputEl?.focus());
    }
  });

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
</script>

<svelte:window onclick={handleClickOutside} />

<div class={`flex flex-col gap-1.5 w-full ${wrapperClass}`} bind:this={container}>
  {#if label}
    <label for={id} class="text-sm font-medium text-(--color-text-secondary)">
      {label}
    </label>
  {/if}

  <div class="relative">
    <button
      {id}
      type="button"
      bind:this={triggerButton}
      onclick={toggleOpen}
      {disabled}
      class={`
        w-full px-3 py-2 text-left text-sm bg-white border rounded-lg outline-none transition flex items-center justify-between
        ${error ? "border-(--color-danger)" : "border-(--color-border)"}
        ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50 text-(--color-text-muted)" : "cursor-pointer focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary-soft)"}
        ${isOpen ? "border-(--color-primary) ring-2 ring-(--color-primary-soft)" : ""}
      `}
    >
      <span class={`truncate ${!selectedLabel ? "text-(--color-text-muted)" : "text-(--color-text-primary)"}`}>
        {selectedLabel || placeholder}
      </span>
      <ChevronDown
        size={18}
        class={`text-(--color-text-muted) transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
      />
    </button>

    {#if isOpen}
      <div
        class="z-1200 bg-white border border-(--color-border) rounded-lg shadow-lg overflow-hidden flex flex-col"
        style={dropdownStyle}
      >
        
        {#if searchable}
          <div class="flex items-center gap-2 px-3 py-2 border-b border-(--color-border) bg-gray-50/50 sticky top-0">
            <Search size={16} class="text-(--color-text-muted) shrink-0" />
            <input
              type="text"
              bind:this={searchInputEl}
              bind:value={searchQuery}
              placeholder="Cari..."
              class="w-full text-sm bg-transparent outline-none text-(--color-text-primary)"
              onclick={(e) => e.stopPropagation()} 
            />
          </div>
        {/if}

        <ul class="min-h-0 flex-1 overflow-y-auto p-1">
          {#each filteredOptions as option (option.value)}
            <button
              type="button"
              onclick={() => selectOption(option.value)}
              class={`
                w-full text-left px-3 py-2 text-sm rounded-md cursor-pointer transition-colors flex items-center justify-between border-0 
                ${
                  value === option.value
                    ? "bg-(--color-primary-soft) text-(--color-primary) font-medium"
                    : "bg-transparent text-(--color-text-primary) hover:bg-(--color-bg-page)"
                }
              `}
            >
              <span class="truncate">{option.label}</span>
            </button>
          {:else}
            <div class="px-3 py-4 text-center text-sm text-(--color-text-muted)">
              Tidak ada hasil untuk "{searchQuery}"
            </div>
          {/each}
        </ul>
      </div>
    {/if}
  </div>

  {#if error}
    <p class="text-xs text-(--color-danger) mt-1">{error}</p>
  {:else if helper}
    <p class="text-xs text-(--color-text-muted) mt-1">{helper}</p>
  {/if}
</div>