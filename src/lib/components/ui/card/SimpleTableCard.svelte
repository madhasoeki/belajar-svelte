<script lang="ts">
  import { Card, CardContent } from "$lib/components/ui/card";
  import Badge from "$lib/components/ui/badge/Badge.svelte";

  interface Props {
    name: string;
    phone?: string;
    program?: string;
    date?: string; // [UPDATE] Jadikan opsional
    amount: string | number;
    amountPrefix?: string; // [BARU] Agar tulisan "Rp" bisa dihilangkan
    statusLabel?: string; // [UPDATE] Jadikan opsional
    statusVariant?: "success" | "warning" | "danger" | "default" | string | any;
  }

  let {
    name,
    phone = "",
    program = "",
    date = "",
    amount,
    amountPrefix = "Rp", // Default tetap "Rp" agar halaman Transaksi tidak rusak
    statusLabel = "",
    statusVariant = "default",
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

      {#if statusLabel}
        <Badge shape="pill" variant={statusVariant}>
          {statusLabel}
        </Badge>
      {/if}
    </div>

    <div class="flex justify-between items-end mt-1">
      <div class="flex flex-col gap-0.5">
        {#if program}
          <span class="text-[13px] font-medium text-gray-700">{program}</span>
        {/if}

        {#if date}
          <span class="text-[10px] text-gray-400">{date}</span>
        {/if}
      </div>
      <div class="text-right">
        {#if amountPrefix}
          <span class="text-xs font-medium text-gray-500">{amountPrefix}</span>
        {/if}
        <span class="font-bold text-gray-900 text-sm">{amount}</span>
      </div>
    </div>
  </CardContent>
</Card>
