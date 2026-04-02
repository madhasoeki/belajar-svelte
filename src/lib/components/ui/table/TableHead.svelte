<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  let { 
    children, 
    class: className = "", 
    ...rest 
  }: HTMLAttributes<HTMLTableCellElement> & { children?: Snippet } = $props();
</script>

<th class={`h-12 px-4 text-left align-middle font-semibold text-(--color-text-secondary) [&:has([role=checkbox])]:pr-0 ${className}`} {...rest}>
  {@render children?.()}
</th>