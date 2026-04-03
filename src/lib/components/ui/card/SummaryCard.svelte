<script lang="ts">
  import { Card, CardContent } from "$lib/components/ui/card";
  import { TrendingUp, TrendingDown, Activity } from 'lucide-svelte';
  
  type Variant = "default" | "primary" | "success" | "warning" | "danger";

  interface SummaryCardProps {
    label?: string;
    value?: string | number;
    icon?: any; 
    trend?: "up" | "down" | null;
    trendValue?: string;
    variant?: Variant;
    class?: string;
  }

  let {
    label = "Label",
    value = "0",
    icon: IconComponent = Activity,
    trend = null,
    trendValue = "",
    variant = "default",
    class: className = "",
  }: SummaryCardProps = $props();

  const variantStyles: Record<Variant, string> = {
    default: "bg-gray-100 text-gray-500",
    primary: "bg-(--color-primary-soft) text-(--color-primary)",
    success: "bg-green-100 text-green-600",
    warning: "bg-amber-100 text-amber-600",
    danger:  "bg-red-100 text-red-600",
  };
</script>

<Card class={`transition-all duration-200 hover:shadow-md ${className}`}>
  <CardContent class="p-4 pt-5 flex flex-col gap-3"> <div class="flex justify-between items-start gap-2">
    
    <div class="flex flex-col gap-1"> <p class="text-[11px] font-semibold uppercase tracking-wider text-(--color-text-muted)">
        {label}
      </p>
      
      <h3 class="text-xl font-bold text-(--color-text-primary) leading-none tracking-tight">
        {value}
      </h3>
    </div>

    <div class={`w-10 h-10 flex items-center justify-center rounded-lg shrink-0 ${ variantStyles[variant]}`}>
      <IconComponent size={20} strokeWidth={2} />
    </div>

  </div>

    {#if trend}
      <div class="flex items-center gap-2 mt-1">
        <span class={`flex items-center justify-center w-5 h-5 rounded-md
          ${trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}
        `}>
          {#if trend === 'up'}
            <TrendingUp size={14} strokeWidth={2.5} />
          {:else}
            <TrendingDown size={14} strokeWidth={2.5} />
          {/if}
        </span>

        <p class="text-xs font-medium text-(--color-text-muted)">
          {trendValue}
        </p>
      </div>
    {/if}

  </CardContent>
</Card>