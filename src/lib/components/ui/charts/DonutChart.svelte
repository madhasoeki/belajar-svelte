<script lang="ts">
import { onMount } from "svelte";

let {
  title = "Donation Sources",
  labels = [],
  series = [],
  height = 320,
}: {
  title?: string;
  labels: string[];
  series: number[];
  height?: number;
} = $props();

let chartEl: HTMLDivElement;

onMount(() => {
  let chartInstance: any;

  import("apexcharts").then(({ default: ApexCharts }) => {
    chartInstance = new ApexCharts(chartEl, {
      chart: {
        type: "donut",
        height,
        toolbar: { show: false }
      },

      labels,

      series,

      colors: [
        "#22C55E", // Green (primary)
        "#16A34A", // Dark green
        "#38BDF8", // Sky
        "#3B82F6", // Blue
        "#6366F1", // Indigo
        "#A855F7", // Purple
        "#EC4899", // Pink
        "#F43F5E", // Rose
        "#F59E0B", // Amber
        "#F97316"  // Orange
        ],

      plotOptions: {
        pie: {
          donut: {
            size: "65%"
          }
        }
      },

      legend: {
        position: "bottom",
        labels: {
          colors: "#64748b"
        }
      },

      tooltip: {
        theme: "light"
      }
    });

    chartInstance.render();
  });

  return () => chartInstance?.destroy();
});
</script>

<div class="bg-white border border-(--color-border) rounded-xl shadow-sm p-5">
  <h3 class="text-sm font-semibold text-(--color-text-primary) mb-4">
    {title}
  </h3>
  <div bind:this={chartEl}></div>
</div>