# Your approach to each section

This is my first time using **JavaScript** and **Node.js** to design this type of application. Previously, I only learned OOP and built simple applications (student information input/storage) with Java in my first year. Therefore, every section was a challenge. I used ChatGPT to exchange ideas and generate code, then simplified and focused on understanding the **input/output flow** of each function and file.

# Key decisions & trade-offs

### Chunking & Upload

* **Decision:** Split audio into short time intervals (e.g., 30s) and upload each chunk.
* **Trade-off:** Small chunks -> more requests but easier to resume; large chunks -> fewer requests but more prone to errors/timeouts.

### Retry & Error handling

* **Decision:** Client-side retry (3 attempts) + idempotency key to avoid duplicates.
* **Trade-off:** Reduces temporary errors but increases duplicate requests, requires control mechanisms.

### Rate limiting

* **Decision:** Sliding-window rate limiting (e.g., 10 req/min).
* **Trade-off:** Simple and easy to implement; when scaling multiple instances, requires centralized solution.

# Questions in real scenario

* Service costs (cloud, tokens, storage, etc)?
* Which files are critical for configuration?
* Are optional features necessary?

# Most challenging parts

* Since everything was completely new, **all parts were challenging**.
* The hardest part was writing code while understanding how files connect and how input/output flows work.
* I learned to analyze systems, code, not just run code.