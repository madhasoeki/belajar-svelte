<script lang="ts">
  let {
    children,
    class: className = "",
    ...rest
  } = $props();
</script>

<div class={`p-3 pb-1 border-t border-gray-100 ${className}`}
  {...rest}
>
  {@render children?.()}
</div>