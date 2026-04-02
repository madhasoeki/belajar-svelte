<script lang="ts">
  import type { Snippet } from "svelte";

  interface DropdownItemProps {
    children: Snippet;
    icon?: any;
    variant?: "default" | "danger";
    onclick?: () => void;
    class?: string;
  }

  let { 
    children, 
    icon = null, 
    variant = "default", 
    onclick, 
    class: className = "" 
  }: DropdownItemProps = $props();

  const variants = {
    default: "text-(--color-text-primary) hover:bg-gray-50",
    danger: "text-(--color-danger) hover:bg-red-50",
  };
</script>

<button
  type="button"
  class={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors ${variants[variant]} ${className}`}
  onclick={(e) => {
    e.stopPropagation();
    onclick?.();
  }}
>
  {#if icon}
    {@const Icon = icon}
    <Icon size={16} strokeWidth={2} />
    <span class="flex-1 min-w-0 text-left">
      {@render children()}
    </span>
  {:else}
    {@render children()}
  {/if}
</button>