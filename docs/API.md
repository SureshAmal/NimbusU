# NimbusU API Documentation

Version: 1.0.0

University Content Management System — REST API

# Academics APIs

## `GET /api/v1/academics/courses/`

**Summary**: academics_courses_list

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `department` | `query` | `string (uuid)` | No |  |
| `is_active` | `query` | `boolean` | No |  |
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `search` | `query` | `string` | No | A search term. |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of Course` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "string",
      "code": "string",
      "department": "123e4567-e89b-12d3-a456-426614174000",
      "department_name": "string",
      "credits": 0,
      "description": "string",
      "is_active": true
    }
  ]
}
```

---

## `POST /api/v1/academics/courses/`

**Summary**: academics_courses_create

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes |  |
| `code` | `string` | Yes |  |
| `department` | `string` | Yes |  |
| `credits` | `integer` | Yes |  |
| `description` | `string` | No |  |
| `is_active` | `boolean` | No |  |

**Example Request**:
```json
{
  "name": "string",
  "code": "string",
  "department": "123e4567-e89b-12d3-a456-426614174000",
  "credits": 0,
  "description": "string",
  "is_active": true
}
```

#### Response: 201 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `code` | `string` | Yes |  |
| `department` | `string` | Yes |  |
| `department_name` | `string` | Yes |  (read-only) |
| `credits` | `integer` | Yes |  |
| `description` | `string` | No |  |
| `is_active` | `boolean` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "code": "string",
  "department": "123e4567-e89b-12d3-a456-426614174000",
  "department_name": "string",
  "credits": 0,
  "description": "string",
  "is_active": true
}
```

---

## `GET /api/v1/academics/courses/{id}/`

**Summary**: academics_courses_retrieve

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `code` | `string` | Yes |  |
| `department` | `string` | Yes |  |
| `department_name` | `string` | Yes |  (read-only) |
| `credits` | `integer` | Yes |  |
| `description` | `string` | No |  |
| `is_active` | `boolean` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "code": "string",
  "department": "123e4567-e89b-12d3-a456-426614174000",
  "department_name": "string",
  "credits": 0,
  "description": "string",
  "is_active": true
}
```

---

## `PUT /api/v1/academics/courses/{id}/`

**Summary**: academics_courses_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes |  |
| `code` | `string` | Yes |  |
| `department` | `string` | Yes |  |
| `credits` | `integer` | Yes |  |
| `description` | `string` | No |  |
| `is_active` | `boolean` | No |  |

**Example Request**:
```json
{
  "name": "string",
  "code": "string",
  "department": "123e4567-e89b-12d3-a456-426614174000",
  "credits": 0,
  "description": "string",
  "is_active": true
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `code` | `string` | Yes |  |
| `department` | `string` | Yes |  |
| `department_name` | `string` | Yes |  (read-only) |
| `credits` | `integer` | Yes |  |
| `description` | `string` | No |  |
| `is_active` | `boolean` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "code": "string",
  "department": "123e4567-e89b-12d3-a456-426614174000",
  "department_name": "string",
  "credits": 0,
  "description": "string",
  "is_active": true
}
```

---

## `PATCH /api/v1/academics/courses/{id}/`

**Summary**: academics_courses_partial_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | No |  |
| `code` | `string` | No |  |
| `department` | `string` | No |  |
| `credits` | `integer` | No |  |
| `description` | `string` | No |  |
| `is_active` | `boolean` | No |  |

**Example Request**:
```json
{
  "name": "string",
  "code": "string",
  "department": "123e4567-e89b-12d3-a456-426614174000",
  "credits": 0,
  "description": "string",
  "is_active": true
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `code` | `string` | Yes |  |
| `department` | `string` | Yes |  |
| `department_name` | `string` | Yes |  (read-only) |
| `credits` | `integer` | Yes |  |
| `description` | `string` | No |  |
| `is_active` | `boolean` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "code": "string",
  "department": "123e4567-e89b-12d3-a456-426614174000",
  "department_name": "string",
  "credits": 0,
  "description": "string",
  "is_active": true
}
```

---

## `DELETE /api/v1/academics/courses/{id}/`

**Summary**: academics_courses_destroy

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 204 No response body

---

## `POST /api/v1/academics/enrollments/`

**Summary**: academics_enrollments_create

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `student` | `string` | Yes |  |
| `course_offering` | `string` | Yes |  |
| `status` | `EnrollmentStatusEnum` | No |  |

**Example Request**:
```json
{
  "student": "123e4567-e89b-12d3-a456-426614174000",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "status": "active"
}
```

#### Response: 201 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `student` | `string` | Yes |  |
| `student_name` | `string` | Yes |  (read-only) |
| `course_offering` | `string` | Yes |  |
| `course_name` | `string` | Yes |  (read-only) |
| `enrolled_at` | `string` | Yes |  (read-only) |
| `status` | `EnrollmentStatusEnum` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "student": "123e4567-e89b-12d3-a456-426614174000",
  "student_name": "string",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "course_name": "string",
  "enrolled_at": "2023-10-23T12:00:00Z",
  "status": "active"
}
```

---

## `DELETE /api/v1/academics/enrollments/{id}/`

**Summary**: academics_enrollments_destroy

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 204 No response body

---

## `GET /api/v1/academics/enrollments/me/`

**Summary**: GET /api/v1/academics/enrollments/me/

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `search` | `query` | `string` | No | A search term. |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of Enrollment` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "student": "123e4567-e89b-12d3-a456-426614174000",
      "student_name": "string",
      "course_offering": "123e4567-e89b-12d3-a456-426614174000",
      "course_name": "string",
      "enrolled_at": "2023-10-23T12:00:00Z",
      "status": "active"
    }
  ]
}
```

---

## `GET /api/v1/academics/offerings/`

**Summary**: academics_offerings_list

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `course` | `query` | `string (uuid)` | No |  |
| `faculty` | `query` | `string (uuid)` | No |  |
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `search` | `query` | `string` | No | A search term. |
| `semester` | `query` | `string (uuid)` | No |  |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of CourseOffering` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "course": "123e4567-e89b-12d3-a456-426614174000",
      "course_name": "string",
      "course_code": "string",
      "semester": "123e4567-e89b-12d3-a456-426614174000",
      "semester_name": "string",
      "faculty": "123e4567-e89b-12d3-a456-426614174000",
      "faculty_name": "string",
      "section": "string",
      "max_students": 0,
      "enrolled_count": 0
    }
  ]
}
```

---

## `POST /api/v1/academics/offerings/`

**Summary**: academics_offerings_create

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `course` | `string` | Yes |  |
| `semester` | `string` | Yes |  |
| `faculty` | `string` | Yes |  |
| `section` | `string` | No |  |
| `max_students` | `integer` | No |  |

**Example Request**:
```json
{
  "course": "123e4567-e89b-12d3-a456-426614174000",
  "semester": "123e4567-e89b-12d3-a456-426614174000",
  "faculty": "123e4567-e89b-12d3-a456-426614174000",
  "section": "string",
  "max_students": 0
}
```

#### Response: 201 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `course` | `string` | Yes |  |
| `course_name` | `string` | Yes |  (read-only) |
| `course_code` | `string` | Yes |  (read-only) |
| `semester` | `string` | Yes |  |
| `semester_name` | `string` | Yes |  (read-only) |
| `faculty` | `string` | Yes |  |
| `faculty_name` | `string` | Yes |  (read-only) |
| `section` | `string` | No |  |
| `max_students` | `integer` | No |  |
| `enrolled_count` | `integer` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "course": "123e4567-e89b-12d3-a456-426614174000",
  "course_name": "string",
  "course_code": "string",
  "semester": "123e4567-e89b-12d3-a456-426614174000",
  "semester_name": "string",
  "faculty": "123e4567-e89b-12d3-a456-426614174000",
  "faculty_name": "string",
  "section": "string",
  "max_students": 0,
  "enrolled_count": 0
}
```

---

## `GET /api/v1/academics/offerings/{id}/`

**Summary**: academics_offerings_retrieve

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `course` | `string` | Yes |  |
| `course_name` | `string` | Yes |  (read-only) |
| `course_code` | `string` | Yes |  (read-only) |
| `semester` | `string` | Yes |  |
| `semester_name` | `string` | Yes |  (read-only) |
| `faculty` | `string` | Yes |  |
| `faculty_name` | `string` | Yes |  (read-only) |
| `section` | `string` | No |  |
| `max_students` | `integer` | No |  |
| `enrolled_count` | `integer` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "course": "123e4567-e89b-12d3-a456-426614174000",
  "course_name": "string",
  "course_code": "string",
  "semester": "123e4567-e89b-12d3-a456-426614174000",
  "semester_name": "string",
  "faculty": "123e4567-e89b-12d3-a456-426614174000",
  "faculty_name": "string",
  "section": "string",
  "max_students": 0,
  "enrolled_count": 0
}
```

---

## `PUT /api/v1/academics/offerings/{id}/`

**Summary**: academics_offerings_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `course` | `string` | Yes |  |
| `semester` | `string` | Yes |  |
| `faculty` | `string` | Yes |  |
| `section` | `string` | No |  |
| `max_students` | `integer` | No |  |

**Example Request**:
```json
{
  "course": "123e4567-e89b-12d3-a456-426614174000",
  "semester": "123e4567-e89b-12d3-a456-426614174000",
  "faculty": "123e4567-e89b-12d3-a456-426614174000",
  "section": "string",
  "max_students": 0
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `course` | `string` | Yes |  |
| `course_name` | `string` | Yes |  (read-only) |
| `course_code` | `string` | Yes |  (read-only) |
| `semester` | `string` | Yes |  |
| `semester_name` | `string` | Yes |  (read-only) |
| `faculty` | `string` | Yes |  |
| `faculty_name` | `string` | Yes |  (read-only) |
| `section` | `string` | No |  |
| `max_students` | `integer` | No |  |
| `enrolled_count` | `integer` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "course": "123e4567-e89b-12d3-a456-426614174000",
  "course_name": "string",
  "course_code": "string",
  "semester": "123e4567-e89b-12d3-a456-426614174000",
  "semester_name": "string",
  "faculty": "123e4567-e89b-12d3-a456-426614174000",
  "faculty_name": "string",
  "section": "string",
  "max_students": 0,
  "enrolled_count": 0
}
```

---

## `PATCH /api/v1/academics/offerings/{id}/`

**Summary**: academics_offerings_partial_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `course` | `string` | No |  |
| `semester` | `string` | No |  |
| `faculty` | `string` | No |  |
| `section` | `string` | No |  |
| `max_students` | `integer` | No |  |

**Example Request**:
```json
{
  "course": "123e4567-e89b-12d3-a456-426614174000",
  "semester": "123e4567-e89b-12d3-a456-426614174000",
  "faculty": "123e4567-e89b-12d3-a456-426614174000",
  "section": "string",
  "max_students": 0
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `course` | `string` | Yes |  |
| `course_name` | `string` | Yes |  (read-only) |
| `course_code` | `string` | Yes |  (read-only) |
| `semester` | `string` | Yes |  |
| `semester_name` | `string` | Yes |  (read-only) |
| `faculty` | `string` | Yes |  |
| `faculty_name` | `string` | Yes |  (read-only) |
| `section` | `string` | No |  |
| `max_students` | `integer` | No |  |
| `enrolled_count` | `integer` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "course": "123e4567-e89b-12d3-a456-426614174000",
  "course_name": "string",
  "course_code": "string",
  "semester": "123e4567-e89b-12d3-a456-426614174000",
  "semester_name": "string",
  "faculty": "123e4567-e89b-12d3-a456-426614174000",
  "faculty_name": "string",
  "section": "string",
  "max_students": 0,
  "enrolled_count": 0
}
```

---

## `GET /api/v1/academics/offerings/{id}/students/`

**Summary**: GET /api/v1/academics/offerings/{id}/students/

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `search` | `query` | `string` | No | A search term. |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of UserList` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "first_name": "string",
      "last_name": "string",
      "role": "admin",
      "department": "123e4567-e89b-12d3-a456-426614174000",
      "department_name": "string",
      "phone": "string",
      "is_active": true,
      "last_login": "2023-10-23T12:00:00Z",
      "created_at": "2023-10-23T12:00:00Z",
      "student_profile": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "student_id_number": "string",
        "register_no": "string",
        "program": "123e4567-e89b-12d3-a456-426614174000",
        "current_semester": 0,
        "admission_date": "2023-10-23",
        "batch_year": 0,
        "batch": "string",
        "division": "string"
      },
      "faculty_profile": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "employee_id": "string",
        "designation": "string",
        "specialization": "string",
        "joining_date": "2023-10-23",
        "consultation_hours": null
      }
    }
  ]
}
```

---

## `GET /api/v1/academics/programs/`

**Summary**: academics_programs_list

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `degree_type` | `query` | `string` | No | * `UG` - Undergraduate * `PG` - Postgraduate * `PhD` - Doctorate * `Diploma` - Diploma |
| `department` | `query` | `string (uuid)` | No |  |
| `is_active` | `query` | `boolean` | No |  |
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `search` | `query` | `string` | No | A search term. |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of Program` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "string",
      "code": "string",
      "department": "123e4567-e89b-12d3-a456-426614174000",
      "department_name": "string",
      "duration_years": 0,
      "degree_type": "UG",
      "is_active": true
    }
  ]
}
```

---

## `POST /api/v1/academics/programs/`

**Summary**: academics_programs_create

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes |  |
| `code` | `string` | Yes |  |
| `department` | `string` | Yes |  |
| `duration_years` | `integer` | Yes |  |
| `degree_type` | `DegreeTypeEnum` | Yes |  |
| `is_active` | `boolean` | No |  |

**Example Request**:
```json
{
  "name": "string",
  "code": "string",
  "department": "123e4567-e89b-12d3-a456-426614174000",
  "duration_years": 0,
  "degree_type": "UG",
  "is_active": true
}
```

#### Response: 201 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `code` | `string` | Yes |  |
| `department` | `string` | Yes |  |
| `department_name` | `string` | Yes |  (read-only) |
| `duration_years` | `integer` | Yes |  |
| `degree_type` | `DegreeTypeEnum` | Yes |  |
| `is_active` | `boolean` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "code": "string",
  "department": "123e4567-e89b-12d3-a456-426614174000",
  "department_name": "string",
  "duration_years": 0,
  "degree_type": "UG",
  "is_active": true
}
```

---

## `GET /api/v1/academics/programs/{id}/`

