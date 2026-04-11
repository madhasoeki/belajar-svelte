<script lang="ts">
  import { Card, CardHeader, CardContent } from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/forms";
  import Button from "$lib/components/ui/button/Button.svelte";
  import Alert from "$lib/components/ui/alert/Alert.svelte"; // Sesuaikan path jika berbeda
  import { toastStore } from "$lib/stores/toast.svelte";
  import { apiClient } from "$lib/utils/api";
  import { API_ENDPOINTS } from "$lib/constans/endpoints";
  import { goto } from "$app/navigation";
  import { Lock, Mail, LogIn, TriangleAlert } from "lucide-svelte";

  let email = $state("");
  let password = $state("");
  let isLoading = $state(false);
  let errorMessage = $state("");

  // [BARU] Logika Error Real-time untuk Email
  // Hanya munculkan error jika email sudah diisi tapi tidak mengandung '@'
  const emailError = $derived(
    email.trim() !== "" && !email.includes("@")
      ? "Format email tidak valid (harus mengandung @)"
      : "",
  );

  // [UPDATE] Validasi tombol submit sekarang harus mengecek emailError juga
  const isValid = $derived(
    email.trim() !== "" && password.trim() !== "" && !emailError, // Pastikan tidak ada error format email
  );

  async function handleLogin(e?: Event) {
    // Jalankan preventDefault HANYA jika event-nya benar-benar ada
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }

    if (!isValid) return;

    isLoading = true;
    errorMessage = "";

    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      const token = response.data?.token || response.token;
      const user = response.data?.user || response.user || null;

      if (token) {
        localStorage.setItem("admin_token", token);
        if (user) {
          localStorage.setItem("admin_user", JSON.stringify(user));
        }
        toastStore.success("Login berhasil. Selamat datang!", "Sukses");
        goto("/dashboard");
      } else {
        throw new Error("Token tidak ditemukan dari server.");
      }
    } catch (error: any) {
      errorMessage =
        error.message ||
        "Kredensial tidak valid. Silakan periksa email dan kata sandi Anda.";
    } finally {
      isLoading = false;
    }
  }

  // HAPUS fungsi handleKeydown, kita sudah tidak membutuhkannya lagi.

  let circles = $state<
    {
      id: number;
      size: number;
      left: number;
      delay: number;
      duration: number;
    }[]
  >([]);

  $effect(() => {
    // Generate 12 lingkaran acak saat halaman pertama kali dibuka
    let generated = [];
    for (let i = 0; i < 12; i++) {
      generated.push({
        id: i,
        size: Math.floor(Math.random() * (120 - 15 + 1)) + 15, // Ukuran acak antara 15px - 120px
        left: Math.floor(Math.random() * 100), // Posisi horizontal acak 0% - 100%
        delay: -Math.floor(Math.random() * 20), // Delay acak negatif (agar langsung muncul)
        duration: Math.floor(Math.random() * (25 - 10 + 1)) + 10, // Kecepatan jatuh acak 10s - 25s
      });
    }
    circles = generated;
  });
</script>

<div
  class="relative min-h-screen flex items-center justify-center bg-blue-50/30 p-4 overflow-hidden"
>
  <ul class="animated-circles">
    {#each circles as circle (circle.id)}
      <li
        style="
        width: {circle.size}px; 
        height: {circle.size}px; 
        left: {circle.left}%; 
        animation-delay: {circle.delay}s; 
        animation-duration: {circle.duration}s;
      "
      ></li>
    {/each}
  </ul>

  <div class="relative z-10 w-full max-w-md">
    <div class="text-center mb-8 flex flex-col gap-2">
      <div
        class="w-12 h-12 bg-(--color-primary) rounded-xl flex items-center justify-center text-white mx-auto mb-2 shadow-lg shadow-(--color-primary)/30"
      >
        <Lock size={24} />
      </div>
      <h1 class="text-2xl font-bold text-gray-900">Login Admin</h1>
      <p class="text-sm text-gray-600">Masukkan email dan password Anda</p>
    </div>

    <Card>
      <CardContent class="p-6!">
        {#if errorMessage}
          <div class="mb-5">
            <Alert
              variant="danger"
              icon={TriangleAlert}
              title="Akses Ditolak"
              dismissible={true}
              onclose={() => (errorMessage = "")}
            >
              {errorMessage}
            </Alert>
          </div>
        {/if}

        <form onsubmit={handleLogin} class="flex flex-col gap-5">
          <Input
            label="Alamat Email"
            type="email"
            placeholder="admin@pondokdigital.com"
            iconLeft={Mail}
            bind:value={email}
            error={emailError}
          />

          <Input
            label="Kata Sandi"
            type="password"
            placeholder="••••••••"
            iconLeft={Lock}
            bind:value={password}
          />

          <Button
            type="submit"
            variant="primary"
            class="w-full py-2.5 mt-2 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            disabled={!isValid || isLoading}
            {isLoading}
          >
            {#if isLoading}
              Memproses...
            {:else}
              <LogIn size={18} /> Masuk ke Dashboard
            {/if}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</div>

<style>
  /* --- LOGIKA ANIMASI LINGKARAN JATUH --- */
  .animated-circles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    margin: 0;
    padding: 0;
    z-index: 0;
    pointer-events: none;
  }

  .animated-circles li {
    position: absolute;
    display: block;
    list-style: none;
    border-radius: 50%;
    background: rgba(59, 130, 246, 0.12); /* Warna biru transparan */
    animation: fall linear infinite;
    top: -150px;
  }

  @keyframes fall {
    0% {
      transform: translateY(-150px);
      opacity: 1;
    }
    100% {
      transform: translateY(120vh);
      opacity: 0;
    }
  }
</style>
