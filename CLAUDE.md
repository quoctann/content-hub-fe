# content-hub-fe

React + Vite SPA for Content Hub. Backend: sibling repo `content-hub` (Go/Gin).
In prod the SPA is served by nginx, which proxies `/api/*` to the backend (same origin).

## API contract with the backend (read before touching `src/types/` or `src/services/`)

The backend is the source of truth. Contract mismatches here have caused silent
bugs (a crash on untitled items; clearing a field in the editor did nothing), so:

- **Types mirror the Go response structs exactly**, not what the UI would like.
  Each API type must name the Go struct it mirrors, e.g.
  `internal/delivery/http/content_response.go#ContentResponse`.
- **Nullability**: every Go pointer field (`*string`, `*time.Time`, ...) is
  `T | null` in TS. Never type it as plain `T` or optional `T?`. A field that the
  Go struct does not have must not exist in the TS type (no phantom fields).
- **Defaults are applied once, in the mapper** (`mapApiContent` etc.), which turns
  `ApiX` (nullable, wire shape) into the UI type. Components must not read raw
  API types for rendering.
- **Update payloads are partial updates** (`PUT /admin/contents/:id`):
  omitted field = leave unchanged; `null` = clear the column; value = set.
  Do not send `undefined`/omit to mean "clear", and do not send `null` for a field
  you did not intend to change. `type` and `is_hidden` are not nullable.
- **Changing the contract is a two-repo change**: update the Go DTO, this repo's
  types/mapper, and `docs/` swagger (`make swagger` in `content-hub`) together.
  Before finishing, grep the backend DTOs and confirm every field, name and
  nullability matches.

## Auth

Admin auth is stateless JWT in HttpOnly cookies + a CSRF token (double submit).
There is no server-side session/blacklist by design. Logout = `adminSignOut()`:
call `/account/logout` (the only way to expire HttpOnly cookies) and clear the
store. Never just clear the store.

## Checks

`npx tsc -b` and `npm run lint` must pass.
