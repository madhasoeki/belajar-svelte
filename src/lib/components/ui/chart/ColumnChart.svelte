<script lang="ts">
  import { onMount } from "svelte";
  import { Card, CardHeader, CardTitle, CardContent } from "$lib/components/ui/card";

  let {
    title = "Donation Sources",
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

  // Palet Warna Seragam & Harmonis
  const categoricalColors = ["#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6", "#06b6d4", "#f43f5e"];

  onMount(() => {
    let chartInstance: any;

    import("apexcharts").then(({ default: ApexCharts }) => {
      chartInstance = new ApexCharts(chartEl, {
        chart: {
          type: "bar",
          height,
          stacked: true,
          toolbar: { show: false },
          fontFamily: 'Inter, sans-serif'
        },
        series,
        colors: categoricalColors, // Terapkan palet warna
        plotOptions: {
          bar: {
            columnWidth: "40%",
            borderRadius: 6
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
        legend: {
          position: "top",
          horizontalAlign: 'right',
          markers: { size: 8 },
          labels: { colors: "#64748b" }
        },
        dataLabels: { enabled: false },
        tooltip: { theme: "light" }
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
  <CardContent class="pt-2">
    <div bind:this={chartEl}></div>
  </CardContent>
</Card>