<script lang="ts">
  import { Check } from "lucide-svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  interface CheckboxProps extends Omit<HTMLInputAttributes, "type"> {
    label?: string;
    helper?: string;
    error?: string;
    checked?: boolean;
    disabled?: boolean;
    class?: string;
    id?: string;
  }

  let {
    id = `checkbox-${Math.random().toString(36).substring(2, 9)}`,
    label,
    helper = "",
    error = "",
    checked = $bindable(false),
    disabled = false,
    class: wrapperClass = "",
    ...rest
  }: CheckboxProps = $props();
</script>

<div class={`flex flex-col gap-1 ${wrapperClass}`}>
  <label class="flex items-start gap-2.5 cursor-pointer group">
    <div class="relative flex items-center h-5">
      <input
        {id}
        type="checkbox"
        bind:checked
        {disabled}
        class="peer absolute opacity-0 w-0 h-0"
        {...rest}
      />
      
      <div class={`
        w-4 h-4 rounded border flex items-center justify-center transition-all duration-200
        ${error ? "border-(--color-danger)" : "border-(--color-border)"}
        ${disabled ? "bg-gray-50 border-gray-200 cursor-not-allowed" : "bg-white group-hover:border-(--color-primary-hover)"}
        peer-checked:bg-(--color-primary) peer-checked:border-(--color-primary)
        peer-focus-visible:ring-2 peer-focus-visible:ring-(--color-primary-soft)
      `}>
        <Check 
          size={12} 
          strokeWidth={3} 
          class={`text-white transition-transform duration-200 ${checked ? "scale-100" : "scale-0"}`} 
        />
      </div>
    </div>
    
    {#if label}
      <span class={`text-sm font-medium pt-0.5 select-none transition-colors
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