<script lang="ts">
  let {
    children,
    class: className = "",
    ...rest
  } = $props();
</script>

<div class={`px-6 py-4 ${className}`}
  {...rest}
>
  {@render children?.()}
</div>