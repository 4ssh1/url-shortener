# Link Shortener Frontend Architecture

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-B7178C?style=for-the-badge&logo=reactivex&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Sass](https://img.shields.io/badge/Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white)
---

<img width="1170" height="673" alt="image" src="https://github.com/user-attachments/assets/689d61cb-3823-418c-9fb4-880e70620dcf" />


## Technical Breakdown

The application is built on a unidirectional data flow model leveraging **Angular Signals** for state management and **RxJS** for asynchronous network operations.

* **State Management:** Local component state and global service state rely on Angular Signals (`signal`, `computed`). This eliminates memory leaks associated with unhandled subscriptions and forces synchronous DOM updates.
* **Network Layer:** `HttpClient` wraps all API requests in RxJS Observables. Responses are piped through `tap` operators to mutate Signal state before resolving.
* **Routing Security:** Route access is strictly evaluated at the navigation phase using functional Angular Route Guards (`canActivate`).

---

## Application Data Lifecycle

The following chart illustrates the standard execution flow from a user action to a DOM update.

```mermaid
graph TD
    A[User Interaction / Route Request] --> B{Route Guards}
    B -->|authGuard| C[Protected View Initialization]
    B -->|guestGuard| D[Public View Initialization]
    C --> E[Service Layer Triggered]
    D --> E
    E --> F[HttpClient RxJS Stream]
    F -->|Success Response| G[Signal State Mutation]
    F -->|Error Response| H[Error Signal Mutation]
    G --> I[Angular Change Detection]
    H --> I
    I --> J[DOM Synchronized]
```

## The Exemption: Anonymous Trial
The system includes a strict bypass for unregistered users. This operates outside the standard authentication lifecycle.

**💡 Core Logic: Guest users interact with a dedicated `/try` service that bypasses the authGuard.**

- Limitation Enforcements
To prevent abuse, limitations are enforced at two distinct levels:

- Client-Side Check: The frontend sets a localStorage marker upon successful creation. Subsequent requests are blocked at the component level.

- Server-Side Check: The API enforces a strict IP-based Time-To-Live (TTL) limit. If the client clears their local storage to bypass the UI block, the network request is still intercepted and rejected by the backend with a 403 Forbidden status.