**Summary**: academics_programs_retrieve

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `code` | `string` | Yes |  |
| `department` | `string` | Yes |  |
| `department_name` | `string` | Yes |  (read-only) |
| `duration_years` | `integer` | Yes |  |
| `degree_type` | `DegreeTypeEnum` | Yes |  |
| `is_active` | `boolean` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "code": "string",
  "department": "123e4567-e89b-12d3-a456-426614174000",
  "department_name": "string",
  "duration_years": 0,
  "degree_type": "UG",
  "is_active": true
}
```

---

## `PUT /api/v1/academics/programs/{id}/`

**Summary**: academics_programs_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes |  |
| `code` | `string` | Yes |  |
| `department` | `string` | Yes |  |
| `duration_years` | `integer` | Yes |  |
| `degree_type` | `DegreeTypeEnum` | Yes |  |
| `is_active` | `boolean` | No |  |

**Example Request**:
```json
{
  "name": "string",
  "code": "string",
  "department": "123e4567-e89b-12d3-a456-426614174000",
  "duration_years": 0,
  "degree_type": "UG",
  "is_active": true
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `code` | `string` | Yes |  |
| `department` | `string` | Yes |  |
| `department_name` | `string` | Yes |  (read-only) |
| `duration_years` | `integer` | Yes |  |
| `degree_type` | `DegreeTypeEnum` | Yes |  |
| `is_active` | `boolean` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "code": "string",
  "department": "123e4567-e89b-12d3-a456-426614174000",
  "department_name": "string",
  "duration_years": 0,
  "degree_type": "UG",
  "is_active": true
}
```

---

## `PATCH /api/v1/academics/programs/{id}/`

**Summary**: academics_programs_partial_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | No |  |
| `code` | `string` | No |  |
| `department` | `string` | No |  |
| `duration_years` | `integer` | No |  |
| `degree_type` | `DegreeTypeEnum` | No |  |
| `is_active` | `boolean` | No |  |

**Example Request**:
```json
{
  "name": "string",
  "code": "string",
  "department": "123e4567-e89b-12d3-a456-426614174000",
  "duration_years": 0,
  "degree_type": "UG",
  "is_active": true
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `code` | `string` | Yes |  |
| `department` | `string` | Yes |  |
| `department_name` | `string` | Yes |  (read-only) |
| `duration_years` | `integer` | Yes |  |
| `degree_type` | `DegreeTypeEnum` | Yes |  |
| `is_active` | `boolean` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "code": "string",
  "department": "123e4567-e89b-12d3-a456-426614174000",
  "department_name": "string",
  "duration_years": 0,
  "degree_type": "UG",
  "is_active": true
}
```

---

## `DELETE /api/v1/academics/programs/{id}/`

**Summary**: academics_programs_destroy

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 204 No response body

---

## `GET /api/v1/academics/schools/`

**Summary**: academics_schools_list

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `search` | `query` | `string` | No | A search term. |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of School` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "string",
      "code": "string",
      "dean": "123e4567-e89b-12d3-a456-426614174000",
      "dean_name": "string",
      "created_at": "2023-10-23T12:00:00Z"
    }
  ]
}
```

---

## `POST /api/v1/academics/schools/`

**Summary**: academics_schools_create

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes |  |
| `code` | `string` | Yes |  |
| `dean` | `string` | No |  |

**Example Request**:
```json
{
  "name": "string",
  "code": "string",
  "dean": "123e4567-e89b-12d3-a456-426614174000"
}
```

#### Response: 201 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `code` | `string` | Yes |  |
| `dean` | `string` | No |  |
| `dean_name` | `string` | Yes |  (read-only) |
| `created_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "code": "string",
  "dean": "123e4567-e89b-12d3-a456-426614174000",
  "dean_name": "string",
  "created_at": "2023-10-23T12:00:00Z"
}
```

---

## `GET /api/v1/academics/schools/{id}/`

**Summary**: academics_schools_retrieve

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `code` | `string` | Yes |  |
| `dean` | `string` | No |  |
| `dean_name` | `string` | Yes |  (read-only) |
| `created_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "code": "string",
  "dean": "123e4567-e89b-12d3-a456-426614174000",
  "dean_name": "string",
  "created_at": "2023-10-23T12:00:00Z"
}
```

---

## `PUT /api/v1/academics/schools/{id}/`

**Summary**: academics_schools_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes |  |
| `code` | `string` | Yes |  |
| `dean` | `string` | No |  |

**Example Request**:
```json
{
  "name": "string",
  "code": "string",
  "dean": "123e4567-e89b-12d3-a456-426614174000"
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `code` | `string` | Yes |  |
| `dean` | `string` | No |  |
| `dean_name` | `string` | Yes |  (read-only) |
| `created_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "code": "string",
  "dean": "123e4567-e89b-12d3-a456-426614174000",
  "dean_name": "string",
  "created_at": "2023-10-23T12:00:00Z"
}
```

---

## `PATCH /api/v1/academics/schools/{id}/`

**Summary**: academics_schools_partial_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | No |  |
| `code` | `string` | No |  |
| `dean` | `string` | No |  |

**Example Request**:
```json
{
  "name": "string",
  "code": "string",
  "dean": "123e4567-e89b-12d3-a456-426614174000"
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `code` | `string` | Yes |  |
| `dean` | `string` | No |  |
| `dean_name` | `string` | Yes |  (read-only) |
| `created_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "code": "string",
  "dean": "123e4567-e89b-12d3-a456-426614174000",
  "dean_name": "string",
  "created_at": "2023-10-23T12:00:00Z"
}
```

---

## `DELETE /api/v1/academics/schools/{id}/`

**Summary**: academics_schools_destroy

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 204 No response body

---

## `GET /api/v1/academics/semesters/`

**Summary**: academics_semesters_list

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `search` | `query` | `string` | No | A search term. |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of Semester` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "string",
      "academic_year": "string",
      "start_date": "2023-10-23",
      "end_date": "2023-10-23",
      "is_current": true
    }
  ]
}
```

---

## `POST /api/v1/academics/semesters/`

**Summary**: academics_semesters_create

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes |  |
| `academic_year` | `string` | Yes |  |
| `start_date` | `string` | Yes |  |
| `end_date` | `string` | Yes |  |
| `is_current` | `boolean` | No |  |

**Example Request**:
```json
{
  "name": "string",
  "academic_year": "string",
  "start_date": "2023-10-23",
  "end_date": "2023-10-23",
  "is_current": true
}
```

#### Response: 201 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `academic_year` | `string` | Yes |  |
| `start_date` | `string` | Yes |  |
| `end_date` | `string` | Yes |  |
| `is_current` | `boolean` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "academic_year": "string",
  "start_date": "2023-10-23",
  "end_date": "2023-10-23",
  "is_current": true
}
```

---

## `GET /api/v1/academics/semesters/{id}/`

**Summary**: academics_semesters_retrieve

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `academic_year` | `string` | Yes |  |
| `start_date` | `string` | Yes |  |
| `end_date` | `string` | Yes |  |
| `is_current` | `boolean` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "academic_year": "string",
  "start_date": "2023-10-23",
  "end_date": "2023-10-23",
  "is_current": true
}
```

---

## `PUT /api/v1/academics/semesters/{id}/`

**Summary**: academics_semesters_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes |  |
| `academic_year` | `string` | Yes |  |
| `start_date` | `string` | Yes |  |
| `end_date` | `string` | Yes |  |
| `is_current` | `boolean` | No |  |

**Example Request**:
```json
{
  "name": "string",
  "academic_year": "string",
  "start_date": "2023-10-23",
  "end_date": "2023-10-23",
  "is_current": true
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `academic_year` | `string` | Yes |  |
| `start_date` | `string` | Yes |  |
| `end_date` | `string` | Yes |  |
| `is_current` | `boolean` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "academic_year": "string",
  "start_date": "2023-10-23",
  "end_date": "2023-10-23",
  "is_current": true
}
```

---

## `PATCH /api/v1/academics/semesters/{id}/`

**Summary**: academics_semesters_partial_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | No |  |
| `academic_year` | `string` | No |  |
| `start_date` | `string` | No |  |
| `end_date` | `string` | No |  |
| `is_current` | `boolean` | No |  |

**Example Request**:
```json
{
  "name": "string",
  "academic_year": "string",
  "start_date": "2023-10-23",
  "end_date": "2023-10-23",
  "is_current": true
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `academic_year` | `string` | Yes |  |
| `start_date` | `string` | Yes |  |
| `end_date` | `string` | Yes |  |
| `is_current` | `boolean` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "academic_year": "string",
  "start_date": "2023-10-23",
  "end_date": "2023-10-23",
  "is_current": true
}
```

---

# Admin APIs

## `GET /api/v1/admin/audit-logs/`

**Summary**: GET /api/v1/admin/audit-logs/

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `action` | `query` | `string` | No |  |
| `entity_type` | `query` | `string` | No |  |
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `user` | `query` | `string (uuid)` | No |  |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of AuditLog` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user": "123e4567-e89b-12d3-a456-426614174000",
      "user_email": "string",
      "action": "string",
      "entity_type": "string",
      "entity_id": "123e4567-e89b-12d3-a456-426614174000",
      "details": null,
      "ip_address": "string",
      "created_at": "2023-10-23T12:00:00Z"
    }
  ]
}
```

---

## `GET /api/v1/notifications/admin/stats/`

**Summary**: GET /api/v1/notifications/admin/stats/

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | `string` | Yes |  |
| `data` | `NotificationStatsData` | Yes |  |

**Example Response**:
```json
{
  "status": "string",
  "data": {
    "total": 0,
    "today": 0,
    "this_week": 0,
    "this_month": 0,
    "by_status": {},
    "delivery_rate": 0.0
  }
}
```

---

# Assignments APIs

## `GET /api/v1/assignments/`

**Summary**: assignments_list

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `assignment_type` | `query` | `string` | No | * `assignment` - Assignment * `quiz` - Quiz * `exam` - Exam * `project` - Project |
| `course_offering` | `query` | `string (uuid)` | No |  |
| `is_published` | `query` | `boolean` | No |  |
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `search` | `query` | `string` | No | A search term. |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of Assignment` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "string",
      "description": "string",
      "course_offering": "123e4567-e89b-12d3-a456-426614174000",
      "course_name": "string",
      "created_by": "123e4567-e89b-12d3-a456-426614174000",
      "created_by_name": "string",
      "due_date": "2023-10-23T12:00:00Z",
      "max_marks": "string",
      "assignment_type": "assignment",
      "attachments": null,
      "is_published": true,
      "submission_count": 0,
      "created_at": "2023-10-23T12:00:00Z",
      "updated_at": "2023-10-23T12:00:00Z"
    }
  ]
}
```

---

## `POST /api/v1/assignments/`

**Summary**: assignments_create

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | Yes |  |
| `description` | `string` | No |  |
| `course_offering` | `string` | Yes |  |
| `due_date` | `string` | Yes |  |
| `max_marks` | `string` | Yes |  |
| `assignment_type` | `AssignmentTypeEnum` | No |  |
| `attachments` | `string` | No |  |
| `is_published` | `boolean` | No |  |

**Example Request**:
```json
{
  "title": "string",
  "description": "string",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "due_date": "2023-10-23T12:00:00Z",
  "max_marks": "string",
  "assignment_type": "assignment",
  "attachments": null,
  "is_published": true
}
```

#### Response: 201 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `title` | `string` | Yes |  |
| `description` | `string` | No |  |
| `course_offering` | `string` | Yes |  |
| `course_name` | `string` | Yes |  (read-only) |
| `created_by` | `string` | Yes |  (read-only) |
| `created_by_name` | `string` | Yes |  (read-only) |
| `due_date` | `string` | Yes |  |
| `max_marks` | `string` | Yes |  |
| `assignment_type` | `AssignmentTypeEnum` | No |  |
| `attachments` | `string` | No |  |
| `is_published` | `boolean` | No |  |
| `submission_count` | `integer` | Yes |  (read-only) |
| `created_at` | `string` | Yes |  (read-only) |
| `updated_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "string",
  "description": "string",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "course_name": "string",
  "created_by": "123e4567-e89b-12d3-a456-426614174000",
  "created_by_name": "string",
  "due_date": "2023-10-23T12:00:00Z",
  "max_marks": "string",
  "assignment_type": "assignment",
  "attachments": null,
  "is_published": true,
  "submission_count": 0,
  "created_at": "2023-10-23T12:00:00Z",
  "updated_at": "2023-10-23T12:00:00Z"
}
```

---

## `GET /api/v1/assignments/{id}/`

**Summary**: assignments_retrieve

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `title` | `string` | Yes |  |
| `description` | `string` | No |  |
| `course_offering` | `string` | Yes |  |
| `course_name` | `string` | Yes |  (read-only) |
| `created_by` | `string` | Yes |  (read-only) |
| `created_by_name` | `string` | Yes |  (read-only) |
| `due_date` | `string` | Yes |  |
| `max_marks` | `string` | Yes |  |
| `assignment_type` | `AssignmentTypeEnum` | No |  |
| `attachments` | `string` | No |  |
| `is_published` | `boolean` | No |  |
| `submission_count` | `integer` | Yes |  (read-only) |
| `created_at` | `string` | Yes |  (read-only) |
| `updated_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "string",
  "description": "string",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "course_name": "string",
  "created_by": "123e4567-e89b-12d3-a456-426614174000",
  "created_by_name": "string",
  "due_date": "2023-10-23T12:00:00Z",
  "max_marks": "string",
  "assignment_type": "assignment",
  "attachments": null,
  "is_published": true,
  "submission_count": 0,
  "created_at": "2023-10-23T12:00:00Z",
  "updated_at": "2023-10-23T12:00:00Z"
}
```

---

## `PUT /api/v1/assignments/{id}/`

**Summary**: assignments_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | Yes |  |
| `description` | `string` | No |  |
| `course_offering` | `string` | Yes |  |
| `due_date` | `string` | Yes |  |
| `max_marks` | `string` | Yes |  |
| `assignment_type` | `AssignmentTypeEnum` | No |  |
| `attachments` | `string` | No |  |
| `is_published` | `boolean` | No |  |

**Example Request**:
```json
{
  "title": "string",
  "description": "string",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "due_date": "2023-10-23T12:00:00Z",
  "max_marks": "string",
  "assignment_type": "assignment",
  "attachments": null,
  "is_published": true
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `title` | `string` | Yes |  |
| `description` | `string` | No |  |
| `course_offering` | `string` | Yes |  |
| `course_name` | `string` | Yes |  (read-only) |
| `created_by` | `string` | Yes |  (read-only) |
| `created_by_name` | `string` | Yes |  (read-only) |
| `due_date` | `string` | Yes |  |
| `max_marks` | `string` | Yes |  |
| `assignment_type` | `AssignmentTypeEnum` | No |  |
| `attachments` | `string` | No |  |
| `is_published` | `boolean` | No |  |
| `submission_count` | `integer` | Yes |  (read-only) |
| `created_at` | `string` | Yes |  (read-only) |
| `updated_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "string",
  "description": "string",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "course_name": "string",
  "created_by": "123e4567-e89b-12d3-a456-426614174000",
  "created_by_name": "string",
  "due_date": "2023-10-23T12:00:00Z",
  "max_marks": "string",
  "assignment_type": "assignment",
  "attachments": null,
  "is_published": true,
  "submission_count": 0,
  "created_at": "2023-10-23T12:00:00Z",
  "updated_at": "2023-10-23T12:00:00Z"
}
```

---

## `PATCH /api/v1/assignments/{id}/`

**Summary**: assignments_partial_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | No |  |
| `description` | `string` | No |  |
| `course_offering` | `string` | No |  |
| `due_date` | `string` | No |  |
| `max_marks` | `string` | No |  |
| `assignment_type` | `AssignmentTypeEnum` | No |  |
| `attachments` | `string` | No |  |
| `is_published` | `boolean` | No |  |

**Example Request**:
```json
{
  "title": "string",
  "description": "string",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "due_date": "2023-10-23T12:00:00Z",
  "max_marks": "string",
  "assignment_type": "assignment",
  "attachments": null,
  "is_published": true
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `title` | `string` | Yes |  |
| `description` | `string` | No |  |
| `course_offering` | `string` | Yes |  |
| `course_name` | `string` | Yes |  (read-only) |
| `created_by` | `string` | Yes |  (read-only) |
| `created_by_name` | `string` | Yes |  (read-only) |
| `due_date` | `string` | Yes |  |
| `max_marks` | `string` | Yes |  |
| `assignment_type` | `AssignmentTypeEnum` | No |  |
| `attachments` | `string` | No |  |
| `is_published` | `boolean` | No |  |
| `submission_count` | `integer` | Yes |  (read-only) |
| `created_at` | `string` | Yes |  (read-only) |
| `updated_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "string",
  "description": "string",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "course_name": "string",
  "created_by": "123e4567-e89b-12d3-a456-426614174000",
  "created_by_name": "string",
  "due_date": "2023-10-23T12:00:00Z",
  "max_marks": "string",
  "assignment_type": "assignment",
  "attachments": null,
  "is_published": true,
  "submission_count": 0,
  "created_at": "2023-10-23T12:00:00Z",
  "updated_at": "2023-10-23T12:00:00Z"
}
```

---

## `DELETE /api/v1/assignments/{id}/`

**Summary**: assignments_destroy

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 204 No response body

---

## `GET /api/v1/assignments/{id}/submissions/`

**Summary**: GET /api/v1/assignments/{id}/submissions/

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `search` | `query` | `string` | No | A search term. |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of Submission` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "assignment": "123e4567-e89b-12d3-a456-426614174000",
      "student": "123e4567-e89b-12d3-a456-426614174000",
      "student_name": "string",
      "file": "https://example.com/resource",
      "text_content": "string",
      "submitted_at": "2023-10-23T12:00:00Z",
      "marks_obtained": "string",
      "grade": "string",
      "feedback": "string",
      "graded_by": "123e4567-e89b-12d3-a456-426614174000",
      "graded_at": "2023-10-23T12:00:00Z",
      "status": "draft"
    }
  ]
}
```

---

## `POST /api/v1/assignments/{id}/submit/`

**Summary**: POST /api/v1/assignments/{id}/submit/

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | `string` | No |  |
| `text_content` | `string` | No |  |
| `marks_obtained` | `string` | No |  |
| `grade` | `string` | No |  |
| `feedback` | `string` | No |  |
| `status` | `SubmissionStatusEnum` | No |  |

**Example Request**:
```json
{
  "file": "string",
  "text_content": "string",
  "marks_obtained": "string",
  "grade": "string",
  "feedback": "string",
  "status": "draft"
}
```

#### Response: 201 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `assignment` | `string` | Yes |  (read-only) |
| `student` | `string` | Yes |  (read-only) |
| `student_name` | `string` | Yes |  (read-only) |
| `file` | `string` | No |  |
| `text_content` | `string` | No |  |
| `submitted_at` | `string` | Yes |  (read-only) |
| `marks_obtained` | `string` | No |  |
| `grade` | `string` | No |  |
| `feedback` | `string` | No |  |
| `graded_by` | `string` | Yes |  (read-only) |
| `graded_at` | `string` | Yes |  (read-only) |
| `status` | `SubmissionStatusEnum` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "assignment": "123e4567-e89b-12d3-a456-426614174000",
  "student": "123e4567-e89b-12d3-a456-426614174000",
  "student_name": "string",
  "file": "https://example.com/resource",
  "text_content": "string",
  "submitted_at": "2023-10-23T12:00:00Z",
  "marks_obtained": "string",
  "grade": "string",
  "feedback": "string",
  "graded_by": "123e4567-e89b-12d3-a456-426614174000",
  "graded_at": "2023-10-23T12:00:00Z",
  "status": "draft"
}
```

