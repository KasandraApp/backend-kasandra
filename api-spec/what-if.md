# API Specification - What-If

> File: what-if.md  
> Last Updated: 2026-07-16  
> PRD Reference: Section 8.4 - What-If Engine

---

## POST /api/v1/what-if/simulate

### Title

> Run a what-if simulation

### Description

Endpoint ini menjalankan simulasi perubahan parameter terhadap hasil forecast saat ini tanpa mengubah data asli. Tujuan utamanya adalah mempermudah pengguna melihat dampak perubahan biaya, penjualan, atau parameter lain secara real-time.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Simulasi dibatasi berdasarkan profil usaha aktif |

---

### Request Body (JSON)

```json
{
  "scenarioName": "Kenaikan biaya operasional 10%",
  "parameters": {
    "expenseIncreasePercentage": 10,
    "dailySalesChange": -2,
    "initialStockChange": -10
  }
}
```

**Field Definitions**

| Field                  | Type   | Required | Description |
| ---------------------- | ------ | -------- | ----------- |
| scenarioName           | string | Yes      | Nama skenario simulasi |
| parameters            | object | Yes      | Parameter simulasi |
| parameters.expenseIncreasePercentage | number | No | Persentase kenaikan pengeluaran |
| parameters.dailySalesChange | number | No | Perubahan rata-rata penjualan per hari |
| parameters.initialStockChange | number | No | Perubahan stok awal |

---

### Responses

#### Success - 200 OK

```json
{
  "success": true,
  "message": "Simulation generated",
  "data": {
    "id": "uuid",
    "scenarioName": "Kenaikan biaya operasional 10%",
    "result": {
      "cashProjection": [{ "date": "2026-07-16", "balance": 2200000 }],
      "inventoryProjection": [{ "date": "2026-07-16", "remainingDays": 20 }]
    }
  }
}
```

#### Error Responses

**400 Bad Request**

```json
{
  "error": "Invalid simulation parameters"
}
```

---

### Notes (Business Rules)

- [x] Simulasi harus menghasilkan output tanpa memodifikasi data baseline.
- [x] Hasil simulasi harus bisa diperbarui real-time saat parameter berubah.
- [x] MVP tetap memakai logika linier, bukan model ML penuh.

---

## GET /api/v1/what-if/history

### Title

> List what-if simulation history

### Description

Endpoint ini menampilkan daftar riwayat simulasi yang pernah dibuat oleh pengguna dalam profil usaha tertentu.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Riwayat dibatasi ke profil usaha aktif |

---

### Query Parameters

| Name  | Type    | Required | Default | Description |
| ----- | ------- | -------- | ------- | ----------- |
| page  | integer | No       | 1       | Halaman data |
| limit | integer | No       | 20      | Jumlah item per halaman |

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
        "scenarioName": "Kenaikan biaya operasional 10%",
        "createdAt": "2026-07-16T10:30:00Z"
      }
    ]
  }
}
```

---

## GET /api/v1/what-if/{id}

### Title

> Get what-if simulation detail

### Description

Endpoint ini mengembalikan detail satu skenario simulasi tertentu.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Hanya skenario milik profil usaha yang valid yang dapat dibuka |

---

### Path Parameters

| Name | Type   | Required | Description |
| ---- | ------ | -------- | ----------- |
| id   | string | Yes      | ID skenario simulasi |

---

### Responses

#### Success - 200 OK

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "scenarioName": "Kenaikan biaya operasional 10%",
    "parameters": {
      "expenseIncreasePercentage": 10
    },
    "result": {
      "cashProjection": []
    }
  }
}
```

---

## DELETE /api/v1/what-if/{id}

### Title

> Delete what-if simulation

### Description

Endpoint ini menghapus riwayat skenario simulasi tertentu.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Hanya skenario milik profil usaha yang valid yang dapat dihapus |

---

### Responses

#### Success - 200 OK

```json
{
  "success": true,
  "message": "Simulation deleted"
}
```
