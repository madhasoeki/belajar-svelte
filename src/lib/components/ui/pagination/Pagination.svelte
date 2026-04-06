<script lang="ts">
  import Button from "$lib/components/ui/button/Button.svelte";
  import Select from "$lib/components/ui/forms/Select.svelte"; // Import komponen Select
  import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-svelte";

  interface PaginationProps {
    currentPage?: number;
    pageSize?: number; // [NEW] Prop untuk jumlah data per halaman
    totalPages: number;
    totalData?: number; // [NEW] Total data keseluruhan untuk teks info
    showPageSize?: boolean; // [NEW] Opsi untuk menampilkan/menyembunyikan selector
    class?: string;
  }

  let {
    currentPage = $bindable(1),
    pageSize = $bindable(10), // [NEW] Default 10 data
    totalPages = 1,
    totalData = 0,
    showPageSize = true,
    class: className = "",
  }: PaginationProps = $props();

  const pageSizeOptions = [
    { value: 10, label: "10" },
    { value: 25, label: "25" },
    { value: 50, label: "50" },
    { value: 100, label: "100" },
  ];

  function setPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
    }
  }

  // Logika elipsis tetap sama
  const pages = $derived.by(() => {
    const items: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      if (currentPage <= 3) {
        items.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        items.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        items.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return items;
  });
</script>

<nav class={`flex flex-col sm:flex-row items-center justify-between gap-4 w-full ${className}`} aria-label="Pagination">
  
  <div class="flex items-center gap-4 order-2 sm:order-1">
    {#if totalData > 0}
      <p class="text-sm text-gray-500 whitespace-nowrap">
        Total <span class="font-medium text-gray-900">{totalData}</span> data
      </p>
    {/if}

    {#if showPageSize}
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500 whitespace-nowrap">Tampilkan</span>
        <div class="w-20">
          <Select 
            options={pageSizeOptions} 
            bind:value={pageSize} 
            class="h-9" 
          />
        </div>
      </div>
    {/if}
  </div>

  <div class="flex items-center gap-1 order-1 sm:order-2">
    <Button
      variant="ghost"
      size="sm"
      disabled={currentPage === 1}
      onclick={() => setPage(currentPage - 1)}
    >
      <ChevronLeft size={16} />
    </Button>

    <div class="flex items-center gap-1">
      {#each pages as page, i (i)}
        {#if page === '...'}
          <div class="w-8 h-8 flex items-center justify-center text-gray-400">
            <MoreHorizontal size={14} />
          </div>
        {:else}
          <Button
            variant={currentPage === page ? "primary" : "ghost"}
            class={`w-8 h-8 p-0 text-xs font-medium`}
            onclick={() => setPage(page as number)}
          >
            {page}
          </Button>
        {/if}
      {/each}
    </div>

    <Button
      variant="ghost"
      size="sm"
      disabled={currentPage === totalPages}
      onclick={() => setPage(currentPage + 1)}
    >
      <ChevronRight size={16} />
    </Button>
  </div>
</nav>