---

## `GET /api/v1/assignments/export/{offering_id}/`

**Summary**: GET /api/v1/assignments/export/{offering_id}/ — CSV export.

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `offering_id` | `path` | `string (uuid)` | Yes |  |

#### Response: 200 

---

# Attendance APIs

## `PUT /api/v1/attendance/{id}/`

**Summary**: attendance_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timetable_entry` | `string` | Yes |  |
| `student` | `string` | Yes |  |
| `date` | `string` | Yes |  |
| `status` | `AttendanceRecordStatusEnum` | Yes |  |
| `remarks` | `string` | No |  |

**Example Request**:
```json
{
  "timetable_entry": "123e4567-e89b-12d3-a456-426614174000",
  "student": "123e4567-e89b-12d3-a456-426614174000",
  "date": "2023-10-23",
  "status": "present",
  "remarks": "string"
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `timetable_entry` | `string` | Yes |  |
| `student` | `string` | Yes |  |
| `student_name` | `string` | Yes |  (read-only) |
| `date` | `string` | Yes |  |
| `status` | `AttendanceRecordStatusEnum` | Yes |  |
| `marked_by` | `string` | Yes |  (read-only) |
| `remarks` | `string` | No |  |
| `created_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "timetable_entry": "123e4567-e89b-12d3-a456-426614174000",
  "student": "123e4567-e89b-12d3-a456-426614174000",
  "student_name": "string",
  "date": "2023-10-23",
  "status": "present",
  "marked_by": "123e4567-e89b-12d3-a456-426614174000",
  "remarks": "string",
  "created_at": "2023-10-23T12:00:00Z"
}
```

---

## `PATCH /api/v1/attendance/{id}/`

**Summary**: attendance_partial_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timetable_entry` | `string` | No |  |
| `student` | `string` | No |  |
| `date` | `string` | No |  |
| `status` | `AttendanceRecordStatusEnum` | No |  |
| `remarks` | `string` | No |  |

**Example Request**:
```json
{
  "timetable_entry": "123e4567-e89b-12d3-a456-426614174000",
  "student": "123e4567-e89b-12d3-a456-426614174000",
  "date": "2023-10-23",
  "status": "present",
  "remarks": "string"
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `timetable_entry` | `string` | Yes |  |
| `student` | `string` | Yes |  |
| `student_name` | `string` | Yes |  (read-only) |
| `date` | `string` | Yes |  |
| `status` | `AttendanceRecordStatusEnum` | Yes |  |
| `marked_by` | `string` | Yes |  (read-only) |
| `remarks` | `string` | No |  |
| `created_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "timetable_entry": "123e4567-e89b-12d3-a456-426614174000",
  "student": "123e4567-e89b-12d3-a456-426614174000",
  "student_name": "string",
  "date": "2023-10-23",
  "status": "present",
  "marked_by": "123e4567-e89b-12d3-a456-426614174000",
  "remarks": "string",
  "created_at": "2023-10-23T12:00:00Z"
}
```

---

## `GET /api/v1/attendance/course/{offering_id}/`

**Summary**: GET /api/v1/attendance/course/{offering_id}/

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `offering_id` | `path` | `string (uuid)` | Yes |  |
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `search` | `query` | `string` | No | A search term. |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of AttendanceRecord` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "timetable_entry": "123e4567-e89b-12d3-a456-426614174000",
      "student": "123e4567-e89b-12d3-a456-426614174000",
      "student_name": "string",
      "date": "2023-10-23",
      "status": "present",
      "marked_by": "123e4567-e89b-12d3-a456-426614174000",
      "remarks": "string",
      "created_at": "2023-10-23T12:00:00Z"
    }
  ]
}
```

---

## `POST /api/v1/attendance/mark/`

**Summary**: POST /api/v1/attendance/mark/ — Mark attendance in bulk.

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timetable_entry_id` | `string` | Yes |  |
| `date` | `string` | Yes |  |
| `records` | `Array of object` | Yes | List of {"student_id": "...", "status": "present|absent|late|excused"} |

**Example Request**:
```json
{
  "timetable_entry_id": "123e4567-e89b-12d3-a456-426614174000",
  "date": "2023-10-23",
  "records": [
    {}
  ]
}
```

#### Response: 201 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `timetable_entry` | `string` | Yes |  |
| `student` | `string` | Yes |  |
| `student_name` | `string` | Yes |  (read-only) |
| `date` | `string` | Yes |  |
| `status` | `AttendanceRecordStatusEnum` | Yes |  |
| `marked_by` | `string` | Yes |  (read-only) |
| `remarks` | `string` | No |  |
| `created_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "timetable_entry": "123e4567-e89b-12d3-a456-426614174000",
    "student": "123e4567-e89b-12d3-a456-426614174000",
    "student_name": "string",
    "date": "2023-10-23",
    "status": "present",
    "marked_by": "123e4567-e89b-12d3-a456-426614174000",
    "remarks": "string",
    "created_at": "2023-10-23T12:00:00Z"
  }
]
```

---

## `GET /api/v1/attendance/me/`

**Summary**: GET /api/v1/attendance/me/

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `search` | `query` | `string` | No | A search term. |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of AttendanceRecord` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "timetable_entry": "123e4567-e89b-12d3-a456-426614174000",
      "student": "123e4567-e89b-12d3-a456-426614174000",
      "student_name": "string",
      "date": "2023-10-23",
      "status": "present",
      "marked_by": "123e4567-e89b-12d3-a456-426614174000",
      "remarks": "string",
      "created_at": "2023-10-23T12:00:00Z"
    }
  ]
}
```

---

## `GET /api/v1/attendance/me/{offering_id}/`

**Summary**: GET /api/v1/attendance/me/{offering_id}/

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `offering_id` | `path` | `string (uuid)` | Yes |  |
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `search` | `query` | `string` | No | A search term. |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of AttendanceRecord` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "timetable_entry": "123e4567-e89b-12d3-a456-426614174000",
      "student": "123e4567-e89b-12d3-a456-426614174000",
      "student_name": "string",
      "date": "2023-10-23",
      "status": "present",
      "marked_by": "123e4567-e89b-12d3-a456-426614174000",
      "remarks": "string",
      "created_at": "2023-10-23T12:00:00Z"
    }
  ]
}
```

---

# Auth APIs

## `POST /api/v1/auth/login/`

**Summary**: Takes a set of user credentials and returns an access and refresh JSON web
token pair to prove the authentication of those credentials.

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes |  (write-only) |
| `password` | `string` | Yes |  (write-only) |

**Example Request**:
```json
{
  "email": "string",
  "password": "string"
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `access` | `string` | Yes |  (read-only) |
| `refresh` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "access": "string",
  "refresh": "string"
}
```

---

## `POST /api/v1/auth/logout/`

**Summary**: POST /api/v1/auth/logout/ — Blacklist the refresh token.

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `refresh` | `string` | Yes |  |

**Example Request**:
```json
{
  "refresh": "string"
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | `string` | Yes |  |
| `message` | `string` | Yes |  |

**Example Response**:
```json
{
  "status": "string",
  "message": "string"
}
```

---

## `POST /api/v1/auth/password/change/`

**Summary**: POST /api/v1/auth/password/change/

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `old_password` | `string` | Yes |  |
| `new_password` | `string` | Yes |  |

**Example Request**:
```json
{
  "old_password": "string",
  "new_password": "string"
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | `string` | Yes |  |
| `message` | `string` | Yes |  |

**Example Response**:
```json
{
  "status": "string",
  "message": "string"
}
```

---

## `POST /api/v1/auth/refresh/`

**Summary**: Takes a refresh type JSON web token and returns an access type JSON web
token if the refresh token is valid.

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `refresh` | `string` | Yes |  |

**Example Request**:
```json
{
  "refresh": "string"
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `access` | `string` | Yes |  (read-only) |
| `refresh` | `string` | Yes |  |

**Example Response**:
```json
{
  "access": "string",
  "refresh": "string"
}
```

---

## `POST /api/v1/auth/register/`

**Summary**: POST /api/v1/auth/register/ — Self-registration.

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes |  |
| `password` | `string` | Yes |  (write-only) |
| `password_confirm` | `string` | Yes |  (write-only) |
| `first_name` | `string` | Yes |  |
| `last_name` | `string` | Yes |  |
| `role` | `RoleEnum` | Yes |  |

**Example Request**:
```json
{
  "email": "user@example.com",
  "password": "string",
  "password_confirm": "string",
  "first_name": "string",
  "last_name": "string",
  "role": "admin"
}
```

#### Response: 201 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `email` | `string` | Yes |  |
| `first_name` | `string` | Yes |  |
| `last_name` | `string` | Yes |  |
| `role` | `RoleEnum` | Yes |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "first_name": "string",
  "last_name": "string",
  "role": "admin"
}
```

---

# Communications APIs

## `GET /api/v1/communications/announcements/`

**Summary**: communications_announcements_list

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `is_published` | `query` | `boolean` | No |  |
| `is_urgent` | `query` | `boolean` | No |  |
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `search` | `query` | `string` | No | A search term. |
| `target_type` | `query` | `string` | No | * `all` - All Users * `department` - Department * `course` - Course * `section` - Section |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of Announcement` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "string",
      "body": "string",
      "created_by": "123e4567-e89b-12d3-a456-426614174000",
      "created_by_name": "string",
      "target_type": "all",
      "target_id": "123e4567-e89b-12d3-a456-426614174000",
      "is_urgent": true,
      "publish_at": "2023-10-23T12:00:00Z",
      "expires_at": "2023-10-23T12:00:00Z",
      "is_published": true,
      "created_at": "2023-10-23T12:00:00Z"
    }
  ]
}
```

---

## `POST /api/v1/communications/announcements/`

**Summary**: communications_announcements_create

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | Yes |  |
| `body` | `string` | Yes |  |
| `target_type` | `TargetTypeEnum` | Yes |  |
| `target_id` | `string` | No |  |
| `is_urgent` | `boolean` | No |  |
| `publish_at` | `string` | No |  |
| `expires_at` | `string` | No |  |
| `is_published` | `boolean` | No |  |

**Example Request**:
```json
{
  "title": "string",
  "body": "string",
  "target_type": "all",
  "target_id": "123e4567-e89b-12d3-a456-426614174000",
  "is_urgent": true,
  "publish_at": "2023-10-23T12:00:00Z",
  "expires_at": "2023-10-23T12:00:00Z",
  "is_published": true
}
```

#### Response: 201 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `title` | `string` | Yes |  |
| `body` | `string` | Yes |  |
| `created_by` | `string` | Yes |  (read-only) |
| `created_by_name` | `string` | Yes |  (read-only) |
| `target_type` | `TargetTypeEnum` | Yes |  |
| `target_id` | `string` | No |  |
| `is_urgent` | `boolean` | No |  |
| `publish_at` | `string` | No |  |
| `expires_at` | `string` | No |  |
| `is_published` | `boolean` | No |  |
| `created_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "string",
  "body": "string",
  "created_by": "123e4567-e89b-12d3-a456-426614174000",
  "created_by_name": "string",
  "target_type": "all",
  "target_id": "123e4567-e89b-12d3-a456-426614174000",
  "is_urgent": true,
  "publish_at": "2023-10-23T12:00:00Z",
  "expires_at": "2023-10-23T12:00:00Z",
  "is_published": true,
  "created_at": "2023-10-23T12:00:00Z"
}
```

---

## `GET /api/v1/communications/announcements/{id}/`

**Summary**: communications_announcements_retrieve

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `title` | `string` | Yes |  |
| `body` | `string` | Yes |  |
| `created_by` | `string` | Yes |  (read-only) |
| `created_by_name` | `string` | Yes |  (read-only) |
| `target_type` | `TargetTypeEnum` | Yes |  |
| `target_id` | `string` | No |  |
| `is_urgent` | `boolean` | No |  |
| `publish_at` | `string` | No |  |
| `expires_at` | `string` | No |  |
| `is_published` | `boolean` | No |  |
| `created_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "string",
  "body": "string",
  "created_by": "123e4567-e89b-12d3-a456-426614174000",
  "created_by_name": "string",
  "target_type": "all",
  "target_id": "123e4567-e89b-12d3-a456-426614174000",
  "is_urgent": true,
  "publish_at": "2023-10-23T12:00:00Z",
  "expires_at": "2023-10-23T12:00:00Z",
  "is_published": true,
  "created_at": "2023-10-23T12:00:00Z"
}
```

---

## `PUT /api/v1/communications/announcements/{id}/`

**Summary**: communications_announcements_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | Yes |  |
| `body` | `string` | Yes |  |
| `target_type` | `TargetTypeEnum` | Yes |  |
| `target_id` | `string` | No |  |
| `is_urgent` | `boolean` | No |  |
| `publish_at` | `string` | No |  |
| `expires_at` | `string` | No |  |
| `is_published` | `boolean` | No |  |

**Example Request**:
```json
{
  "title": "string",
  "body": "string",
  "target_type": "all",
  "target_id": "123e4567-e89b-12d3-a456-426614174000",
  "is_urgent": true,
  "publish_at": "2023-10-23T12:00:00Z",
  "expires_at": "2023-10-23T12:00:00Z",
  "is_published": true
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `title` | `string` | Yes |  |
| `body` | `string` | Yes |  |
| `created_by` | `string` | Yes |  (read-only) |
| `created_by_name` | `string` | Yes |  (read-only) |
| `target_type` | `TargetTypeEnum` | Yes |  |
| `target_id` | `string` | No |  |
| `is_urgent` | `boolean` | No |  |
| `publish_at` | `string` | No |  |
| `expires_at` | `string` | No |  |
| `is_published` | `boolean` | No |  |
| `created_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "string",
  "body": "string",
  "created_by": "123e4567-e89b-12d3-a456-426614174000",
  "created_by_name": "string",
  "target_type": "all",
  "target_id": "123e4567-e89b-12d3-a456-426614174000",
  "is_urgent": true,
  "publish_at": "2023-10-23T12:00:00Z",
  "expires_at": "2023-10-23T12:00:00Z",
  "is_published": true,
  "created_at": "2023-10-23T12:00:00Z"
}
```

---

## `PATCH /api/v1/communications/announcements/{id}/`

**Summary**: communications_announcements_partial_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | No |  |
| `body` | `string` | No |  |
| `target_type` | `TargetTypeEnum` | No |  |
| `target_id` | `string` | No |  |
| `is_urgent` | `boolean` | No |  |
| `publish_at` | `string` | No |  |
| `expires_at` | `string` | No |  |
| `is_published` | `boolean` | No |  |

**Example Request**:
```json
{
  "title": "string",
  "body": "string",
  "target_type": "all",
  "target_id": "123e4567-e89b-12d3-a456-426614174000",
  "is_urgent": true,
  "publish_at": "2023-10-23T12:00:00Z",
  "expires_at": "2023-10-23T12:00:00Z",
  "is_published": true
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `title` | `string` | Yes |  |
| `body` | `string` | Yes |  |
| `created_by` | `string` | Yes |  (read-only) |
| `created_by_name` | `string` | Yes |  (read-only) |
| `target_type` | `TargetTypeEnum` | Yes |  |
| `target_id` | `string` | No |  |
| `is_urgent` | `boolean` | No |  |
| `publish_at` | `string` | No |  |
| `expires_at` | `string` | No |  |
| `is_published` | `boolean` | No |  |
| `created_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "string",
  "body": "string",
  "created_by": "123e4567-e89b-12d3-a456-426614174000",
  "created_by_name": "string",
  "target_type": "all",
  "target_id": "123e4567-e89b-12d3-a456-426614174000",
  "is_urgent": true,
  "publish_at": "2023-10-23T12:00:00Z",
  "expires_at": "2023-10-23T12:00:00Z",
  "is_published": true,
  "created_at": "2023-10-23T12:00:00Z"
}
```

---

## `DELETE /api/v1/communications/announcements/{id}/`

**Summary**: communications_announcements_destroy

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 204 No response body

---

## `GET /api/v1/communications/forums/`

**Summary**: communications_forums_list

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `course_offering` | `query` | `string (uuid)` | No |  |
| `is_active` | `query` | `boolean` | No |  |
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `search` | `query` | `string` | No | A search term. |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of DiscussionForum` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "string",
      "course_offering": "123e4567-e89b-12d3-a456-426614174000",
      "created_by": "123e4567-e89b-12d3-a456-426614174000",
      "created_by_name": "string",
      "is_active": true,
      "post_count": 0,
      "created_at": "2023-10-23T12:00:00Z"
    }
  ]
}
```

---

## `POST /api/v1/communications/forums/`

**Summary**: communications_forums_create

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | Yes |  |
| `course_offering` | `string` | Yes |  |
| `is_active` | `boolean` | No |  |

**Example Request**:
```json
{
  "title": "string",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "is_active": true
}
```

#### Response: 201 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `title` | `string` | Yes |  |
| `course_offering` | `string` | Yes |  |
| `created_by` | `string` | Yes |  (read-only) |
| `created_by_name` | `string` | Yes |  (read-only) |
| `is_active` | `boolean` | No |  |
| `post_count` | `integer` | Yes |  (read-only) |
| `created_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "string",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "created_by": "123e4567-e89b-12d3-a456-426614174000",
  "created_by_name": "string",
  "is_active": true,
  "post_count": 0,
  "created_at": "2023-10-23T12:00:00Z"
}
```

---

## `PUT /api/v1/communications/forums/{forum_id}/posts/{id}/`

**Summary**: communications_forums_posts_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `forum_id` | `path` | `string (uuid)` | Yes |  |
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `forum` | `string` | Yes |  |
| `parent` | `string` | No |  |
| `body` | `string` | Yes |  |

**Example Request**:
```json
{
  "forum": "123e4567-e89b-12d3-a456-426614174000",
  "parent": "123e4567-e89b-12d3-a456-426614174000",
  "body": "string"
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `forum` | `string` | Yes |  |
| `author` | `string` | Yes |  (read-only) |
| `author_name` | `string` | Yes |  (read-only) |
| `parent` | `string` | No |  |
| `body` | `string` | Yes |  |
| `replies` | `Array of object` | Yes |  (read-only) |
| `created_at` | `string` | Yes |  (read-only) |
| `updated_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "forum": "123e4567-e89b-12d3-a456-426614174000",
  "author": "123e4567-e89b-12d3-a456-426614174000",
  "author_name": "string",
  "parent": "123e4567-e89b-12d3-a456-426614174000",
  "body": "string",
  "replies": [
    {}
  ],
  "created_at": "2023-10-23T12:00:00Z",
  "updated_at": "2023-10-23T12:00:00Z"
}
```

---

## `PATCH /api/v1/communications/forums/{forum_id}/posts/{id}/`

**Summary**: communications_forums_posts_partial_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `forum_id` | `path` | `string (uuid)` | Yes |  |
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `forum` | `string` | No |  |
| `parent` | `string` | No |  |
| `body` | `string` | No |  |

**Example Request**:
```json
{
  "forum": "123e4567-e89b-12d3-a456-426614174000",
  "parent": "123e4567-e89b-12d3-a456-426614174000",
  "body": "string"
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `forum` | `string` | Yes |  |
| `author` | `string` | Yes |  (read-only) |
| `author_name` | `string` | Yes |  (read-only) |
| `parent` | `string` | No |  |
| `body` | `string` | Yes |  |
| `replies` | `Array of object` | Yes |  (read-only) |
| `created_at` | `string` | Yes |  (read-only) |
| `updated_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "forum": "123e4567-e89b-12d3-a456-426614174000",
  "author": "123e4567-e89b-12d3-a456-426614174000",
  "author_name": "string",
  "parent": "123e4567-e89b-12d3-a456-426614174000",
  "body": "string",
  "replies": [
    {}
  ],
  "created_at": "2023-10-23T12:00:00Z",
  "updated_at": "2023-10-23T12:00:00Z"
}
```

---

## `DELETE /api/v1/communications/forums/{forum_id}/posts/{id}/delete/`

**Summary**: communications_forums_posts_delete_destroy

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `forum_id` | `path` | `string (uuid)` | Yes |  |
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 204 No response body

---

## `POST /api/v1/communications/forums/{id}/posts/`

**Summary**: POST /api/v1/communications/forums/{id}/posts/

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `forum` | `string` | Yes |  |
| `parent` | `string` | No |  |
| `body` | `string` | Yes |  |

**Example Request**:
```json
{
  "forum": "123e4567-e89b-12d3-a456-426614174000",
  "parent": "123e4567-e89b-12d3-a456-426614174000",
  "body": "string"
}
```

#### Response: 201 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `forum` | `string` | Yes |  |
| `author` | `string` | Yes |  (read-only) |
| `author_name` | `string` | Yes |  (read-only) |
| `parent` | `string` | No |  |
| `body` | `string` | Yes |  |
| `replies` | `Array of object` | Yes |  (read-only) |
| `created_at` | `string` | Yes |  (read-only) |
| `updated_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "forum": "123e4567-e89b-12d3-a456-426614174000",
  "author": "123e4567-e89b-12d3-a456-426614174000",
  "author_name": "string",
  "parent": "123e4567-e89b-12d3-a456-426614174000",
  "body": "string",
  "replies": [
    {}
  ],
  "created_at": "2023-10-23T12:00:00Z",
  "updated_at": "2023-10-23T12:00:00Z"
}
```

---

## `GET /api/v1/communications/messages/`

**Summary**: communications_messages_list

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `search` | `query` | `string` | No | A search term. |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of Message` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "sender": "123e4567-e89b-12d3-a456-426614174000",
      "sender_name": "string",
      "receiver": "123e4567-e89b-12d3-a456-426614174000",
      "receiver_name": "string",
      "subject": "string",
      "body": "string",
      "is_read": true,
      "read_at": "2023-10-23T12:00:00Z",
      "created_at": "2023-10-23T12:00:00Z"
    }
  ]
}
```

---

## `POST /api/v1/communications/messages/`

**Summary**: communications_messages_create

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `receiver` | `string` | Yes |  |
| `subject` | `string` | No |  |
| `body` | `string` | Yes |  |

**Example Request**:
```json
{
  "receiver": "123e4567-e89b-12d3-a456-426614174000",
  "subject": "string",
  "body": "string"
}
```

#### Response: 201 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `sender` | `string` | Yes |  (read-only) |
| `sender_name` | `string` | Yes |  (read-only) |
| `receiver` | `string` | Yes |  |
| `receiver_name` | `string` | Yes |  (read-only) |
| `subject` | `string` | No |  |
| `body` | `string` | Yes |  |
| `is_read` | `boolean` | Yes |  (read-only) |
| `read_at` | `string` | Yes |  (read-only) |
| `created_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "sender": "123e4567-e89b-12d3-a456-426614174000",
  "sender_name": "string",
  "receiver": "123e4567-e89b-12d3-a456-426614174000",
  "receiver_name": "string",
  "subject": "string",
  "body": "string",
  "is_read": true,
  "read_at": "2023-10-23T12:00:00Z",
  "created_at": "2023-10-23T12:00:00Z"
}
```

---

## `GET /api/v1/communications/messages/{id}/`

**Summary**: communications_messages_retrieve

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `sender` | `string` | Yes |  (read-only) |
| `sender_name` | `string` | Yes |  (read-only) |
| `receiver` | `string` | Yes |  |
| `receiver_name` | `string` | Yes |  (read-only) |
| `subject` | `string` | No |  |
| `body` | `string` | Yes |  |
| `is_read` | `boolean` | Yes |  (read-only) |
| `read_at` | `string` | Yes |  (read-only) |
| `created_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "sender": "123e4567-e89b-12d3-a456-426614174000",
  "sender_name": "string",
  "receiver": "123e4567-e89b-12d3-a456-426614174000",
  "receiver_name": "string",
  "subject": "string",
  "body": "string",
  "is_read": true,
  "read_at": "2023-10-23T12:00:00Z",
  "created_at": "2023-10-23T12:00:00Z"
}
```

---

## `DELETE /api/v1/communications/messages/{id}/`

**Summary**: communications_messages_destroy

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 204 No response body

---

# Content APIs

## `GET /api/v1/content/`

**Summary**: content_list

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `content_type` | `query` | `string` | No | * `document` - Document * `video` - Video * `image` - Image * `link` - Link * `assignment` - Assignment |
| `course_offering` | `query` | `string (uuid)` | No |  |
| `folder` | `query` | `string (uuid)` | No |  |
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `search` | `query` | `string` | No | A search term. |
| `visibility` | `query` | `string` | No | * `public` - Public * `department` - Department * `course` - Course * `private` - Private |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of ContentList` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "string",
      "content_type": "document",
      "file_size": 0,
      "mime_type": "string",
      "uploaded_by": "123e4567-e89b-12d3-a456-426614174000",
      "uploaded_by_name": "string",
      "course_offering": "123e4567-e89b-12d3-a456-426614174000",
      "visibility": "public",
      "is_published": true,
      "tags": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "name": "string"
        }
      ],
      "created_at": "2023-10-23T12:00:00Z"
    }
  ]
}
```

---

## `POST /api/v1/content/`

**Summary**: content_create

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | Yes |  |
| `description` | `string` | No |  |
| `content_type` | `ContentTypeEnum` | Yes |  |
| `file` | `string` | No |  |
| `file_size` | `integer` | No |  |
| `mime_type` | `string` | No |  |
| `external_url` | `string` | No |  |
| `folder` | `string` | No |  |
| `course_offering` | `string` | No |  |
| `visibility` | `VisibilityEnum` | No |  |
| `tag_ids` | `Array of string` | No |  (write-only) |
| `publish_at` | `string` | No |  |
| `expires_at` | `string` | No |  |
| `is_published` | `boolean` | No |  |

**Example Request**:
```json
{
  "title": "string",
  "description": "string",
  "content_type": "document",
  "file": "string",
  "file_size": 0,
  "mime_type": "string",
  "external_url": "https://example.com/resource",
  "folder": "123e4567-e89b-12d3-a456-426614174000",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "visibility": "public",
  "tag_ids": [
    "123e4567-e89b-12d3-a456-426614174000"
  ],
  "publish_at": "2023-10-23T12:00:00Z",
  "expires_at": "2023-10-23T12:00:00Z",
  "is_published": true
}
```

#### Response: 201 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `title` | `string` | Yes |  |
| `description` | `string` | No |  |
| `content_type` | `ContentTypeEnum` | Yes |  |
| `file` | `string` | No |  |
| `file_size` | `integer` | No |  |
| `mime_type` | `string` | No |  |
| `external_url` | `string` | No |  |
| `folder` | `string` | No |  |
| `course_offering` | `string` | No |  |
| `uploaded_by` | `string` | Yes |  (read-only) |
| `uploaded_by_name` | `string` | Yes |  (read-only) |
| `visibility` | `VisibilityEnum` | No |  |
| `tags` | `Array of ContentTag` | Yes |  (read-only) |
| `publish_at` | `string` | No |  |
| `expires_at` | `string` | No |  |
| `is_published` | `boolean` | No |  |
| `created_at` | `string` | Yes |  (read-only) |
| `updated_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "string",
  "description": "string",
  "content_type": "document",
  "file": "https://example.com/resource",
  "file_size": 0,
  "mime_type": "string",
  "external_url": "https://example.com/resource",
  "folder": "123e4567-e89b-12d3-a456-426614174000",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "uploaded_by": "123e4567-e89b-12d3-a456-426614174000",
  "uploaded_by_name": "string",
  "visibility": "public",
  "tags": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "string"
    }
  ],
  "publish_at": "2023-10-23T12:00:00Z",
  "expires_at": "2023-10-23T12:00:00Z",
  "is_published": true,
  "created_at": "2023-10-23T12:00:00Z",
  "updated_at": "2023-10-23T12:00:00Z"
}
```

---

## `GET /api/v1/content/{id}/`

**Summary**: content_retrieve

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `title` | `string` | Yes |  |
| `description` | `string` | No |  |
| `content_type` | `ContentTypeEnum` | Yes |  |
| `file` | `string` | No |  |
| `file_size` | `integer` | No |  |
| `mime_type` | `string` | No |  |
| `external_url` | `string` | No |  |
| `folder` | `string` | No |  |
| `course_offering` | `string` | No |  |
| `uploaded_by` | `string` | Yes |  (read-only) |
| `uploaded_by_name` | `string` | Yes |  (read-only) |
| `visibility` | `VisibilityEnum` | No |  |
| `tags` | `Array of ContentTag` | Yes |  (read-only) |
| `publish_at` | `string` | No |  |
| `expires_at` | `string` | No |  |
| `is_published` | `boolean` | No |  |
| `created_at` | `string` | Yes |  (read-only) |
| `updated_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "string",
  "description": "string",
  "content_type": "document",
  "file": "https://example.com/resource",
  "file_size": 0,
  "mime_type": "string",
  "external_url": "https://example.com/resource",
  "folder": "123e4567-e89b-12d3-a456-426614174000",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "uploaded_by": "123e4567-e89b-12d3-a456-426614174000",
  "uploaded_by_name": "string",
  "visibility": "public",
  "tags": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "string"
    }
  ],
  "publish_at": "2023-10-23T12:00:00Z",
  "expires_at": "2023-10-23T12:00:00Z",
  "is_published": true,
  "created_at": "2023-10-23T12:00:00Z",
  "updated_at": "2023-10-23T12:00:00Z"
}
```

---

## `PUT /api/v1/content/{id}/`

**Summary**: content_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | Yes |  |
| `description` | `string` | No |  |
| `content_type` | `ContentTypeEnum` | Yes |  |
| `file` | `string` | No |  |
| `file_size` | `integer` | No |  |
| `mime_type` | `string` | No |  |
| `external_url` | `string` | No |  |
| `folder` | `string` | No |  |
| `course_offering` | `string` | No |  |
| `visibility` | `VisibilityEnum` | No |  |
| `tag_ids` | `Array of string` | No |  (write-only) |
| `publish_at` | `string` | No |  |
| `expires_at` | `string` | No |  |
| `is_published` | `boolean` | No |  |

**Example Request**:
```json
{
  "title": "string",
  "description": "string",
  "content_type": "document",
  "file": "string",
  "file_size": 0,
  "mime_type": "string",
  "external_url": "https://example.com/resource",
  "folder": "123e4567-e89b-12d3-a456-426614174000",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "visibility": "public",
  "tag_ids": [
    "123e4567-e89b-12d3-a456-426614174000"
  ],
  "publish_at": "2023-10-23T12:00:00Z",
  "expires_at": "2023-10-23T12:00:00Z",
  "is_published": true
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `title` | `string` | Yes |  |
| `description` | `string` | No |  |
| `content_type` | `ContentTypeEnum` | Yes |  |
| `file` | `string` | No |  |
| `file_size` | `integer` | No |  |
| `mime_type` | `string` | No |  |
| `external_url` | `string` | No |  |
| `folder` | `string` | No |  |
| `course_offering` | `string` | No |  |
| `uploaded_by` | `string` | Yes |  (read-only) |
| `uploaded_by_name` | `string` | Yes |  (read-only) |
| `visibility` | `VisibilityEnum` | No |  |
| `tags` | `Array of ContentTag` | Yes |  (read-only) |
| `publish_at` | `string` | No |  |
| `expires_at` | `string` | No |  |
| `is_published` | `boolean` | No |  |
| `created_at` | `string` | Yes |  (read-only) |
| `updated_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "string",
  "description": "string",
  "content_type": "document",
  "file": "https://example.com/resource",
  "file_size": 0,
  "mime_type": "string",
  "external_url": "https://example.com/resource",
  "folder": "123e4567-e89b-12d3-a456-426614174000",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "uploaded_by": "123e4567-e89b-12d3-a456-426614174000",
  "uploaded_by_name": "string",
  "visibility": "public",
  "tags": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "string"
    }
  ],
  "publish_at": "2023-10-23T12:00:00Z",
  "expires_at": "2023-10-23T12:00:00Z",
  "is_published": true,
  "created_at": "2023-10-23T12:00:00Z",
  "updated_at": "2023-10-23T12:00:00Z"
}
```

---

## `PATCH /api/v1/content/{id}/`

**Summary**: content_partial_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | No |  |
| `description` | `string` | No |  |
| `content_type` | `ContentTypeEnum` | No |  |
| `file` | `string` | No |  |
| `file_size` | `integer` | No |  |
| `mime_type` | `string` | No |  |
| `external_url` | `string` | No |  |
| `folder` | `string` | No |  |
| `course_offering` | `string` | No |  |
| `visibility` | `VisibilityEnum` | No |  |
| `tag_ids` | `Array of string` | No |  (write-only) |
| `publish_at` | `string` | No |  |
| `expires_at` | `string` | No |  |
| `is_published` | `boolean` | No |  |

**Example Request**:
```json
{
  "title": "string",
  "description": "string",
  "content_type": "document",
  "file": "string",
  "file_size": 0,
  "mime_type": "string",
  "external_url": "https://example.com/resource",
  "folder": "123e4567-e89b-12d3-a456-426614174000",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "visibility": "public",
  "tag_ids": [
    "123e4567-e89b-12d3-a456-426614174000"
  ],
  "publish_at": "2023-10-23T12:00:00Z",
  "expires_at": "2023-10-23T12:00:00Z",
  "is_published": true
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `title` | `string` | Yes |  |
| `description` | `string` | No |  |
| `content_type` | `ContentTypeEnum` | Yes |  |
| `file` | `string` | No |  |
| `file_size` | `integer` | No |  |
| `mime_type` | `string` | No |  |
| `external_url` | `string` | No |  |
| `folder` | `string` | No |  |
| `course_offering` | `string` | No |  |
| `uploaded_by` | `string` | Yes |  (read-only) |
| `uploaded_by_name` | `string` | Yes |  (read-only) |
| `visibility` | `VisibilityEnum` | No |  |
| `tags` | `Array of ContentTag` | Yes |  (read-only) |
| `publish_at` | `string` | No |  |
| `expires_at` | `string` | No |  |
| `is_published` | `boolean` | No |  |
| `created_at` | `string` | Yes |  (read-only) |
| `updated_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "string",
  "description": "string",
  "content_type": "document",
  "file": "https://example.com/resource",
  "file_size": 0,
  "mime_type": "string",
  "external_url": "https://example.com/resource",
  "folder": "123e4567-e89b-12d3-a456-426614174000",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "uploaded_by": "123e4567-e89b-12d3-a456-426614174000",
  "uploaded_by_name": "string",
  "visibility": "public",
  "tags": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "string"
    }
  ],
  "publish_at": "2023-10-23T12:00:00Z",
  "expires_at": "2023-10-23T12:00:00Z",
  "is_published": true,
  "created_at": "2023-10-23T12:00:00Z",
  "updated_at": "2023-10-23T12:00:00Z"
}
```

---

## `DELETE /api/v1/content/{id}/`

**Summary**: content_destroy

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 204 No response body

---

## `GET /api/v1/content/{id}/download/`

**Summary**: GET /api/v1/content/{id}/download/ — returns file URL and logs download.

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | `string` | Yes |  |
| `data` | `object` | Yes |  |

**Example Response**:
```json
{
  "status": "string",
  "data": {}
}
```

---

## `GET /api/v1/content/{id}/stats/`

**Summary**: GET /api/v1/content/{id}/stats/

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | `string` | Yes |  |
| `data` | `ContentStatsData` | Yes |  |

**Example Response**:
```json
{
  "status": "string",
  "data": {
    "total_views": 0,
    "total_downloads": 0,
    "bookmarks": 0
  }
}
```

---

## `GET /api/v1/content/bookmarks/`

**Summary**: content_bookmarks_list

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `search` | `query` | `string` | No | A search term. |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of Bookmark` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user": "123e4567-e89b-12d3-a456-426614174000",
      "content": "123e4567-e89b-12d3-a456-426614174000",
      "content_title": "string",
      "content_type": "string",
      "created_at": "2023-10-23T12:00:00Z"
    }
  ]
}
```

---

## `POST /api/v1/content/bookmarks/`

**Summary**: content_bookmarks_create

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | `string` | Yes |  |

**Example Request**:
```json
{
  "content": "123e4567-e89b-12d3-a456-426614174000"
}
```

#### Response: 201 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `user` | `string` | Yes |  (read-only) |
| `content` | `string` | Yes |  |
| `content_title` | `string` | Yes |  (read-only) |
| `content_type` | `string` | Yes |  (read-only) |
| `created_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user": "123e4567-e89b-12d3-a456-426614174000",
  "content": "123e4567-e89b-12d3-a456-426614174000",
  "content_title": "string",
  "content_type": "string",
  "created_at": "2023-10-23T12:00:00Z"
}
```

---

## `DELETE /api/v1/content/bookmarks/{id}/`

**Summary**: content_bookmarks_destroy

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 204 No response body

---

## `GET /api/v1/content/folders/`

**Summary**: content_folders_list

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `course_offering` | `query` | `string (uuid)` | No |  |
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `parent` | `query` | `string (uuid)` | No |  |
| `search` | `query` | `string` | No | A search term. |
| `visibility` | `query` | `string` | No | * `public` - Public * `department` - Department * `course` - Course * `private` - Private |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of ContentFolder` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "string",
      "parent": "123e4567-e89b-12d3-a456-426614174000",
      "created_by": "123e4567-e89b-12d3-a456-426614174000",
      "created_by_name": "string",
      "course_offering": "123e4567-e89b-12d3-a456-426614174000",
      "visibility": "public",
      "created_at": "2023-10-23T12:00:00Z"
    }
  ]
}
```

---

## `POST /api/v1/content/folders/`

**Summary**: content_folders_create

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes |  |
| `parent` | `string` | No |  |
| `course_offering` | `string` | No |  |
| `visibility` | `VisibilityEnum` | No |  |

**Example Request**:
```json
{
  "name": "string",
  "parent": "123e4567-e89b-12d3-a456-426614174000",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "visibility": "public"
}
```

#### Response: 201 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `parent` | `string` | No |  |
| `created_by` | `string` | Yes |  (read-only) |
| `created_by_name` | `string` | Yes |  (read-only) |
| `course_offering` | `string` | No |  |
| `visibility` | `VisibilityEnum` | No |  |
| `created_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "parent": "123e4567-e89b-12d3-a456-426614174000",
  "created_by": "123e4567-e89b-12d3-a456-426614174000",
  "created_by_name": "string",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "visibility": "public",
  "created_at": "2023-10-23T12:00:00Z"
}
```

---

## `GET /api/v1/content/folders/{id}/`

**Summary**: content_folders_retrieve

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `parent` | `string` | No |  |
| `created_by` | `string` | Yes |  (read-only) |
| `created_by_name` | `string` | Yes |  (read-only) |
| `course_offering` | `string` | No |  |
| `visibility` | `VisibilityEnum` | No |  |
| `created_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "parent": "123e4567-e89b-12d3-a456-426614174000",
  "created_by": "123e4567-e89b-12d3-a456-426614174000",
  "created_by_name": "string",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "visibility": "public",
  "created_at": "2023-10-23T12:00:00Z"
}
```

---

## `PUT /api/v1/content/folders/{id}/`

**Summary**: content_folders_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes |  |
| `parent` | `string` | No |  |
| `course_offering` | `string` | No |  |
| `visibility` | `VisibilityEnum` | No |  |

**Example Request**:
```json
{
  "name": "string",
  "parent": "123e4567-e89b-12d3-a456-426614174000",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "visibility": "public"
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `parent` | `string` | No |  |
| `created_by` | `string` | Yes |  (read-only) |
| `created_by_name` | `string` | Yes |  (read-only) |
| `course_offering` | `string` | No |  |
| `visibility` | `VisibilityEnum` | No |  |
| `created_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "parent": "123e4567-e89b-12d3-a456-426614174000",
  "created_by": "123e4567-e89b-12d3-a456-426614174000",
  "created_by_name": "string",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "visibility": "public",
  "created_at": "2023-10-23T12:00:00Z"
}
```

---

## `PATCH /api/v1/content/folders/{id}/`

**Summary**: content_folders_partial_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | No |  |
| `parent` | `string` | No |  |
| `course_offering` | `string` | No |  |
| `visibility` | `VisibilityEnum` | No |  |

**Example Request**:
```json
{
  "name": "string",
  "parent": "123e4567-e89b-12d3-a456-426614174000",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "visibility": "public"
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `parent` | `string` | No |  |
| `created_by` | `string` | Yes |  (read-only) |
| `created_by_name` | `string` | Yes |  (read-only) |
| `course_offering` | `string` | No |  |
| `visibility` | `VisibilityEnum` | No |  |
| `created_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "parent": "123e4567-e89b-12d3-a456-426614174000",
  "created_by": "123e4567-e89b-12d3-a456-426614174000",
  "created_by_name": "string",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "visibility": "public",
  "created_at": "2023-10-23T12:00:00Z"
}
```

---

## `DELETE /api/v1/content/folders/{id}/`

**Summary**: content_folders_destroy

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 204 No response body

---

## `GET /api/v1/content/recent/`

**Summary**: GET /api/v1/content/recent/

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `search` | `query` | `string` | No | A search term. |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of ContentList` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "string",
      "content_type": "document",
      "file_size": 0,
      "mime_type": "string",
      "uploaded_by": "123e4567-e89b-12d3-a456-426614174000",
      "uploaded_by_name": "string",
      "course_offering": "123e4567-e89b-12d3-a456-426614174000",
      "visibility": "public",
      "is_published": true,
      "tags": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "name": "string"
        }
      ],
      "created_at": "2023-10-23T12:00:00Z"
    }
  ]
}
```

---

## `GET /api/v1/content/tags/`

**Summary**: content_tags_list

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `search` | `query` | `string` | No | A search term. |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of ContentTag` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "string"
    }
  ]
}
```

---

## `POST /api/v1/content/tags/`

**Summary**: content_tags_create

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes |  |

**Example Request**:
```json
{
  "name": "string"
}
```

#### Response: 201 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string"
}
```

