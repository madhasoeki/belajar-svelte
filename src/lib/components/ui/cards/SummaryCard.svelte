<script lang="ts">
  import type { Component } from 'svelte';
  import { TrendingUp, TrendingDown, Activity } from 'lucide-svelte';
  
  type Variant = "default" | "primary" | "success" | "warning" | "danger";

  let {
    label = "Label",
    value = "0",
    icon: IconComponent = Activity,
    trend = null,
    trendValue = "",
    variant = "default",
  }: {
    label?: string;
    value?: string;
    icon?: typeof Activity; // Gunakan typeof Activity agar sesuai dengan tipe komponen Svelte yang diimport
    trend?: "up" | "down" | null;
    trendValue?: string;
    variant?: Variant;
  } = $props();

  const variantStyles: Record<Variant, { iconBg: string; iconColor: string }> = {
    default: { iconBg: "bg-gray-100", iconColor: "text-gray-500" },
    primary: { iconBg: "bg-[var(--color-primary-soft)]", iconColor: "text-[var(--color-primary)]" },
    success: { iconBg: "bg-green-100", iconColor: "text-green-600" },
    warning: { iconBg: "bg-amber-100", iconColor: "text-amber-600" },
    danger:  { iconBg: "bg-red-100", iconColor: "text-red-600" },
  };

  const s = $derived(variantStyles[variant]);
</script>

<div class="bg-white border border-(--color-border) rounded-md shadow-sm p-4 flex flex-col gap-4">

  <div class="flex justify-between items-start">
    
    <div class="flex flex-col gap-1">
      <p class="text-xs font-semibold uppercase tracking-widest text-(--color-text-muted)">
        {label}
      </p>
      
      <p class="text-xl font-bold text-(--color-text-primary) leading-none mt-1">
        {value}
      </p>
    </div>

    <div class="w-10 h-10 flex items-center justify-center rounded-lg {s.iconBg} {s.iconColor} shrink-0">
        <IconComponent size={20} />
    </div>

  </div>

  {#if trend}
    <div class="flex items-center gap-1.5">
      {#if trend === 'up'}
        <TrendingUp size={14} class="text-green-500" />
      {:else}
        <TrendingDown size={14} class="text-red-500" />
      {/if}

      <p class="text-xs text-(--color-text-muted)">
        {trendValue}
      </p>
    </div>
  {/if}

</div>