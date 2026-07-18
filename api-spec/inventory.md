# API Specification - Inventory

> File: inventory.md  
> Last Updated: 2026-07-16  
> PRD Reference: Section 8.2 - Data Management

---

## GET /api/v1/inventory-items

### Title

> List inventory items

### Description

Endpoint ini digunakan untuk mengambil daftar item stok yang dimiliki oleh profil usaha aktif. Data ini digunakan untuk menghitung estimasi stok habis dan menampilkan dashboard inventaris.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Data dibatasi ke profil usaha yang sedang aktif |

---

### Query Parameters

| Name   | Type    | Required | Default | Description |
| ------ | ------- | -------- | ------- | ----------- |
| page   | integer | No       | 1       | Halaman data |
| limit  | integer | No       | 20      | Jumlah item per halaman |
| search | string  | No       | -       | Pencarian nama item |
| sortBy | string  | No       | itemName | Kolom sort |
| order  | string  | No       | asc     | asc atau desc |

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
        "itemName": "Kopi Arabica",
        "currentStock": 120,
        "averageSalesPerDay": 4,
        "unit": "kg",
        "minimumThreshold": 20
      }
    ]
  }
}
```

---

## POST /api/v1/inventory-items

### Title

> Create inventory item

### Description

Endpoint ini digunakan untuk menambahkan item stok baru ke sistem.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Item ditambahkan ke profil usaha aktif |

---

### Request Body (JSON)

```json
{
  "itemName": "Kopi Arabica",
  "currentStock": 120,
  "averageSalesPerDay": 4,
  "unit": "kg",
  "minimumThreshold": 20
}
```

**Field Definitions**

| Field               | Type   | Required | Description |
| ------------------- | ------ | -------- | ----------- |
| itemName            | string | Yes      | Nama barang |
| currentStock        | number | Yes      | Stok saat ini |
| averageSalesPerDay  | number | Yes      | Rata-rata penjualan per hari |
| unit                | string | Yes      | Satuan barang |
| minimumThreshold    | number | No       | Batas minimum stok |

---

### Responses

#### Success - 201 Created

```json
{
  "success": true,
  "message": "Inventory item created",
  "data": {
    "id": "uuid",
    "itemName": "Kopi Arabica",
    "currentStock": 120
  }
}
```

---

## GET /api/v1/inventory-items/{id}

### Title

> Get inventory item detail

### Description

Endpoint ini mengembalikan detail satu item stok.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Hanya item milik profil usaha yang diizinkan |

---

### Path Parameters

| Name | Type   | Required | Description |
| ---- | ------ | -------- | ----------- |
| id   | string | Yes      | ID item inventory |

---

### Responses

#### Success - 200 OK

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "itemName": "Kopi Arabica",
    "currentStock": 120,
    "averageSalesPerDay": 4,
    "unit": "kg",
    "minimumThreshold": 20
  }
}
```

---

## PATCH /api/v1/inventory-items/{id}

### Title

> Update inventory item

### Description

Endpoint ini memperbarui data item stok yang sudah ada.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Hanya item milik profil usaha yang valid yang dapat diubah |

---

### Request Body (JSON)

```json
{
  "currentStock": 100,
  "minimumThreshold": 15
}
```

---

### Responses

#### Success - 200 OK

```json
{
  "success": true,
  "message": "Inventory item updated"
}
```

---

## DELETE /api/v1/inventory-items/{id}

### Title

> Delete inventory item

### Description

Endpoint ini menghapus item stok tertentu dari sistem.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Hanya item milik profil usaha yang valid yang dapat dihapus |

---

### Responses

#### Success - 200 OK

```json
{
  "success": true,
  "message": "Inventory item deleted"
}
```
