# Kontrak API Backend Belajar

Dokumen ini merangkum seluruh kontrak API yang saat ini terdaftar pada router backend.
Sumber utama: route di `cmd/api/router.go`, validasi di handler, dan struktur model response.

## 1. Konvensi Umum

### 1.1 Base URL

- Gunakan base URL sesuai environment.
- Semua path di dokumen ini bersifat relatif, misalnya: `/login`, `/donatur`, `/transaksi`.

### 1.2 Header

- Request JSON: `Content-Type: application/json`
- Endpoint berproteksi: `Authorization: Bearer <JWT_TOKEN>`

### 1.3 Aturan Auth dan Permission

- Endpoint publik hanya `POST /login`.
- Endpoint lain wajib token JWT valid dan permission sesuai route.
- Super admin dapat melewati check permission jika memiliki permission `all`.

### 1.4 Error Global untuk Endpoint Berproteksi

- `401 Unauthorized`
  - Token tidak ada.
  - Token invalid/expired.
  - User context tidak ditemukan dalam sesi.
- `403 Forbidden`
  - Permission tidak sesuai.

Contoh body error umum:

```json
{
  "pesan": "Anda tidak memiliki izin (permission) untuk mengakses fitur ini"
}
```

### 1.5 Pola Response Umum

Contoh list + meta:

```json
{
  "data": [],
  "meta": {
    "total_data": 0,
    "page": 1,
    "limit": 10,
    "total_page": 0
  }
}
```

Contoh list + meta + summary:

```json
{
  "data": [],
  "meta": {
    "total_data": 0,
    "page": 1,
    "limit": 10,
    "total_page": 0
  },
  "summary": {}
}
```

Contoh response aksi:

```json
{
  "pesan": "Operasi berhasil",
  "data": {}
}
```

## 2. Domain Auth

### POST /login

- Permission: tidak perlu.
- Auth: tidak perlu token.
- Query params: tidak ada.

Request body:

```json
{
  "email": "user@contoh.com",
  "password": "rahasia"
}
```

Response sukses `200`:

```json
{
  "pesan": "Login berhasil",
  "token": "JWT_TOKEN_STRING",
  "user": {
    "id": "USR-260409-ABCD",
    "nama lengkap": "Nama Lengkap User",
    "nama panggilan": "Nama Panggilan",
    "role": "Super Admin",
    "cabang_id": "CBG-260409-ABCD",
    "tim_id": "TIM-260409-ABCD"
  }
}
```

Catatan:

- `tim_id` bisa bernilai `null` jika user belum terhubung ke tim.

Error penting:

- `400` format JSON tidak valid.
- `401` email atau password salah.
- `403` akun nonaktif.
- `500` gagal membuat token login.

## 3. Domain Donatur

### Skema Donatur (contoh)

```json
{
  "id": "DNT-260409-ABCDE",
  "sapaan": "Bapak",
  "nama_donatur": "Ahmad",
  "nomor_hp_donatur": "6281234567890",
  "email": "ahmad@contoh.com",
  "label": "Loyal",
  "domisili": "Jakarta Selatan",
  "alamat": "Jl. Melati 10",
  "info_tambahan": {
    "catatan": "Donatur rutin"
  },
  "total_donasi": 1500000,
  "total_transaksi": 12,
  "terakhir_donasi": "2026-04-08",
  "probabilitas_churn": 0.12,
  "pola_donasi": "aktif",
  "created_by_id": "USR-260409-ABCD",
  "pic_id": "USR-260409-WXYZ",
  "created_at": "2026-04-09T02:00:00Z",
  "updated_at": "2026-04-09T04:00:00Z"
}
```

### GET /donatur

- Permission: `read_donatur`
- Path params: tidak ada.

Query params:

- `page` (int, default 1)
- `limit` (int, default 10)
- `q` (string)
- `domisili` (string)
- `label` (string)
- `nominal_operator` (string: `=`, `>`, `<`, `>=`, `<=`, `between`)
- `nominal_value` (number/string)
- `nominal_from` (number/string)
- `nominal_to` (number/string)
- `transaksi_operator` (string: `=`, `>`, `<`, `>=`, `<=`, `between`)
- `transaksi_value` (number/string)
- `transaksi_from` (number/string)
- `transaksi_to` (number/string)
- `label_churn` (string)
- `start_date` (string, format `YYYY-MM-DD`)
- `end_date` (string, format `YYYY-MM-DD`)
- `scope_mode` (string opsional, contoh: `self`, `team`)

Response sukses `200`:

