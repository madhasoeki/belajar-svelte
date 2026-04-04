<script lang="ts">
  import Card from "$lib/components/ui/card/Card.svelte";
  import CardContent from "$lib/components/ui/card/CardContent.svelte";
  import type { Snippet } from "svelte";

  // Struktur tipe data untuk sub-metrik di bagian bawah
  interface SubMetric {
    label: string;
    value: string | number;
    trendText?: string;
    trendUp?: boolean;
  }

  let {
    title,
    value,
    icon: Icon,
    progress = null, // Format: { targetText: "Target: Rp 200 Jt", percentage: 64.2 }
    metrics = [],
    customChart // Snippet untuk grafik khusus (Pie/Donut) di masa depan
  }: {
    title: string;
    value: string | number;
    icon: any;
    progress?: { targetText: string; percentage: number } | null;
    metrics?: SubMetric[];
    customChart?: Snippet;
  } = $props();
</script>

<Card>
  <CardContent class="p-4! flex flex-col gap-4">
    
    <div class="flex flex-col gap-3">
      <div class="flex justify-between items-start">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
          <span class="text-2xl font-bold text-gray-900">{value}</span>
        </div>
        <div class="p-2.5 bg-(--color-primary-soft) text-(--color-primary) rounded-xl shrink-0">
          <Icon size={20} />
        </div>
      </div>
      
      {#if progress}
        <div class="flex flex-col gap-1.5 w-full">
          <div class="flex justify-between text-[10px] font-semibold">
            <span class="text-gray-500">{progress.targetText}</span>
            <span class="text-(--color-primary)">{progress.percentage}%</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div class="bg-(--color-primary) h-full rounded-full transition-all duration-500" style="width: {progress.percentage}%"></div>
          </div>
        </div>
      {/if}

      {#if customChart}
        <div class="w-full pt-2">
          {@render customChart()}
        </div>
      {/if}
    </div>

    {#if metrics.length > 0}
      <div class="h-px w-full bg-gray-100"></div>

      <div class="flex divide-x divide-gray-100 w-full">
        {#each metrics as item}
          <div class="flex flex-1 flex-col items-center justify-center px-1 text-center min-w-0">
            <span class="text-[10px] font-medium text-gray-400 mb-0.5 truncate w-full">{item.label}</span>
            <span class="text-sm font-bold text-gray-800 truncate w-full">{item.value}</span>
            {#if item.trendText}
              <span class={`text-[9px] font-semibold mt-0.5 ${item.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                {item.trendText}
              </span>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

  </CardContent>
</Card>