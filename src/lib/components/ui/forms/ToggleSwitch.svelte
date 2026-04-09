<script lang="ts">
  import { LoaderCircle } from "lucide-svelte";

  interface Props {
    checked?: boolean;
    disabled?: boolean;
    isLoading?: boolean;
    onchange?: (checked: boolean) => void;
    size?: "sm" | "md";
    class?: string;
  }

  let {
    checked = false,
    disabled = false,
    isLoading = false,
    onchange,
    size = "md",
    class: className = "",
  }: Props = $props();

  function handleClick() {
    if (disabled || isLoading) return;
    if (onchange) onchange(!checked);
  }
</script>

<button
  type="button"
  role="switch"
  aria-checked={checked}
  {disabled}
  onclick={handleClick}
  class={`
    relative inline-flex shrink-0 cursor-pointer items-center rounded-full
    transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-(--color-primary-soft) focus:ring-offset-2
    ${checked ? "bg-emerald-500" : "bg-gray-300"}
    ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}
    ${size === "sm" ? "h-5 w-9" : "h-6 w-11"}
    ${className}
  `}
>
  <span class="sr-only">Toggle status</span>
  <span
    class={`
      pointer-events-none rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center
      ${size === "sm" ? "h-4 w-4" : "h-5 w-5"}
      ${checked ? (size === "sm" ? "translate-x-4" : "translate-x-5") : "translate-x-1"}
    `}
  >
    {#if isLoading}
      <LoaderCircle size={size === "sm" ? 12 : 14} class="animate-spin text-gray-400" />
    {/if}
  </span>
</button>