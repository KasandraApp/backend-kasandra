# API Specification - Cash

> File: cash.md  
> Last Updated: 2026-07-16  
> PRD Reference: Section 8.2 - Data Management

---

## GET /api/v1/cash-transactions

### Title

> List cash transactions

### Description

Endpoint ini digunakan untuk mengambil daftar transaksi kas harian yang terkait dengan profil usaha aktif pengguna. Data ini menjadi dasar perhitungan proyeksi kas pada dashboard.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Data dibatasi berdasarkan profil usaha yang sedang aktif |

---

### Query Parameters

| Name      | Type    | Required | Default | Description |
| --------- | ------- | -------- | ------- | ----------- |
| page      | integer | No       | 1       | Halaman data |
| limit     | integer | No       | 20      | Jumlah item per halaman |
| startDate | string  | No       | -       | Filter tanggal mulai |
| endDate   | string  | No       | -       | Filter tanggal akhir |
| type      | string  | No       | -       | Filter income / expense |
| search    | string  | No       | -       | Pencarian deskripsi |
| sortBy    | string  | No       | transactionDate | Kolom sort |
| order     | string  | No       | desc    | asc atau desc |

---

### Responses

#### Success - 200 OK

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "transactionDate": "2026-07-16",
        "type": "expense",
        "amount": 150000,
        "description": "Pembelian plastik"
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

#### Error Responses

**401 Unauthorized**

```json
{
  "error": "Unauthorized"
}
```

---

### Notes (Business Rules)

- [x] Data transaksi wajib terkait dengan profil usaha yang aktif.
- [x] Jumlah transaksi harus berupa angka positif.
- [x] Tanggal transaksi harus valid.

---

## POST /api/v1/cash-transactions

### Title

> Create a new cash transaction

### Description

Endpoint ini digunakan untuk mencatat pemasukan atau pengeluaran harian.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Data dimasukkan ke profil usaha aktif |

---

### Request Body (JSON)

```json
{
  "transactionDate": "2026-07-16",
  "type": "income",
  "amount": 2500000,
  "description": "Penjualan hari ini"
}
```

**Field Definitions**

| Field           | Type   | Required | Description |
| --------------- | ------ | -------- | ----------- |
| transactionDate | string | Yes      | Tanggal transaksi |
| type            | string | Yes      | income atau expense |
| amount          | number | Yes      | Jumlah nominal |
| description     | string | No       | Keterangan transaksi |

---

### Responses

#### Success - 201 Created

```json
{
  "success": true,
  "message": "Cash transaction created",
  "data": {
    "id": "uuid",
    "transactionDate": "2026-07-16",
    "type": "income",
    "amount": 2500000,
    "description": "Penjualan hari ini"
  }
}
```

#### Error Responses

**400 Bad Request**

```json
{
  "error": "Invalid request body"
}
```

**401 Unauthorized**

```json
{
  "error": "Unauthorized"
}
```

---

## GET /api/v1/cash-transactions/{id}

### Title

> Get cash transaction detail

### Description

Endpoint ini mengembalikan detail satu transaksi kas tertentu.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Hanya transaksi milik profil usaha yang diizinkan |

---

### Path Parameters

| Name | Type   | Required | Description |
| ---- | ------ | -------- | ----------- |
| id   | string | Yes      | ID transaksi kas |

---

### Responses

#### Success - 200 OK

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "transactionDate": "2026-07-16",
    "type": "expense",
    "amount": 150000,
    "description": "Pembelian plastik"
  }
}
```

#### Error Responses

**404 Not Found**

```json
{
  "error": "Cash transaction not found"
}
```

---

## PATCH /api/v1/cash-transactions/{id}

### Title

> Update cash transaction

### Description

Endpoint ini digunakan untuk memperbarui data transaksi kas yang sudah ada.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Hanya pemilik data yang dapat mengubah |

---

### Request Body (JSON)

```json
{
  "amount": 180000,
  "description": "Pembelian plastik ukuran besar"
}
```

---

### Responses

#### Success - 200 OK

```json
{
  "success": true,
  "message": "Cash transaction updated",
  "data": {
    "id": "uuid",
    "amount": 180000
  }
}
```

---

## DELETE /api/v1/cash-transactions/{id}

### Title

> Delete cash transaction

### Description

Endpoint ini menghapus transaksi kas tertentu dari sistem.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Hanya data milik profil usaha yang valid yang dapat dihapus |

---

### Responses

#### Success - 200 OK

```json
{
  "success": true,
  "message": "Cash transaction deleted"
}
```

#### Error Responses

**404 Not Found**

```json
{
  "error": "Cash transaction not found"
}
```
