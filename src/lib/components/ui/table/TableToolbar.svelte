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
    // Snippets untuk komposisi dinamis
    filterContent?: Snippet;
    bulkActions?: Snippet;
    extraActions?: Snippet;
    // Handler bawaan
    onDeleteSelected?: () => void;
    onApplyFilter?: () => void;
  }

  let {
    searchValue = $bindable(""),
    searchPlaceholder = "Cari data...",
    selectedCount = 0,
    showFilter = true,
    filterContent,
    bulkActions,
    extraActions,
    onDeleteSelected,
    onApplyFilter
  }: TableToolbarProps = $props();

  // State internal untuk mengatur buka/tutup modal filter
  let isFilterModalOpen = $state(false);

  function handleApplyFilter() {
    isFilterModalOpen = false;
    if (onApplyFilter) onApplyFilter();
  }
</script>

<div class="flex flex-col sm:flex-row items-center justify-between gap-4">
  <div class="w-full sm:w-72">
    <Input
      iconLeft={Search}
      placeholder={searchPlaceholder}
      bind:value={searchValue}
    />
  </div>

  <div class="flex items-center gap-2 w-full sm:w-auto">
    
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
        onclick={() => (isFilterModalOpen = true)}
      >
        Filter
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
      <Button variant="ghost" class="w-full sm:w-auto" onclick={() => (isFilterModalOpen = false)}>
        Batal
      </Button>
      <Button variant="primary" class="w-full sm:w-auto" onclick={handleApplyFilter}>
        Terapkan Filter
      </Button>
    {/snippet}
  </Modal>
{/if}