<script lang="ts">
  let {
    children,
    class: className = "",
    ...rest
  } = $props();
</script>

<h3 class={`text-lg font-semibold text-gray-800 ${className}`}
  {...rest}>
  {@render children?.()}
</h3>