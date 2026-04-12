import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
    const id = params.id;

    return {
        title: `Detail Transaksi ${id}`,
        idTransaksi: id,
    };
};