---

# Departments APIs

## `GET /api/v1/departments/`

**Summary**: departments_list

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `search` | `query` | `string` | No | A search term. |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of Department` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "string",
      "code": "string",
      "school": "123e4567-e89b-12d3-a456-426614174000",
      "school_name": "string",
      "head": "123e4567-e89b-12d3-a456-426614174000",
      "head_name": "string",
      "created_at": "2023-10-23T12:00:00Z"
    }
  ]
}
```

---

## `POST /api/v1/departments/`

**Summary**: departments_create

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes |  |
| `code` | `string` | Yes |  |
| `school` | `string` | No |  |
| `head` | `string` | No |  |

**Example Request**:
```json
{
  "name": "string",
  "code": "string",
  "school": "123e4567-e89b-12d3-a456-426614174000",
  "head": "123e4567-e89b-12d3-a456-426614174000"
}
```

#### Response: 201 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `code` | `string` | Yes |  |
| `school` | `string` | No |  |
| `school_name` | `string` | Yes |  (read-only) |
| `head` | `string` | No |  |
| `head_name` | `string` | Yes |  (read-only) |
| `created_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "code": "string",
  "school": "123e4567-e89b-12d3-a456-426614174000",
  "school_name": "string",
  "head": "123e4567-e89b-12d3-a456-426614174000",
  "head_name": "string",
  "created_at": "2023-10-23T12:00:00Z"
}
```

