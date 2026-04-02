<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  // Asumsi kamu menggunakan lucide-svelte untuk icon loading bawaan
  import { Loader2 } from "lucide-svelte"; 

  interface ButtonProps extends HTMLButtonAttributes {
    children?: Snippet; 
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    icon?: any; 
    iconPosition?: "left" | "right";
    isLoading?: boolean; // 1. Tambahan prop loading
    class?: string;
  }

  let {
    children,
    variant = "primary",
    size = "md",
    icon = null,
    iconPosition = "left",
    isLoading = false, // Default false
    type = "button", 
    disabled = false,  // Tangkap disabled bawaan
    class: className = "",
    ...rest
  }: ButtonProps = $props();

  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-(--color-primary) text-white hover:bg-(--color-primary-hover)",
    secondary: "bg-(--color-primary-soft) text-(--color-primary-hover) hover:opacity-90",
    outline: "border border-(--color-border) text-(--color-text-primary) hover:bg-(--color-bg-page)",
    ghost: "text-(--color-text-primary) hover:bg-(--color-bg-page)",
    danger: "bg-(--color-danger) text-white hover:opacity-90",
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  // 2. Pemetaan ukuran ikon agar proporsional dengan tombol
  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20
  };
</script>

<button
  {type}
  disabled={disabled || isLoading} class={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
  {...rest}
>
  {#if isLoading}
    <Loader2 size={iconSizes[size]} class="animate-spin" />
  {:else if icon && iconPosition === "left"}
    {@const Icon = icon}
    <Icon size={iconSizes[size]} />
  {/if}

  {@render children?.()}

  {#if !isLoading && icon && iconPosition === "right"}
    {@const Icon = icon}
    <Icon size={iconSizes[size]} />
  {/if}
</button>