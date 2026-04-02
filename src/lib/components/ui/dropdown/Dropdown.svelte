<script lang="ts">
  import type { Snippet } from "svelte";
  import { fade, fly } from "svelte/transition";

  interface DropdownProps {
    trigger: Snippet;
    children: Snippet;
    align?: "left" | "right";
    width?: string;
  }

  let { 
    trigger, 
    children, 
    align = "right", 
    width = "w-48" 
  }: DropdownProps = $props();

  let isOpen = $state(false);
  let container: HTMLDivElement;

  // Logic: Close when clicking outside
  $effect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && container && !container.contains(event.target as Node)) {
        isOpen = false;
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  });
</script>

<div class="relative inline-block" bind:this={container}>
  <div onclick={() => (isOpen = !isOpen)} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && (isOpen = !isOpen)}>
    {@render trigger()}
  </div>

  {#if isOpen}
    <div
      in:fly={{ y: 5, duration: 150 }}
      out:fade={{ duration: 100 }}
      class={`absolute z-100 mt-2 ${width} bg-white border border-(--color-border) rounded-lg shadow-lg
        ${align === "right" ? "right-0" : "left-0"}
      `}
    >
      <div class="p-1 flex flex-col gap-0.5" onclick={() => (isOpen = false)} role="presentation">
        {@render children()}
      </div>
    </div>
  {/if}
</div>