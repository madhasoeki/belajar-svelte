<script lang="ts">
  import { Card, CardContent } from "$lib/components/ui/card";
  import Badge from "$lib/components/ui/badge/Badge.svelte";
  
  // [UPDATE 1] Import tipe Snippet dari svelte
  import type { Snippet } from "svelte";

  interface Props {
    name: string;
    phone?: string;
    program?: string;
    date?: string; 
    amount: string | number;
    amountPrefix?: string; 
    statusLabel?: string; 
    statusVariant?: "success" | "warning" | "danger" | "default" | string | any;
    
    // [UPDATE 2] Daftarkan actions sebagai Snippet (opsional)
    actions?: Snippet;
    onclick?: () => void;
  }

  let {
    name,
    phone = "",
    program = "",
    date = "",
    amount,
    amountPrefix = "Rp", 
    statusLabel = "",
    statusVariant = "default",
    
    // [UPDATE 3] Ekstrak actions dari $props()
    actions,
    onclick,
  }: Props = $props();

  const isClickable = $derived(typeof onclick === "function");
</script>

<Card
  class={isClickable
    ? "cursor-pointer transition-transform active:scale-[0.99]"
    : ""}
  onclick={onclick}
  role={isClickable ? "button" : undefined}
  tabindex={isClickable ? 0 : undefined}
  onkeydown={(e) => {
    if (!isClickable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onclick?.();
    }
  }}
>
  <CardContent class="pt-3 pb-3 px-3">
    <div class="flex justify-between items-start gap-2">
      <div class="flex flex-wrap items-baseline gap-x-1.5">
        <span class="font-bold text-[13px] text-gray-900">{name}</span>
        {#if phone}
          <span class="text-xs text-gray-400">({phone})</span>
        {/if}
      </div>

      <div class="flex items-center gap-1.5">
        {#if statusLabel}
          <Badge shape="pill" variant={statusVariant}>
            {statusLabel}
          </Badge>
        {/if}
        
        {#if actions}
          <div class="-mr-1">
            {@render actions()}
          </div>
        {/if}
      </div>
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