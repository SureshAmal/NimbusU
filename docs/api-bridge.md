# NimbusU — API Bridge Reference

> Quick-reference for frontend developers mapping UI features to API endpoints.
> Full API docs: [API.md](./API.md) | OpenAPI schema: `/api/schema/`

---

## Authentication

| Action | Method | Endpoint | Body | Response |
|--------|--------|----------|------|----------|
| Register | POST | `/auth/register/` | `{email, password, password_confirm, first_name, last_name, role}` | `{user, tokens}` |
| Login | POST | `/auth/login/` | `{email, password}` | `{access, refresh}` |
| Refresh | POST | `/auth/refresh/` | `{refresh}` | `{access}` |
| Logout | POST | `/auth/logout/` | `{refresh}` | `{message}` |
| Change Password | POST | `/auth/password/change/` | `{old_password, new_password}` | `{message}` |

---

## Users

| Action | Method | Endpoint | Auth | Role |
|--------|--------|----------|------|------|
| List users | GET | `/users/` | ✅ | Admin |
| Create user | POST | `/users/` | ✅ | Admin |
| Get me | GET | `/users/me/` | ✅ | Any |
| Update me | PATCH | `/users/me/` | ✅ | Any |
| Upload avatar | POST | `/users/me/avatar/` | ✅ | Any |
| Get user | GET | `/users/{id}/` | ✅ | Admin |
| Update user | PATCH | `/users/{id}/` | ✅ | Admin |
| Delete user | DELETE | `/users/{id}/` | ✅ | Admin |
| Reset password | POST | `/users/{id}/reset-password/` | ✅ | Admin |
| Audit logs | GET | `/admin/audit-logs/` | ✅ | Admin |

---

## Academics

| Action | Method | Endpoint | Role |
|--------|--------|----------|------|
| List departments | GET | `/departments/` | Any |
| Create department | POST | `/departments/` | Admin |
| Get/Update/Delete dept | GET/PATCH/DELETE | `/departments/{id}/` | Admin |
| List programs | GET | `/academics/programs/` | Any |
| Create program | POST | `/academics/programs/` | Admin |
| List semesters | GET | `/academics/semesters/` | Any |
| Current semester | GET | `/academics/semesters/current/` | Any |
| List courses | GET | `/academics/courses/` | Any |
| Create course | POST | `/academics/courses/` | Admin |
| List offerings | GET | `/academics/offerings/` | Any |
| Create offering | POST | `/academics/offerings/` | Admin |
| Offering students | GET | `/academics/offerings/{id}/students/` | Admin/Faculty |
| Create enrollment | POST | `/academics/enrollments/` | Admin |
| My enrollments | GET | `/academics/enrollments/me/` | Student |
| Drop enrollment | DELETE | `/academics/enrollments/{id}/` | Admin |

### Key Query Params
- **Programs**: `?department=UUID&degree_type=UG|PG|PhD&is_active=bool`
- **Courses**: `?department=UUID&is_active=bool&search=text`
- **Offerings**: `?course=UUID&semester=UUID&faculty=UUID`

---

## Content

| Action | Method | Endpoint | Role |
|--------|--------|----------|------|
| List folders | GET | `/content/folders/` | Any |
| Create folder | POST | `/content/folders/` | Admin/Faculty |
| Get/Edit/Delete folder | GET/PATCH/DELETE | `/content/folders/{id}/` | Owner/Admin |
| List content | GET | `/content/` | Any |
| Upload content | POST | `/content/` | Admin/Faculty |
| Get content | GET | `/content/{id}/` | Any |
| Edit/Delete content | PATCH/DELETE | `/content/{id}/` | Owner/Admin |
| Download | GET | `/content/{id}/download/` | Any |
| Stats | GET | `/content/{id}/stats/` | Any |
| Recent content | GET | `/content/recent/` | Any |
| List tags | GET | `/content/tags/` | Any |
| Create tag | POST | `/content/tags/` | Admin/Faculty |
| My bookmarks | GET | `/content/bookmarks/` | Any |
| Add bookmark | POST | `/content/bookmarks/` | Any |
| Remove bookmark | DELETE | `/content/bookmarks/{id}/` | Owner |

### Key Query Params
- **Content**: `?course_offering=UUID&content_type=document|video|link&folder=UUID&visibility=public|course&search=text`
- **Folders**: `?course_offering=UUID&parent=UUID&visibility=str`

