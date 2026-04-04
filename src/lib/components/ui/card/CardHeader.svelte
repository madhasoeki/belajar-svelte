<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import CardTitle from "./CardTitle.svelte";
  import CardDescription from "./CardDescription.svelte";
  // [BARU] Import komponen Badge milikmu
  import Badge from "$lib/components/ui/badge/Badge.svelte";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    children?: Snippet;
    title?: string;
    description?: string;
    badge?: string | number;
    icon?: any;
    iconColor?: string;
    action?: Snippet;
  }

  let { 
    children, 
    title,
    description,
    badge,
    icon: Icon,
    iconColor = "text-(--color-primary)",
    action,
    class: className = "", 
    ...rest 
  }: Props = $props();
</script>

<div class={`p-6 ${className}`} {...rest}>
  
  {#if title || description || badge || action || Icon}
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        {#if title}
        <CardTitle class="flex items-center gap-2">
          {#if Icon}
            <Icon size={18} class={iconColor} />
          {/if}
            {title}
          </CardTitle>
        {/if}
        {#if description}
          <CardDescription class="mt-0.5 text-xs">{description}</CardDescription>
        {/if}
      </div>
      
      {#if badge || action}
        <div class="shrink-0 flex items-center gap-3">
          
          {#if badge}
            <Badge variant="secondary" shape="pill" size="md">
              {badge}
            </Badge>
          {/if}
          
          {#if action}
            {@render action()}
          {/if}
          
        </div>
      {/if}
    </div>
  {/if}

  {@render children?.()}
</div>