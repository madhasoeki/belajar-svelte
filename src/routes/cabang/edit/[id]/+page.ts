import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
  return {
    title: `Edit Cabang`,
    idCabang: params.id
  };
};