<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children?: Snippet;
    variant?: "default" | "soft" | "success" | "warning" | "danger";
  }

  let { 
    children, 
    variant = "default", 
    class: className = "", 
    ...rest 
  }: CardProps = $props();

  const variants = {
    default: "bg-(--color-bg-card)",
    soft: "bg-(--color-primary-soft)",
    success: "bg-green-50 border-green-200",
    warning: "bg-amber-50 border-amber-200",
    danger: "bg-red-50 border-red-200"
  };
</script>

<div class={`${variants[variant]} border border-(--color-border) rounded-(--radius-card) shadow-sm ${className}`} {...rest}>
  {@render children?.()}
</div>