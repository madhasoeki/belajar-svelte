<script lang="ts">
  import { Card, CardContent } from "$lib/components/ui/card";
  import { Activity } from 'lucide-svelte';
  
  type Variant = "default" | "primary" | "success" | "warning" | "danger";

  interface ProgressCardProps {
    label?: string;
    value?: string | number;
    icon?: any;
    progress?: number;
    progressText?: string;
    variant?: Variant;
    class?: string;
  }

  let {
    label = "Label",
    value = "0",
    icon: IconComponent = Activity,
    progress = 0,
    progressText = "",
    variant = "default",
    class: className = "",
  }: ProgressCardProps = $props();

  // Memisahkan style untuk warna latar Ikon dan warna isian Progress Bar
  const variantStyles: Record<Variant, { icon: string; fill: string }> = {
    default: { icon: "bg-gray-100 text-gray-500", fill: "bg-gray-400" },
    primary: { icon: "bg-(--color-primary-soft) text-(--color-primary)", fill: "bg-(--color-primary)" },
    success: { icon: "bg-green-100 text-green-600", fill: "bg-green-500" },
    warning: { icon: "bg-amber-100 text-amber-600", fill: "bg-amber-500" },
    danger:  { icon: "bg-red-100 text-red-600", fill: "bg-red-500" },
  };

  // Mencegah progress bar bocor atau error jika nilai kurang dari 0 atau lebih dari 100
  const safeProgress = $derived(Math.min(Math.max(progress, 0), 100));
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

    <div class={`w-10 h-10 flex items-center justify-center rounded-lg shrink-0 ${variantStyles[variant].icon}`}>
      <IconComponent size={20} strokeWidth={2} />
    </div>

  </div>

    <div class="flex flex-col gap-1.5 mt-1">
      
      <div class="flex items-center justify-between text-xs text-(--color-text-muted)">
        <span class="font-medium">{progressText}</span>
        <span class="font-bold text-(--color-text-primary)">{safeProgress}%</span>
      </div>

      <div class="h-1 w-full rounded-full bg-gray-100 overflow-hidden">
        <div 
          class={`h-full rounded-full transition-all duration-1000 ease-out ${variantStyles[variant].fill}`} 
          style={`width: ${safeProgress}%;`}
        ></div>
      </div>

    </div>

  </CardContent>
</Card>