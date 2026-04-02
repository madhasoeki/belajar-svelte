<script lang="ts">
  import type { HTMLTextareaAttributes } from "svelte/elements";

  interface TextareaProps extends HTMLTextareaAttributes {
    label?: string;
    helper?: string;
    error?: string;
    value?: string | any;
    placeholder?: string;
    disabled?: boolean;
    resizable?: boolean; // 1. Tambahkan prop resizable
    class?: string;
    textareaClass?: string;
    id?: string;
    rows?: number;
  }

  let {
    id = `textarea-${Math.random().toString(36).substring(2, 9)}`,
    label,
    helper = "",
    error = "",
    value = $bindable(""),
    placeholder = "",
    disabled = false,
    resizable = true, // 2. Set default-nya true (biar perilaku awalnya tetap sama)
    rows = 4,
    class: wrapperClass = "",
    textareaClass = "",
    ...rest
  }: TextareaProps = $props();
</script>

<div class={`flex flex-col gap-1.5 w-full ${wrapperClass}`}>
  {#if label}
    <label for={id} class="text-sm font-medium text-(--color-text-secondary)">
      {label}
    </label>
  {/if}

  <div class="relative">
    <textarea
      {id}
      bind:value
      {placeholder}
      {disabled}
      {rows}
      class={`
        w-full px-3 py-2 text-sm bg-white border rounded-lg outline-none transition
        border-(--color-border) text-(--color-text-primary)
        focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary-soft)
        ${resizable ? "resize-y" : "resize-none"} /* 3. Logika untuk mengganti class Tailwind */
        ${error ? "border-(--color-danger)" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}
        ${textareaClass}
      `}
      {...rest}
    ></textarea>
  </div>

  {#if error}
    <p class="text-xs text-(--color-danger) mt-1">{error}</p>
  {:else if helper}
    <p class="text-xs text-(--color-text-muted) mt-1">{helper}</p>
  {/if}
</div>