---

## `GET /api/v1/departments/{id}/`

**Summary**: departments_retrieve

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `code` | `string` | Yes |  |
| `school` | `string` | No |  |
| `school_name` | `string` | Yes |  (read-only) |
| `head` | `string` | No |  |
| `head_name` | `string` | Yes |  (read-only) |
| `created_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "code": "string",
  "school": "123e4567-e89b-12d3-a456-426614174000",
  "school_name": "string",
  "head": "123e4567-e89b-12d3-a456-426614174000",
  "head_name": "string",
  "created_at": "2023-10-23T12:00:00Z"
}
```

---

## `PUT /api/v1/departments/{id}/`

**Summary**: departments_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes |  |
| `code` | `string` | Yes |  |
| `school` | `string` | No |  |
| `head` | `string` | No |  |

**Example Request**:
```json
{
  "name": "string",
  "code": "string",
  "school": "123e4567-e89b-12d3-a456-426614174000",
  "head": "123e4567-e89b-12d3-a456-426614174000"
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `code` | `string` | Yes |  |
| `school` | `string` | No |  |
| `school_name` | `string` | Yes |  (read-only) |
| `head` | `string` | No |  |
| `head_name` | `string` | Yes |  (read-only) |
| `created_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "code": "string",
  "school": "123e4567-e89b-12d3-a456-426614174000",
  "school_name": "string",
  "head": "123e4567-e89b-12d3-a456-426614174000",
  "head_name": "string",
  "created_at": "2023-10-23T12:00:00Z"
}
```

---

## `PATCH /api/v1/departments/{id}/`

**Summary**: departments_partial_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | No |  |
| `code` | `string` | No |  |
| `school` | `string` | No |  |
| `head` | `string` | No |  |

**Example Request**:
```json
{
  "name": "string",
  "code": "string",
  "school": "123e4567-e89b-12d3-a456-426614174000",
  "head": "123e4567-e89b-12d3-a456-426614174000"
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `code` | `string` | Yes |  |
| `school` | `string` | No |  |
| `school_name` | `string` | Yes |  (read-only) |
| `head` | `string` | No |  |
| `head_name` | `string` | Yes |  (read-only) |
| `created_at` | `string` | Yes |  (read-only) |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "code": "string",
  "school": "123e4567-e89b-12d3-a456-426614174000",
  "school_name": "string",
  "head": "123e4567-e89b-12d3-a456-426614174000",
  "head_name": "string",
  "created_at": "2023-10-23T12:00:00Z"
}
```

---

## `DELETE /api/v1/departments/{id}/`

**Summary**: departments_destroy

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 204 No response body

---

# Forums APIs

## `GET /api/v1/communications/forums/{id}/`

**Summary**: GET /api/v1/communications/forums/{id}/ — includes top-level posts.

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | `string` | Yes |  |
| `data` | `object` | Yes |  |

**Example Response**:
```json
{
  "status": "string",
  "data": {}
}
```

---

# Notifications APIs

## `GET /api/v1/notifications/`

**Summary**: notifications_list

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `search` | `query` | `string` | No | A search term. |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of Notification` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user": "123e4567-e89b-12d3-a456-426614174000",
      "title": "string",
      "message": "string",
      "notification_type": "announcement",
      "reference_type": "string",
      "reference_id": "123e4567-e89b-12d3-a456-426614174000",
      "channel": "in_app",
      "is_read": true,
      "read_at": "2023-10-23T12:00:00Z",
      "status": "pending",
      "created_at": "2023-10-23T12:00:00Z"
    }
  ]
}
```

---

## `PATCH /api/v1/notifications/{id}/read/`

**Summary**: PATCH /api/v1/notifications/{id}/read/

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | `string` | Yes |  |
| `message` | `string` | Yes |  |

**Example Response**:
```json
{
  "status": "string",
  "message": "string"
}
```

---

## `GET /api/v1/notifications/preferences/`

**Summary**: notifications_preferences_list

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `search` | `query` | `string` | No | A search term. |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of NotificationPreference` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user": "123e4567-e89b-12d3-a456-426614174000",
      "notification_type": "string",
      "email_enabled": true,
      "push_enabled": true,
      "in_app_enabled": true
    }
  ]
}
```

---

## `POST /api/v1/notifications/preferences/`

**Summary**: notifications_preferences_create

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `notification_type` | `string` | Yes |  |
| `email_enabled` | `boolean` | No |  |
| `push_enabled` | `boolean` | No |  |
| `in_app_enabled` | `boolean` | No |  |

**Example Request**:
```json
{
  "notification_type": "string",
  "email_enabled": true,
  "push_enabled": true,
  "in_app_enabled": true
}
```

#### Response: 201 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `user` | `string` | Yes |  (read-only) |
| `notification_type` | `string` | Yes |  |
| `email_enabled` | `boolean` | No |  |
| `push_enabled` | `boolean` | No |  |
| `in_app_enabled` | `boolean` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user": "123e4567-e89b-12d3-a456-426614174000",
  "notification_type": "string",
  "email_enabled": true,
  "push_enabled": true,
  "in_app_enabled": true
}
```

