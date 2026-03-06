# NimbusU API Documentation

**Version:** 1.0  
**Base URL:** `/api/v1/`  
**Authentication:** JWT Bearer Token

## Table of Contents

1. [Authentication](#authentication)
2. [Users & Accounts](#users--accounts)
3. [Academics](#academics)
4. [Assignments](#assignments)
5. [Content Management](#content-management)
6. [Timetable & Attendance](#timetable--attendance)
7. [Communications](#communications)
8. [Common Response Formats](#common-response-formats)

---

## Academics

### academics_courses_list
**GET** `/api/v1/academics/courses/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| department | query | No | string |  |
| is_active | query | No | boolean |  |
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| search | query | No | string | A search term. |

**Responses:**
- **200**: 

---

### academics_courses_create
**POST** `/api/v1/academics/courses/`

**Responses:**
- **201**: 

---

### academics_courses_retrieve
**GET** `/api/v1/academics/courses/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### academics_courses_update
**PUT** `/api/v1/academics/courses/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### academics_courses_partial_update
**PATCH** `/api/v1/academics/courses/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### academics_courses_destroy
**DELETE** `/api/v1/academics/courses/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **204**: No response body

---

### academics_enrollments_create
**POST** `/api/v1/academics/enrollments/`

**Responses:**
- **201**: 

---

### academics_enrollments_destroy
**DELETE** `/api/v1/academics/enrollments/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **204**: No response body

---

### academics_enrollments_me_list
**GET** `/api/v1/academics/enrollments/me/`

GET /api/v1/academics/enrollments/me/

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| search | query | No | string | A search term. |

**Responses:**
- **200**: 

---

### academics_offerings_list
**GET** `/api/v1/academics/offerings/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| course | query | No | string |  |
| faculty | query | No | string |  |
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| search | query | No | string | A search term. |
| semester | query | No | string |  |

**Responses:**
- **200**: 

---

### academics_offerings_create
**POST** `/api/v1/academics/offerings/`

**Responses:**
- **201**: 

---

### academics_offerings_retrieve
**GET** `/api/v1/academics/offerings/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### academics_offerings_update
**PUT** `/api/v1/academics/offerings/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### academics_offerings_partial_update
**PATCH** `/api/v1/academics/offerings/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### academics_offerings_students_list
**GET** `/api/v1/academics/offerings/{id}/students/`

GET /api/v1/academics/offerings/{id}/students/

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| search | query | No | string | A search term. |

**Responses:**
- **200**: 

---

### academics_programs_list
**GET** `/api/v1/academics/programs/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| degree_type | query | No | string | * `UG` - Undergraduate * `PG` - Postgraduate * `PhD` - Doctorate * `Diploma` - Diploma |
| department | query | No | string |  |
| is_active | query | No | boolean |  |
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| search | query | No | string | A search term. |

**Responses:**
- **200**: 

---

### academics_programs_create
**POST** `/api/v1/academics/programs/`

**Responses:**
- **201**: 

---

### academics_programs_retrieve
**GET** `/api/v1/academics/programs/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### academics_programs_update
**PUT** `/api/v1/academics/programs/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### academics_programs_partial_update
**PATCH** `/api/v1/academics/programs/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### academics_programs_destroy
**DELETE** `/api/v1/academics/programs/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **204**: No response body

---

### academics_schools_list
**GET** `/api/v1/academics/schools/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| search | query | No | string | A search term. |

**Responses:**
- **200**: 

---

### academics_schools_create
**POST** `/api/v1/academics/schools/`

**Responses:**
- **201**: 

---

### academics_schools_retrieve
**GET** `/api/v1/academics/schools/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### academics_schools_update
**PUT** `/api/v1/academics/schools/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### academics_schools_partial_update
**PATCH** `/api/v1/academics/schools/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### academics_schools_destroy
**DELETE** `/api/v1/academics/schools/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **204**: No response body

---

### academics_semesters_list
**GET** `/api/v1/academics/semesters/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| search | query | No | string | A search term. |

**Responses:**
- **200**: 

---

### academics_semesters_create
**POST** `/api/v1/academics/semesters/`

**Responses:**
- **201**: 

---

### academics_semesters_retrieve
**GET** `/api/v1/academics/semesters/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### academics_semesters_update
**PUT** `/api/v1/academics/semesters/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### academics_semesters_partial_update
**PATCH** `/api/v1/academics/semesters/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### academics_semesters_current_retrieve
**GET** `/api/v1/academics/semesters/current/`

GET /api/v1/academics/semesters/current/

**Responses:**
- **200**: 

---

## Admin

### admin_audit_logs_list
**GET** `/api/v1/admin/audit-logs/`

GET /api/v1/admin/audit-logs/

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| action | query | No | string |  |
| entity_type | query | No | string |  |
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| user | query | No | string |  |

**Responses:**
- **200**: 

---

## Assignments

### assignments_list
**GET** `/api/v1/assignments/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| assignment_type | query | No | string | * `assignment` - Assignment * `quiz` - Quiz * `exam` - Exam * `project` - Project |
| course_offering | query | No | string |  |
| is_published | query | No | boolean |  |
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| search | query | No | string | A search term. |

**Responses:**
- **200**: 

---

### assignments_create
**POST** `/api/v1/assignments/`

**Responses:**
- **201**: 

---

### assignments_retrieve
**GET** `/api/v1/assignments/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### assignments_update
**PUT** `/api/v1/assignments/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### assignments_partial_update
**PATCH** `/api/v1/assignments/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### assignments_destroy
**DELETE** `/api/v1/assignments/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **204**: No response body

---

### assignments_submissions_list
**GET** `/api/v1/assignments/{id}/submissions/`

GET /api/v1/assignments/{id}/submissions/

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| search | query | No | string | A search term. |

**Responses:**
- **200**: 

---

### assignments_submissions_grade_partial_update
**PATCH** `/api/v1/assignments/{id}/submissions/{sub_id}/grade/`

PATCH /api/v1/assignments/{pk}/submissions/{sub_id}/grade/

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |
| sub_id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### assignments_submissions_me_retrieve
**GET** `/api/v1/assignments/{id}/submissions/me/`

GET /api/v1/assignments/{id}/submissions/me/

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### assignments_submit_create
**POST** `/api/v1/assignments/{id}/submit/`

POST /api/v1/assignments/{id}/submit/

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **201**: 

---

### assignments_export_retrieve
**GET** `/api/v1/assignments/export/{offering_id}/`

GET /api/v1/assignments/export/{offering_id}/ — CSV export.

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| offering_id | path | Yes | string |  |

**Responses:**
- **200**: 

---

## Attendance

### attendance_update
**PUT** `/api/v1/attendance/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### attendance_partial_update
**PATCH** `/api/v1/attendance/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### attendance_course_list
**GET** `/api/v1/attendance/course/{offering_id}/`

GET /api/v1/attendance/course/{offering_id}/

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| offering_id | path | Yes | string |  |
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| search | query | No | string | A search term. |

**Responses:**
- **200**: 

---

### attendance_mark_create
**POST** `/api/v1/attendance/mark/`

POST /api/v1/attendance/mark/ — Mark attendance in bulk.

**Responses:**
- **201**: 

---

### attendance_me_list
**GET** `/api/v1/attendance/me/`

GET /api/v1/attendance/me/

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| search | query | No | string | A search term. |

**Responses:**
- **200**: 

---

### attendance_me_list_2
**GET** `/api/v1/attendance/me/{offering_id}/`

GET /api/v1/attendance/me/{offering_id}/

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| offering_id | path | Yes | string |  |
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| search | query | No | string | A search term. |

**Responses:**
- **200**: 

---

## Authentication

### auth_login_create
**POST** `/api/v1/auth/login/`

Takes a set of user credentials and returns an access and refresh JSON web
token pair to prove the authentication of those credentials.

**Responses:**
- **200**: 

---

### auth_logout_create
**POST** `/api/v1/auth/logout/`

POST /api/v1/auth/logout/ — Blacklist the refresh token.

**Responses:**
- **200**: 

---

### auth_password_change_create
**POST** `/api/v1/auth/password/change/`

POST /api/v1/auth/password/change/

**Responses:**
- **200**: 

---

### auth_refresh_create
**POST** `/api/v1/auth/refresh/`

Takes a refresh type JSON web token and returns an access type JSON web
token if the refresh token is valid.

**Responses:**
- **200**: 

---

### auth_register_create
**POST** `/api/v1/auth/register/`

POST /api/v1/auth/register/ — Self-registration.

**Responses:**
- **201**: 

---

## Communications

### communications_announcements_list
**GET** `/api/v1/communications/announcements/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| is_published | query | No | boolean |  |
| is_urgent | query | No | boolean |  |
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| search | query | No | string | A search term. |
| target_type | query | No | string | * `all` - All Users * `department` - Department * `course` - Course * `section` - Section |

**Responses:**
- **200**: 

---

### communications_announcements_create
**POST** `/api/v1/communications/announcements/`

**Responses:**
- **201**: 

---

### communications_announcements_retrieve
**GET** `/api/v1/communications/announcements/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### communications_announcements_update
**PUT** `/api/v1/communications/announcements/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### communications_announcements_partial_update
**PATCH** `/api/v1/communications/announcements/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### communications_announcements_destroy
**DELETE** `/api/v1/communications/announcements/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **204**: No response body

---

### communications_forums_list
**GET** `/api/v1/communications/forums/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| course_offering | query | No | string |  |
| is_active | query | No | boolean |  |
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| search | query | No | string | A search term. |

**Responses:**
- **200**: 

---

### communications_forums_create
**POST** `/api/v1/communications/forums/`

**Responses:**
- **201**: 

---

### communications_forums_posts_update
**PUT** `/api/v1/communications/forums/{forum_id}/posts/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| forum_id | path | Yes | string |  |
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### communications_forums_posts_partial_update
**PATCH** `/api/v1/communications/forums/{forum_id}/posts/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| forum_id | path | Yes | string |  |
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### communications_forums_posts_delete_destroy
**DELETE** `/api/v1/communications/forums/{forum_id}/posts/{id}/delete/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| forum_id | path | Yes | string |  |
| id | path | Yes | string |  |

**Responses:**
- **204**: No response body

---

### communications_forums_retrieve
**GET** `/api/v1/communications/forums/{id}/`

GET /api/v1/communications/forums/{id}/ — includes top-level posts.

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### communications_forums_posts_create
**POST** `/api/v1/communications/forums/{id}/posts/`

POST /api/v1/communications/forums/{id}/posts/

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **201**: 

---

### communications_messages_list
**GET** `/api/v1/communications/messages/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| search | query | No | string | A search term. |

**Responses:**
- **200**: 

---

### communications_messages_create
**POST** `/api/v1/communications/messages/`

**Responses:**
- **201**: 

---

### communications_messages_retrieve
**GET** `/api/v1/communications/messages/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### communications_messages_destroy
**DELETE** `/api/v1/communications/messages/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **204**: No response body

---

## Content

### content_list
**GET** `/api/v1/content/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| content_type | query | No | string | * `document` - Document * `video` - Video * `image` - Image * `link` - Link * `assignment` - Assignment |
| course_offering | query | No | string |  |
| folder | query | No | string |  |
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| search | query | No | string | A search term. |
| visibility | query | No | string | * `public` - Public * `department` - Department * `course` - Course * `private` - Private |

**Responses:**
- **200**: 

---

### content_create
**POST** `/api/v1/content/`

**Responses:**
- **201**: 

---

### content_retrieve
**GET** `/api/v1/content/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### content_update
**PUT** `/api/v1/content/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### content_partial_update
**PATCH** `/api/v1/content/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### content_destroy
**DELETE** `/api/v1/content/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **204**: No response body

---

### content_download_retrieve
**GET** `/api/v1/content/{id}/download/`

GET /api/v1/content/{id}/download/ — returns file URL and logs download.

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### content_stats_retrieve
**GET** `/api/v1/content/{id}/stats/`

GET /api/v1/content/{id}/stats/

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### content_bookmarks_list
**GET** `/api/v1/content/bookmarks/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| search | query | No | string | A search term. |

**Responses:**
- **200**: 

---

### content_bookmarks_create
**POST** `/api/v1/content/bookmarks/`

**Responses:**
- **201**: 

---

### content_bookmarks_destroy
**DELETE** `/api/v1/content/bookmarks/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **204**: No response body

---

### content_folders_list
**GET** `/api/v1/content/folders/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| course_offering | query | No | string |  |
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| parent | query | No | string |  |
| search | query | No | string | A search term. |
| visibility | query | No | string | * `public` - Public * `department` - Department * `course` - Course * `private` - Private |

**Responses:**
- **200**: 

---

### content_folders_create
**POST** `/api/v1/content/folders/`

**Responses:**
- **201**: 

---

### content_folders_retrieve
**GET** `/api/v1/content/folders/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### content_folders_update
**PUT** `/api/v1/content/folders/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### content_folders_partial_update
**PATCH** `/api/v1/content/folders/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### content_folders_destroy
**DELETE** `/api/v1/content/folders/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **204**: No response body

---

### content_recent_list
**GET** `/api/v1/content/recent/`

GET /api/v1/content/recent/

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| search | query | No | string | A search term. |

**Responses:**
- **200**: 

---

### content_tags_list
**GET** `/api/v1/content/tags/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| search | query | No | string | A search term. |

**Responses:**
- **200**: 

---

### content_tags_create
**POST** `/api/v1/content/tags/`

**Responses:**
- **201**: 

---

## Departments

### departments_list
**GET** `/api/v1/departments/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| search | query | No | string | A search term. |

**Responses:**
- **200**: 

---

### departments_create
**POST** `/api/v1/departments/`

**Responses:**
- **201**: 

---

### departments_retrieve
**GET** `/api/v1/departments/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### departments_update
**PUT** `/api/v1/departments/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### departments_partial_update
**PATCH** `/api/v1/departments/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### departments_destroy
**DELETE** `/api/v1/departments/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **204**: No response body

---

## Notifications

### notifications_list
**GET** `/api/v1/notifications/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| search | query | No | string | A search term. |

**Responses:**
- **200**: 

---

### notifications_read_partial_update
**PATCH** `/api/v1/notifications/{id}/read/`

PATCH /api/v1/notifications/{id}/read/

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### notifications_admin_stats_retrieve
**GET** `/api/v1/notifications/admin/stats/`

GET /api/v1/notifications/admin/stats/

**Responses:**
- **200**: 

---

### notifications_preferences_list
**GET** `/api/v1/notifications/preferences/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| search | query | No | string | A search term. |

**Responses:**
- **200**: 

---

### notifications_preferences_create
**POST** `/api/v1/notifications/preferences/`

**Responses:**
- **201**: 

---

### notifications_preferences_update
**PUT** `/api/v1/notifications/preferences/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### notifications_preferences_partial_update
**PATCH** `/api/v1/notifications/preferences/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### notifications_read_all_create
**POST** `/api/v1/notifications/read-all/`

POST /api/v1/notifications/read-all/

**Responses:**
- **200**: 

---

### notifications_unread_count_retrieve
**GET** `/api/v1/notifications/unread-count/`

GET /api/v1/notifications/unread-count/

**Responses:**
- **200**: 

---

## Root

### root_retrieve
**GET** `/api/v1/`

API root — health check and endpoint overview.

**Responses:**
- **200**: 

---

## Timetable

### timetable_list
**GET** `/api/v1/timetable/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| day_of_week | query | No | integer | * `0` - Monday * `1` - Tuesday * `2` - Wednesday * `3` - Thursday * `4` - Friday * `5` - Saturday * `6` - Sunday |
| is_active | query | No | boolean |  |
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| room | query | No | string |  |
| search | query | No | string | A search term. |
| semester | query | No | string |  |

**Responses:**
- **200**: 

---

### timetable_create
**POST** `/api/v1/timetable/`

**Responses:**
- **201**: 

---

### timetable_retrieve
**GET** `/api/v1/timetable/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### timetable_update
**PUT** `/api/v1/timetable/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### timetable_partial_update
**PATCH** `/api/v1/timetable/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### timetable_destroy
**DELETE** `/api/v1/timetable/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **204**: No response body

---

### timetable_conflicts_retrieve
**GET** `/api/v1/timetable/conflicts/`

GET /api/v1/timetable/conflicts/ — check room/faculty conflicts.

**Responses:**
- **200**: 

---

### timetable_me_list
**GET** `/api/v1/timetable/me/`

GET /api/v1/timetable/me/ — student or faculty timetable.

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| search | query | No | string | A search term. |

**Responses:**
- **200**: 

---

### timetable_rooms_list
**GET** `/api/v1/timetable/rooms/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| is_available | query | No | boolean |  |
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| room_type | query | No | string | * `classroom` - Classroom * `lab` - Laboratory * `auditorium` - Auditorium * `conference` - Conference Room |
| search | query | No | string | A search term. |

**Responses:**
- **200**: 

---

### timetable_rooms_create
**POST** `/api/v1/timetable/rooms/`

**Responses:**
- **201**: 

---

### timetable_rooms_retrieve
**GET** `/api/v1/timetable/rooms/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### timetable_rooms_update
**PUT** `/api/v1/timetable/rooms/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### timetable_rooms_partial_update
**PATCH** `/api/v1/timetable/rooms/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### timetable_rooms_destroy
**DELETE** `/api/v1/timetable/rooms/{id}/`

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **204**: No response body

---

## Users & Accounts

### users_list
**GET** `/api/v1/users/`

GET /api/v1/users/ — List users (admin).
POST /api/v1/users/ — Create user (admin).

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| department | query | No | string |  |
| is_active | query | No | boolean |  |
| ordering | query | No | string | Which field to use when ordering the results. |
| page | query | No | integer | A page number within the paginated result set. |
| role | query | No | string | * `admin` - Admin * `faculty` - Faculty * `student` - Student |
| search | query | No | string | A search term. |

**Responses:**
- **200**: 

---

### users_create
**POST** `/api/v1/users/`

GET /api/v1/users/ — List users (admin).
POST /api/v1/users/ — Create user (admin).

**Responses:**
- **201**: 

---

### users_retrieve
**GET** `/api/v1/users/{id}/`

GET/PATCH/DELETE /api/v1/users/{id}/

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### users_update
**PUT** `/api/v1/users/{id}/`

GET/PATCH/DELETE /api/v1/users/{id}/

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### users_partial_update
**PATCH** `/api/v1/users/{id}/`

GET/PATCH/DELETE /api/v1/users/{id}/

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### users_destroy
**DELETE** `/api/v1/users/{id}/`

GET/PATCH/DELETE /api/v1/users/{id}/

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **204**: No response body

---

### users_reset_password_create
**POST** `/api/v1/users/{id}/reset-password/`

POST /api/v1/users/{id}/reset-password/ — Admin resets a user's password.

**Parameters:**
| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| id | path | Yes | string |  |

**Responses:**
- **200**: 

---

### users_me_retrieve
**GET** `/api/v1/users/me/`

GET/PATCH /api/v1/users/me/ — Current user profile.

**Responses:**
- **200**: 

---

### users_me_update
**PUT** `/api/v1/users/me/`

GET/PATCH /api/v1/users/me/ — Current user profile.

**Responses:**
- **200**: 

---

### users_me_partial_update
**PATCH** `/api/v1/users/me/`

GET/PATCH /api/v1/users/me/ — Current user profile.

**Responses:**
- **200**: 

---

### users_me_avatar_create
**POST** `/api/v1/users/me/avatar/`

POST /api/v1/users/me/avatar/

**Responses:**
- **200**: 

---

