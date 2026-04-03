<script lang="ts">
  import { onMount } from "svelte";
  import { Card, CardHeader, CardTitle, CardContent } from "$lib/components/ui/card";

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

  onMount(() => {
    let chartInstance: any;

    import("apexcharts").then(({ default: ApexCharts }) => {
      chartInstance = new ApexCharts(chartEl, {
        chart: {
          type: "area",
          height,
          toolbar: { show: false },
          fontFamily: 'Inter, sans-serif',
          sparkline: { enabled: false }
        },
        series,
        colors: ["#22c55e"], // Hijau Utama SAMS
        stroke: { curve: "smooth", width: 3 },
        markers: { size: 0, hover: { size: 6 } },
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.8,
            opacityTo: 0.5,
            stops: [0, 100]
          }
        },
        grid: {
          borderColor: "#f1f5f9",
          strokeDashArray: 4,
          padding: { top: 0, right: 0, bottom: 0, left: 10 }
        },
        xaxis: {
          categories,
          axisBorder: { show: false },
          axisTicks: { show: false },
          labels: { style: { colors: "#64748b", fontSize: "12px" } }
        },
        yaxis: {
          labels: { style: { colors: "#64748b", fontSize: "12px" } }
        },
        tooltip: { theme: "light" },
        dataLabels: { enabled: false }
      });
      chartInstance.render();
    });

    return () => chartInstance?.destroy();
  });
</script>

<Card class="transition-all duration-200 hover:shadow-md">
  <CardHeader class="pb-0">
    <CardTitle class="text-base text-(--color-text-primary)">{title}</CardTitle>
  </CardHeader>
  <CardContent class="pt-4">
    <div bind:this={chartEl}></div>
  </CardContent>
</Card>