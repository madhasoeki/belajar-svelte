<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  let { 
    children, 
    class: className = "", 
    ...rest 
  }: HTMLAttributes<HTMLTableElement> & { children?: Snippet } = $props();
</script>

<div class="relative w-full overflow-auto rounded-lg border border-(--color-border) bg-white">
  <table class={`w-full caption-bottom text-sm text-left ${className}`} {...rest}>
    {@render children?.()}
  </table>
</div>