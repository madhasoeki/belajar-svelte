<script lang="ts">
  import { X } from "lucide-svelte";
  import type { Snippet } from "svelte";

  interface AlertProps {
    children: Snippet;
    title?: string;
    variant?: "info" | "success" | "warning" | "danger" | "primary";
    icon?: any;
    dismissible?: boolean;
    class?: string;
    onclose?: () => void;
  }

  let {
    children,
    title,
    variant = "info",
    icon = null,
    dismissible = false,
    class: className = "",
    onclose,
  }: AlertProps = $props();

  // State untuk mengontrol visibilitas alert
  let isVisible = $state(true);

  function handleClose() {
    isVisible = false;
    if (onclose) onclose();
  }

  // Sinkronisasi dengan variabel tema CSS
  const variants = {
    primary: "bg-(--color-primary-soft) border-(--color-primary)/20 text-(--color-primary-hover)",
    info: "bg-(--color-info)/10 border-(--color-info)/20 text-(--color-info)",
    success: "bg-(--color-success)/10 border-(--color-success)/20 text-(--color-success)",
    warning: "bg-(--color-warning)/10 border-(--color-warning)/20 text-(--color-warning)",
    danger: "bg-(--color-danger)/10 border-(--color-danger)/20 text-(--color-danger)",
  };

  const iconColors = {
    primary: "text-(--color-primary)",
    info: "text-(--color-info)",
    success: "text-(--color-success)",
    warning: "text-(--color-warning)",
    danger: "text-(--color-danger)",
  };
</script>

{#if isVisible}
  <div 
    class={`relative flex w-full p-4 border rounded-lg transition-all duration-300 ${variants[variant]} ${className}`} 
    role="alert"
  >
    {#if icon}
      {@const Icon = icon}
      <div class={`shrink-0 mr-3 mt-0.5 ${iconColors[variant]}`}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
    {/if}

    <div class="flex-1 flex flex-col justify-center">
      {#if title}
        <h5 class="mb-1 font-semibold leading-none tracking-tight text-gray-900 dark:text-white">
          {title}
        </h5>
      {/if}
      <div class="text-sm opacity-90 text-gray-800">
        {@render children()}
      </div>
    </div>

    {#if dismissible}
      <button
        type="button"
        class="absolute top-3.5 right-3.5 p-1 rounded-md hover:bg-black/5 transition-colors focus:outline-none"
        onclick={handleClose}
        aria-label="Close alert"
      >
        <X size={16} strokeWidth={3} class="opacity-70 hover:opacity-100" />
      </button>
    {/if}
  </div>
{/if}