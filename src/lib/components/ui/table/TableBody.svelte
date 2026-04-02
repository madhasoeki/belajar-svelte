<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  let { 
    children, 
    class: className = "", 
    ...rest 
  }: HTMLAttributes<HTMLTableSectionElement> & { children?: Snippet } = $props();
</script>

<tbody class={`[&_tr:last-child]:border-0 ${className}`} {...rest}>
  {@render children?.()}
</tbody>