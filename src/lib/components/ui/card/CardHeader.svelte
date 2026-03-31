<script lang="ts">
  let {
    children,
    class: className = "",
    ...rest
  } = $props();
</script>

<div
  class={`p-3 ${className}`}
  {...rest}
>
  {@render children?.()}
</div>