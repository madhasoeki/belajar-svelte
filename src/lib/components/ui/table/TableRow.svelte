<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  let { 
    children, 
    class: className = "", 
    ...rest 
  }: HTMLAttributes<HTMLTableRowElement> & { children?: Snippet } = $props();
</script>

<tr class={`border-b border-(--color-border) transition-colors hover:bg-gray-50/80 data-[state=selected]:bg-gray-50 ${className}`} {...rest}>
  {@render children?.()}
</tr>