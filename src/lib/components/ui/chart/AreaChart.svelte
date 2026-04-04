<script lang="ts">
  import { onMount } from "svelte";
  import { Card, CardHeader, CardContent } from "$lib/components/ui/card";
  import { formatNumber } from "$lib/utils/formatter";

  let {
    subtitle, 
    badge,   
    icon: Icon, 
    iconColor = "text-(--color-primary)",
    title = "Donation Trend",
    categories = [],
    series = [],
    height = 320,
    formatType = "standard", 
    unit = "",  
  }: {
    title?: string;
    subtitle?: string;
    badge?: string;
    icon?: any;
    iconColor?: string;
    categories: string[];
    series: { name: string; data: number[] }[];
    height?: number;
    formatType?: "currency" | "standard";
    unit?: string;
  } = $props();

  let chartEl: HTMLDivElement;

  onMount(() => {
    let chartInstance: any;

    const rootStyles = getComputedStyle(document.documentElement);
    const primaryColor = rootStyles.getPropertyValue('--color-primary').trim() || "#22c55e";

    import("apexcharts").then(({ default: ApexCharts }) => {
      chartInstance = new ApexCharts(chartEl, {
        chart: {
          type: "area",
          height,
          toolbar: { show: false },
          fontFamily: 'Inter, sans-serif',
          sparkline: { enabled: false },
          zoom: { enabled: false }
        },
        series,
        colors: [primaryColor],
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
          tickAmount: 5, 
          labels: { 
            style: { colors: "#64748b", fontSize: "12px" },
            hideOverlappingLabels: true 
          }
        },
        yaxis: {
          labels: { 
            style: { colors: "#64748b", fontSize: "12px" },
            formatter: function (value: number) {
              if (formatType === "currency") {
                return "Rp " + formatNumber(value, "compact");
              }
              return formatNumber(value, "standard");
            }
          }
        },
        tooltip: { 
          theme: "light",
          y: {
            formatter: function (value: number) {
              if (formatType === "currency") {
                return formatNumber(value, "currency");
              }
              return unit ? `${formatNumber(value, "standard")} ${unit}` : formatNumber(value, "standard");
            }
          }
        },
        dataLabels: { enabled: false }
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
  <CardContent class="pt-0 pl-1!">
    <div bind:this={chartEl} class="w-full"></div>
  </CardContent>
</Card>