---

## Assignments

| Action | Method | Endpoint | Role |
|--------|--------|----------|------|
| List assignments | GET | `/assignments/` | Any |
| Create assignment | POST | `/assignments/` | Faculty |
| Get/Edit/Delete | GET/PATCH/DELETE | `/assignments/{id}/` | Owner/Admin |
| Submit work | POST | `/assignments/{id}/submit/` | Student |
| List submissions | GET | `/assignments/{id}/submissions/` | Admin/Faculty |
| My submission | GET | `/assignments/{id}/submissions/me/` | Student |
| Grade submission | PATCH | `/assignments/{id}/submissions/{sub_id}/grade/` | Faculty |
| Export grades CSV | GET | `/assignments/export/{offering_id}/` | Admin/Faculty |

### Key Query Params
- **Assignments**: `?course_offering=UUID&assignment_type=assignment|quiz|exam|project&is_published=bool&search=text`

---

## Timetable & Attendance

| Action | Method | Endpoint | Role |
|--------|--------|----------|------|
| List rooms | GET | `/timetable/rooms/` | Any |
| Create room | POST | `/timetable/rooms/` | Admin |
| List entries | GET | `/timetable/` | Any |
| Create entry | POST | `/timetable/` | Admin |
| My timetable | GET | `/timetable/me/` | Any |
| Conflicts | GET | `/timetable/conflicts/` | Admin |
| Mark attendance | POST | `/attendance/mark/` | Faculty |
| Edit attendance | PATCH | `/attendance/{id}/` | Faculty |
| Course attendance | GET | `/attendance/course/{offering_id}/` | Admin/Faculty |
| My attendance | GET | `/attendance/me/` | Student |
| My course attendance | GET | `/attendance/me/{offering_id}/` | Student |

### Bulk Attendance Body
```json
{
  "timetable_entry_id": "UUID",
  "date": "2026-03-02",
  "records": [
    {"student_id": "UUID", "status": "present"},
    {"student_id": "UUID", "status": "absent"}
  ]
}
```

---

## Communications

| Action | Method | Endpoint | Role |
|--------|--------|----------|------|
| List announcements | GET | `/communications/announcements/` | Any |
| Create announcement | POST | `/communications/announcements/` | Admin/Faculty |
| Get/Edit/Delete | GET/PATCH/DELETE | `/communications/announcements/{id}/` | Owner/Admin |
| List messages | GET | `/communications/messages/` | Any |
| Send message | POST | `/communications/messages/` | Any |
| Get message | GET | `/communications/messages/{id}/` | Owner |
| List forums | GET | `/communications/forums/` | Any |
| Create forum | POST | `/communications/forums/` | Admin/Faculty |
| Get forum + posts | GET | `/communications/forums/{id}/` | Any |
| Create post | POST | `/communications/forums/{id}/posts/` | Any |
| Edit post | PATCH | `/communications/forums/{forum_id}/posts/{id}/` | Author |
| Delete post | DELETE | `/communications/forums/{forum_id}/posts/{id}/delete/` | Author/Admin |

---

## Notifications

| Action | Method | Endpoint | Role |
|--------|--------|----------|------|
| List notifications | GET | `/notifications/` | Any |
| Mark read | PATCH | `/notifications/{id}/read/` | Owner |
| Mark all read | POST | `/notifications/read-all/` | Any |
| Unread count | GET | `/notifications/unread-count/` | Any |
| Preferences | GET/POST | `/notifications/preferences/` | Any |
| Update preference | PATCH | `/notifications/preferences/{id}/` | Owner |
| Admin stats | GET | `/notifications/admin/stats/` | Admin |

---

## Frontend Integration Patterns

### Token Storage
```typescript
// Store in httpOnly cookie or localStorage
const tokens = { access: "...", refresh: "..." };
```

### API Client Setup
```typescript
// lib/api.ts — Axios instance with interceptors
const api = axios.create({ baseURL: "/api/v1/" });

// Request interceptor: attach access token
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      const newToken = await refreshToken();
      err.config.headers.Authorization = `Bearer ${newToken}`;
      return api.request(err.config);
    }
    return Promise.reject(err);
  }
);
```

### Pagination Pattern
```typescript
// All list endpoints return:
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
```

### Error Handling
```typescript
// Standard error response:
interface APIError {
  status: "error";
  message: string;
  errors?: Record<string, string[]>;  // field-level validation
}
```
