<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  let { 
    children, 
    class: className = "", 
    ...rest 
  }: HTMLAttributes<HTMLHeadingElement> & { children?: Snippet } = $props();
</script>

<h3 class={`text-lg font-semibold text-gray-800 leading-none tracking-tight ${className}`} {...rest}>
  {@render children?.()}
</h3>