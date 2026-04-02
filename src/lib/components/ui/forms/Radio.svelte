<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  interface RadioProps extends Omit<HTMLInputAttributes, "type" | "value"> {
    label?: string;
    helper?: string;
    error?: string;
    value: any;
    group: any;
    disabled?: boolean;
    class?: string;
    id?: string;
  }

  let {
    id = `radio-${Math.random().toString(36).substring(2, 9)}`,
    label,
    helper = "",
    error = "",
    value,
    group = $bindable(),
    disabled = false,
    class: wrapperClass = "",
    ...rest
  }: RadioProps = $props();

  // Deteksi apakah radio ini sedang terpilih untuk memicu animasi titik tengahnya
  const isChecked = $derived(group === value);
</script>

<div class={`flex flex-col gap-1 ${wrapperClass}`}>
  <label class="flex items-start gap-2.5 cursor-pointer group">
    <div class="relative flex items-center h-5">
      <input
        {id}
        type="radio"
        {value}
        bind:group
        {disabled}
        class="peer absolute opacity-0 w-0 h-0"
        {...rest}
      />
      
      <div class={`
        w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200
        ${error ? "border-(--color-danger)" : "border-(--color-border)"}
        ${disabled ? "bg-gray-50 border-gray-200 cursor-not-allowed" : "bg-white group-hover:border-(--color-primary-hover)"}
        peer-checked:border-(--color-primary) peer-checked:bg-white
        peer-focus-visible:ring-2 peer-focus-visible:ring-(--color-primary-soft)
      `}>
        <div class={`
          w-2 h-2 rounded-full bg-(--color-primary) transition-transform duration-200
          ${isChecked ? "scale-100" : "scale-0"}
        `}></div>
      </div>
    </div>
    
    {#if label}
      <span class={`text-sm font-medium select-none transition-colors
        ${disabled ? "text-(--color-text-muted)" : "text-(--color-text-primary) group-hover:text-(--color-primary-hover)"}
      `}>
        {label}
      </span>
    {/if}
  </label>

  {#if error || helper}
    <div class="ml-6.5">
      {#if error}
        <p class="text-xs text-(--color-danger)">{error}</p>
      {:else if helper}
        <p class="text-xs text-(--color-text-muted)">{helper}</p>
      {/if}
    </div>
  {/if}
</div>