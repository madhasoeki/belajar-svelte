<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { LoaderCircle } from "lucide-svelte"; 

  interface ButtonProps extends HTMLButtonAttributes {
    children?: Snippet; 
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    icon?: any; 
    iconPosition?: "left" | "right";
    isLoading?: boolean;
    badge?: boolean | number | string; 
    class?: string;
  }

  let {
    children,
    variant = "primary",
    size = "md",
    icon = null,
    iconPosition = "left",
    isLoading = false,
    badge, 
    type = "button", 
    disabled = false,
    class: className = "",
    ...rest
  }: ButtonProps = $props();

  const base =
    "relative inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none";

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

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20
  };
</script>

<button
  {type}
  disabled={disabled || isLoading} 
  class={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
  {...rest}
>
  {#if isLoading}
    <LoaderCircle size={iconSizes[size]} class="animate-spin" />
  {:else if icon && iconPosition === "left"}
    {@const Icon = icon}
    <Icon size={iconSizes[size]} />
  {/if}

  {@render children?.()}

  {#if !isLoading && icon && iconPosition === "right"}
    {@const Icon = icon}
    <Icon size={iconSizes[size]} />
  {/if}

  {#if badge}
    <span class={`absolute -top-1.5 -right-1.5 flex items-center justify-center font-bold text-white bg-red-500 border-2 border-white rounded-full 
      ${typeof badge === 'boolean' ? 'w-3 h-3' : 'px-1 min-w-5 h-5 text-[10px]'}`}
    >
      {typeof badge === 'boolean' ? '' : badge}
    </span>
  {/if}
</button>