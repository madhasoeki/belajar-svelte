<script lang="ts">
  import { Activity } from 'lucide-svelte';
  
  type Variant = "default" | "primary" | "success" | "warning" | "danger";

  let {
    label = "Label",
    value = "0",
    icon: IconComponent = Activity,
    progress = 0,
    progressText = "",
    variant = "default",
  }: {
    label?: string;
    value?: string;
    icon?: typeof Activity;
    progress?: number;
    progressText?: string;
    variant?: Variant;
  } = $props();

  const variantStyles: Record<Variant, { iconBg: string; iconColor: string; fill: string }> = {
    default: { iconBg: "bg-gray-100", iconColor: "text-gray-500", fill: "bg-gray-400" },
    primary: { iconBg: "bg-[var(--color-primary-soft)]", iconColor: "text-[var(--color-primary)]", fill: "bg-[var(--color-primary)]" },
    success: { iconBg: "bg-green-100", iconColor: "text-green-600", fill: "bg-green-500" },
    warning: { iconBg: "bg-amber-100", iconColor: "text-amber-600", fill: "bg-amber-500" },
    danger:  { iconBg: "bg-red-100", iconColor: "text-red-600", fill: "bg-red-500" },
  };

  const s = $derived(variantStyles[variant]);

  const safeProgress = $derived(Math.min(Math.max(progress, 0), 100));
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

  <div class="flex flex-col gap-1.5">

    <div class="flex items-center justify-between text-[11px] text-(--color-text-muted)">
      <span>{progressText}</span>
      <span class="font-semibold">{safeProgress}%</span>
    </div>

    <div class="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
      <div 
        class="h-full rounded-full transition-all duration-500 ease-out {s.fill}" 
        style="width: {safeProgress}%;">
      </div>
    </div>

  </div>

</div>