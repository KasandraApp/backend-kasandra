# API Specification - Forecast

> File: forecast.md  
> Last Updated: 2026-07-16  
> PRD Reference: Section 8.3 - Forecast Engine

---

## GET /api/v1/forecast

### Title

> Get latest forecast result

### Description

Endpoint ini mengembalikan hasil proyeksi kas dan stok terkini untuk profil usaha aktif. Hasil ini dipakai untuk dashboard visualisasi dan alert.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Hasil forecast dibatasi berdasarkan profil usaha aktif |

---

### Query Parameters

| Name | Type | Required | Default | Description |
| ---- | ---- | -------- | ------- | ----------- |
| -    | -    | -        | -       | -           |

---

### Responses

#### Success - 200 OK

```json
{
  "success": true,
  "data": {
    "forecastType": "combined",
    "horizonDays": 30,
    "cashProjection": [
      { "date": "2026-07-16", "balance": 2500000 },
      { "date": "2026-07-17", "balance": 2400000 }
    ],
    "inventoryProjection": [
      { "date": "2026-07-16", "remainingDays": 30 },
      { "date": "2026-07-17", "remainingDays": 29 }
    ],
    "generatedAt": "2026-07-16T10:00:00Z"
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

- [x] Forecast MVP menggunakan logika linier deterministik.
- [x] Horizon default adalah 30 hari.
- [x] Perubahan data operasional harus memicu recalculation.

---

## POST /api/v1/forecast/recalculate

### Title

> Trigger manual forecast recalculation

### Description

Endpoint ini dipakai untuk menghitung ulang proyeksi secara manual setelah perubahan data transaksi atau stok.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Recalculation dilakukan untuk profil usaha aktif |

---

### Request Body (JSON)

```json
{
  "force": true
}
```

**Field Definitions**

| Field | Type    | Required | Description |
| ----- | ------- | -------- | ----------- |
| force | boolean | No       | Paksa penghitungan ulang meskipun data tidak berubah |

---

### Responses

#### Success - 200 OK

```json
{
  "success": true,
  "message": "Forecast recalculated",
  "data": {
    "forecastType": "combined",
    "horizonDays": 30
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
