<script lang="ts">
  import { X } from "lucide-svelte";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    children: Snippet;
    variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "outline";
    size?: "sm" | "md" | "lg";
    shape?: "square" | "pill";
    iconLeft?: any;
    iconRight?: any;
    dismissable?: boolean;
    ondismiss?: () => void;
    class?: string;
  }

  let {
    children,
    variant = "secondary",
    size = "sm",
    shape = "square",
    iconLeft = null,
    iconRight = null,
    dismissable = false,
    ondismiss,
    class: className = "",
    ...rest
  }: BadgeProps = $props();

  const base = "inline-flex items-center justify-center font-semibold transition-all whitespace-nowrap border border-transparent";

  // MENGGUNAKAN VARIABEL TEMA
  const variants = {
    primary: "bg-(--color-primary) text-white",
    secondary: "bg-(--color-primary-soft) text-(--color-primary-hover)",
    // Kita gunakan utilitas Tailwind untuk transparansi agar sinkron dengan variabel status
    success: "bg-(--color-success)/10 text-(--color-success) border-(--color-success)/20",
    warning: "bg-(--color-warning)/10 text-(--color-warning) border-(--color-warning)/20",
    danger: "bg-(--color-danger)/10 text-(--color-danger) border-(--color-danger)/20",
    info: "bg-(--color-info)/10 text-(--color-info) border-(--color-info)/20",
    outline: "border-(--color-border) text-(--color-text-secondary) bg-white",
  };

  const sizes = {
    sm: "text-[10px] px-1.5 py-0.5 gap-1 uppercase tracking-wider",
    md: "text-[11px] px-2 py-0.5 gap-1.5",
    lg: "text-xs px-2.5 py-1 gap-2",
  };

  const shapes = {
    square: "rounded-[4px]", // Menyesuaikan dengan --radius-card yang 5px agar senada
    pill: "rounded-full",
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  };
</script>

<span 
  class="{base} {variants[variant]} {sizes[size]} {shapes[shape]} {className}" 
  {...rest}
>
  {#if iconLeft}
    {@const Icon = iconLeft}
    <Icon size={iconSizes[size]} strokeWidth={2.5} />
  {/if}

  {@render children()}

  {#if iconRight && !dismissable}
    {@const Icon = iconRight}
    <Icon size={iconSizes[size]} strokeWidth={2.5} />
  {/if}

  {#if dismissable}
    <button
      type="button"
      class="ml-0.5 hover:bg-black/5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center justify-center"
      aria-label="Remove badge"
      onclick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        ondismiss?.();
      }}
    >
      <X size={iconSizes[size]} strokeWidth={3} />
    </button>
  {/if}
</span>