<script lang="ts">
  import { onMount } from "svelte";
  import { Card, CardHeader, CardTitle, CardContent } from "$lib/components/ui/card";

  let {
    subtitle, // [BARU]
    badge,    // [BARU]
    icon: Icon, // [BARU]
    iconColor = "text-(--color-primary)", // [BARU]
    title = "Donation Distribution",
    labels = [],
    series = [],
    height = 320,
  }: {
    subtitle?: string;
    badge?: string;
    icon?: any;
    iconColor?: string;
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

<Card class="w-full h-full shadow-sm">
  <CardHeader 
    title={title} 
    description={subtitle} 
    badge={badge} 
    icon={Icon} 
    iconColor={iconColor} 
    class="pb-2" 
  />
  <CardContent class="pt-0">
    <div bind:this={chartEl} class="w-full"></div>
  </CardContent>
</Card>