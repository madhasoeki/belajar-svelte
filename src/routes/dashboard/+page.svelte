<script lang="ts">
  import { formatNumber } from "$lib/utils/formatter";
  import { Plus, CircleDollarSign, Users, CreditCard, Activity, Calendar, Trophy, Clock, TrendingUp, PieChart, BarChart3 } from "lucide-svelte";

  import { Card, CardHeader, CardContent, SummaryCard, ProgressCard, SimpleTableCard, MobileOverviewCard, LeaderboardItem } from "$lib/components/ui/card";
  import { Button, SegmentedControl, FloatingActionButton } from "$lib/components/ui/button";
  import { AreaChart, DonutChart, HorizontalBarChart } from "$lib/components/ui/chart";
  import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "$lib/components/ui/table";
  import  Badge  from "$lib/components/ui/badge/Badge.svelte";

  // --- STATE & AUTH SIMULATION ---
  let userRole = $state("koordinator_cs");
  let viewMode = $state("pribadi");

  const viewOptions = [
    { label: "Data Pribadi", value: "pribadi" },
    { label: "Data Tim", value: "tim" },
  ];

  // --- CLEAN INTEGER DATA ---
  const trenCategories = [ "01 Apr", "02 Apr", "03 Apr", "04 Apr", "05 Apr", "06 Apr", "07 Apr", "08 Apr", "09 Apr", "10 Apr", "11 Apr", "12 Apr", "13 Apr", "14 Apr", "15 Apr", "16 Apr", "17 Apr", "18 Apr", "19 Apr", "20 Apr", "21 Apr", "22 Apr", "23 Apr", "24 Apr", "25 Apr", "26 Apr", "27 Apr", "28 Apr", "29 Apr", "30 Apr"];

  const trenSeries = [ { name: "Nominal Donasi",
      data: [ 4200000, 5100000, 12500000, 6000000, 1500000, 3800000, 4500000, 4100000, 5800000, 14200000, 7100000, 1200000, 4000000, 3500000, 4800000, 6200000, 13800000, 5500000, 1800000, 4500000, 5200000, 4900000, 6500000, 15500000, 8000000, 2000000, 5000000, 4800000, 5500000, 6800000], }, ];

  const danaLabels = ["Zakat", "Wakaf", "Infaq", "Hibah"];
  const danaSeries = [40, 30, 20, 10];

  const progCategories = ["Masjid", "Beasiswa", "Pangan", "Sumur"];
  const progSeries = [{ name: "Terkumpul (Juta)", data: [45, 32, 28, 15] }];

  const recentTransactions = [ { id: "TRX-001", name: "Desy", phone: "6285888925417", program: "Pembangunan Masjid", amount: 100000, date: "03 Apr 2026 21:36", status: "Berhasil", }, { id: "TRX-002", name: "Taufik Rahman", phone: "6281367459860", program: "Beasiswa Tahfidz", amount: 10000, date: "03 Apr 2026 21:35", status: "Berhasil", }, { id: "TRX-003", name: "Darwing", phone: "6282112701983", program: "Wakaf Sumur", amount: 20000, date: "03 Apr 2026 21:35", status: "Berhasil", }, { id: "TRX-004", name: "Pak Budi", phone: "6285727701084", program: "Bantuan Pangan", amount: 10000, date: "03 Apr 2026 21:34", status: "Menunggu", }, { id: "TRX-005", name: "Padricha", phone: "6287730120549", program: "Zakat Fitrah", amount: 100000, date: "03 Apr 2026 21:34", status: "Berhasil", }];

  const topDonors = [ { name: "Hamba Allah", total: 15000000, count: 3 }, { name: "Keluarga Bapak Budi", total: 12500000, count: 1 }, { name: "PT. Maju Mundur", total: 10000000, count: 2 }, { name: "Rina Gunawan", total: 5000000, count: 5 }];

  const maxTopDonorTotal = Math.max(
    ...topDonors.map((donor) => donor.total),
    1,
  );

  function getStatusClass(status: string) {
    if (status === "Berhasil") return "secondary";
    if (status === "Menunggu") return "warning";
    return "danger";
  }
</script>

