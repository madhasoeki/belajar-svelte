<script lang="ts">
  import type { Snippet } from "svelte";
  import Input from "$lib/components/ui/forms/Input.svelte";
  import Button from "$lib/components/ui/button/Button.svelte";
  import Modal from "$lib/components/ui/modal/Modal.svelte";
  import { Search, Filter, Trash2 } from "lucide-svelte";

  interface TableToolbarProps {
    searchValue?: string;
    searchPlaceholder?: string;
    selectedCount?: number;
    showFilter?: boolean;
    class?: string;
    searchWrapperClass?: string;
    searchInputClass?: string;
    actionsClass?: string;
    filterButtonClass?: string;
    filterLabelClass?: string;
    filterActive?: boolean;
    // Snippets untuk komposisi dinamis
    filterContent?: Snippet;
    bulkActions?: Snippet;
    extraActions?: Snippet;
    // Handler bawaan
    onDeleteSelected?: () => void;
    onResetFilter?: () => void;
    onApplyFilter?: () => void;
  }

  let {
    searchValue = $bindable(""),
    searchPlaceholder = "Cari data...",
    selectedCount = 0,
    showFilter = true,
    class: className = "flex flex-col sm:flex-row items-center justify-between gap-4",
    searchWrapperClass = "w-full sm:w-72",
    searchInputClass = "",
    actionsClass = "flex items-center gap-2 w-full sm:w-auto",
    filterButtonClass = "",
    filterLabelClass = "",
    filterActive = false,
    filterContent,
    bulkActions,
    extraActions,
    onDeleteSelected,
    onResetFilter,
    onApplyFilter
  }: TableToolbarProps = $props();

  // State internal untuk mengatur buka/tutup modal filter
  let isFilterModalOpen = $state(false);

  function handleApplyFilter() {
    isFilterModalOpen = false;
    if (onApplyFilter) onApplyFilter();
  }
</script>

<div class={className}>
  <div class={searchWrapperClass}>
    <Input
      iconLeft={Search}
      placeholder={searchPlaceholder}
      bind:value={searchValue}
      class={searchInputClass}
    />
  </div>

  <div class={actionsClass}>
    
    {#if selectedCount > 0}
      {#if bulkActions}
        {@render bulkActions()}
      {:else}
        <Button
          variant="danger"
          icon={Trash2}
          class="w-full sm:w-auto animate-in fade-in zoom-in duration-200"
          onclick={onDeleteSelected}
        >
          Hapus ({selectedCount})
        </Button>
      {/if}
    {/if}

    {#if showFilter}
      <Button 
        variant="outline" 
        icon={Filter} 
        class={`relative ${filterButtonClass}`}
        onclick={() => (isFilterModalOpen = true)}
      >
        <span class={filterLabelClass}>Filter</span>
        {#if filterActive}
          <span class="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-(--color-primary) opacity-75"
            ></span>
            <span
              class="relative inline-flex rounded-full h-3 w-3 bg-(--color-primary)"
            ></span>
          </span>
        {/if}
      </Button>
    {/if}

    {#if extraActions}
      {@render extraActions()}
    {/if}
  </div>
</div>

{#if showFilter && filterContent}
  <Modal
    bind:open={isFilterModalOpen}
    title="Filter Data"
    description="Saring data yang ingin ditampilkan pada tabel."
    size="md"
  >
    <div class="py-4 space-y-4">
      {@render filterContent()}
    </div>

    {#snippet footer()}
      {#if onResetFilter}
        <Button variant="outline" class="w-full sm:w-auto" onclick={onResetFilter}>
          Reset
        </Button>
      {/if}
      <Button variant="primary" class="w-full sm:w-auto" onclick={handleApplyFilter}>
        Terapkan Filter
      </Button>
    {/snippet}
  </Modal>
{/if}