---

## `PUT /api/v1/notifications/preferences/{id}/`

**Summary**: notifications_preferences_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `notification_type` | `string` | Yes |  |
| `email_enabled` | `boolean` | No |  |
| `push_enabled` | `boolean` | No |  |
| `in_app_enabled` | `boolean` | No |  |

**Example Request**:
```json
{
  "notification_type": "string",
  "email_enabled": true,
  "push_enabled": true,
  "in_app_enabled": true
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `user` | `string` | Yes |  (read-only) |
| `notification_type` | `string` | Yes |  |
| `email_enabled` | `boolean` | No |  |
| `push_enabled` | `boolean` | No |  |
| `in_app_enabled` | `boolean` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user": "123e4567-e89b-12d3-a456-426614174000",
  "notification_type": "string",
  "email_enabled": true,
  "push_enabled": true,
  "in_app_enabled": true
}
```

---

## `PATCH /api/v1/notifications/preferences/{id}/`

**Summary**: notifications_preferences_partial_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `notification_type` | `string` | No |  |
| `email_enabled` | `boolean` | No |  |
| `push_enabled` | `boolean` | No |  |
| `in_app_enabled` | `boolean` | No |  |

**Example Request**:
```json
{
  "notification_type": "string",
  "email_enabled": true,
  "push_enabled": true,
  "in_app_enabled": true
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `user` | `string` | Yes |  (read-only) |
| `notification_type` | `string` | Yes |  |
| `email_enabled` | `boolean` | No |  |
| `push_enabled` | `boolean` | No |  |
| `in_app_enabled` | `boolean` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user": "123e4567-e89b-12d3-a456-426614174000",
  "notification_type": "string",
  "email_enabled": true,
  "push_enabled": true,
  "in_app_enabled": true
}
```

---

## `POST /api/v1/notifications/read-all/`

**Summary**: POST /api/v1/notifications/read-all/

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | `string` | Yes |  |
| `message` | `string` | Yes |  |

**Example Response**:
```json
{
  "status": "string",
  "message": "string"
}
```

---

## `GET /api/v1/notifications/unread-count/`

**Summary**: GET /api/v1/notifications/unread-count/

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | `string` | Yes |  |
| `data` | `UnreadCountData` | Yes |  |

**Example Response**:
```json
{
  "status": "string",
  "data": {
    "unread_count": 0
  }
}
```

---

# Root APIs

## `GET /api/v1/`

**Summary**: API root — health check and endpoint overview.

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | `string` | Yes |  |
| `message` | `string` | Yes |  |
| `endpoints` | `object` | Yes |  |
| `docs` | `object` | Yes |  |

**Example Response**:
```json
{
  "status": "string",
  "message": "string",
  "endpoints": {},
  "docs": {}
}
```

---

# Semesters APIs

## `GET /api/v1/academics/semesters/current/`

**Summary**: GET /api/v1/academics/semesters/current/

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `academic_year` | `string` | Yes |  |
| `start_date` | `string` | Yes |  |
| `end_date` | `string` | Yes |  |
| `is_current` | `boolean` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "academic_year": "string",
  "start_date": "2023-10-23",
  "end_date": "2023-10-23",
  "is_current": true
}
```

---

# Submissions APIs

## `PATCH /api/v1/assignments/{id}/submissions/{sub_id}/grade/`

**Summary**: PATCH /api/v1/assignments/{pk}/submissions/{sub_id}/grade/

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |
| `sub_id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `marks_obtained` | `string` | No |  |
| `grade` | `string` | No |  |
| `feedback` | `string` | No |  |

**Example Request**:
```json
{
  "marks_obtained": "string",
  "grade": "string",
  "feedback": "string"
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `assignment` | `string` | Yes |  (read-only) |
| `student` | `string` | Yes |  (read-only) |
| `student_name` | `string` | Yes |  (read-only) |
| `file` | `string` | No |  |
| `text_content` | `string` | No |  |
| `submitted_at` | `string` | Yes |  (read-only) |
| `marks_obtained` | `string` | No |  |
| `grade` | `string` | No |  |
| `feedback` | `string` | No |  |
| `graded_by` | `string` | Yes |  (read-only) |
| `graded_at` | `string` | Yes |  (read-only) |
| `status` | `SubmissionStatusEnum` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "assignment": "123e4567-e89b-12d3-a456-426614174000",
  "student": "123e4567-e89b-12d3-a456-426614174000",
  "student_name": "string",
  "file": "https://example.com/resource",
  "text_content": "string",
  "submitted_at": "2023-10-23T12:00:00Z",
  "marks_obtained": "string",
  "grade": "string",
  "feedback": "string",
  "graded_by": "123e4567-e89b-12d3-a456-426614174000",
  "graded_at": "2023-10-23T12:00:00Z",
  "status": "draft"
}
```

---

## `GET /api/v1/assignments/{id}/submissions/me/`

**Summary**: GET /api/v1/assignments/{id}/submissions/me/

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `assignment` | `string` | Yes |  (read-only) |
| `student` | `string` | Yes |  (read-only) |
| `student_name` | `string` | Yes |  (read-only) |
| `file` | `string` | No |  |
| `text_content` | `string` | No |  |
| `submitted_at` | `string` | Yes |  (read-only) |
| `marks_obtained` | `string` | No |  |
| `grade` | `string` | No |  |
| `feedback` | `string` | No |  |
| `graded_by` | `string` | Yes |  (read-only) |
| `graded_at` | `string` | Yes |  (read-only) |
| `status` | `SubmissionStatusEnum` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "assignment": "123e4567-e89b-12d3-a456-426614174000",
  "student": "123e4567-e89b-12d3-a456-426614174000",
  "student_name": "string",
  "file": "https://example.com/resource",
  "text_content": "string",
  "submitted_at": "2023-10-23T12:00:00Z",
  "marks_obtained": "string",
  "grade": "string",
  "feedback": "string",
  "graded_by": "123e4567-e89b-12d3-a456-426614174000",
  "graded_at": "2023-10-23T12:00:00Z",
  "status": "draft"
}
```

---

# Timetable APIs

## `GET /api/v1/timetable/`

**Summary**: timetable_list

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `day_of_week` | `query` | `integer` | No | * `0` - Monday * `1` - Tuesday * `2` - Wednesday * `3` - Thursday * `4` - Friday * `5` - Saturday * `6` - Sunday |
| `is_active` | `query` | `boolean` | No |  |
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `room` | `query` | `string (uuid)` | No |  |
| `search` | `query` | `string` | No | A search term. |
| `semester` | `query` | `string (uuid)` | No |  |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of TimetableEntry` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "course_offering": "123e4567-e89b-12d3-a456-426614174000",
      "course_name": "string",
      "course_code": "string",
      "faculty_name": "string",
      "room": "123e4567-e89b-12d3-a456-426614174000",
      "room_name": "string",
      "day_of_week": {},
      "day_name": "string",
      "start_time": "string",
      "end_time": "string",
      "semester": "123e4567-e89b-12d3-a456-426614174000",
      "is_active": true
    }
  ]
}
```

---

## `POST /api/v1/timetable/`

**Summary**: timetable_create

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `course_offering` | `string` | Yes |  |
| `room` | `string` | Yes |  |
| `day_of_week` | `string` | Yes |  |
| `start_time` | `string` | Yes |  |
| `end_time` | `string` | Yes |  |
| `semester` | `string` | Yes |  |
| `is_active` | `boolean` | No |  |

**Example Request**:
```json
{
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "room": "123e4567-e89b-12d3-a456-426614174000",
  "day_of_week": {},
  "start_time": "string",
  "end_time": "string",
  "semester": "123e4567-e89b-12d3-a456-426614174000",
  "is_active": true
}
```

#### Response: 201 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `course_offering` | `string` | Yes |  |
| `course_name` | `string` | Yes |  (read-only) |
| `course_code` | `string` | Yes |  (read-only) |
| `faculty_name` | `string` | Yes |  (read-only) |
| `room` | `string` | Yes |  |
| `room_name` | `string` | Yes |  (read-only) |
| `day_of_week` | `string` | Yes |  |
| `day_name` | `string` | Yes |  (read-only) |
| `start_time` | `string` | Yes |  |
| `end_time` | `string` | Yes |  |
| `semester` | `string` | Yes |  |
| `is_active` | `boolean` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "course_name": "string",
  "course_code": "string",
  "faculty_name": "string",
  "room": "123e4567-e89b-12d3-a456-426614174000",
  "room_name": "string",
  "day_of_week": {},
  "day_name": "string",
  "start_time": "string",
  "end_time": "string",
  "semester": "123e4567-e89b-12d3-a456-426614174000",
  "is_active": true
}
```

---

## `GET /api/v1/timetable/{id}/`

