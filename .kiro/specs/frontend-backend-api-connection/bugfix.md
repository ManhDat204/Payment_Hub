# Bugfix Requirements Document

## Introduction

Ứng dụng frontend (Angular) tại http://localhost:4200/ không thể kết nối với backend API, gây ra lỗi `ECONNREFUSED` khi gọi các endpoints `/api/group-categories/jpa/*`. Lỗi này ảnh hưởng đến toàn bộ chức năng quản lý Group Category, bao gồm việc tải danh sách và component options. Nguyên nhân chính là backend Spring Boot chưa được khởi động trên port 8080, trong khi frontend proxy đã được cấu hình đúng để forward requests đến `http://localhost:8080`.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN frontend gọi API endpoint `/api/group-categories/jpa?page=0&size=20` THEN hệ thống trả về lỗi `[vite] http proxy error: /api/group-categories/jpa?page=0&size=20` và `AggregateError [ECONNREFUSED]`

1.2 WHEN frontend gọi API endpoint `/api/group-categories/jpa/components/active` THEN hệ thống trả về lỗi `[vite] http proxy error: /api/group-categories/jpa/components/active` và `AggregateError [ECONNREFUSED]`

1.3 WHEN frontend khởi động với proxy configuration pointing to `http://localhost:8080` và backend chưa chạy THEN tất cả API requests đến `/api/*` đều thất bại với connection refused error

### Expected Behavior (Correct)

2.1 WHEN frontend gọi API endpoint `/api/group-categories/jpa?page=0&size=20` với backend đã được start THEN hệ thống SHALL trả về response thành công với dữ liệu phân trang (PagedResult<GroupCategory>)

2.2 WHEN frontend gọi API endpoint `/api/group-categories/jpa/components/active` với backend đã được start THEN hệ thống SHALL trả về response thành công với danh sách component options (ComponentOption[])

2.3 WHEN frontend khởi động với proxy configuration pointing to `http://localhost:8080` và backend đang chạy trên port 8080 THEN tất cả API requests đến `/api/*` SHALL được proxy thành công đến backend và trả về response hợp lệ

2.4 WHEN backend Spring Boot application được start THEN hệ thống SHALL khởi động trên port 8080 (default) và expose tất cả REST API endpoints tại `/api/group-categories/jpa/*`

### Unchanged Behavior (Regression Prevention)

3.1 WHEN proxy configuration trong `proxy.conf.json` đã được cấu hình đúng với target `http://localhost:8080` THEN hệ thống SHALL CONTINUE TO sử dụng configuration này để forward requests

3.2 WHEN frontend API service sử dụng base URL `/api/group-categories/jpa` THEN hệ thống SHALL CONTINUE TO sử dụng URL pattern này cho tất cả API calls

3.3 WHEN backend được cấu hình với database connection (Oracle) trong `application.properties` THEN hệ thống SHALL CONTINUE TO sử dụng các settings này khi khởi động

3.4 WHEN frontend development server chạy trên port 4200 THEN hệ thống SHALL CONTINUE TO serve application trên port này

3.5 WHEN có các static resources hoặc routes không thuộc `/api/*` pattern THEN hệ thống SHALL CONTINUE TO serve chúng trực tiếp từ frontend server mà không proxy đến backend
