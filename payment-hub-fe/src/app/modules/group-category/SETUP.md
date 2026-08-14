# Group Category Module - Setup Guide

## Missing Dependencies

The following npm packages need to be installed for this module to work:

```bash
npm install @taiga-ui/core @taiga-ui/kit @tinkoff/ng-polymorpheus
```

## Known Issues & Fixes

### 1. TuiNotificationService API

The current implementation uses `notify.show()` which doesn't match the actual TuiNotificationService API in Taiga UI.
Correct usage should be through TuiToastService or similar.

### 2. @tinkoff/ng-polymorpheus

This is a dependency for Taiga UI dialogs. Must be installed for the module to compile.

### 3. Form Dialog Integration

The form-dialog component has been updated to use Taiga UI's PolymorpheusComponent pattern instead of Material Dialog.

## Component Structure

The module follows this architecture:

- **Models**: Define data structures and enums
- **Services**: API calls and state management
- **Components**: Reusable UI components (dialogs, filters, grids)
- **Pages**: Full-page components (list view)
- **Guards**: Route protection with permission checking

## Key Features Implemented

1. **Search Filter** - Multiple criteria search with reset
2. **Data Grid** - Paginated list with inline actions
3. **Form Dialog** - Create/Edit/Copy operations
4. **Detail Dialog** - View with approval workflow
5. **History Dialog** - Audit trail with pagination
6. **Reject Dialog** - Rejection reason input

## API Endpoints Required

All endpoints use `/api/v1/group-category` base URL:

- `GET /api/v1/group-category` - Search with filters
- `GET /api/v1/group-category/:id/detail` - Get detail with diff
- `POST /api/v1/group-category` - Create new
- `PUT /api/v1/group-category/:id` - Update
- `DELETE /api/v1/group-category/:id` - Delete
- `POST /api/v1/group-category/:id/submit` - Submit for approval
- `POST /api/v1/group-category/approve` - Approve items
- `POST /api/v1/group-category/reject` - Reject items
- `POST /api/v1/group-category/cancel-approval` - Cancel approval
- `GET /api/v1/group-category/:id/history` - Get history log

## Next Steps

1. Install dependencies: `npm install @taiga-ui/core @taiga-ui/kit @tinkoff/ng-polymorpheus`
2. Update TuiNotificationService calls to use correct API
3. Implement backend API endpoints
4. Add permission checking in the guard
5. Configure routing in main app module
