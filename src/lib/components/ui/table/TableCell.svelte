<script lang="ts">
  // [UPDATE] Gunakan HTMLTdAttributes alih-alih HTMLAttributes biasa
  import type { HTMLTdAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";

  // Pastikan interface meng-extend HTMLTdAttributes
  interface TableCellProps extends HTMLTdAttributes {
    children: Snippet;
    class?: string;
  }

  let { 
    children, 
    class: className = "", 
    ...rest // Sisa atribut standar HTML (termasuk colspan) akan masuk ke sini
  }: TableCellProps = $props();
</script>

<td class={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`} {...rest}>
  {@render children()}
</td>