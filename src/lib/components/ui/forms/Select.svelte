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
  let searchQuery = $state("");
  let searchInputEl = $state<HTMLInputElement | null>(null);

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

  $effect(() => {
    if (isOpen && searchInputEl) {
      setTimeout(() => searchInputEl?.focus(), 10);
    }
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
      <div class="absolute z-50 w-full mt-1 bg-white border border-(--color-border) rounded-lg shadow-lg overflow-hidden flex flex-col">
        
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

        <ul class="max-h-60 overflow-y-auto p-1">
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