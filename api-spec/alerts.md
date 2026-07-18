# API Specification - Alerts

> File: alerts.md  
> Last Updated: 2026-07-16  
> PRD Reference: Section 8.5 - Alert Engine

---

## GET /api/v1/alerts

### Title

> List alerts for active business profile

### Description

Endpoint ini menampilkan alert yang dihasilkan sistem berdasarkan hasil forecast. Alert dapat berupa informasi, peringatan, atau kondisi kritis.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Alert dibatasi berdasarkan profil usaha aktif |

---

### Query Parameters

| Name   | Type    | Required | Default | Description |
| ------ | ------- | -------- | ------- | ----------- |
| page   | integer | No       | 1       | Halaman data |
| limit  | integer | No       | 20      | Jumlah item per halaman |
| status | string  | No       | active  | Filter status alert |
| severity | string | No       | -       | Filter tingkat severity |

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
        "alertType": "cash",
        "severity": "critical",
        "message": "Kas diproyeksikan negatif dalam 7 hari",
        "status": "active",
        "triggerValue": -500000
      }
    ]
  }
}
```

---

### Notes (Business Rules)

- [x] Alert stok kritis muncul jika stok diprediksi habis dalam < 3 hari.
- [x] Alert kas kritis muncul jika kas diproyeksikan negatif dalam 7 hari.
- [x] Alert warning digunakan untuk kondisi yang mendekati batas aman.

---

## GET /api/v1/alerts/{id}

### Title

> Get alert detail

### Description

Endpoint ini mengembalikan detail satu alert tertentu.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Hanya alert milik profil usaha yang valid yang bisa dibaca |

---

### Path Parameters

| Name | Type   | Required | Description |
| ---- | ------ | -------- | ----------- |
| id   | string | Yes      | ID alert |

---

### Responses

#### Success - 200 OK

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "alertType": "inventory",
    "severity": "critical",
    "message": "Stok diprediksi habis dalam 2 hari",
    "status": "active",
    "triggerValue": 2
  }
}
```

---

## PATCH /api/v1/alerts/{id}/read

### Title

> Mark alert as read

### Description

Endpoint ini menandai alert sebagai sudah dibaca oleh pengguna.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Hanya alert milik profil usaha yang valid yang dapat ditandai |

---

### Responses

#### Success - 200 OK

```json
{
  "success": true,
  "message": "Alert marked as read"
}
```

---

## PATCH /api/v1/alerts/{id}/resolve

### Title

> Resolve alert

### Description

Endpoint ini menandai alert sebagai selesai atau teratasi.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Hanya alert milik profil usaha yang valid yang dapat diselesaikan |

---

### Responses

#### Success - 200 OK

```json
{
  "success": true,
  "message": "Alert resolved"
}
```
