<script lang="ts">
  import { onMount } from "svelte";
  import { Card, CardHeader, CardTitle, CardContent } from "$lib/components/ui/card";

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

  // Palet Warna Kategorikal agar setiap tahap funnel punya warna berbeda
  const categoricalColors = ["#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6", "#06b6d4", "#f43f5e"];

  onMount(() => {
    let chartInstance: any;

    import("apexcharts").then(({ default: ApexCharts }) => {
      chartInstance = new ApexCharts(chartEl, {
        chart: {
          type: "bar",
          height,
          toolbar: { show: false },
          fontFamily: 'Inter, sans-serif'
        },
        series: [
          {
            name: "Funnel",
            data
          }
        ],
        colors: categoricalColors,
        plotOptions: {
          bar: {
            horizontal: true,
            isFunnel: true,
            distributed: true, // [PENTING] Memaksa ApexChart memakai palet warna untuk setiap baris
            borderRadius: 0
          }
        },
        dataLabels: {
          enabled: true,
          formatter: function (val: any, opts: any) {
            const label = opts.w.config.series[0].data[opts.dataPointIndex].x;
            return `${label}: ${val}`;
          },
          style: {
            fontSize: "12px",
            fontWeight: 600,
            colors: ["#ffffff"]
          },
          dropShadow: { enabled: false } // Matikan shadow bawaan yang bikin teks terlihat kotor
        },
        xaxis: {
          labels: {
            style: { colors: "#64748b", fontSize: "12px" }
          }
        },
        yaxis: {
          labels: { show: false } // Label Y disembunyikan karena sudah ada di dalam funnel
        },
        grid: {
          show: false,
          padding: { top: 0, right: 10, bottom: 0, left: 10 }
        },
        legend: {
          show: false // Sembunyikan legend karena ini adalah funnel flow, bukan kategori bebas
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

<Card class="transition-all duration-200 hover:shadow-md">
  <CardHeader class="pb-0">
    <CardTitle class="text-base text-(--color-text-primary)">{title}</CardTitle>
  </CardHeader>
  <CardContent class="pt-4">
    <div bind:this={chartEl}></div>
  </CardContent>
</Card>