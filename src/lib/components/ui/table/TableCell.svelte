<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  let { 
    children, 
    class: className = "", 
    ...rest 
  }: HTMLAttributes<HTMLTableCellElement> & { children?: Snippet } = $props();
</script>

<td class={`p-4 align-middle [&:has([role=checkbox])]:pr-0 text-(--color-text-primary) ${className}`} {...rest}>
  {@render children?.()}
</td>