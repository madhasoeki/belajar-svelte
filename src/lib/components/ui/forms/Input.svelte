<script lang="ts">
  import { Eye, EyeOff, X } from "lucide-svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  interface InputProps extends HTMLInputAttributes {
    label?: string;
    helper?: string;
    error?: string;
    type?: "text" | "password" | "email" | "number" | string;
    value?: string | number | null | any;
    placeholder?: string;
    disabled?: boolean;
    iconLeft?: any;
    iconRight?: any;
    class?: string;
    inputClass?: string;
    hideSpinButtons?: boolean;
    id?: string;
    clearable?: boolean;
  }

  let {
    id = `input-${Math.random().toString(36).substring(2, 9)}`,
    label,
    helper = "",
    error = "",
    type = "text",
    value = $bindable(""), // Perubahan krusial untuk Svelte 5
    placeholder = "",
    disabled = false,
    iconLeft = null,
    iconRight = null,
    hideSpinButtons = false,
    clearable = false,

    class: wrapperClass = "",
    inputClass = "",

    ...rest
  }: InputProps = $props();

  let showPassword = $state(false);

  const isPassword = $derived(type === "password");
  const inputType = $derived(
    isPassword ? (showPassword ? "text" : "password") : type,
  );

  function handleClear() {
    value = "";
  }
</script>

<div class={`flex flex-col gap-1.5 w-full ${wrapperClass}`}>
  {#if label}
    <label for={id} class="text-sm font-medium text-(--color-text-secondary)">
      {label}
    </label>
  {/if}

  <div class="relative">
    {#if iconLeft}
      {@const Icon = iconLeft}
      <Icon
        size={18}
        class="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)"
      />
    {/if}

    <input
      {id}
      type={inputType}
      bind:value
      {placeholder}
      {disabled}
      class={`
        w-full px-3 py-2 text-sm bg-white border rounded-lg outline-none transition
        border-(--color-border) text-(--color-text-primary)
        focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary-soft)
        ${iconLeft ? "pl-9" : ""}
        /* Beri padding kanan jika ada iconRight, password toggle, ATAU tombol clear */
        ${iconRight || isPassword || (clearable && value) ? "pr-9" : ""}
        ${error ? "border-(--color-danger)" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}
        
        ${type === "number" && hideSpinButtons ? "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" : ""}
        
        ${inputClass}
      `}
      {...rest}
    />

    {#if clearable && value && !disabled}
      <button
        type="button"
        onclick={handleClear}
        class="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-muted) hover:text-red-500 p-0.5 hover:bg-gray-100 rounded-md transition-colors focus:outline-none"
      >
        <X size={16} strokeWidth={2.5} />
      </button>

    {:else if iconRight && !isPassword}
      {@const Icon = iconRight}
      <Icon
        size={18}
        class="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)"
      />
    {/if}

    {#if isPassword}
      <button
        type="button"
        onclick={() => (showPassword = !showPassword)}
        class="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors focus:outline-none"
      >
        {#if showPassword}
          <EyeOff size={18} />
        {:else}
          <Eye size={18} />
        {/if}
      </button>
    {/if}
  </div>

  {#if error}
    <p class="text-xs text-(--color-danger) mt-1">{error}</p>
  {:else if helper}
    <p class="text-xs text-(--color-text-muted) mt-1">{helper}</p>
  {/if}
</div>
