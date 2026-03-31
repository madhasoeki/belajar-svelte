<script lang="ts">
  import { onMount } from "svelte";

  let {
    title = "Donation Trend",
    categories = [],
    series = [],
    height = 320,
  }: {
    title?: string;
    categories: string[];
    series: { name: string; data: number[] }[];
    height?: number;
  } = $props();

  let chartEl: HTMLDivElement;
  let chart: any = $state(null);

  onMount(() => {
    let chartInstance: any;

    import("apexcharts").then(({ default: ApexCharts }) => {
    chartInstance = new ApexCharts(chartEl, {
    chart: {
        type: "area",
        height,
        toolbar: { show: false }
    },

    series,

    colors: ["#22c55e"],

    stroke: {
        curve: "smooth",
        width: 3
    },

    markers: {
        size: 4
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

    tooltip: {
        theme: "light"
    }
    });
    chartInstance.render();
    });
  });
</script>

<div class="bg-white border border-(--color-border) rounded-md shadow-sm p-5">
  <h3 class="text-sm font-semibold text-(--color-text-primary) mb-4">
    {title}
  </h3>
  <div bind:this={chartEl}></div>
</div>