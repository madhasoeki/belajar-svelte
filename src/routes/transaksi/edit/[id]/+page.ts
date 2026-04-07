// src/routes/transaksi/edit/[id]/+page.ts

import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
  // params.id ini otomatis didapatkan dari nama folder [id]
  const id = params.id;

  return {
    title: `Edit Transaksi ${id}`,
    idTransaksi: id // Oper ID-nya ke +page.svelte
  };
};