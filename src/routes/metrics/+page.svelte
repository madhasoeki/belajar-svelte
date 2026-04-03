<script lang="ts">
  import SummaryCard from "$lib/components/ui/card/SummaryCard.svelte";
  import ProgressCard from "$lib/components/ui/card/ProgressCard.svelte";
  import { Wallet, Users, Box, Target, Heart, TrendingUp, AlertCircle } from "lucide-svelte";
</script>

<div class="p-8 space-y-12 max-w-7xl mx-auto bg-gray-50 min-h-screen">
  
  <div class="border-b border-gray-200 pb-4">
    <h1 class="text-2xl font-bold text-gray-900">Metrics & Widgets</h1>
    <p class="text-gray-500">Kumpulan komponen kartu ringkasan data dan indikator progres.</p>
  </div>

  <section class="space-y-6">
    <div>
      <h2 class="text-lg font-semibold text-gray-800">1. Summary Cards</h2>
      <p class="text-sm text-gray-500">Kartu indikator utama dengan panah tren (naik/turun).</p>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard 
        label="Total Donasi" 
        value="Rp 1.250.000.000" 
        icon={Wallet} 
        trend="up" 
        trendValue="15% dari bulan lalu"
        variant="success" 
      />
      <SummaryCard 
        label="Donatur Baru" 
        value="842 Orang" 
        icon={Users} 
        trend="up" 
        trendValue="5% dari bulan lalu"
        variant="primary" 
      />
      <SummaryCard 
        label="Donatur Pasif" 
        value="124 Orang" 
        icon={AlertCircle} 
        trend="down" 
        trendValue="-2% dari bulan lalu"
        variant="danger" 
      />
      <SummaryCard 
        label="Barang Keluar" 
        value="85 Dus" 
        icon={Box} 
        variant="warning" 
      />
    </div>
  </section>

  <section class="space-y-6">
    <div>
      <h2 class="text-lg font-semibold text-gray-800">2. Progress Cards</h2>
      <p class="text-sm text-gray-500">Kartu indikator dengan batang progres untuk melacak target kampanye.</p>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <ProgressCard 
        label="Pembangunan Masjid" 
        value="Rp 750 Juta" 
        icon={Target} 
        progress={75}
        progressText="Target: Rp 1 Miliar"
        variant="primary" 
      />
      <ProgressCard 
        label="Bantuan Pangan" 
        value="8,500 Paket" 
        icon={Heart} 
        progress={85}
        progressText="Target: 10,000 Paket"
        variant="success" 
      />
      <ProgressCard 
        label="Dana Operasional" 
        value="Rp 25 Juta" 
        icon={TrendingUp} 
        progress={25}
        progressText="Target: Rp 100 Juta"
        variant="warning" 
      />
    </div>
  </section>

</div>