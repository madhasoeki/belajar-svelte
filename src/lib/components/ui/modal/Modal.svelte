<script lang="ts">
  import { X } from "lucide-svelte";
  import type { Snippet } from "svelte";
  import { fade, fly } from "svelte/transition";
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
  } from "$lib/components/ui/card";

  interface ModalProps {
    open?: boolean;
    title?: string;
    description?: string;
    size?: "sm" | "md" | "lg" | "xl";
    preventClose?: boolean;
    children: Snippet;
    footer?: Snippet;
  }

  let {
    open = $bindable(false),
    title,
    description,
    size = "md",
    preventClose = false,
    children,
    footer,
  }: ModalProps = $props();

  function close() {
    if (!preventClose) open = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && open) close();
  }

  $effect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  });

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="fixed inset-0 z-999 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
    in:fade={{ duration: 200 }}
    out:fade={{ duration: 150 }}
  >
    <div class="absolute inset-0" onclick={close} aria-hidden="true"></div>

    <div
      class={`relative w-full ${sizes[size]} bg-(--color-bg-card) rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden`}
      in:fly={{ y: 20, duration: 300, delay: 50 }}
      out:fly={{ y: 10, duration: 200 }}
    >
      {#if !preventClose}
        <button
          type="button"
          class="absolute top-5 right-5 z-50 text-(--color-text-muted) hover:bg-gray-100 hover:text-(--color-text-primary) transition-colors p-1.5 rounded-lg focus:outline-none"
          onclick={close}
          aria-label="Close modal"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      {/if}

      <Card class="contents" role="dialog" aria-modal="true">
        
        {#if title || description}
          <CardHeader class="border-b border-(--color-border)">
            <div class="pr-10"> {#if title}
                <CardTitle>{title}</CardTitle>
              {/if}
              {#if description}
                <CardDescription>{description}</CardDescription>
              {/if}
            </div>
          </CardHeader>
        {/if}

        <CardContent class="overflow-y-auto custom-scrollbar flex-1">
          <div class={title || description ? "pt-6" : "pt-8"}>
            {@render children()}
          </div>
        </CardContent>

        {#if footer}
          <CardFooter class="bg-gray-50/50 rounded-b-xl flex-col">
            <div class="flex items-center justify-end w-full pt-6 gap-3">
              {@render footer()}
            </div>
          </CardFooter>
        {/if}
      </Card>
    </div>
  </div>
{/if}

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 10px;
  }
</style>