**Summary**: timetable_retrieve

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `course_offering` | `string` | Yes |  |
| `course_name` | `string` | Yes |  (read-only) |
| `course_code` | `string` | Yes |  (read-only) |
| `faculty_name` | `string` | Yes |  (read-only) |
| `room` | `string` | Yes |  |
| `room_name` | `string` | Yes |  (read-only) |
| `day_of_week` | `string` | Yes |  |
| `day_name` | `string` | Yes |  (read-only) |
| `start_time` | `string` | Yes |  |
| `end_time` | `string` | Yes |  |
| `semester` | `string` | Yes |  |
| `is_active` | `boolean` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "course_name": "string",
  "course_code": "string",
  "faculty_name": "string",
  "room": "123e4567-e89b-12d3-a456-426614174000",
  "room_name": "string",
  "day_of_week": {},
  "day_name": "string",
  "start_time": "string",
  "end_time": "string",
  "semester": "123e4567-e89b-12d3-a456-426614174000",
  "is_active": true
}
```

---

## `PUT /api/v1/timetable/{id}/`

**Summary**: timetable_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `course_offering` | `string` | Yes |  |
| `room` | `string` | Yes |  |
| `day_of_week` | `string` | Yes |  |
| `start_time` | `string` | Yes |  |
| `end_time` | `string` | Yes |  |
| `semester` | `string` | Yes |  |
| `is_active` | `boolean` | No |  |

**Example Request**:
```json
{
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "room": "123e4567-e89b-12d3-a456-426614174000",
  "day_of_week": {},
  "start_time": "string",
  "end_time": "string",
  "semester": "123e4567-e89b-12d3-a456-426614174000",
  "is_active": true
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `course_offering` | `string` | Yes |  |
| `course_name` | `string` | Yes |  (read-only) |
| `course_code` | `string` | Yes |  (read-only) |
| `faculty_name` | `string` | Yes |  (read-only) |
| `room` | `string` | Yes |  |
| `room_name` | `string` | Yes |  (read-only) |
| `day_of_week` | `string` | Yes |  |
| `day_name` | `string` | Yes |  (read-only) |
| `start_time` | `string` | Yes |  |
| `end_time` | `string` | Yes |  |
| `semester` | `string` | Yes |  |
| `is_active` | `boolean` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "course_name": "string",
  "course_code": "string",
  "faculty_name": "string",
  "room": "123e4567-e89b-12d3-a456-426614174000",
  "room_name": "string",
  "day_of_week": {},
  "day_name": "string",
  "start_time": "string",
  "end_time": "string",
  "semester": "123e4567-e89b-12d3-a456-426614174000",
  "is_active": true
}
```

---

## `PATCH /api/v1/timetable/{id}/`

**Summary**: timetable_partial_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `course_offering` | `string` | No |  |
| `room` | `string` | No |  |
| `day_of_week` | `string` | No |  |
| `start_time` | `string` | No |  |
| `end_time` | `string` | No |  |
| `semester` | `string` | No |  |
| `is_active` | `boolean` | No |  |

**Example Request**:
```json
{
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "room": "123e4567-e89b-12d3-a456-426614174000",
  "day_of_week": {},
  "start_time": "string",
  "end_time": "string",
  "semester": "123e4567-e89b-12d3-a456-426614174000",
  "is_active": true
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `course_offering` | `string` | Yes |  |
| `course_name` | `string` | Yes |  (read-only) |
| `course_code` | `string` | Yes |  (read-only) |
| `faculty_name` | `string` | Yes |  (read-only) |
| `room` | `string` | Yes |  |
| `room_name` | `string` | Yes |  (read-only) |
| `day_of_week` | `string` | Yes |  |
| `day_name` | `string` | Yes |  (read-only) |
| `start_time` | `string` | Yes |  |
| `end_time` | `string` | Yes |  |
| `semester` | `string` | Yes |  |
| `is_active` | `boolean` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "course_offering": "123e4567-e89b-12d3-a456-426614174000",
  "course_name": "string",
  "course_code": "string",
  "faculty_name": "string",
  "room": "123e4567-e89b-12d3-a456-426614174000",
  "room_name": "string",
  "day_of_week": {},
  "day_name": "string",
  "start_time": "string",
  "end_time": "string",
  "semester": "123e4567-e89b-12d3-a456-426614174000",
  "is_active": true
}
```

---

## `DELETE /api/v1/timetable/{id}/`

**Summary**: timetable_destroy

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 204 No response body

---

## `GET /api/v1/timetable/conflicts/`

**Summary**: GET /api/v1/timetable/conflicts/ — check room/faculty conflicts.

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | `string` | Yes |  |
| `data` | `Array of object` | Yes |  |

**Example Response**:
```json
{
  "status": "string",
  "data": [
    {}
  ]
}
```

---

## `GET /api/v1/timetable/me/`

**Summary**: GET /api/v1/timetable/me/ — student or faculty timetable.

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `search` | `query` | `string` | No | A search term. |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of TimetableEntry` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "course_offering": "123e4567-e89b-12d3-a456-426614174000",
      "course_name": "string",
      "course_code": "string",
      "faculty_name": "string",
      "room": "123e4567-e89b-12d3-a456-426614174000",
      "room_name": "string",
      "day_of_week": {},
      "day_name": "string",
      "start_time": "string",
      "end_time": "string",
      "semester": "123e4567-e89b-12d3-a456-426614174000",
      "is_active": true
    }
  ]
}
```

---

## `GET /api/v1/timetable/rooms/`

**Summary**: timetable_rooms_list

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `is_available` | `query` | `boolean` | No |  |
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `room_type` | `query` | `string` | No | * `classroom` - Classroom * `lab` - Laboratory * `auditorium` - Auditorium * `conference` - Conference Room |
| `search` | `query` | `string` | No | A search term. |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of Room` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "string",
      "building": "string",
      "capacity": 0,
      "room_type": "classroom",
      "is_available": true
    }
  ]
}
```

---

## `POST /api/v1/timetable/rooms/`

**Summary**: timetable_rooms_create

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes |  |
| `building` | `string` | No |  |
| `capacity` | `integer` | Yes |  |
| `room_type` | `RoomTypeEnum` | No |  |
| `is_available` | `boolean` | No |  |

**Example Request**:
```json
{
  "name": "string",
  "building": "string",
  "capacity": 0,
  "room_type": "classroom",
  "is_available": true
}
```

#### Response: 201 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `building` | `string` | No |  |
| `capacity` | `integer` | Yes |  |
| `room_type` | `RoomTypeEnum` | No |  |
| `is_available` | `boolean` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "building": "string",
  "capacity": 0,
  "room_type": "classroom",
  "is_available": true
}
```

---

## `GET /api/v1/timetable/rooms/{id}/`

**Summary**: timetable_rooms_retrieve

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `building` | `string` | No |  |
| `capacity` | `integer` | Yes |  |
| `room_type` | `RoomTypeEnum` | No |  |
| `is_available` | `boolean` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "building": "string",
  "capacity": 0,
  "room_type": "classroom",
  "is_available": true
}
```

---

## `PUT /api/v1/timetable/rooms/{id}/`

**Summary**: timetable_rooms_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes |  |
| `building` | `string` | No |  |
| `capacity` | `integer` | Yes |  |
| `room_type` | `RoomTypeEnum` | No |  |
| `is_available` | `boolean` | No |  |

**Example Request**:
```json
{
  "name": "string",
  "building": "string",
  "capacity": 0,
  "room_type": "classroom",
  "is_available": true
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `building` | `string` | No |  |
| `capacity` | `integer` | Yes |  |
| `room_type` | `RoomTypeEnum` | No |  |
| `is_available` | `boolean` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "building": "string",
  "capacity": 0,
  "room_type": "classroom",
  "is_available": true
}
```

---

## `PATCH /api/v1/timetable/rooms/{id}/`

**Summary**: timetable_rooms_partial_update

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | No |  |
| `building` | `string` | No |  |
| `capacity` | `integer` | No |  |
| `room_type` | `RoomTypeEnum` | No |  |
| `is_available` | `boolean` | No |  |

**Example Request**:
```json
{
  "name": "string",
  "building": "string",
  "capacity": 0,
  "room_type": "classroom",
  "is_available": true
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `name` | `string` | Yes |  |
| `building` | `string` | No |  |
| `capacity` | `integer` | Yes |  |
| `room_type` | `RoomTypeEnum` | No |  |
| `is_available` | `boolean` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "string",
  "building": "string",
  "capacity": 0,
  "room_type": "classroom",
  "is_available": true
}
```

---

## `DELETE /api/v1/timetable/rooms/{id}/`

**Summary**: timetable_rooms_destroy

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 204 No response body

---

# Users APIs

## `GET /api/v1/users/`

**Summary**: GET /api/v1/users/ — List users (admin).
POST /api/v1/users/ — Create user (admin).

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `department` | `query` | `string (uuid)` | No |  |
| `is_active` | `query` | `boolean` | No |  |
| `ordering` | `query` | `string` | No | Which field to use when ordering the results. |
| `page` | `query` | `integer` | No | A page number within the paginated result set. |
| `role` | `query` | `string` | No | * `admin` - Admin * `faculty` - Faculty * `student` - Student |
| `search` | `query` | `string` | No | A search term. |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `count` | `integer` | Yes |  |
| `next` | `string` | No |  |
| `previous` | `string` | No |  |
| `results` | `Array of UserList` | Yes |  |

**Example Response**:
```json
{
  "count": 0,
  "next": "https://example.com/resource",
  "previous": "https://example.com/resource",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "first_name": "string",
      "last_name": "string",
      "role": "admin",
      "department": "123e4567-e89b-12d3-a456-426614174000",
      "department_name": "string",
      "phone": "string",
      "is_active": true,
      "last_login": "2023-10-23T12:00:00Z",
      "created_at": "2023-10-23T12:00:00Z",
      "student_profile": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "student_id_number": "string",
        "register_no": "string",
        "program": "123e4567-e89b-12d3-a456-426614174000",
        "current_semester": 0,
        "admission_date": "2023-10-23",
        "batch_year": 0,
        "batch": "string",
        "division": "string"
      },
      "faculty_profile": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "employee_id": "string",
        "designation": "string",
        "specialization": "string",
        "joining_date": "2023-10-23",
        "consultation_hours": null
      }
    }
  ]
}
```

---

## `POST /api/v1/users/`

**Summary**: GET /api/v1/users/ — List users (admin).
POST /api/v1/users/ — Create user (admin).

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes |  |
| `password` | `string` | Yes |  (write-only) |
| `first_name` | `string` | Yes |  |
| `last_name` | `string` | Yes |  |
| `role` | `RoleEnum` | Yes |  |
| `department` | `string` | No |  |
| `phone` | `string` | No |  |
| `student_profile` | `string` | No |  |
| `faculty_profile` | `string` | No |  |

**Example Request**:
```json
{
  "email": "user@example.com",
  "password": "string",
  "first_name": "string",
  "last_name": "string",
  "role": "admin",
  "department": "123e4567-e89b-12d3-a456-426614174000",
  "phone": "string",
  "student_profile": {
    "student_id_number": "string",
    "register_no": "string",
    "program": "123e4567-e89b-12d3-a456-426614174000",
    "current_semester": 0,
    "admission_date": "2023-10-23",
    "batch_year": 0,
    "batch": "string",
    "division": "string"
  },
  "faculty_profile": {
    "employee_id": "string",
    "designation": "string",
    "specialization": "string",
    "joining_date": "2023-10-23",
    "consultation_hours": null
  }
}
```

#### Response: 201 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `email` | `string` | Yes |  |
| `first_name` | `string` | Yes |  |
| `last_name` | `string` | Yes |  |
| `role` | `RoleEnum` | Yes |  |
| `department` | `string` | No |  |
| `phone` | `string` | No |  |
| `student_profile` | `string` | No |  |
| `faculty_profile` | `string` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "first_name": "string",
  "last_name": "string",
  "role": "admin",
  "department": "123e4567-e89b-12d3-a456-426614174000",
  "phone": "string",
  "student_profile": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "student_id_number": "string",
    "register_no": "string",
    "program": "123e4567-e89b-12d3-a456-426614174000",
    "current_semester": 0,
    "admission_date": "2023-10-23",
    "batch_year": 0,
    "batch": "string",
    "division": "string"
  },
  "faculty_profile": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "employee_id": "string",
    "designation": "string",
    "specialization": "string",
    "joining_date": "2023-10-23",
    "consultation_hours": null
  }
}
```

---

## `GET /api/v1/users/{id}/`

