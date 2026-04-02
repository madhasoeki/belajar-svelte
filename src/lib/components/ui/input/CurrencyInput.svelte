<script lang="ts">
  import Input from "./Input.svelte";
  import type { ComponentProps } from "svelte";

  interface CurrencyProps extends Omit<ComponentProps<typeof Input>, "type" | "value"> {
    value?: number | null;
    currencyPrefix?: string;
  }

  let {
    value = $bindable(null),
    currencyPrefix = "",
    oninput,
    ...rest
  }: CurrencyProps = $props();

  let displayValue = $state("");

  function formatNumber(val: string | number | null): string {
    if (val === null || val === "") return "";
    const raw = val.toString().replace(/[^0-9]/g, "");
    if (!raw) return "";
    const formatted = new Intl.NumberFormat("id-ID").format(parseInt(raw, 10));
    return currencyPrefix ? `${currencyPrefix} ${formatted}` : formatted;
  }

  $effect(() => {
    if (value !== null && value !== undefined) {
      const currentRaw = displayValue.replace(/[^0-9]/g, "");
      if (currentRaw !== value.toString()) {
        displayValue = formatNumber(value);
      }
    } else {
      displayValue = "";
    }
  });

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const rawString = target.value.replace(/[^0-9]/g, "");

    displayValue = formatNumber(rawString);
    value = rawString ? parseInt(rawString, 10) : null;

    // Paksa sinkronisasi DOM (mencegah 'ghost letter' jika ada karakter aneh lolos dari HP)
    target.value = displayValue;

    if (oninput) {
      // @ts-ignore
      oninput(e);
    }
  }

  // FUNGSI BARU: Cegah tombol huruf ditekan
  function handleKeyDown(e: KeyboardEvent) {
    // 1. Izinkan tombol kontrol standar navigasi dan hapus
    const isControlKey = [
      "Backspace", "Tab", "Delete", "ArrowLeft", "ArrowRight", "Home", "End", "Enter"
    ].includes(e.key);

    // 2. Izinkan kombinasi shortcut (Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X)
    const isShortcut = e.ctrlKey || e.metaKey;

    // 3. Cek apakah yang diketik adalah angka murni 0-9
    const isNumber = /^[0-9]$/.test(e.key);

    // Jika bukan kontrol, bukan shortcut, dan bukan angka -> BLOKIR!
    if (!isControlKey && !isShortcut && !isNumber) {
      e.preventDefault();
    }
  }
</script>

<Input 
  type="text" 
  inputmode="numeric"
  value={displayValue} 
  oninput={handleInput} 
  onkeydown={handleKeyDown}
  {...rest} 
/>