<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  let { 
    children, 
    class: className = "", 
    ...rest 
  }: HTMLAttributes<HTMLTableSectionElement> & { children?: Snippet } = $props();
</script>

<thead class={`border-b border-(--color-border) bg-gray-50/50 ${className}`} {...rest}>
  {@render children?.()}
</thead>