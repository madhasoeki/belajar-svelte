<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { User } from "lucide-svelte";

  interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
    src?: string | null;
    alt?: string;
    name?: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    shape?: "circle" | "square";
    indicator?: "online" | "offline" | "busy" | "away" | "none";
    class?: string;
  }

  let {
    src = null,
    alt = "Avatar",
    name = "",
    size = "md",
    shape = "circle",
    indicator = "none",
    class: className = "",
    ...rest
  }: AvatarProps = $props();

  // State untuk melacak jika gambar gagal dimuat
  let imageFailed = $state(false);

  // Derivasi untuk mengambil inisial dari nama (Maksimal 2 huruf)
  const initials = $derived(() => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  });

  // Sistem Pemetaan Kelas Tailwind
  const sizes = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const shapes = {
    circle: "rounded-full",
    square: "rounded-lg", // Mengikuti kelengkungan standar card
  };

  // Status Indicator Colors (Menggunakan variabel tema SAMS)
  const indicatorColors = {
    online: "bg-(--color-success)",
    offline: "bg-(--color-text-muted)",
    busy: "bg-(--color-danger)",
    away: "bg-(--color-warning)",
    none: "hidden",
  };

  const indicatorSizes = {
    xs: "w-1.5 h-1.5 border",
    sm: "w-2 h-2 border",
    md: "w-2.5 h-2.5 border-2",
    lg: "w-3 h-3 border-2",
    xl: "w-4 h-4 border-2",
  };

  const indicatorPositions = {
    circle: "bottom-0 right-0 translate-x-[10%] translate-y-[10%]",
    square: "bottom-[-4px] right-[-4px]",
  };
</script>

<div class="relative inline-block shrink-0 {className}" {...rest}>
  <div
    class={`flex items-center justify-center overflow-hidden transition-colors border border-transparent
      bg-(--color-primary-soft) text-(--color-primary-hover) font-semibold
      ${sizes[size]} ${shapes[shape]}
    `}
  >
    {#if src && !imageFailed}
      <img
        {src}
        {alt}
        class="w-full h-full object-cover"
        onerror={() => (imageFailed = true)}
      />
    {:else if name}
      <span>{initials()}</span>
    {:else}
      <User class="w-1/2 h-1/2 opacity-60" strokeWidth={2.5} />
    {/if}
  </div>

  {#if indicator !== "none"}
    <span
      class={`absolute block rounded-full border-white z-10 
        ${indicatorSizes[size]} 
        ${indicatorColors[indicator]} 
        ${indicatorPositions[shape]}
      `}
      title={indicator}
    ></span>
  {/if}
</div>