<script lang="ts">
  let {
    children,
    class: className = "",
    ...rest
  } = $props();
</script>

<div
  class={`bg-white border border-(--color-border) rounded-xl shadow-sm p-3 ${className}`}
  {...rest}
>
  {@render children?.()}
</div>