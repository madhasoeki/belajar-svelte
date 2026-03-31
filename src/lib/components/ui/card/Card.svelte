<script lang="ts">
  let {
    children,
    padding = "md",
    variant = "default",
    class: className = "",
    ...rest
  }: {
    children?: any;
    padding?: "none" | "sm" | "md" | "lg";
    variant?: "default" | "soft" | "success" | "warning" | "danger";
    class?: string;
  } = $props();

  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-6",
  };

  const variants = {
  default: "bg-(--color-bg-card)",
  soft: "bg-(--color-primary-soft)",
  success: "bg-green-50 border-green-200",
  warning: "bg-amber-50 border-amber-200",
  danger: "bg-red-50 border-red-200"
}
</script>

<div
  class={`${variants[variant]} border border-(--color-border) rounded-(--radius-card) shadow-sm ${paddings[padding]} ${className}`}
  {...rest}
>
  {@render children?.()}
</div>