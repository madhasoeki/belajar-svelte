<script lang="ts">
  import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-svelte";
  import { fly } from "svelte/transition";
  import { toastStore, type ToastItem } from "$lib/stores/toast.svelte";

  let { item }: { item: ToastItem } = $props();

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
    primary: Info
  };

  const variants = {
    primary: "bg-white border-(--color-primary)/20 text-(--color-primary-hover) shadow-lg shadow-(--color-primary)/5",
    success: "bg-white border-(--color-success)/20 text-(--color-success) shadow-lg shadow-(--color-success)/5",
    error: "bg-white border-(--color-danger)/20 text-(--color-danger) shadow-lg shadow-(--color-danger)/5",
    warning: "bg-white border-(--color-warning)/20 text-(--color-warning) shadow-lg shadow-(--color-warning)/5",
    info: "bg-white border-(--color-info)/20 text-(--color-info) shadow-lg shadow-(--color-info)/5",
  };

  const Icon = $derived(icons[item.type]);
</script>

<div
  in:fly={{ x: 20, duration: 300 }}
  out:fly={{ x: 20, duration: 200 }}
  class={`flex w-80 p-4 border rounded-lg pointer-events-auto group ${variants[item.type]}`}
>
  <div class="shrink-0 mr-3 mt-0.5">
    <Icon size={18} strokeWidth={2.5} />
  </div>
  
  <div class="flex-1">
    {#if item.title}
      <h5 class="text-sm font-bold text-gray-900 leading-tight mb-1">{item.title}</h5>
    {/if}
    <p class="text-xs text-gray-600 leading-relaxed">{item.message}</p>
  </div>

  <button 
    onclick={() => toastStore.remove(item.id)}
    class="ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
  >
    <X size={14} class="text-gray-400 hover:text-gray-600" />
  </button>
</div>