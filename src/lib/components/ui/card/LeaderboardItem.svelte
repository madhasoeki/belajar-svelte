<script lang="ts">
  import { Crown } from "lucide-svelte";
  import Card from "$lib/components/ui/card/Card.svelte";
  import CardContent from "$lib/components/ui/card/CardContent.svelte";

  let {
    rank,
    name,
    subtitle,
    amount,
    progress
  }: {
    rank: number;
    name: string;
    subtitle: string;
    amount: string | number;
    progress: number;
  } = $props();

  const rankStyles = [
    { badge: "bg-amber-100 text-amber-700 border-amber-200", row: "bg-emerald-50/40 border-emerald-100", bar: "bg-gradient-to-r from-emerald-500 to-green-400" },
    { badge: "bg-slate-100 text-slate-700 border-slate-200", row: "bg-white border-gray-200", bar: "bg-gradient-to-r from-slate-500 to-slate-400" },
    { badge: "bg-orange-100 text-orange-700 border-orange-200", row: "bg-white border-gray-200", bar: "bg-gradient-to-r from-amber-500 to-orange-400" },
    { badge: "bg-gray-100 text-gray-600 border-gray-200", row: "bg-white border-gray-200", bar: "bg-gradient-to-r from-gray-400 to-gray-300" }
  ];

  const currentStyle = $derived(rankStyles[rank - 1] ?? rankStyles[rankStyles.length - 1]);
</script>

<Card class={`transition-colors shadow-none ${currentStyle.row}`}>
  <CardContent class="p-3!">
    <div class="flex items-center gap-3">
      <div class={`h-9 w-9 rounded-full border flex items-center justify-center shrink-0 ${currentStyle.badge}`}>
        {#if rank === 1}
          <Crown size={18} />
        {:else}
          <span class="text-xs font-bold">{rank}</span>
        {/if}
      </div>
      
      <div class="flex-1 min-w-0">
        <p class="truncate text-sm font-semibold text-gray-900">{name}</p>
        <div class="mt-0.5 flex items-center gap-2 text-[11px] text-gray-500">
          <span>{subtitle}</span>
        </div>
      </div>
      
      <div class="shrink-0 text-right">
        <p class="text-sm font-bold text-gray-900">{amount}</p>
      </div>
    </div>
    
    <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
      <div class={`h-full rounded-full transition-all duration-1000 ${currentStyle.bar}`} style={`width: ${progress}%`}></div>
    </div>
  </CardContent>
</Card>