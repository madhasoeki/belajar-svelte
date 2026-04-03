<script lang="ts">
  import AreaChart from "$lib/components/ui/chart/AreaChart.svelte";
  import BarChart from "$lib/components/ui/chart/BarChart.svelte";
  import ColumnChart from "$lib/components/ui/chart/ColumnChart.svelte";
  import DonutChart from "$lib/components/ui/chart/DonutChart.svelte";
  import PieChart from "$lib/components/ui/chart/PieChart.svelte";
  import LineChart from "$lib/components/ui/chart/LineChart.svelte";
  import HorizontalBarChart from "$lib/components/ui/chart/HorizontalBarChart.svelte";
  import FunnelChart from "$lib/components/ui/chart/FunnelChart.svelte";

  // --- DUMMY DATA UNTUK SHOWCASE ---
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const campaigns = ["Masjid", "Pendidikan", "Kesehatan", "Pangan", "Bencana"];
  
  const trendData = [{ name: "Donasi", data: [31, 40, 28, 51, 42, 109, 100] }];
  const multiSourceData = [
    { name: "Transfer Bank", data: [44, 55, 41, 67, 22, 43, 21] },
    { name: "E-Wallet", data: [13, 23, 20, 8, 13, 27, 33] },
    { name: "Tunai", data: [11, 17, 15, 15, 21, 14, 15] }
  ];
  
  const distributionSeries = [44, 55, 13, 43, 22];
  
  const funnelData = [
    { x: "Pengunjung Web", y: 15420 },
    { x: "Klik Kampanye", y: 8430 },
    { x: "Isi Form", y: 3120 },
    { x: "Menunggu Pembayaran", y: 2840 },
    { x: "Donasi Berhasil", y: 2150 }
  ];
</script>

<div class="p-8 space-y-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
  
  <div class="border-b border-gray-200 pb-4">
    <h1 class="text-2xl font-bold text-gray-900">Visualisasi Data (Charts)</h1>
    <p class="text-gray-500">Dokumentasi integrasi ApexCharts dengan warna kategorikal SAMS.</p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    
    <AreaChart 
      title="Tren Donasi Masuk (Area)" 
      categories={months} 
      series={trendData} 
    />

    <ColumnChart 
      title="Sumber Dana Per Bulan (Stacked)" 
      categories={months} 
      series={multiSourceData} 
    />

    <DonutChart 
      title="Distribusi Program (Donut)" 
      labels={campaigns} 
      series={distributionSeries} 
    />

    <PieChart 
      title="Distribusi Program (Pie)" 
      labels={campaigns} 
      series={distributionSeries} 
    />

    <BarChart 
      title="Pertumbuhan Bulanan (Bar)" 
      categories={months} 
      series={trendData} 
    />

    <LineChart 
      title="Performa Kampanye (Line)" 
      categories={months} 
      series={trendData} 
    />

    <HorizontalBarChart 
      title="Top 5 Kampanye (Horizontal)" 
      categories={campaigns} 
      series={[{ name: "Total", data: [400, 300, 200, 150, 100] }]} 
    />

    <FunnelChart 
      title="Konversi Donatur (Funnel)" 
      data={funnelData} 
    />

  </div>

</div>