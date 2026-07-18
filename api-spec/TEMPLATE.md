# API Specification - [Feature Group Name]

> File: paths/[filename].md <br>
> Last Updated: YYYY-MM-DD <br>
> PRD Reference: Section X.X - [Section Title]

---

<!--
How to use this template:
1. Copy an endpoint block to the correct file under paths.
2. Fill every section. If not applicable, write None.
3. Separate endpoint blocks with ---.
4. Do not edit this master template for endpoint-specific details.
-->

## [HTTP_METHOD] /api/[resource-name]

### Title

> [Short and clear endpoint name]

### Description

[Brief business context for this endpoint, 1-3 sentences.]

---

### Authentication / Authorization

| Field         | Value                               |
| ------------- | ----------------------------------- |
| Auth Required | Yes / No                            |
| Role(s)       | super_admin, head_mentors, ...      |
| Notes         | [Additional access notes if needed] |

---

### Path Parameters

| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| -    | -    | -        | -           |

If the endpoint has no path parameters, write: None.

---

### Query Parameters

| Name   | Type    | Required | Default   | Description    |
| ------ | ------- | -------- | --------- | -------------- |
| page   | integer | No       | 1         | Page number    |
| limit  | integer | No       | 20        | Items per page |
| search | string  | No       | -         | Search keyword |
| sortBy | string  | No       | createdAt | Sort field     |
| order  | string  | No       | desc      | asc or desc    |

If the endpoint has no query parameters, write: None.

---

### Request Body (JSON)

For GET or DELETE with no body, write: None - no request body.

```json
{
  "fieldName": "string",
  "anotherField": 0,
  "optionalField": "string | null"
}
```

**Field Definitions**

| Field         | Type    | Required | Description               |
| ------------- | ------- | -------- | ------------------------- |
| fieldName     | string  | Yes      | [Field meaning]           |
| anotherField  | integer | Yes      | [Field meaning]           |
| optionalField | string  | No       | [Field meaning and usage] |

---

### Responses

Important notes:

- Always document the response based on the real endpoint contract.
- This template does not enforce one global response envelope for all endpoints.
- If standardization is planned, document it in Current vs Planned.

#### Success - 200 OK / 201 Created

Use the response shape that matches the actual endpoint behavior.

```json
{
  "success": true,
  "resource": {
    "id": "uuid-here"
  }
}
```

Or resource-keyed list response:

```json
{
  "announcements": []
}
```

Or if the endpoint already uses message/data/error envelope:

```json
{
  "message": "Success",
  "data": {},
  "error": null
}
```

---

#### Error Responses

Provide at least the relevant errors for this endpoint.

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

**403 Forbidden**

```json
{
  "error": "Forbidden"
}
```

**404 Not Found**

```json
{
  "error": "Not found"
}
```

**409 Conflict** (if relevant)

```json
{
  "error": "Conflict"
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

- [ ] [Business rule 1]
- [ ] [Business rule 2]
- [ ] [Business rule 3]

---

### Current vs Planned (Optional, if mismatch exists)

- Current Behavior: [Current implementation behavior]
- Planned Behavior: [Expected target behavior]

---

## [HTTP_METHOD] /api/[resource-name]/{id}

### Title

> [Short and clear endpoint name]

### Description

[Brief business context for this endpoint, 1-3 sentences.]

---

### Authentication / Authorization

| Field         | Value                               |
| ------------- | ----------------------------------- |
| Auth Required | Yes / No                            |
| Role(s)       | super_admin, head_mentors, ...      |
| Notes         | [Additional access notes if needed] |

---

### Path Parameters

| Name | Type   | Required | Description                    |
| ---- | ------ | -------- | ------------------------------ |
| id   | string | Yes      | Resource ID from endpoint path |

Path parameter example:

```text
/api/[resource-name]/{id}
```

If the parameter name is not id (for example groupId, announcementId), use the actual route name.

---

### Query Parameters

| Name | Type | Required | Default | Description |
| ---- | ---- | -------- | ------- | ----------- |
| -    | -    | -        | -       | -           |

If the endpoint has no query parameters, write: None.

---

### Request Body (JSON)

```json
{}
```

Or write: None - no request body.

---

### Responses

Important notes:

- Always document the response based on the real endpoint contract.
- This template does not enforce one global response envelope for all endpoints.
- If standardization is planned, document it in Current vs Planned.

#### Success - 200 OK / 201 Created

Use the response shape that matches the actual endpoint behavior.

```json
{
  "success": true,
  "resource": {
    "id": "uuid-here"
  }
}
```

Or resource-keyed list response:

```json
{
  "announcements": []
}
```

Or if the endpoint already uses message/data/error envelope:

```json
{
  "message": "Success",
  "data": {},
  "error": null
}
```

#### Error Responses

Provide at least the relevant errors for this endpoint.

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

**403 Forbidden**

```json
{
  "error": "Forbidden"
}
```

**404 Not Found**

```json
{
  "error": "Not found"
}
```

**409 Conflict** (if relevant)

```json
{
  "error": "Conflict"
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

- [ ] [Business rule 1]
- [ ] [Business rule 2]
- [ ] [Business rule 3]

---

### Current vs Planned (Optional, if mismatch exists)

- Current Behavior: [Current implementation behavior]
- Planned Behavior: [Expected target behavior]
