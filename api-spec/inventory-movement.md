# API Specification - Inventory Movement

> File: inventory-movement.md  
> Last Updated: 2026-07-16  
> PRD Reference: Section 8.2 - Data Management

---

## GET /api/v1/inventory-movements

### Title

> List inventory movements

### Description

Endpoint ini digunakan untuk melihat riwayat pergerakan stok barang, seperti barang masuk, barang keluar, atau penyesuaian stok.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Data dipusatkan per item inventory yang termasuk dalam profil usaha aktif |

---

### Query Parameters

| Name           | Type    | Required | Default | Description |
| -------------- | ------- | -------- | ------- | ----------- |
| inventoryItemId | string  | No       | -       | Filter berdasarkan item |
| page           | integer | No       | 1       | Halaman data |
| limit          | integer | No       | 20      | Jumlah item per halaman |

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
        "inventoryItemId": "uuid",
        "movementDate": "2026-07-16",
        "movementType": "out",
        "quantity": 5,
        "note": "Penjualan harian"
      }
    ]
  }
}
```

---

## POST /api/v1/inventory-movements

### Title

> Create inventory movement

### Description

Endpoint ini digunakan untuk mencatat pergerakan stok barang secara terstruktur.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Hanya item yang valid pada profil usaha yang aktif yang dapat diubah |

---

### Request Body (JSON)

```json
{
  "inventoryItemId": "uuid",
  "movementDate": "2026-07-16",
  "movementType": "out",
  "quantity": 5,
  "note": "Penjualan harian"
}
```

**Field Definitions**

| Field           | Type   | Required | Description |
| --------------- | ------ | -------- | ----------- |
| inventoryItemId | string | Yes      | ID item inventory terkait |
| movementDate    | string | Yes      | Tanggal pergerakan stok |
| movementType    | string | Yes      | in / out / adjustment |
| quantity        | number | Yes      | Jumlah pergerakan |
| note            | string | No       | Keterangan tambahan |

---

### Responses

#### Success - 201 Created

```json
{
  "success": true,
  "message": "Inventory movement created",
  "data": {
    "id": "uuid",
    "movementType": "out",
    "quantity": 5
  }
}
```

---

## PATCH /api/v1/inventory-movements/{id}

### Title

> Update inventory movement

### Description

Endpoint ini mengubah catatan pergerakan stok yang sudah ada.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Hanya data milik profil usaha yang valid yang bisa diperbarui |

---

### Request Body (JSON)

```json
{
  "quantity": 8,
  "note": "Penyesuaian stok"
}
```

---

### Responses

#### Success - 200 OK

```json
{
  "success": true,
  "message": "Inventory movement updated"
}
```

---

## DELETE /api/v1/inventory-movements/{id}

### Title

> Delete inventory movement

### Description

Endpoint ini menghapus catatan pergerakan stok tertentu.

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
  "message": "Inventory movement deleted"
}
```
