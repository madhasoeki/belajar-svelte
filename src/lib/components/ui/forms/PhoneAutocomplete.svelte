<script lang="ts">
  import { Phone, Loader2 } from "lucide-svelte";
  import { apiClient } from "$lib/utils/api";
  import { API_ENDPOINTS } from "$lib/constans/endpoints";

  interface AutocompleteProps {
    label?: string;
    helper?: string;
    error?: string;
    value: string; // Nomor HP yang diketik

    // [BARU] Fungsi callback untuk mengirim data lengkap ke parent (halaman input)
    onSelectDonatur: (donatur: {
      id: string;
      sapaan: string;
      nama_donatur: string;
      nomor_hp_donatur: string;
      transaksi?: Array<{
        tanggal_transaksi: string;
        program: string;
        rekening: string;
        nominal: number;
      }>;
    }) => void;

    placeholder?: string;
    disabled?: boolean;
    class?: string;
    id?: string;
  }

  let {
    id = `phone-auto-${Math.random().toString(36).substring(2, 9)}`,
    label,
    helper = "",
    error = "",
    value = $bindable(""),
    onSelectDonatur,
    placeholder = "628...",
    disabled = false,
    class: wrapperClass = "",
  }: AutocompleteProps = $props();

  let isOpen = $state(false);
  let isLoading = $state(false);
  let container: HTMLElement;
  let options = $state<
    Array<{
      id: string;
      nomor_hp_donatur: string;
      nama_donatur: string;
      sapaan: string;
    }>
  >([]);
  let selectedValue = $state("");

  // Timer untuk Debounce
  let timeoutId: ReturnType<typeof setTimeout>;

  // Memantau perubahan ketikan (Reaktivitas Svelte 5)
  $effect(() => {
    if (value === selectedValue) {
      isOpen = false;
      return;
    }

    if (disabled || value.length < 8) {
      isOpen = false;
      options = [];
      return;
    }

    // 2. Debounce Logic: Batalkan timer sebelumnya jika CS masih mengetik
    clearTimeout(timeoutId);

    // 3. Set timer baru (Tunggu 500ms setelah ketikan terakhir)
    timeoutId = setTimeout(async () => {
      isLoading = true;
      isOpen = true; // Buka dropdown untuk menampilkan loading state

      try {
        // Tembak API Go-lang milikmu
        // Asumsi struktur response Go-lang: { data: [{ id, no_hp, nama, sapaan }, ...] }
        const res = await apiClient.get(
          `${API_ENDPOINTS.DONATUR.SEARCH}?q=${value}`,
        );

        // Asumsikan data dari Golang ditaruh di dalam objek 'data'
        options = Array.isArray(res) ? res : [];

        // Jika tidak ada hasil, tutup dropdown agar tidak mengganggu
        if (options.length === 0) {
          isOpen = false;
        }
      } catch (err) {
        console.error("Gagal mencari donatur:", err);
        options = [];
        isOpen = false;
      } finally {
        isLoading = false;
      }
    }, 500); // 500 milidetik delay
  });

  function handleSelect(opt: {
    id: string;
    nomor_hp_donatur: string;
    nama_donatur: string;
    sapaan: string;
  }) {
    selectedValue = opt.nomor_hp_donatur; // [BARU] Kunci nilainya sebelum mengubah value
    value = opt.nomor_hp_donatur;
    isOpen = false;

    onSelectDonatur(opt);
  }

  function handleClickOutside(event: MouseEvent) {
    if (isOpen && container && !container.contains(event.target as Node)) {
      isOpen = false;
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

<div
  class={`flex flex-col gap-1.5 w-full ${wrapperClass}`}
  bind:this={container}
>
  {#if label}
    <label for={id} class="text-sm font-medium text-(--color-text-secondary)">
      {label}
    </label>
  {/if}

  <div class="relative">
    <Phone
      size={18}
      class="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)"
    />

    <input
      {id}
      type="tel"
      bind:value
      {placeholder}
      {disabled}
      autocomplete="off"
      class={`
        w-full pl-9 pr-10 py-2 text-sm bg-white border rounded-lg outline-none transition
        border-(--color-border) text-(--color-text-primary)
        focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary-soft)
        ${error ? "border-(--color-danger)" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}
      `}
    />

    {#if isLoading}
      <Loader2
        size={16}
        class="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-primary) animate-spin"
      />
    {/if}

    {#if isOpen && !isLoading && options.length > 0}
      <div
        class="absolute z-50 w-full mt-1 bg-white border border-(--color-border) rounded-lg shadow-lg overflow-hidden flex flex-col"
      >
        <ul class="max-h-60 overflow-y-auto p-1">
          <div
            class="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50"
          >
            Ditemukan {options.length} Donatur
          </div>

          {#each options as opt (opt.id)}
            <button
              type="button"
              onclick={() => handleSelect(opt)}
              class="w-full text-left px-3 py-2.5 text-sm rounded-md cursor-pointer transition-colors flex flex-col gap-0.5 border-0 bg-transparent hover:bg-(--color-primary-soft) group"
            >
              <span
                class="font-bold text-gray-900 group-hover:text-(--color-primary)"
              >
                {opt.sapaan}
                {opt.nama_donatur}
              </span>
              <span class="text-xs text-gray-500 font-mono">
                {opt.nomor_hp_donatur}
              </span>
            </button>
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
