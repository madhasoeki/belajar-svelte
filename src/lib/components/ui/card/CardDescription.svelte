<script lang="ts">
  let {
    children,
    class: className = "",
    ...rest
  } = $props();
</script>

<p class={`text-sm text-gray-500 ${className}`}
  {...rest}
>
  {@render children?.()}
</p>