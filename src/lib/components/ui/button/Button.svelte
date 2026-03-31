<script lang="ts">
  let {
    children,
    variant = "primary",
    size = "md",
    icon = null,
    iconPosition = "left",
    class: className = "",
    ...rest
  }: {
    children?: any;
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    icon?: any;
    iconPosition?: "left" | "right";
    class?: string;
  } = $props();

  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-(--color-primary) text-white hover:bg-(--color-primary-hover)",

    secondary:
      "bg-(--color-primary-soft) text-(--color-primary-hover) hover:opacity-90",

    outline:
      "border border-(--color-border) text-(--color-text-primary) hover:bg-(--color-bg-page)",

    ghost:
      "text-(--color-text-primary) hover:bg-(--color-bg-page)",

    danger:
      "bg-(--color-danger) text-white hover:opacity-90",
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };
</script>

<button
  class={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
  {...rest}
>
  {#if icon && iconPosition === "left"}
    {@const Icon = icon}
    <Icon size={18} />
  {/if}

  {@render children?.()}

  {#if icon && iconPosition === "right"}
    {@const Icon = icon}
    <Icon size={18} />
  {/if}
</button>