**Summary**: GET/PATCH/DELETE /api/v1/users/{id}/

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `email` | `string` | Yes |  |
| `first_name` | `string` | Yes |  |
| `last_name` | `string` | Yes |  |
| `role` | `RoleEnum` | Yes |  |
| `department` | `string` | No |  |
| `department_name` | `string` | Yes |  (read-only) |
| `profile_picture` | `string` | No |  |
| `phone` | `string` | No |  |
| `is_active` | `boolean` | No |  |
| `failed_login_attempts` | `integer` | No |  |
| `last_login` | `string` | Yes |  (read-only) |
| `created_at` | `string` | Yes |  (read-only) |
| `updated_at` | `string` | Yes |  (read-only) |
| `student_profile` | `string` | No |  |
| `faculty_profile` | `string` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "first_name": "string",
  "last_name": "string",
  "role": "admin",
  "department": "123e4567-e89b-12d3-a456-426614174000",
  "department_name": "string",
  "profile_picture": "https://example.com/resource",
  "phone": "string",
  "is_active": true,
  "failed_login_attempts": 0,
  "last_login": "2023-10-23T12:00:00Z",
  "created_at": "2023-10-23T12:00:00Z",
  "updated_at": "2023-10-23T12:00:00Z",
  "student_profile": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "student_id_number": "string",
    "register_no": "string",
    "program": "123e4567-e89b-12d3-a456-426614174000",
    "current_semester": 0,
    "admission_date": "2023-10-23",
    "batch_year": 0,
    "batch": "string",
    "division": "string"
  },
  "faculty_profile": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "employee_id": "string",
    "designation": "string",
    "specialization": "string",
    "joining_date": "2023-10-23",
    "consultation_hours": null
  }
}
```

---

## `PUT /api/v1/users/{id}/`

**Summary**: GET/PATCH/DELETE /api/v1/users/{id}/

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes |  |
| `first_name` | `string` | Yes |  |
| `last_name` | `string` | Yes |  |
| `role` | `RoleEnum` | Yes |  |
| `department` | `string` | No |  |
| `profile_picture` | `string` | No |  |
| `phone` | `string` | No |  |
| `is_active` | `boolean` | No |  |
| `failed_login_attempts` | `integer` | No |  |
| `student_profile` | `string` | No |  |
| `faculty_profile` | `string` | No |  |

**Example Request**:
```json
{
  "email": "user@example.com",
  "first_name": "string",
  "last_name": "string",
  "role": "admin",
  "department": "123e4567-e89b-12d3-a456-426614174000",
  "profile_picture": "string",
  "phone": "string",
  "is_active": true,
  "failed_login_attempts": 0,
  "student_profile": {
    "student_id_number": "string",
    "register_no": "string",
    "program": "123e4567-e89b-12d3-a456-426614174000",
    "current_semester": 0,
    "admission_date": "2023-10-23",
    "batch_year": 0,
    "batch": "string",
    "division": "string"
  },
  "faculty_profile": {
    "employee_id": "string",
    "designation": "string",
    "specialization": "string",
    "joining_date": "2023-10-23",
    "consultation_hours": null
  }
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `email` | `string` | Yes |  |
| `first_name` | `string` | Yes |  |
| `last_name` | `string` | Yes |  |
| `role` | `RoleEnum` | Yes |  |
| `department` | `string` | No |  |
| `department_name` | `string` | Yes |  (read-only) |
| `profile_picture` | `string` | No |  |
| `phone` | `string` | No |  |
| `is_active` | `boolean` | No |  |
| `failed_login_attempts` | `integer` | No |  |
| `last_login` | `string` | Yes |  (read-only) |
| `created_at` | `string` | Yes |  (read-only) |
| `updated_at` | `string` | Yes |  (read-only) |
| `student_profile` | `string` | No |  |
| `faculty_profile` | `string` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "first_name": "string",
  "last_name": "string",
  "role": "admin",
  "department": "123e4567-e89b-12d3-a456-426614174000",
  "department_name": "string",
  "profile_picture": "https://example.com/resource",
  "phone": "string",
  "is_active": true,
  "failed_login_attempts": 0,
  "last_login": "2023-10-23T12:00:00Z",
  "created_at": "2023-10-23T12:00:00Z",
  "updated_at": "2023-10-23T12:00:00Z",
  "student_profile": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "student_id_number": "string",
    "register_no": "string",
    "program": "123e4567-e89b-12d3-a456-426614174000",
    "current_semester": 0,
    "admission_date": "2023-10-23",
    "batch_year": 0,
    "batch": "string",
    "division": "string"
  },
  "faculty_profile": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "employee_id": "string",
    "designation": "string",
    "specialization": "string",
    "joining_date": "2023-10-23",
    "consultation_hours": null
  }
}
```

---

## `PATCH /api/v1/users/{id}/`

**Summary**: GET/PATCH/DELETE /api/v1/users/{id}/

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | No |  |
| `first_name` | `string` | No |  |
| `last_name` | `string` | No |  |
| `role` | `RoleEnum` | No |  |
| `department` | `string` | No |  |
| `profile_picture` | `string` | No |  |
| `phone` | `string` | No |  |
| `is_active` | `boolean` | No |  |
| `failed_login_attempts` | `integer` | No |  |
| `student_profile` | `string` | No |  |
| `faculty_profile` | `string` | No |  |

**Example Request**:
```json
{
  "email": "user@example.com",
  "first_name": "string",
  "last_name": "string",
  "role": "admin",
  "department": "123e4567-e89b-12d3-a456-426614174000",
  "profile_picture": "string",
  "phone": "string",
  "is_active": true,
  "failed_login_attempts": 0,
  "student_profile": {
    "student_id_number": "string",
    "register_no": "string",
    "program": "123e4567-e89b-12d3-a456-426614174000",
    "current_semester": 0,
    "admission_date": "2023-10-23",
    "batch_year": 0,
    "batch": "string",
    "division": "string"
  },
  "faculty_profile": {
    "employee_id": "string",
    "designation": "string",
    "specialization": "string",
    "joining_date": "2023-10-23",
    "consultation_hours": null
  }
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `email` | `string` | Yes |  |
| `first_name` | `string` | Yes |  |
| `last_name` | `string` | Yes |  |
| `role` | `RoleEnum` | Yes |  |
| `department` | `string` | No |  |
| `department_name` | `string` | Yes |  (read-only) |
| `profile_picture` | `string` | No |  |
| `phone` | `string` | No |  |
| `is_active` | `boolean` | No |  |
| `failed_login_attempts` | `integer` | No |  |
| `last_login` | `string` | Yes |  (read-only) |
| `created_at` | `string` | Yes |  (read-only) |
| `updated_at` | `string` | Yes |  (read-only) |
| `student_profile` | `string` | No |  |
| `faculty_profile` | `string` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "first_name": "string",
  "last_name": "string",
  "role": "admin",
  "department": "123e4567-e89b-12d3-a456-426614174000",
  "department_name": "string",
  "profile_picture": "https://example.com/resource",
  "phone": "string",
  "is_active": true,
  "failed_login_attempts": 0,
  "last_login": "2023-10-23T12:00:00Z",
  "created_at": "2023-10-23T12:00:00Z",
  "updated_at": "2023-10-23T12:00:00Z",
  "student_profile": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "student_id_number": "string",
    "register_no": "string",
    "program": "123e4567-e89b-12d3-a456-426614174000",
    "current_semester": 0,
    "admission_date": "2023-10-23",
    "batch_year": 0,
    "batch": "string",
    "division": "string"
  },
  "faculty_profile": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "employee_id": "string",
    "designation": "string",
    "specialization": "string",
    "joining_date": "2023-10-23",
    "consultation_hours": null
  }
}
```

---

## `DELETE /api/v1/users/{id}/`

**Summary**: GET/PATCH/DELETE /api/v1/users/{id}/

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Response: 204 No response body

---

## `POST /api/v1/users/{id}/reset-password/`

**Summary**: POST /api/v1/users/{id}/reset-password/ — Admin resets a user's password.

#### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `id` | `path` | `string (uuid)` | Yes |  |

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `new_password` | `string` | Yes |  |

**Example Request**:
```json
{
  "new_password": "string"
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | `string` | Yes |  |
| `message` | `string` | Yes |  |

**Example Response**:
```json
{
  "status": "string",
  "message": "string"
}
```

---

## `GET /api/v1/users/me/`

**Summary**: GET/PATCH /api/v1/users/me/ — Current user profile.

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `email` | `string` | Yes |  |
| `first_name` | `string` | Yes |  |
| `last_name` | `string` | Yes |  |
| `role` | `RoleEnum` | Yes |  |
| `department` | `string` | No |  |
| `department_name` | `string` | Yes |  (read-only) |
| `profile_picture` | `string` | No |  |
| `phone` | `string` | No |  |
| `is_active` | `boolean` | No |  |
| `failed_login_attempts` | `integer` | No |  |
| `last_login` | `string` | Yes |  (read-only) |
| `created_at` | `string` | Yes |  (read-only) |
| `updated_at` | `string` | Yes |  (read-only) |
| `student_profile` | `string` | No |  |
| `faculty_profile` | `string` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "first_name": "string",
  "last_name": "string",
  "role": "admin",
  "department": "123e4567-e89b-12d3-a456-426614174000",
  "department_name": "string",
  "profile_picture": "https://example.com/resource",
  "phone": "string",
  "is_active": true,
  "failed_login_attempts": 0,
  "last_login": "2023-10-23T12:00:00Z",
  "created_at": "2023-10-23T12:00:00Z",
  "updated_at": "2023-10-23T12:00:00Z",
  "student_profile": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "student_id_number": "string",
    "register_no": "string",
    "program": "123e4567-e89b-12d3-a456-426614174000",
    "current_semester": 0,
    "admission_date": "2023-10-23",
    "batch_year": 0,
    "batch": "string",
    "division": "string"
  },
  "faculty_profile": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "employee_id": "string",
    "designation": "string",
    "specialization": "string",
    "joining_date": "2023-10-23",
    "consultation_hours": null
  }
}
```

---

## `PUT /api/v1/users/me/`

**Summary**: GET/PATCH /api/v1/users/me/ — Current user profile.

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes |  |
| `first_name` | `string` | Yes |  |
| `last_name` | `string` | Yes |  |
| `role` | `RoleEnum` | Yes |  |
| `department` | `string` | No |  |
| `profile_picture` | `string` | No |  |
| `phone` | `string` | No |  |
| `is_active` | `boolean` | No |  |
| `failed_login_attempts` | `integer` | No |  |
| `student_profile` | `string` | No |  |
| `faculty_profile` | `string` | No |  |

**Example Request**:
```json
{
  "email": "user@example.com",
  "first_name": "string",
  "last_name": "string",
  "role": "admin",
  "department": "123e4567-e89b-12d3-a456-426614174000",
  "profile_picture": "string",
  "phone": "string",
  "is_active": true,
  "failed_login_attempts": 0,
  "student_profile": {
    "student_id_number": "string",
    "register_no": "string",
    "program": "123e4567-e89b-12d3-a456-426614174000",
    "current_semester": 0,
    "admission_date": "2023-10-23",
    "batch_year": 0,
    "batch": "string",
    "division": "string"
  },
  "faculty_profile": {
    "employee_id": "string",
    "designation": "string",
    "specialization": "string",
    "joining_date": "2023-10-23",
    "consultation_hours": null
  }
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `email` | `string` | Yes |  |
| `first_name` | `string` | Yes |  |
| `last_name` | `string` | Yes |  |
| `role` | `RoleEnum` | Yes |  |
| `department` | `string` | No |  |
| `department_name` | `string` | Yes |  (read-only) |
| `profile_picture` | `string` | No |  |
| `phone` | `string` | No |  |
| `is_active` | `boolean` | No |  |
| `failed_login_attempts` | `integer` | No |  |
| `last_login` | `string` | Yes |  (read-only) |
| `created_at` | `string` | Yes |  (read-only) |
| `updated_at` | `string` | Yes |  (read-only) |
| `student_profile` | `string` | No |  |
| `faculty_profile` | `string` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "first_name": "string",
  "last_name": "string",
  "role": "admin",
  "department": "123e4567-e89b-12d3-a456-426614174000",
  "department_name": "string",
  "profile_picture": "https://example.com/resource",
  "phone": "string",
  "is_active": true,
  "failed_login_attempts": 0,
  "last_login": "2023-10-23T12:00:00Z",
  "created_at": "2023-10-23T12:00:00Z",
  "updated_at": "2023-10-23T12:00:00Z",
  "student_profile": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "student_id_number": "string",
    "register_no": "string",
    "program": "123e4567-e89b-12d3-a456-426614174000",
    "current_semester": 0,
    "admission_date": "2023-10-23",
    "batch_year": 0,
    "batch": "string",
    "division": "string"
  },
  "faculty_profile": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "employee_id": "string",
    "designation": "string",
    "specialization": "string",
    "joining_date": "2023-10-23",
    "consultation_hours": null
  }
}
```

---

## `PATCH /api/v1/users/me/`

**Summary**: GET/PATCH /api/v1/users/me/ — Current user profile.

#### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | No |  |
| `first_name` | `string` | No |  |
| `last_name` | `string` | No |  |
| `role` | `RoleEnum` | No |  |
| `department` | `string` | No |  |
| `profile_picture` | `string` | No |  |
| `phone` | `string` | No |  |
| `is_active` | `boolean` | No |  |
| `failed_login_attempts` | `integer` | No |  |
| `student_profile` | `string` | No |  |
| `faculty_profile` | `string` | No |  |

**Example Request**:
```json
{
  "email": "user@example.com",
  "first_name": "string",
  "last_name": "string",
  "role": "admin",
  "department": "123e4567-e89b-12d3-a456-426614174000",
  "profile_picture": "string",
  "phone": "string",
  "is_active": true,
  "failed_login_attempts": 0,
  "student_profile": {
    "student_id_number": "string",
    "register_no": "string",
    "program": "123e4567-e89b-12d3-a456-426614174000",
    "current_semester": 0,
    "admission_date": "2023-10-23",
    "batch_year": 0,
    "batch": "string",
    "division": "string"
  },
  "faculty_profile": {
    "employee_id": "string",
    "designation": "string",
    "specialization": "string",
    "joining_date": "2023-10-23",
    "consultation_hours": null
  }
}
```

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes |  (read-only) |
| `email` | `string` | Yes |  |
| `first_name` | `string` | Yes |  |
| `last_name` | `string` | Yes |  |
| `role` | `RoleEnum` | Yes |  |
| `department` | `string` | No |  |
| `department_name` | `string` | Yes |  (read-only) |
| `profile_picture` | `string` | No |  |
| `phone` | `string` | No |  |
| `is_active` | `boolean` | No |  |
| `failed_login_attempts` | `integer` | No |  |
| `last_login` | `string` | Yes |  (read-only) |
| `created_at` | `string` | Yes |  (read-only) |
| `updated_at` | `string` | Yes |  (read-only) |
| `student_profile` | `string` | No |  |
| `faculty_profile` | `string` | No |  |

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "first_name": "string",
  "last_name": "string",
  "role": "admin",
  "department": "123e4567-e89b-12d3-a456-426614174000",
  "department_name": "string",
  "profile_picture": "https://example.com/resource",
  "phone": "string",
  "is_active": true,
  "failed_login_attempts": 0,
  "last_login": "2023-10-23T12:00:00Z",
  "created_at": "2023-10-23T12:00:00Z",
  "updated_at": "2023-10-23T12:00:00Z",
  "student_profile": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "student_id_number": "string",
    "register_no": "string",
    "program": "123e4567-e89b-12d3-a456-426614174000",
    "current_semester": 0,
    "admission_date": "2023-10-23",
    "batch_year": 0,
    "batch": "string",
    "division": "string"
  },
  "faculty_profile": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "employee_id": "string",
    "designation": "string",
    "specialization": "string",
    "joining_date": "2023-10-23",
    "consultation_hours": null
  }
}
```

---

## `POST /api/v1/users/me/avatar/`

**Summary**: POST /api/v1/users/me/avatar/

#### Response: 200 

#### Response Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | `string` | Yes |  |
| `data` | `object` | Yes |  |

**Example Response**:
```json
{
  "status": "string",
  "data": {}
}
```

---

# WebSocket APIs

WebSocket endpoints require authentication. The JWT token must be passed in the connection URL as a query parameter.

**Base URL**: `ws://<domain>/ws/` or `wss://<domain>/ws/`
**Authentication**: Append `?token=<JWT_ACCESS_TOKEN>` to the WebSocket URL.

## `ws/notifications/`

**Summary**: Connects to the real-time notification stream for the authenticated user.

#### Connection
```javascript
const socket = new WebSocket('ws://localhost:8000/ws/notifications/?token=eyJhbG...');
```

#### Server-to-Client Messages
The server pushes JSON-formatted messages when a new notification is generated for the user.

**Payload Format**:
| Field | Type | Description |
|-------|------|-------------|
| `type` | `string` | Always `"new_notification"` |
| `notification` | `object` | The notification object containing details |

**Example Message**:
```json
{
  "type": "new_notification",
  "notification": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "New Assignment",
    "message": "Assignment 1 has been posted.",
    "is_read": false,
    "created_at": "2023-10-23T12:00:00Z"
  }
}
```

---

## `ws/chat/`

**Summary**: Connects to the real-time global chat stream. 

#### Connection
```javascript
const socket = new WebSocket('ws://localhost:8000/ws/chat/?token=eyJhbG...');
```

#### Server-to-Client Messages
The server pushes JSON-formatted messages when a new chat message is sent.

**Payload Format**:
| Field | Type | Description |
|-------|------|-------------|
| `type` | `string` | Always `"new_message"` |
| `message` | `object` | The chat message object containing details |

**Example Message**:
```json
{
  "type": "new_message",
  "message": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "sender_name": "John Doe",
    "role": "faculty",
    "subject": "Office Hours",
    "content": "I will be holding office hours today at 3 PM.",
    "created_at": "2023-10-23T12:00:00Z"
  }
}
```

---

## `ws/timetable/`

**Summary**: Connects to real-time timetable updates (e.g., class cancellations, room changes).

#### Connection
```javascript
const socket = new WebSocket('ws://localhost:8000/ws/timetable/?token=eyJhbG...');
```

#### Server-to-Client Messages
The server pushes JSON-formatted messages when a relevant timetable event is updated or triggered.

**Payload Format**:
| Field | Type | Description |
|-------|------|-------------|
| `type` | `string` | Always `"timetable_update"` |
| `event` | `object` | The timetable event details |

**Example Message**:
```json
{
  "type": "timetable_update",
  "event": {
    "action": "updated",
    "class_id": "123e4567...",
    "course_name": "CS101",
    "new_room": "Room 5B",
    "time": "10:00 AM"
  }
}
```
