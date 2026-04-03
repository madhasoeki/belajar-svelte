<script lang="ts">
  import { onMount } from "svelte";
  import { Card, CardHeader, CardTitle, CardContent } from "$lib/components/ui/card";

  let {
    title = "Donation Distribution",
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

  const categoricalColors = ["#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6", "#06b6d4", "#f43f5e"];

  onMount(() => {
    let chartInstance: any;

    import("apexcharts").then(({ default: ApexCharts }) => {
      chartInstance = new ApexCharts(chartEl, {
        chart: {
          type: "donut",
          height,
          toolbar: { show: false },
          fontFamily: 'Inter, sans-serif'
        },
        labels,
        series,
        colors: categoricalColors,
        plotOptions: {
          pie: {
            donut: {
              size: "72%",
              labels: {
                show: true,
                name: { fontSize: '12px', color: '#64748b' },
                value: { fontSize: '20px', fontWeight: 700, color: '#0f172a', offsetY: -2 },
                total: { show: true, label: 'Total', color: '#64748b', fontSize: '12px' }
              }
            }
          }
        },
        dataLabels: { enabled: false }, // Matikan data labels agar clean
        stroke: { colors: ["#ffffff"], width: 2 },
        legend: {
          position: "bottom",
          markers: { size: 8 },
          itemMargin: { horizontal: 8, vertical: 5 },
          labels: { colors: "#64748b" }
        },
        tooltip: { theme: "light" }
      });
      chartInstance.render();
    });

    return () => chartInstance?.destroy();
  });
</script>

<Card class="transition-all duration-200 hover:shadow-md">
  <CardHeader class="pb-2">
    <CardTitle class="text-base text-(--color-text-primary)">{title}</CardTitle>
  </CardHeader>
  <CardContent>
    <div bind:this={chartEl} class="flex justify-center"></div>
  </CardContent>
</Card>