```json
{
  "data": [
    {
      "id": "DNT-260409-ABCDE",
      "nama_donatur": "Ahmad",
      "nomor_hp_donatur": "6281234567890",
      "label": "Loyal",
      "domisili": "Jakarta Selatan",
      "total_donasi": 1500000,
      "total_transaksi": 12,
      "terakhir_donasi": "2026-04-08",
      "probabilitas_churn": 0.12,
      "pola_donasi": "aktif"
    }
  ],
  "meta": {
    "total_data": 1,
    "page": 1,
    "limit": 10,
    "total_page": 1
  },
  "summary": {
    "total_donatur": 1,
    "tingkat_aktif": 100,
    "rata_rata_clv": 1500000,
    "rata_rata_frekuensi": 12,
    "trend_total_donatur": 0,
    "trend_tingkat_aktif": 0,
    "trend_clv": 0,
    "trend_frekuensi": 0
  }
}
```

Error penting:

- `400` `scope_mode` tidak valid.
- `403` akses data ditolak oleh scope role.
- `500` gagal mengambil daftar donatur.

### GET /donatur/export

- Permission: `export_donatur`
- Auth: token valid.
- Query params:
  - `q` (string, keyword pencarian nama/HP)
  - `domisili` (string, filter domisili)
  - `label` (string, filter label)
  - `nominal_operator` (string, operator nominal: `gt`, `lt`, `eq`, `range`)
  - `nominal_value` (float, nominal pembanding)
  - `nominal_from` (float, batas bawah range nominal)
  - `nominal_to` (float, batas atas range nominal)
  - `transaksi_operator` (string, operator total transaksi: `gt`, `lt`, `eq`, `range`)
  - `transaksi_value` (int, jumlah transaksi pembanding)
  - `transaksi_from` (int, batas bawah range transaksi)
  - `transaksi_to` (int, batas atas range transaksi)
  - `start_date` (string, format `YYYY-MM-DD`, filter tanggal donatur dibuat)
  - `end_date` (string, format `YYYY-MM-DD`, filter tanggal donatur dibuat)
  - `label_churn` (string, filter status churn: `Aktif`, `Beresiko`, `Churn`)
  - `scope_mode` (string, pilihan: `self`, `team`)

Response sukses `200`:

- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename=Data_Donatur_YYYY-MM-DD.csv`
- Body: File CSV dengan kolom:
  - `ID Donatur`, `Nama`, `No HP`, `Email`, `Label`, `Domisili`, `Alamat`, `Total Donasi`, `Total Transaksi`, `Terakhir Donasi`, `PIC`

### GET /donatur/{id}

- Permission: `read_donatur`
- Path params:
  - `id` (string, ID donatur)

Query params:

- `scope_mode` (opsional)

Response sukses `200`:

```json
{
  "id": "DNT-260409-ABCDE",
  "nama_donatur": "Ahmad",
  "nomor_hp_donatur": "6281234567890",
  "label": "Loyal",
  "domisili": "Jakarta Selatan"
}
```

Error penting:

- `400` `scope_mode` tidak valid.
- `403` akses data ditolak oleh scope role.
- `404` data donatur tidak ditemukan.

### GET /donatur/search

- Permission: `search_donatur`
- Path params: tidak ada.

Query params:

- `q` (string; jika kurang dari 4 karakter akan return array kosong)
- `scope_mode` (opsional)

Response sukses `200`:

```json
[
  {
    "id": "DNT-260409-ABCDE",
    "nama_donatur": "Ahmad",
    "nomor_hp_donatur": "6281234567890"
  }
]
```

Catatan perilaku:

- Bila `q` kurang dari 4 karakter, backend mengembalikan:

```json
[]
```

Error penting:

- `400` `scope_mode` tidak valid.
- `403` akses data ditolak oleh scope role.
- `500` gagal mencari data donatur.

### POST /donatur

- Permission: `create_donatur`
- Path params: tidak ada.

Request body:

```json
{
  "sapaan": "Bapak",
  "nama_donatur": "Ahmad",
  "nomor_hp_donatur": "6281234567890",
  "email": "ahmad@contoh.com",
  "label": "Loyal",
  "domisili": "Jakarta Selatan",
  "alamat": "Jl. Melati 10",
  "info_tambahan": {
    "catatan": "Donatur rutin"
  }
}
```

Keterangan validasi penting:

- `sapaan`, `nama_donatur`, `nomor_hp_donatur` wajib.
- `nomor_hp_donatur` numeric, minimal 10 digit, dan diawali `628`.

Response sukses `201`:

```json
{
  "pesan": "Donatur berhasil ditambahkan",
  "data": {
    "id": "DNT-260409-ABCDE",
    "nama_donatur": "Ahmad",
    "nomor_hp_donatur": "6281234567890"
  }
}
```

Error penting:

- `400` format JSON tidak valid atau validasi gagal.
- `500` gagal menyimpan donatur.

### PUT /donatur/{id}

- Permission: `update_donatur`
- Path params:
  - `id` (string, ID donatur)

Request body: sama seperti `POST /donatur`.

Response sukses `200`:

```json
{
  "pesan": "Data donatur berhasil diperbarui"
}
```

Error penting:

- `400` format JSON tidak valid atau validasi gagal.
- `404` data donatur tidak ditemukan.
- `500` gagal mengupdate data donatur.

### PATCH /donatur/{id}/label

- Permission: `update_donatur`
- Path params:
  - `id` (string, ID donatur)

Request body:

```json
{
  "label": "Loyal"
}
```

Catatan perilaku:

- Field `label` boleh string kosong untuk menghapus label.

Response sukses `200`:

```json
{
  "pesan": "Label berhasil diperbarui",
  "label": "Loyal"
}
```

Error penting:

- `400` format JSON tidak valid.
- `500` gagal mengupdate label.

## 4. Domain Transaksi

### Skema Transaksi (contoh)

```json
{
  "id": "TRX-260409-ABCDE",
  "tanggal_transaksi": "2026-04-09T00:00:00Z",
  "program_id": "PRG-260409-ABCDE",
  "rekening_id": "REK-260409-ABCDE",
  "sumber_id": "SRC-260409-ABCDE",
  "nominal": 250000,
  "status": "success",
  "donatur_id": "DNT-260409-ABCDE",
  "created_by_id": "USR-260409-ABCD",
  "created_at": "2026-04-09T02:00:00Z",
  "updated_at": "2026-04-09T02:00:00Z"
}
```

### GET /transaksi

- Permission: `read_transaksi`
- Path params: tidak ada.

Query params:

- `page` (int, default 1)
- `limit` (int, default 20)
- `q` (string)
- `start_date` (string, `YYYY-MM-DD`)
- `end_date` (string, `YYYY-MM-DD`)
- `program_id` (string)
- `rekening_id` (string)
- `sumber_id` (string)
- `status` (string: `success`, `duplicate`)
- `nominal_operator` (string)
- `nominal_value` (number/string)
- `nominal_from` (number/string)
- `nominal_to` (number/string)
- `scope_mode` (opsional)

Response sukses `200`:

```json
{
  "data": [
    {
      "id": "TRX-260409-ABCDE",
      "tanggal_transaksi": "2026-04-09T00:00:00Z",
      "program_id": "PRG-260409-ABCDE",
      "rekening_id": "REK-260409-ABCDE",
      "sumber_id": "SRC-260409-ABCDE",
      "nominal": 250000,
      "status": "success",
      "donatur_id": "DNT-260409-ABCDE"
    }
  ],
  "meta": {
    "total_data": 1,
    "page": 1,
    "limit": 20,
    "total_page": 1
  },
  "summary": {
    "total_donasi": 250000,
    "total_transaksi": 1,
    "donatur_unik": 1,
    "rata_rata_donasi": 250000,
    "trend_donasi": 0,
    "trend_transaksi": 0,
    "trend_donatur": 0,
    "trend_rata_rata": 0
  }
}
```

Error penting:

- `400` `scope_mode` tidak valid.
- `403` akses data ditolak oleh scope role.
- `500` gagal mengambil daftar transaksi.

### GET /transaksi/export

- Permission: `export_transaksi`
- Path params: tidak ada.
- Query params: sama seperti `GET /transaksi` (tanpa pagination wajib).

Response sukses `200`:

- Konten berupa file CSV (`text/csv`) dengan header download.
- Nama file: `Laporan_Transaksi_YYYY-MM-DD.csv`.

Error penting:

- `400` `scope_mode` tidak valid.
- `403` akses data ditolak oleh scope role.
- `500` gagal mengekspor data transaksi.

### GET /transaksi/{id}

- Permission: `read_transaksi`
- Path params:
  - `id` (string, ID transaksi)

Query params:

- `scope_mode` (opsional)

Response sukses `200`:

```json
{
  "id": "TRX-260409-ABCDE",
  "tanggal_transaksi": "2026-04-09T00:00:00Z",
  "program_id": "PRG-260409-ABCDE",
  "rekening_id": "REK-260409-ABCDE",
  "sumber_id": "SRC-260409-ABCDE",
  "nominal": 250000,
  "status": "success"
}
```

Error penting:

- `400` `scope_mode` tidak valid.
- `403` akses data ditolak oleh scope role.
- `404` data transaksi tidak ditemukan.

### POST /transaksi

- Permission: `create_transaksi`
- Path params: tidak ada.

Request body:

```json
{
  "donatur_id": "DNT-260409-ABCDE",
  "sapaan": "Bapak",
  "nama_donatur": "Ahmad",
  "nomor_hp_donatur": "6281234567890",
  "tanggal_transaksi": "2026-04-09",
  "program_id": "PRG-260409-ABCDE",
  "rekening_id": "REK-260409-ABCDE",
  "sumber_id": "SRC-260409-ABCDE",
  "nominal": 250000,
  "status": "success"
}
```

Validasi penting:

- `tanggal_transaksi`, `program_id`, `rekening_id`, `sumber_id`, `nominal`, `status` wajib.
- `status` wajib salah satu: `pending`, `success`, `failed`, `duplicate`.
- Jika `donatur_id` kosong, maka `nama_donatur` dan `nomor_hp_donatur` wajib diisi.
- Untuk donatur baru, nomor HP harus diawali `628` dan minimal 10 digit.
- `tanggal_transaksi` tidak boleh lebih dari hari ini (zona waktu WIB).

Response sukses `201`:

```json
{
  "pesan": "Transaksi berhasil disimpan"
}
```

Error penting:

- `400` format JSON tidak valid, validasi gagal, format tanggal salah, atau tanggal melebihi hari ini.
- `403` akses ditolak sesuai scope role.
- `500` gagal menyimpan transaksi.

### PUT /transaksi/{id}

- Permission: `update_transaksi`
- Path params:
  - `id` (string, ID transaksi)

Request body:

```json
{
  "donatur_id": "DNT-260409-ABCDE",
  "sapaan": "Bapak",
  "nama_donatur": "Ahmad",
  "nomor_hp_donatur": "6281234567890",
  "tanggal_transaksi": "2026-04-09",
  "program_id": "PRG-260409-ABCDE",
  "rekening_id": "REK-260409-ABCDE",
  "sumber_id": "SRC-260409-ABCDE",
  "nominal": 250000,
  "status": "success"
}
```

Catatan perilaku saat ini:

- Payload tetap divalidasi dengan skema `TransaksiInput`.
- Proses update saat ini mengubah: `donatur_id`, `program_id`, `rekening_id`, `sumber_id`, `nominal`, `status`.
- Field `tanggal_transaksi` ada di payload namun saat ini tidak diterapkan pada update.

Response sukses `200`:

```json
{
  "pesan": "Data transaksi berhasil diperbarui"
}
```

Error penting:

- `400` format JSON tidak valid atau validasi gagal.
- `403` akses ditolak sesuai scope role.
- `404` data transaksi tidak ditemukan.
- `500` gagal mengupdate data transaksi.

### DELETE /transaksi/{id}

- Permission: `delete_transaksi`
- Path params:
  - `id` (string, ID transaksi)

Response sukses `200`:

```json
{
  "pesan": "Data transaksi berhasil dihapus"
}
```

Error penting:

- `404` data transaksi tidak ditemukan.
- `500` gagal menghapus transaksi.

## 5. Domain Leaderboard

### Query params umum leaderboard

- `start_date` (string, `YYYY-MM-DD`)
- `end_date` (string, `YYYY-MM-DD`)
- `limit` (int, opsional)
- `scope_mode` (opsional)

### GET /leaderboard/cs

- Permission: `read_transaksi`

Response sukses `200`:

```json
{
  "data": [
    {
      "rank": 1,
      "user_id": "USR-260409-ABCD",
      "nama_panggilan": "Andi",
      "nama_lengkap": "Andi Saputra",
      "tim_id": "TIM-260409-ABCD",
      "cabang_id": "CBG-260409-ABCD",
      "total_nominal": 5000000,
      "total_transaksi": 20
    }
  ]
}
```

Error penting:

- `400` `scope_mode` tidak valid.
- `403` akses data ditolak oleh scope role.
- `500` gagal mengambil leaderboard CS.

### GET /leaderboard/tim

- Permission: `read_transaksi`

Response sukses `200`:

```json
{
  "data": [
    {
      "rank": 1,
      "tim_id": "TIM-260409-ABCD",
      "nama_tim": "Tim A",
      "cabang_id": "CBG-260409-ABCD",
      "nama_cabang": "Cabang Jakarta",
      "total_nominal": 12000000,
      "total_transaksi": 52
    }
  ]
}
```

Error penting:

- `400` `scope_mode` tidak valid.
- `403` akses data ditolak oleh scope role.
- `500` gagal mengambil leaderboard Tim.

### GET /leaderboard/cabang

- Permission: `read_transaksi`

Response sukses `200`:

```json
{
  "data": [
    {
      "rank": 1,
      "cabang_id": "CBG-260409-ABCD",
      "nama_cabang": "Cabang Jakarta",
      "total_nominal": 25000000,
      "total_transaksi": 100
    }
  ]
}
```

Error penting:

- `400` `scope_mode` tidak valid.
- `403` akses data ditolak oleh scope role.
- `500` gagal mengambil leaderboard Cabang.

### GET /leaderboard/donatur

- Permission: `read_donatur`

Response sukses `200`:

```json
{
  "data": [
    {
      "rank": 1,
      "donatur_id": "DNT-260409-ABCDE",
      "nama_donatur": "Ahmad",
      "nomor_hp_donatur": "6281234567890",
      "pic_id": "USR-260409-ABCD",
      "total_nominal": 7500000,
      "total_transaksi": 30
    }
  ]
}
```

Error penting:

- `400` `scope_mode` tidak valid.
- `403` akses data ditolak oleh scope role.
- `500` gagal mengambil leaderboard Donatur.

## 6. Domain Label

### GET /labels

- Permission: `read_labels`
- Query params:
  - `scope_mode` (opsional): Jika diset "donatur", hanya mengambil label yang aktif digunakan oleh donatur dalam scope akses user.

Response sukses `200`:

```json
{
  "data": [
    {
      "id": "LBL-260409-ABCDE",
      "nama_label": "Loyal",
      "created_by_id": "USR-260409-ABCD",
      "created_by": {
        "id": "USR-260409-ABCD",
        "nama": "Nama User"
      },
      "created_at": "2026-04-09T02:00:00Z",
      "updated_at": "2026-04-09T02:00:00Z"
    }
  ]
}
```

Error penting:

- `400` `scope_mode` tidak valid.
- `403` akses data ditolak oleh scope role.
- `500` gagal mengambil data label.

## 7. Domain Domisili

### GET /domisili

- Permission: `read_domisili`

Response sukses `200`:

```json
{
  "data": [
    {
      "id": "31.74",
      "nama_domisili": "Kota Administrasi Jakarta Selatan",
      "created_at": "2026-04-09T02:00:00Z",
      "updated_at": "2026-04-09T02:00:00Z"
    }
  ]
}
```

Error penting:

- `500` gagal mengambil data domisili.

### GET /seed-domisili

- Permission: `create_domisili`

Response sukses `200`:

```json
{
  "pesan": "Mantap! Berhasil memindahkan 514 data Kota/Kabupaten ke database lokal."
}
```

Catatan perilaku:

- Endpoint ini memanggil API eksternal wilayah.id.
- Bisa memakan waktu lebih lama dari endpoint biasa.
- Melakukan upsert domisili berdasarkan `id` kode wilayah.

Error penting:

- `500` gagal mengambil data provinsi atau memproses data domisili.

## 8. Domain Program

### GET /program

- Permission: `read_program`
- Query params: tidak ada.

Response sukses `200`:

```json
{
  "data": [
    {
      "id": "PRG-260409-ABCDE",
      "nama_program": "Program Pendidikan",
      "tipe_program": "Sosial",
      "tims": [
        {
          "id": "TIM-260409-ABCD",
          "nama_tim": "Tim A"
        }
      ],
      "created_at": "2026-04-09T02:00:00Z",
      "updated_at": "2026-04-09T02:00:00Z"
    }
  ]
}
```

Catatan perilaku:

- Filter berdasarkan scope akses:
  - Super Admin: Melihat semua program.
  - Admin Cabang/Manajer/Direktur: Hanya program yang terhubung ke tim di cabangnya.
  - CS/Koordinator/SPV: Hanya program yang terhubung ke timnya sendiri.

Error penting:

- `401` user tidak valid.
- `500` gagal mengambil data program.

### POST /program

- Permission: `create_program`

Request body:

```json
{
  "nama_program": "Program Pendidikan",
  "tipe_program": "Sosial",
  "tim_ids": ["TIM-260409-ABCD"]
}
```

Response sukses `201`:

```json
{
  "pesan": "Program berhasil disimpan",
  "data": {
    "id": "PRG-260409-ABCDE",
    "nama_program": "Program Pendidikan",
    "tipe_program": "Sosial"
  }
}
```

Error penting:

- `400` input tidak valid atau validasi gagal.
- `500` gagal menyimpan data program.

### PUT /program/{id}

- Permission: `update_program`
- Auth: token Bearer valid.
- Path params: `id` program.

Request body sama dengan `POST /program`.

Response sukses `200`:

```json
{
  "pesan": "Program berhasil diperbarui"
}
```

Error penting:

- `400` input tidak valid.
- `404` program tidak ditemukan.
- `500` gagal mengupdate program.

## 9. Domain Rekening

### GET /rekening

- Permission: `read_rekening`
- Query params: tidak ada.

Response sukses `200`:

```json
{
  "data": [
    {
      "id": "REK-260409-ABCDE",
      "nama_rekening": "Yayasan ABC",
      "nomor_rekening": "1234567890",
      "nama_bank": "BCA",
      "kode_bank": "014",
      "alias": "BCA Operasional",
      "tims": [
        {
          "id": "TIM-260409-ABCD",
          "nama_tim": "Tim A"
        }
      ],
      "created_at": "2026-04-09T02:00:00Z",
      "updated_at": "2026-04-09T02:00:00Z"
    }
  ]
}
```

Catatan perilaku:

- Filter berdasarkan scope akses:
  - Super Admin: Melihat semua rekening.
  - Admin Cabang/Manajer/Direktur: Hanya rekening yang terhubung ke tim di cabangnya.
  - CS/Koordinator/SPV: Hanya rekening yang terhubung ke timnya sendiri.

Error penting:

- `401` user tidak valid.
- `500` gagal mengambil data rekening.

### POST /rekening

- Permission: `create_rekening`

Request body:

```json
{
  "nama_rekening": "Yayasan ABC",
  "nomor_rekening": "1234567890",
  "nama_bank": "BCA",
  "kode_bank": "014",
  "alias": "BCA Operasional",
  "tim_ids": ["TIM-260409-ABCD"]
}
```

Response sukses `201`:

```json
{
  "pesan": "Rekening berhasil disimpan",
  "data": {
    "id": "REK-260409-ABCDE",
    "nama_rekening": "Yayasan ABC",
    "nomor_rekening": "1234567890"
  }
}
```

Error penting:

- `400` input tidak valid atau validasi gagal.
- `500` gagal menyimpan data rekening.

### PUT /rekening/{id}

- Permission: `update_rekening`
- Auth: token Bearer valid.
- Path params: `id` rekening.

Request body sama dengan `POST /rekening`.

Response sukses `200`:

```json
{
  "pesan": "Data rekening berhasil diperbarui"
}
```

Error penting:

- `400` input tidak valid.
- `404` data rekening tidak ditemukan.
- `500` gagal mengupdate data rekening.

## 10. Domain Sumber Transaksi

### GET /sumber

- Permission: `read_sumber`

Response sukses `200`:

```json
{
  "data": [
    {
      "id": "SRC-260409-ABCDE",
      "sumber_transaksi": "Transfer Bank",
      "created_at": "2026-04-09T02:00:00Z",
      "updated_at": "2026-04-09T02:00:00Z"
    }
  ]
}
```

Error penting:

- `500` gagal mengambil data sumber transaksi.

### POST /sumber

- Permission: `create_sumber`

Request body:

```json
{
  "sumber_transaksi": "Transfer Bank"
}
```

Response sukses `201`:

```json
{
  "pesan": "Sumber transaksi berhasil disimpan",
  "data": {
    "id": "SRC-260409-ABCDE",
    "sumber_transaksi": "Transfer Bank"
  }
}
```

Error penting:

- `400` input tidak valid atau validasi gagal.
- `500` gagal menyimpan data sumber transaksi.

### PUT /sumber/{id}

- Permission: `update_sumber`
- Auth: token Bearer valid.
- Path params: `id` sumber transaksi.

Request body sama dengan `POST /sumber`.

Response sukses `200`:

```json
{
  "pesan": "Sumber transaksi berhasil diperbarui"
}
```

Error penting:

- `400` input tidak valid.
- `404` sumber transaksi tidak ditemukan.
- `500` gagal mengupdate sumber transaksi.

## 11. Domain Cabang

### GET /cabang

- Permission: `read_cabang`

Query params:

- `page` (int, default 1)
- `limit` (int, default 20)
- `q` (string) atau `search` (string)
- `status` (string: `aktif` atau `nonaktif`; variasi seperti `inactive` dinormalisasi)

Response sukses `200`:

```json
{
  "data": [
    {
      "id": "CBG-260409-ABCD",
      "nama_cabang": "Cabang Jakarta",
      "alamat": "Jl. Sudirman 1",
      "status": "aktif",
      "tim_count": 5,
      "user_count": 20,
      "created_at": "2026-04-09T02:00:00Z",
      "updated_at": "2026-04-09T02:00:00Z"
    }
  ],
  "meta": {
    "total_data": 1,
    "page": 1,
    "limit": 20,
    "total_page": 1
  }
}
```

Error penting:

- `400` filter status cabang tidak valid.
- `500` gagal mengambil data cabang.

### GET /cabang/{id}

- Permission: `read_cabang`
- Path params:
  - `id` (string, ID cabang)

Response sukses `200`:

```json
{
  "id": "CBG-260409-ABCD",
  "nama_cabang": "Cabang Jakarta",
  "alamat": "Jl. Sudirman 1",
  "status": "aktif"
}
```

Error penting:

- `404` data cabang tidak ditemukan.

### POST /cabang

- Permission: `create_cabang`

Request body:

```json
{
  "nama_cabang": "Cabang Jakarta",
  "alamat": "Jl. Sudirman 1",
  "status": "aktif"
}
```

Validasi penting:

- `nama_cabang` dan `alamat` wajib.
- `status` opsional, default `aktif`.

Response sukses `201`:

```json
{
  "pesan": "Cabang berhasil ditambahkan",
  "data": {
    "id": "CBG-260409-ABCD",
    "nama_cabang": "Cabang Jakarta",
    "alamat": "Jl. Sudirman 1",
    "status": "aktif"
  }
}
```

Error penting:

- `400` format JSON tidak valid, validasi gagal, atau status cabang tidak valid.
- `500` gagal menyimpan cabang.

### PUT /cabang/{id}

- Permission: `update_cabang`
- Path params:
  - `id` (string, ID cabang)

Request body:

```json
{
  "nama_cabang": "Cabang Jakarta Baru",
  "alamat": "Jl. Sudirman 10",
  "status": "nonaktif"
}
```

Response sukses `200`:

```json
{
  "pesan": "Data cabang berhasil diperbarui"
}
```

Error penting:

- `400` format JSON tidak valid, validasi gagal, atau status cabang tidak valid.
- `404` data cabang tidak ditemukan.
- `500` gagal mengupdate cabang.

### PATCH /cabang/{id}/status

- Permission: `update_cabang`
- Path params:
  - `id` (string, ID cabang)

Request body:

```json
{
  "status": "nonaktif"
}
```

Response sukses `200`:

```json
{
  "pesan": "Status cabang berhasil diperbarui",
  "data": {
    "id": "CBG-260409-ABCD",
    "status": "nonaktif"
  }
}
```

Error penting:

- `400` format JSON tidak valid, validasi gagal, atau status cabang tidak valid.
- `404` data cabang tidak ditemukan.
- `500` gagal mengubah status cabang.

### DELETE /cabang/{id}

- Permission: `delete_cabang`
- Path params:
  - `id` (string, ID cabang)

Response sukses `200`:

```json
{
  "pesan": "Data cabang berhasil dihapus"
}
```

Error penting:

- `404` data cabang tidak ditemukan.
- `409` cabang masih punya relasi tim/user.
- `500` gagal menghapus cabang.

## 12. Domain Tim

### GET /tim

- Permission: `read_tim`

Query params:

- `page` (int, default 1)
- `limit` (int, default 20)
- `q` (string) atau `search` (string)
- `cabang_id` (string)

Response sukses `200`:

```json
{
  "data": [
    {
      "id": "TIM-260409-ABCD",
      "nama_tim": "Tim A",
      "status": "aktif",
      "cabang_id": "CBG-260409-ABCD",
      "user_count": 5,
      "created_at": "2026-04-09T02:00:00Z",
      "updated_at": "2026-04-09T02:00:00Z"
    }
  ],
  "meta": {
    "total_data": 1,
    "page": 1,
    "limit": 20,
    "total_page": 1
  }
}
```

Error penting:

- `500` gagal mengambil data tim.

### GET /tim/{id}

- Permission: `read_tim`
- Path params:
  - `id` (string, ID tim)

Response sukses `200`:

```json
{
  "id": "TIM-260409-ABCD",
  "nama_tim": "Tim A",
  "status": "aktif",
  "cabang_id": "CBG-260409-ABCD"
}
```

Error penting:

- `404` data tim tidak ditemukan.
- `500` gagal mengambil detail tim.

### POST /tim

- Permission: `create_tim`

Request body:

```json
{
  "nama_tim": "Tim A",
  "cabang_id": "CBG-260409-ABCD",
  "program_ids": ["PRG-260409-ABCDE"],
  "rekening_ids": ["REK-260409-ABCDE"],
  "status": "aktif"
}
```

Validasi penting:

- `nama_tim` dan `cabang_id` wajib.
- `program_ids` dan `rekening_ids` opsional.
- `status` opsional, akan dinormalisasi.

Response sukses `201`:

```json
{
  "pesan": "Tim disimpan",
  "data": {
    "id": "TIM-260409-ABCD",
    "nama_tim": "Tim A",
    "cabang_id": "CBG-260409-ABCD",
    "status": "aktif"
  }
}
```

Error penting:

- `400` format JSON tidak valid, validasi gagal, relasi tidak valid, atau status tim tidak valid.
- `500` gagal menyimpan tim.

### PUT /tim/{id}

- Permission: `update_tim`
- Path params:
  - `id` (string, ID tim)

Request body: sama seperti `POST /tim`.

Response sukses `200`:

```json
{
  "pesan": "Tim diperbarui"
}
```

Error penting:

- `400` format JSON tidak valid, validasi gagal, relasi tidak valid, atau status tim tidak valid.
- `404` data tim tidak ditemukan.
- `500` gagal update tim.

### PATCH /tim/{id}/status

- Permission: `update_tim`
- Path params:
  - `id` (string, ID tim)

Request body:

```json
{
  "status": "nonaktif"
}
```

Response sukses `200`:

```json
{
  "pesan": "Status tim berhasil diperbarui",
  "data": {
    "id": "TIM-260409-ABCD",
    "status": "nonaktif"
  }
}
```

Error penting:

- `400` format JSON tidak valid, validasi gagal, atau status tim tidak valid.
- `404` data tim tidak ditemukan.
- `500` gagal mengubah status tim.

### DELETE /tim/{id}

- Permission: `delete_tim`
- Path params:
  - `id` (string, ID tim)

Response sukses `200`:

```json
{
  "pesan": "Tim dihapus"
}
```

Error penting:

- `404` data tim tidak ditemukan.
- `500` gagal menghapus tim.

## 13. Domain User

### GET /user

- Permission: `read_user`

Query params:

- `page` (int, default 1)
- `limit` (int, default 20)
- `q` (string) atau `search` (string)
- `role_id` (string)
- `tim_id` (string)
- `cabang_id` (string)
- `status` (string: `aktif` atau `nonaktif`; variasi dinormalisasi)

Response sukses `200`:

```json
{
  "data": [
    {
      "id": "USR-260409-ABCD",
      "nama_panggilan": "Andi",
      "nama_lengkap": "Andi Saputra",
      "email": "andi@contoh.com",
      "nomor_hp": "6281234567890",
      "status": "aktif",
      "role_id": "ROL-260409-ABCD",
      "cabang_id": "CBG-260409-ABCD",
      "tim_id": "TIM-260409-ABCD",
      "created_at": "2026-04-09T02:00:00Z",
      "updated_at": "2026-04-09T02:00:00Z"
    }
  ],
  "meta": {
    "total_data": 1,
    "page": 1,
    "limit": 20,
    "total_page": 1
  }
}
```

Error penting:

- `400` filter status user tidak valid.
- `500` gagal mengambil data user.

### GET /user/{id}

- Permission: `read_user`
- Path params:
  - `id` (string, ID user)

Response sukses `200`:

```json
{
  "id": "USR-260409-ABCD",
  "nama_panggilan": "Andi",
  "nama_lengkap": "Andi Saputra",
  "email": "andi@contoh.com",
  "nomor_hp": "6281234567890",
  "status": "aktif",
  "role_id": "ROL-260409-ABCD",
  "cabang_id": "CBG-260409-ABCD",
  "tim_id": "TIM-260409-ABCD"
}
```

Error penting:

- `404` data user tidak ditemukan.

### POST /user

- Permission: `create_user`

Request body:

```json
{
  "nama_lengkap": "Andi Saputra",
  "nama_panggilan": "Andi",
  "email": "andi@contoh.com",
  "nomor_hp": "6281234567890",
  "password": "rahasia123",
  "role_id": "ROL-260409-ABCD",
  "cabang_id": "CBG-260409-ABCD",
  "tim_id": "TIM-260409-ABCD",
  "status": "aktif"
}
```

Validasi penting:

- `nama_lengkap`, `email`, `nomor_hp`, `role_id`, `cabang_id` wajib.
- `password` wajib untuk create.
- `tim_id` opsional (boleh `null`).
- `status` opsional, default `aktif`.

Response sukses `201`:

```json
{
  "pesan": "User disimpan",
  "data": {
    "id": "USR-260409-ABCD",
    "nama_lengkap": "Andi Saputra",
    "email": "andi@contoh.com",
    "status": "aktif"
  }
}
```

Error penting:

- `400` format JSON tidak valid, validasi gagal, password kosong, relasi tidak valid, atau status user tidak valid.
- `500` gagal menyimpan user.

### PUT /user/{id}

- Permission: `update_user`
- Path params:
  - `id` (string, ID user)

Request body:

```json
{
  "nama_lengkap": "Andi Saputra",
  "nama_panggilan": "Andi",
  "email": "andi@contoh.com",
  "nomor_hp": "6281234567890",
  "password": "",
  "role_id": "ROL-260409-ABCD",
  "cabang_id": "CBG-260409-ABCD",
  "tim_id": "TIM-260409-ABCD",
  "status": "aktif"
}
```

Catatan perilaku:

- Jika `password` diisi, password akan di-hash ulang.
- Jika `password` kosong, password lama dipertahankan.

Response sukses `200`:

```json
{
  "pesan": "User diperbarui"
}
```

Error penting:

- `400` format JSON tidak valid, validasi gagal, relasi tidak valid, atau status user tidak valid.
- `404` data user tidak ditemukan.
- `500` gagal memperbarui user.

### PATCH /user/{id}/status

- Permission: `update_user`
- Path params:
  - `id` (string, ID user)

Request body:

```json
{
  "status": "nonaktif"
}
```

Response sukses `200`:

```json
{
  "pesan": "Status user berhasil diperbarui",
  "data": {
    "id": "USR-260409-ABCD",
    "status": "nonaktif"
  }
}
```

Error penting:

- `400` format JSON tidak valid, validasi gagal, atau status user tidak valid.
- `404` data user tidak ditemukan.
- `500` gagal mengubah status user.

### DELETE /user/{id}

- Permission: `delete_user`
- Path params:
  - `id` (string, ID user)

Response sukses `200`:

```json
{
  "pesan": "User dihapus"
}
```

Error penting:

- `500` gagal menghapus user.

## 14. Domain Role

### GET /role

- Permission: `read_user`
- Query params: tidak ada.

Response sukses `200`:

```json
{
  "data": [
    {
      "id": "ROL-260409-ABCD",
      "nama_role": "CS",
      "permissions": ["read_transaksi", "create_transaksi"],
      "created_at": "2026-04-09T02:00:00Z",
      "updated_at": "2026-04-09T02:00:00Z"
    }
  ]
}
```

Error penting:

- `500` gagal mengambil data role.

## 15. Ringkasan Endpoint

Total endpoint terdaftar di router saat ini: `45 endpoint`.

Rincian jumlah per domain:

- Auth: 1
- Donatur: 6
- Transaksi: 6
- Leaderboard: 4
- Label: 1
- Domisili: 2
- Program: 2
- Rekening: 2
- Sumber Transaksi: 2
- Cabang: 6
- Tim: 6
- User: 6
- Role: 1

Dokumen ini sudah siap dipakai frontend sebagai acuan integrasi endpoint.
