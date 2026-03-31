<script lang="ts">
import { onMount } from "svelte";

let {
  title = "Top Campaign",
  categories = [],
  series = [],
  height = 320
}: {
  title?: string;
  categories: string[];
  series: { name: string; data: number[] }[];
  height?: number;
} = $props();

let chartEl: HTMLDivElement;

onMount(async () => {
  const { default: ApexCharts } = await import("apexcharts");

  const chart = new ApexCharts(chartEl, {
    chart: {
      type: "bar",
      height,
      toolbar: { show: false }
    },

    series,

    colors: [
      "#22C55E",
      "#38BDF8",
      "#F59E0B",
      "#F43F5E",
      "#6366F1"
    ],

    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        barHeight: "50%"
      }
    },

    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4
    },

    xaxis: {
      categories,
      labels: {
        style: {
          colors: "#64748b",
          fontSize: "12px"
        }
      }
    },

    yaxis: {
      labels: {
        style: {
          colors: "#64748b",
          fontSize: "12px"
        }
      }
    },

    dataLabels: {
      enabled: false
    },

    tooltip: {
      theme: "light"
    }
  });

  chart.render();
});
</script>

<div class="bg-white border border-(--color-border) rounded-xl shadow-sm p-5">
  <h3 class="text-sm font-semibold text-(--color-text-primary) mb-4">
    {title}
  </h3>

  <div bind:this={chartEl}></div>
</div>