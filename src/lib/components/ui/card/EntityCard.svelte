<script lang="ts">
  import type { Snippet } from "svelte";
  import Badge from "$lib/components/ui/badge/Badge.svelte";
  import ToggleSwitch from "$lib/components/ui/forms/ToggleSwitch.svelte";

  // Struktur metrik opsional (kotak abu-abu)
  interface Metric {
    label: string;
    value: string | number;
    icon?: any;
  }

  interface Props {
    title: string;
    subtitle?: string;
    titleIcon?: any;
    metrics?: Metric[];
    statusLabel?: string;
    statusVariant?: "success" | "warning" | "danger" | "primary" | "secondary" | "info" | "outline";
    hasToggle?: boolean;
    isToggling?: boolean;
    onToggle?: (checked: boolean) => void;
    actions?: Snippet;
  }

  let {
    title,
    subtitle,
    titleIcon: TitleIcon,
    metrics = [],
    statusLabel,
    statusVariant = "secondary",
    hasToggle = false,
    isToggling = false,
    onToggle,
    actions
  }: Props = $props();
</script>

<div class="bg-white border border-gray-100 p-4 rounded-xl shadow-sm flex flex-col gap-3">
  
  <div class="flex justify-between items-start gap-3">
    <div class="flex gap-3 items-start overflow-hidden">
      {#if TitleIcon}
        <div class="mt-0.5 p-2 bg-gray-50 rounded-lg text-gray-500 shrink-0">
          <TitleIcon size={18} />
        </div>
      {/if}
      <div class="flex flex-col min-w-0 mt-0.5">
        <span class="font-bold text-[14px] text-gray-900 truncate leading-tight">{title}</span>
        {#if subtitle}
          <span class="text-xs text-gray-500 truncate mt-1">{subtitle}</span>
        {/if}
      </div>
    </div>
    
    {#if actions}
      <div class="shrink-0 -mt-1 -mr-1">
        {@render actions()}
      </div>
    {/if}
  </div>

  {#if metrics.length > 0}
    <div class={`bg-gray-50 p-2.5 rounded-lg grid gap-2 mt-1 ${metrics.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {#each metrics as metric}
        <div class="flex flex-col gap-0.5">
          <span class="text-[10px] text-gray-400 font-medium flex items-center gap-1">
            {#if metric.icon}
              {@const Icon = metric.icon}
              <Icon size={10} />
            {/if}
            {metric.label}
          </span>
          <span class="text-xs font-semibold text-gray-800">{metric.value}</span>
        </div>
      {/each}
    </div>
  {/if}

  {#if statusLabel || hasToggle}
    <div class="flex items-center justify-between pt-2 border-t border-gray-50">
      <span class="text-[10px] text-gray-400 font-medium">Status Operasional</span>
      <div class="flex items-center gap-2">
        {#if hasToggle && onToggle}
          <ToggleSwitch
            size="sm"
            checked={statusLabel?.toLowerCase() === 'aktif'}
            isLoading={isToggling}
            onchange={onToggle}
          />
          <span class={`text-[11px] font-semibold uppercase tracking-wide ${statusLabel?.toLowerCase() === 'aktif' ? 'text-emerald-600' : 'text-gray-400'}`}>
            {statusLabel || "Tidak Aktif"}
          </span>
        {:else if statusLabel}
          <Badge variant={statusVariant} size="sm" class="text-[10px] uppercase tracking-wider py-0.5">
            {statusLabel}
          </Badge>
        {/if}
      </div>
    </div>
  {/if}

</div>