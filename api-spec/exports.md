# API Specification - Exports

> File: exports.md  
> Last Updated: 2026-07-16  
> PRD Reference: Section 8.6 - Export

---

## POST /api/v1/exports/pdf

### Title

> Export forecast report to PDF

### Description

Endpoint ini menghasilkan laporan forecast atau simulasi dalam format PDF. Fitur ini termasuk dalam scope opsional MVP, tetapi dirancang sebagai bagian roadmap yang dapat diimplementasikan saat waktu cukup.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Export dibatasi berdasarkan profil usaha aktif |

---

### Request Body (JSON)

```json
{
  "type": "forecast",
  "format": "pdf"
}
```

**Field Definitions**

| Field | Type   | Required | Description |
| ----- | ------ | -------- | ----------- |
| type  | string | Yes      | Jenis data yang diekspor: forecast atau simulation |
| format | string | Yes     | Format ekspor: pdf atau excel |

---

### Responses

#### Success - 200 OK

```json
{
  "success": true,
  "message": "Export generated",
  "data": {
    "fileUrl": "/exports/report-20260716.pdf"
  }
}
```

#### Error Responses

**400 Bad Request**

```json
{
  "error": "Invalid export request"
}
```

---

## POST /api/v1/exports/excel

### Title

> Export forecast report to Excel

### Description

Endpoint ini menghasilkan laporan forecast atau simulasi dalam format Excel.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Export dibatasi berdasarkan profil usaha aktif |

---

### Request Body (JSON)

```json
{
  "type": "simulation",
  "format": "excel"
}
```

---

### Responses

#### Success - 200 OK

```json
{
  "success": true,
  "message": "Export generated",
  "data": {
    "fileUrl": "/exports/simulation-20260716.xlsx"
  }
}
```

---

## GET /api/v1/exports/history

### Title

> Get export history

### Description

Endpoint ini menampilkan riwayat export yang pernah dilakukan pengguna untuk profil usaha tertentu.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Riwayat export dibatasi berdasarkan profil usaha aktif |

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
        "exportType": "pdf",
        "createdAt": "2026-07-16T11:00:00Z"
      }
    ]
  }
}
```
