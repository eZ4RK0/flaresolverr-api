# FlareSolverr Client

A TypeScript client API to easily communicate with [FlareSolverr](https://github.com/FlareSolverr/FlareSolverr), a headless browser-based anti-bot bypass tool.

> This client allows you to perform HTTP requests via an automated browser, manage persistent sessions, use proxies, and more.

## ✨ Features

- `GET` / `POST` requests via a controlled browser.
- Create, destroy, and list **persistent sessions**.
- Optional use of HTTP **proxies**.
- Automatic handling of errors returned by the API.
- Fully typed with **TypeScript**.

## 📦 Installation

```bash
npm install flaresolverr-client
# or
pnpm add flaresolverr-client
```

## 🛠️ Usage

```ts
import { FlareSolverrClient } from 'flaresolverr-client';

const flaresolverr = new FlareSolverrClient('http://localhost:8191');

// Check the health of the service
await flaresolverr.health();

// Create a session manager (with optional TTL in seconds)
const sessionManager = flaresolverr.createSession({ ttl: 60 }, true); // 60s TTL

// Perform a GET request via the session
const getResult = await sessionManager.requestGet({ url: 'https://example.com' });
console.log(getResult.solution.response);

// Destroy the session
await sessionManager.destroy();

// Perform a GET request
const result = await flaresolverr.requestGet({
  url: 'https://example.com'
});

console.log(result.solution.response);
```

## 📚 API

### Main class

```ts
new FlareSolverrClient(baseURL: string)
new SessionsManager(sessionId: string, flareSolverr: FlareSolverrClient, ttl?: number)
```

### Available methods

| Method             | Description                           |
| ------------------ | ------------------------------------- |
| `index()`          | Retrieves version info and user-agent |
| `health()`         | Checks if FlareSolverr is running     |
| `createSession()`  | Creates a browser session             |
| `listSessions()`   | Lists active sessions                 |
| `destroySession()` | Deletes a session by ID               |
| `requestGet()`     | Performs a GET request via browser    |
| `requestPost()`    | Performs a POST request via browser   |

### Available types

All types (requests, responses, cookies, proxies, etc.) are exported from `flaresolverr-client`.

`SessionsManager` provides typed methods for session-based requests and lifecycle management.

Examples:

```ts
import type { V1Request, V1Response, Status } from 'flaresolverr-client';
```

## ✅ Supported requests

| Route         | Command            |
| ------------- | ------------------ |
| `POST /v1`    | `sessions.create`  |
| `POST /v1`    | `sessions.list`    |
| `POST /v1`    | `sessions.destroy` |
| `POST /v1`    | `request.get`      |
| `POST /v1`    | `request.post`     |
| `GET /`       | -                  |
| `GET /health` | -                  |

## ⚠️ Error handling

Errors returned by the API are transformed into clear and detailed exceptions:

```ts
[FlareSolverr Error] error: Timeout occurred
-> Start at: Tue Jul 22 2025 14:00:00 GMT+0200 (CEST)
-> End at: Tue Jul 22 2025 14:01:00 GMT+0200 (CEST)
-> Version: v3.3.9
```

## 🧠 About

This client aims to simplify interactions with FlareSolverr while providing strict typing and a modern API for Node.js/TypeScript.

---

> For any contribution, feel free to open an issue or a PR!
