<script lang="ts">
  import SummaryCard from "$lib/components/ui/card/SummaryCard.svelte";
  import ProgressCard from "$lib/components/ui/card/ProgressCard.svelte";
  import LineChart from "$lib/components/ui/chart/LineChart.svelte";
  import PieChart from "$lib/components/ui/chart/PieChart.svelte";
  import DonutChart from "$lib/components/ui/chart/DonutChart.svelte";
  import BarChart from "$lib/components/ui/chart/BarChart.svelte";
  import AreaChart from "$lib/components/ui/chart/AreaChart.svelte";
  import HorizontalBarChart from "$lib/components/ui/chart/HorizontalBarChart.svelte";
  import ColumnChart from "$lib/components/ui/chart/ColumnChart.svelte";
  import FunnelChart from "$lib/components/ui/chart/FunnelChart.svelte";

  import {
    Target,
    CircleDollarSign,
    Users,
    Megaphone,
    TrendingUp,
    Activity,
  } from "lucide-svelte";

  const donationSeries = [
    {
      name: "Donasi",
      data: [300000, 500000, 450000, 700000, 1000000, 1250000],
    },
  ];

  const donationCategories = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"];
</script>

<div class="grid grid-cols-1 gap-3">
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <SummaryCard label="Total Donasi" value="Rp 1.000.250.000" icon={CircleDollarSign} trend="up" trendValue="15% dari bulan lalu" variant="primary" />

    <SummaryCard label="Jumlah Donatur" value="350" icon={Users} trend="down" trendValue="5% dari bulan lalu" variant="success" />

    <SummaryCard label="Campaign Aktif" value="12" icon={Megaphone} variant="warning" />

    <SummaryCard label="Konversi Donasi" value="25%" icon={TrendingUp} trend="up" trendValue="10% dari bulan lalu" variant="default" />
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
    <ProgressCard label="Target Donasi" value="Rp 750.000.000" icon={Activity} progress={65} progressText="Target: Rp 100.000.000" variant="primary" />

    <ProgressCard label="Leads Masuk" value="320" icon={Activity} progress={80} progressText="Target: 400 Leads" variant="success"/>

    <ProgressCard label="Campaign Selesai" value="8" icon={Activity} progress={40} progressText="Target: 20 Campaign" variant="danger"/>

    <ProgressCard label="Close Rate" value="58%" icon={Activity} progress={58} progressText="Closing 58/100 Leads" variant="warning"/>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    <LineChart title="Tren Donasi Bulanan" categories={donationCategories} series={donationSeries} height={320} />
    <BarChart title="Tren Donasi Bulanan" categories={donationCategories} series={donationSeries} height={320} />
    <AreaChart title="Tren Donasi Bulanan" categories={donationCategories} series={donationSeries} height={320} />
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
    <PieChart title="Donation Methods" labels={["BCA", "QRIS", "Cash", "BRI", "BSI", "Mandiri"]} series={[44, 35, 21, 10, 30, 25]} />
    <DonutChart title="Donation Methods" labels={["Transfer", "QRIS", "Cash"]} series={[44, 35, 21]} />
    <ColumnChart title="Sumber Donasi" categories={["Jan","Feb","Mar","Apr","Mei","Jun"]}
      series={[
        { name: "Zakat", data: [30,40,35,50,49,60] },
        { name: "Infak", data: [20,25,30,35,40,45] },
        { name: "Sedekah", data: [10,15,20,25,30,35] }
      ]} />
    <HorizontalBarChart title="Top Campaign" categories={["Ramadhan", "Beasiswa", "Masjid", "Bencana"]} series={[{ name: "Donasi", data: [120, 95, 80, 60] }]} />
  </div>
  <FunnelChart
  title="Donation Funnel"
  data={[
    { x: "Visitor", y: 1380 },
    { x: "Landing Page", y: 1100 },
    { x: "Klik Donasi", y: 880 },
    { x: "Isi Form", y: 540 },
    { x: "Berhasil Donasi", y: 200 }
  ]}
/>
</div>
