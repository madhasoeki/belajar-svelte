<script lang="ts">
  import type { Snippet } from "svelte";
  import { fade } from "svelte/transition";

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
  let triggerElement = $state<HTMLDivElement | null>(null);
  let dropdownElement = $state<HTMLDivElement | null>(null);
  let dropdownStyle = $state("");

  function toggleOpen() {
    isOpen = !isOpen;
  }

  function updateDropdownPosition() {
    if (!isOpen || !triggerElement || !dropdownElement) return;

    const triggerRect = triggerElement.getBoundingClientRect();
    const dropdownRect = dropdownElement.getBoundingClientRect();
    const gap = 6;
    const viewportPadding = 8;

    const spaceBelow = window.innerHeight - triggerRect.bottom - viewportPadding;
    const spaceAbove = triggerRect.top - viewportPadding;
    const openUpward =
      spaceBelow < dropdownRect.height && spaceAbove > spaceBelow;

    const preferredLeft =
      align === "right"
        ? triggerRect.right - dropdownRect.width
        : triggerRect.left;

    const left = Math.max(
      viewportPadding,
      Math.min(
        preferredLeft,
        window.innerWidth - viewportPadding - dropdownRect.width,
      ),
    );

    const top = openUpward ? triggerRect.top - gap : triggerRect.bottom + gap;

    dropdownStyle = `position:fixed;left:${Math.round(left)}px;top:${Math.round(top)}px;${openUpward ? "transform:translateY(-100%);" : ""}`;
  }

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

  $effect(() => {
    if (!isOpen || !dropdownElement) return;

    const syncPosition = () => updateDropdownPosition();
    requestAnimationFrame(syncPosition);

    window.addEventListener("resize", syncPosition);
    window.addEventListener("scroll", syncPosition, true);

    return () => {
      window.removeEventListener("resize", syncPosition);
      window.removeEventListener("scroll", syncPosition, true);
    };
  });
</script>

<div class="relative inline-block" bind:this={container}>
  <div
    bind:this={triggerElement}
    onclick={toggleOpen}
    role="button"
    tabindex="0"
    onkeydown={(e) => (e.key === "Enter" || e.key === " ") && toggleOpen()}
  >
    {@render trigger()}
  </div>

  {#if isOpen}
    <div
      bind:this={dropdownElement}
      in:fade={{ duration: 120 }}
      out:fade={{ duration: 100 }}
      class={`z-1200 ${width} bg-white border border-(--color-border) rounded-lg shadow-lg`}
      style={dropdownStyle}
    >
      <div class="p-1 flex flex-col gap-0.5" onclick={() => (isOpen = false)} role="presentation">
        {@render children()}
      </div>
    </div>
  {/if}
</div>