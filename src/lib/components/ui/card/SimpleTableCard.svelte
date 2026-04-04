<script lang="ts">
  import { Card, CardContent } from "$lib/components/ui/card";
  import Badge from "$lib/components/ui/badge/Badge.svelte"; 

  interface Props {
    name: string;
    phone?: string;
    program: string;
    date: string;
    amount: string | number;
    statusLabel: string;
    statusVariant?: "success" | "warning" | "danger" | "default" | string | any;
  }

  let {
    name,
    phone = "",
    program,
    date,
    amount,
    statusLabel,
    statusVariant = "default"
  }: Props = $props();
</script>

<Card>
  <CardContent class="pt-3 pb-3 px-3">
    <div class="flex justify-between items-start gap-2">
      <div class="flex flex-wrap items-baseline gap-x-1.5">
        <span class="font-bold text-[13px] text-gray-900">{name}</span>
        {#if phone}
          <span class="text-xs text-gray-400">({phone})</span>
        {/if}
      </div>
      <Badge shape="pill" variant={statusVariant}>
        {statusLabel}
      </Badge>
    </div>
    
    <div class="flex justify-between items-center">
      <div class="flex flex-col gap-0.5">
        <span class="text-[13px] font-medium text-gray-700">{program}</span>
        <span class="text-[10px] text-gray-400">{date}</span>
      </div>
      <div class="text-right">
        <span class="text-xs font-medium text-gray-500">Rp</span>
        <span class="font-bold text-gray-900 text-sm">{amount}</span>
      </div>
    </div>
  </CardContent>
</Card>