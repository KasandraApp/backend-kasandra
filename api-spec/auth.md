# API Specification - Auth

> File: auth.md  
> Last Updated: 2026-07-16  
> PRD Reference: Section 8.1 - Authentication

---

## POST /api/v1/auth/register

### Title

> Register a new user account

### Description

Endpoint ini digunakan untuk mendaftarkan akun pengguna baru. Pada MVP, fitur autentikasi bersifat opsional, tetapi jika diimplementasikan maka alur registrasi harus sederhana dan aman.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | No |
| Role(s)       | None |
| Notes         | Endpoint publik untuk pendaftaran awal |

---

### Path Parameters

| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| -    | -    | -        | -           |

---

### Query Parameters

| Name | Type | Required | Default | Description |
| ---- | ---- | -------- | ------- | ----------- |
| -    | -    | -        | -       | -           |

---

### Request Body (JSON)

```json
{
  "fullName": "Rina",
  "email": "rina@example.com",
  "password": "StrongPassword123"
}
```

**Field Definitions**

| Field     | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| fullName  | string | Yes      | Nama lengkap pengguna |
| email     | string | Yes      | Alamat email unik |
| password  | string | Yes      | Password yang telah di-hash di backend |

---

### Responses

#### Success - 201 Created

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "fullName": "Rina",
    "email": "rina@example.com"
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

**409 Conflict**

```json
{
  "error": "Email already registered"
}
```

**500 Internal Server Error**

```json
{
  "error": "Internal server error"
}
```

---

### Notes (Business Rules)

- [x] Email harus unik.
- [x] Password harus disimpan dalam bentuk hash.
- [x] Registrasi tidak boleh membuat akun ganda untuk email yang sama.

---

## POST /api/v1/auth/login

### Title

> Authenticate an existing user

### Description

Endpoint ini digunakan untuk login pengguna dan menerima token sesi untuk mengakses endpoint yang membutuhkan autentikasi.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | No |
| Role(s)       | None |
| Notes         | Endpoint publik untuk autentikasi awal |

---

### Request Body (JSON)

```json
{
  "email": "rina@example.com",
  "password": "StrongPassword123"
}
```

**Field Definitions**

| Field    | Type   | Required | Description |
| -------- | ------ | -------- | ----------- |
| email    | string | Yes      | Email yang terdaftar |
| password | string | Yes      | Password akun |

---

### Responses

#### Success - 200 OK

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "user": {
      "id": "uuid",
      "fullName": "Rina",
      "email": "rina@example.com"
    }
  }
}
```

#### Error Responses

**400 Bad Request**

```json
{
  "error": "Invalid credentials"
}
```

**401 Unauthorized**

```json
{
  "error": "Unauthorized"
}
```

---

### Notes (Business Rules)

- [x] Login harus memvalidasi kombinasi email dan password.
- [x] Token harus diterbitkan setelah kredensial valid.
- [x] Session harus bisa diakhiri melalui endpoint logout.

---

## POST /api/v1/auth/logout

### Title

> End the current user session

### Description

Endpoint ini digunakan untuk menutup sesi pengguna yang sedang aktif. Pada MVP, logout dapat berupa invalidasi token atau penghapusan sesi yang tersimpan.

---

### Authentication / Authorization

| Field         | Value |
| ------------- | ----- |
| Auth Required | Yes |
| Role(s)       | authenticated_user |
| Notes         | Hanya pengguna dengan token valid yang dapat logout |

---

### Request Body (JSON)

```json
{}
```

---

### Responses

#### Success - 200 OK

```json
{
  "success": true,
  "message": "Logout successful"
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

- [x] Logout harus menghentikan akses token yang sedang berlaku.
- [x] Setelah logout, token tidak boleh dipakai lagi.
