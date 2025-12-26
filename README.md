# TaskEngine: Distributed Job Queue Dashboard

A professional, full-stack asynchronous task management system. This project demonstrates a **Producer-Consumer architecture** using **Node.js**, **Redis**, and **React**. It is designed to handle background tasks efficiently without blocking the main application thread.



##  Tech Stack

* **Frontend:** React.js, Axios, Lucide-React (Icons)
* **Backend:** Node.js, Express.js
* **Message Broker:** Redis (In-memory data structure store)
* **Queue Management:** BullMQ (Robust Redis-based queue for Node.js)
* **State Management:** Asynchronous Polling & REST APIs

---

##  Key Features

### 1. Asynchronous Background Processing
Tasks are offloaded to background workers. This allows the user to continue using the application while "heavy" tasks (like Email Campaigns or Data Syncs) process in the background.

### 2. Priority-Based Scheduling
Implemented a priority system (1-10) where high-priority jobs are moved to the front of the queue automatically by the Redis broker.

### 3. Fault Tolerance & Manual Retries
* **Automatic Retries:** Configured with exponential backoff to handle transient failures.
* **Manual Actions:** Users can manually trigger a "Retry" for failed jobs or "Cancel" jobs that are currently queued.

### 4. Real-time Monitoring
A dynamic dashboard that tracks the lifecycle of every job through four distinct states:
* **QUEUED:** Waiting for an available worker.
* **RUNNING:** Currently being processed by a worker.
* **COMPLETED:** Successfully finished.
* **FAILED:** Encountered an error (visible with retry options).



---

##  System Architecture

1.  **Producer (React):** Submits job requests with specific types and priority levels.
2.  **Broker (Redis):** Acts as the "source of truth," holding the queue and managing job states atomically.
3.  **Consumer (Worker):** Background processes that pick up jobs from Redis, execute the logic, and update the status.

---

## 🚦 Getting Started

### Prerequisites
* **Node.js** (v16.x or higher)
* **Redis Server** (Running on `localhost:6379`)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/your-username/task-engine.git](https://github.com/your-username/task-engine.git)
    cd task-engine
    ```

2.  **Setup Backend**
    ```bash
    cd backend
    npm install
    node server.js
    ```

3.  **Setup Frontend**
    ```bash
    cd ../frontend
    npm install
    npm start
    ```

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/jobs` | Retrieve all jobs and their current status. |
| `POST` | `/api/jobs` | Create a new background task. |
| `POST` | `/api/jobs/:id/retry` | Manually restart a failed job. |
| `DELETE` | `/api/jobs/:id` | Remove/Cancel a job from the queue. |
| `POST` | `/api/jobs/clear` | Purge history of completed and failed tasks. |

---

##  Internship Learning Outcomes
* Implemented **Distributed Systems** principles using a Message Broker (Redis).
* Handled **Concurrency Control** to prevent server resource exhaustion.
* Developed a **Responsive UI** with advanced error boundaries and `try/catch` logic for stable API interactions.
* Configured **Worker Logic** with random failure simulations to test system resilience.

---

Developed as part of the Full-Stack Engineering Internship Assignment.
