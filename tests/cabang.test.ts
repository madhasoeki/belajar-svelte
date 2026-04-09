import { test, expect } from '@playwright/test';

// Skenario 1: Mengecek apakah halaman cabang bisa dibuka dan tabelnya muncul
test('Halaman Cabang bisa dibuka dan menampilkan tombol Tambah', async ({ page }) => {
  // 1. Robot disuruh pergi ke halaman cabang
  await page.goto('http://localhost:5173/cabang');

  // 2. Robot mengecek apakah ada teks judul "Manajemen Cabang"
  await expect(page.locator('text=Manajemen Cabang')).toBeVisible();

  // 3. Robot mengecek apakah tombol "Tambah Cabang" ada
  const btnTambah = page.locator('button', { hasText: 'Tambah Cabang' });
  await expect(btnTambah).toBeVisible();
});

// Skenario 2: Menguji form tambah cabang
test('Bisa masuk ke form tambah cabang', async ({ page }) => {
  await page.goto('http://localhost:5173/cabang');
  
  // 1. Robot mengklik tombol Tambah
  await page.locator('button', { hasText: 'Tambah Cabang' }).click();

  // 2. Robot memastikan URL-nya berubah ke /cabang/tambah
  await expect(page).toHaveURL('http://localhost:5173/cabang/tambah');

  // 3. Robot memastikan input "Nama Cabang" muncul
  await expect(page.locator('input[placeholder="Contoh: Cabang Jakarta Selatan"]')).toBeVisible();
  
  // 4. (Opsional) Robot bisa disuruh ngetik
  await page.fill('input[placeholder="Contoh: Cabang Jakarta Selatan"]', 'Cabang Testing');
});