<div class="max-w-7xl mx-auto flex flex-col gap-4 md:gap-6 w-full overflow-x-hidden" >
  <div class="flex flex-col md:flex-row justify-between items-end md:items-center w-full gap-4" >
    <div class="flex flex-row-reverse md:flex-row items-center gap-2 sm:gap-3 text-gray-800 min-w-0 w-full md:w-auto order-1" >
      <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <Calendar size={20} class="text-(--color-primary) sm:w-5.5 sm:h-5.5" />
        <h2 class="text-lg sm:text-xl font-bold tracking-tight">April 2026</h2>
      </div>
      <div class="h-4 sm:h-5 w-px bg-gray-300 shrink-0"></div>
      <span class="text-sm font-medium text-gray-500 truncate"
        >Indonesia Berwakaf</span
      >
    </div>

    <div class="flex justify-end items-center gap-4 w-full md:w-auto order-2">
      {#if userRole === "koordinator_cs"}
        <SegmentedControl
          options={viewOptions}
          bind:selected={viewMode}
          class="w-full md:w-auto"
        />
      {/if}

      <div class="hidden md:block shrink-0">
        <Button
          variant="primary"
          class="flex justify-center items-center gap-2 px-4 shadow-sm"
        >
          <Plus size={16} />
          <span>Input Donasi</span>
        </Button>
      </div>
    </div>
  </div>

  <div class="w-full min-w-0">
    <div class="hidden md:grid lg:grid-cols-4 md:gap-4 lg:gap-6 w-full">
      <ProgressCard
        label="Target Bulan Ini"
        value="Rp 128.500.000"
        icon={CircleDollarSign}
        progress={64.2}
        progressText="Target: Rp 200 Jt"
        variant="primary"
      />
      <SummaryCard
        label="Total Transaksi"
        value="452"
        icon={CreditCard}
        trend="up"
        trendValue="5.2% vs lalu"
        variant="default"
      />
      <SummaryCard
        label="Donatur Unik"
        value="318"
        icon={Users}
        trend="down"
        trendValue="2.1% vs lalu"
        variant="warning"
      />
      <SummaryCard
        label="Rata-rata / Donatur"
        value="Rp 404k"
        icon={Activity}
        trend="up"
        trendValue="8.4% vs lalu"
        variant="success"
      />
    </div>

    <div class="block md:hidden w-full">
      <MobileOverviewCard
        title="Total Donasi"
        value="Rp 128.500.000"
        icon={CircleDollarSign}
        progress={{ targetText: "Target: Rp 200 Jt", percentage: 64.2 }}
        metrics={[
          {
            label: "Transaksi",
            value: "452",
            trendText: "+5.2%",
            trendUp: true,
          },
          {
            label: "Donatur",
            value: "318",
            trendText: "-2.1%",
            trendUp: false,
          },
          {
            label: "Rata-rata",
            value: "Rp 404k",
            trendText: "+8.4%",
            trendUp: true,
          },
        ]}
      />
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 w-full min-w-0">
    <div class="lg:col-span-2 min-w-0">
      <AreaChart
        title="Tren Donasi"
        subtitle="Akumulasi donasi harian"
        badge="April 2026"
        icon={TrendingUp}
        iconColor="text-emerald-500"
        categories={trenCategories}
        series={trenSeries}
        height={320}
        formatType="currency"
        unit="Rp"
      />
    </div>
    <div class="lg:col-span-1 min-w-0">
      <DonutChart
        title="Distribusi Jenis Dana"
        subtitle="Persentase berdasarkan jenis dana"
        badge="April 2026"
        icon={PieChart}
        iconColor="text-cyan-500"
        labels={danaLabels}
        series={danaSeries}
        height={320}
      />
    </div>
  </div>

  <div class="flex flex-col lg:grid lg:grid-cols-3 gap-4 md:gap-6 items-start w-full min-w-0" >
    <div class="order-1 lg:order-2 flex flex-col gap-4 md:gap-6 w-full lg:col-span-1 min-w-0" >
      <HorizontalBarChart
        title="Top 4 Program"
        subtitle="Program dengan donasi terbesar"
        badge="April 2026"
        icon={BarChart3}
        iconColor="text-violet-500"
        categories={progCategories}
        series={progSeries}
        height={250}
      />

      <Card>
        <CardHeader
          title="Top Donatur"
          description="Kontributor terbesar periode ini"
          badge={`${topDonors.length} Donatur`}
          icon={Trophy}
          iconColor="text-amber-500"
        />
        <CardContent class="flex flex-col gap-3">
          {#each topDonors as donor, i (donor.name)}
            {@const progress = Math.max(
              8,
              Math.round((donor.total / maxTopDonorTotal) * 100),
            )}
            <LeaderboardItem
              rank={i + 1}
              name={donor.name}
              subtitle={`${donor.count} Transaksi`}
              amount={formatNumber(donor.total, "currency")}
              {progress}
            />
          {/each}
        </CardContent>
      </Card>
    </div>

    <Card class="order-2 lg:order-1 w-full lg:col-span-2 h-full min-w-0">
      <CardHeader title="Transaksi Terbaru" description="5 transaksi terakhir yang masuk" icon={Clock} iconColor="text-gray-500" class="pb-2" >
        {#snippet action()}
          <button class="text-sm font-medium text-(--color-primary) hover:underline focus:outline-none">
            Lihat Semua
          </button>
        {/snippet}
      </CardHeader>

      <CardContent class="pt-3">
        <div class="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donatur</TableHead>
                <TableHead>Program</TableHead>
                <TableHead class="text-right">Nominal</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead class="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each recentTransactions as trx (trx.id)}
                <TableRow class="hover:bg-gray-50 transition-colors">
                  <TableCell class="font-medium text-gray-900"
                    >{trx.name} <br />
                    <span class="text-xs text-gray-400 font-normal"
                      >{trx.phone}</span
                    ></TableCell
                  >
                  <TableCell class="text-gray-600">{trx.program}</TableCell>
                  <TableCell class="text-right font-semibold text-gray-900"
                    >Rp {formatNumber(trx.amount, "standard")}</TableCell
                  >
                  <TableCell class="text-gray-500 text-xs">{trx.date}</TableCell
                  >
                  <TableCell class="text-center">
                    <Badge shape="pill" variant={getStatusClass(trx.status)}
                      >{trx.status}</Badge
                    >
                  </TableCell>
                </TableRow>
              {/each}
            </TableBody>
          </Table>
        </div>

        <div class="sm:hidden flex flex-col gap-3 bg-gray-50/30">
          {#each recentTransactions as trx (trx.id)}
            <SimpleTableCard
              name={trx.name}
              phone={trx.phone}
              program={trx.program}
              date={trx.date}
              amount={formatNumber(trx.amount, "standard")}
              statusLabel={trx.status}
              statusVariant={getStatusClass(trx.status)}
            />
          {/each}
        </div>
      </CardContent>
    </Card>
  </div>

  <FloatingActionButton
    icon={Plus}
    ariaLabel="Input Donasi"
    onclick={() => console.log("Buka modal donasi")}
  />
</div>
