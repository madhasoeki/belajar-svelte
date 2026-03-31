<script lang="ts">
import { onMount } from "svelte";

let {
  title = "Conversion Funnel",
  data = [],
  height = 350
}: {
  title?: string;
  data: { x: string; y: number }[];
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

    series: [
      {
        name: "Funnel",
        data
      }
    ],

    colors: [
      "#22C55E",
      "#38BDF8",
      "#6366F1",
      "#A855F7",
      "#EC4899",
      "#F43F5E",
      "#F59E0B"
    ],

    plotOptions: {
      bar: {
        horizontal: true,
        isFunnel: true
      }
    },

    dataLabels: {
      enabled: true,
      formatter: function (val, opts: any) {
        const label = opts.w.config.series[0].data[opts.dataPointIndex].x;
        return `${label}: ${val}`;
      },
      style: {
        fontSize: "13px",
        fontWeight: 600,
        colors: ["#ffffff"]
      }
    },

    xaxis: {
      labels: {
        style: {
          colors: "#64748b"
        }
      }
    },

    yaxis: {
      labels: {
        show: false
      }
    },

    grid: {
      show: false
    },

    legend: {
      show: false
    },

    tooltip: {
      theme: "light"
    }
  });

  chart.render();
});
</script>

<div class="bg-white border border-(--color-border) rounded-md shadow-sm p-5">
  <h3 class="text-sm font-semibold text-(--color-text-primary) mb-4">
    {title}
  </h3>

  <div bind:this={chartEl}></div>
</div>