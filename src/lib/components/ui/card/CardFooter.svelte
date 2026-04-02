<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  let { 
    children, 
    class: className = "", 
    ...rest 
  }: HTMLAttributes<HTMLDivElement> & { children?: Snippet } = $props();
</script>

<div class={`flex items-center p-6 pt-0 border-t border-gray-100 ${className}`} {...rest}>
  {@render children?.()}
</div>