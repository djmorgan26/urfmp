Design Principles & Implementation Guidelines for Claude Code working on
Universal Robot Fleet Management Platform (URFMP)
Clear, opinionated, and developer-first rules so every implementation is consistent, secure, and product-focused.

⸻

1. Purpose & Tone
	•	Purpose: Give Claude Code a single source of truth for decisions, trade-offs, and patterns while implementing URFMP.
	•	Tone for code & text output: Practical, concise, empathic to developer needs, and API-first. Prefer clarity over cleverness.
	•	Primary goal: Ship the smallest thing that delivers real developer value (monitoring + 7-line SDK experience) with predictable, maintainable engineering.

⸻

2. Overarching Design Pillars (ranked)
	1.	Developer-first — APIs and SDKs should be delightful: discoverable, predictable, minimal friction.
	2.	Observability & Reliability — every component emits structured telemetry; failures are visible and actionable.
	3.	Security-by-default — zero-trust model, least privilege, encrypted-in-transit & at-rest.
	4.	Vendor-agnostic extensibility — adapters and integrations are pluggable and sandboxed.
	5.	Data-driven — design to feed ML and analytics; capture high-quality time-series.
	6.	Incremental delivery — prefer a small, well-tested core to a large untested surface.

⸻

3. API & SDK Principles
	•	Design for 7 lines of code. Example SDK experience must be true: fleet.monitor({...}) should bootstrap connection, return a typed object, and emit events.
	•	Consistency: Use REST for CRUD + WebSocket (or Server-Sent Events) for streaming telemetry. Follow OpenAPI 3.0 patterns already in spec.
	•	Idempotency & determinism: write idempotent endpoints (create/update where appropriate) and require idempotency keys for operations with side effects.
	•	Pagination & time windows: telemetry endpoints must support from, to, limit, cursor. Default to = now, from = now - 24h.
	•	Versioning: use /v1/ path. Breaking changes must follow v2 release with migration notes in changelog.
	•	Error model: standardize on HTTP status + structured error body:

{
  "code": "ROBOT_NOT_FOUND",
  "message": "Robot not found",
  "details": {"robotId": "uuid"}
}


	•	SDKs: provide typed SDKs for Node (TS), Python, and a minimal REST client. SDKs should:
	•	Expose event emitter for real-time events (on('robot.telemetry', fn)).
	•	Auto-retry network errors with exponential backoff (configurable).
	•	Surface authentication and scope errors clearly.

⸻

4. Universal Adapter Pattern
	•	Single interface contract every adapter implements:

interface IRobotVendorAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getId(): string;
  getStatus(): Promise<VendorStatus>;
  streamTelemetry(onData: (t: Telemetry) => void): Subscription;
  sendCommand?(cmd: Command): Promise<CommandResult>;
}


	•	Vendor Factory: use VendorFactory.create(vendorType, config) returning the above interface.
	•	Transformations: adapters must map vendor-specific statuses/fields into canonical schema before ingesting (status, position, battery_level, metrics).
	•	Sandboxing: adapters run in a separate process/container (or worker) to avoid crashing core service.
	•	Testing: provide recorded fixtures (VCR-style) for each vendor adapter to enable deterministic unit tests.

⸻

5. Telemetry & Schema
	•	Canonical telemetry schema (minimal):

{
  "robot_id": "uuid",
  "ts": "ISO8601",
  "status": "active|idle|maintenance|error",
  "position": {"lat": number, "lon": number, "frame": "map"},
  "battery_level": 0-100,
  "metrics": {"cpu":0-100,"temperature":number, ...}
}


	•	Timescale hypertable: ensure robot_telemetry uses the timestamp column and partitioning strategy in spec.
	•	Retention policy: default hot retention = 90 days; cold storage in S3 for raw telemetry (Parquet).
	•	Data validation: ingest pipeline validates schema and emits ingest.failure events for schema mismatches.

⸻

6. Alerting & Rules Engine
	•	Rule format: declarative, JSON/YAML rules with pluggable condition language (JS expression for MVP).
	•	Actions: notify, page, webhook, run_job.
	•	Severity levels: INFO, WARNING, CRITICAL. Must map to escalation policies.
	•	Idempotent alerts: deduplicate alerts per robot + rule with a TTL window.
	•	Backpressure: rate-limit alert execution per org to prevent notification storms.
	•	Audit trail: every alert should write an event to alerts table with rule_id, robot_id, status, actions_taken.

⸻

7. Security (concrete rules)
	•	Authentication: JWT with short-lived tokens + refresh tokens for SDKs. API keys must have scopes.
	•	Authorization: RBAC; actions checked by scope and org membership.
	•	Encryption: TLS everywhere. Telemetry payloads optionally encrypted end-to-end (AES) when requested by customer; at-rest encryption for DB and S3.
	•	Secrets: store in AWS Secrets Manager or Azure Key Vault. Never persist vendor credentials in plaintext.
	•	Network segmentation: vendor adapters must initiate outbound connections; never open admin ports to public internet.
	•	Rate limiting: per-org and per-api-key rate limits configurable by subscription tier.
	•	Compliance: design with SOC 2 in mind: audit logs, access controls, incident response playbook.

⸻

8. Scalability & Reliability Patterns
	•	Streaming ingestion: Kafka (or Kinesis) as source-of-truth for telemetry; consumers for enrichment, storage (ClickHouse/Timescale) and ML.
	•	Microservices: keep ML services separate (Python), core control plane in Node. Communicate via RPC (gRPC) or Kafka.
	•	Autoscaling: ECS tasks scale by CPU, memory, and custom metrics (ingest rate).
	•	Backfill & replay: store raw telemetry in S3 (partitioned by org/date) and support replay into Kafka for model retraining or analytics backfill.
	•	Circuit breakers & bulkheads: protect upstream vendor adapter failures from cascading.

⸻

9. Observability & SLOs
	•	Logs: structured JSON logs with trace_id, org_id, robot_id, service.
	•	Tracing: OpenTelemetry across services; propagate trace_id.
	•	Metrics: Prometheus metrics (or CloudWatch) exposing:
	•	ingest.events/sec
	•	db.write.latency
	•	api.p95
	•	alerts.fired
	•	SLOs: follow spec targets; example: api.p95 < 200ms, uptime 99.9%.
	•	Dashboards & runbooks: for each critical alert include cause, mitigation, and rollback steps.

⸻

10. ML / Predictive Maintenance Guidelines
	•	Feature engineering: store windowed aggregates (1m, 5m, 1h) to feed models; keep feature lineage.
	•	Model serving: Python microservice exposes predict(robot_id, window) returning structured prediction (risk, component, confidence, recommended_action).
	•	Thresholds: predictions translated to business actions only after human-in-the-loop validation for first N customers.
	•	Retrain cadence: automated retrain with data drift detection; keep model versioning.
	•	Explainability: return feature importance or why field for each prediction to help operations trust decisions.

⸻

11. UX & Dashboard Guidelines
	•	Primary flows prioritized: Fleet map, Alert feed, Robot timeline, Telemetry timeseries, Maintenance predictions.
	•	Performance: dashboard initial load < 2s; use progressive hydration & careful chunking of telemetry.
	•	Real-time: use WebSocket topic per org; respect subscription/presence to avoid pushing unnecessary data.
	•	Accessibility: basic a11y compliance (contrast, keyboard nav) for MVP.
	•	Onboarding: wizard for org creation -> auto-discovery -> connect first robot (aim for < 5 minutes).

⸻

12. Marketplace & Third-party Apps
	•	App model: Apps register webhooks, request scopes (read.telemetry, write.commands), and go through permission grant flow.
	•	Billing: platform fee 30% default; apps receive tokens scoped to their installed org.
	•	Isolation: apps run in sandboxed environment and are subject to rate limits and monitoring.

⸻

13. Testing Strategy
	•	Unit tests: adapters + core business logic — fast, hermetic.
	•	Integration tests: run adapters against mocked vendor fixtures and a test Timescale instance (CI).
	•	Contract tests: for SDKs and API (OpenAPI contract tests).
	•	E2E: minimal scenarios: onboarding -> connect -> ingest -> alert -> dashboard shows alert.
	•	Chaos testing: periodically simulate adapter failures, DB lag, and network partitions to validate resilience.

⸻

14. Coding & Repo Conventions
	•	Monorepo layout (recommended):

/services
  /api (Node/Express)
  /core-service (Node)
  /ml-service (Python)
  /adapters (TS per adapter)
  /sdk (typescript, python)
/infrastructure (terraform)
/web (react + typescript)


	•	Commit & PR rules:
	•	PR size: small, < 400 lines when possible.
	•	PR must have CI passing, unit tests, and basic integration smoke.
	•	Linting & formatting: ESLint + Prettier for TS/JS, Black + Flake8 for Python.
	•	Types: prefer strong typing — TypeScript for frontend/backend contracts; Pydantic for Python models.

⸻

15. Acceptance Criteria / Definition of Done (example)
	•	Feature implements API + tests + SDK changes (if applicable).
	•	OpenAPI spec updated and validated.
	•	CI runs: unit tests, linting, integration smoke.
	•	Telemetry emitted with trace_id and visible in staging dashboard.
	•	Security review checklist completed (secrets, scopes, rate limits).
	•	Documentation: README, API docs, and a “how to connect a first robot” quickstart.

⸻

16. Documentation & Communication
	•	Living docs: API OpenAPI, Adapter spec, Alert rule schema, Onboarding flow — all in repo docs.
	•	Changelogs: semver-based changelog for breaking changes and migration notes.
	•	Design notes: every non-trivial design decision must have a short rationale and alternatives considered.

⸻

17. Example: Minimal Implementation Checklist (Week 1–4)
	•	Terraform AWS infra bootstrapped
	•	Express API (/v1/robots, /v1/robots/{id}/telemetry)
	•	TimescaleDB with robot_telemetry hypertable
	•	Universal adapter skeleton + one vendor adapter (Universal Robots)
	•	WebSocket channel for real-time telemetry
	•	Basic React dashboard showing live positions and statuses
	•	Rule-based alert engine with Low Battery & Unexpected Stop
	•	JS SDK with monitor() + event emitter quickstart
	•	CI with unit tests and contract validation
	•	Basic logging, traces, and a staging dashboard

⸻

18. Common Anti-Patterns (do not do)
	•	Designing UI before a working API.
	•	Embedding vendor-specific logic into core services instead of adapters.
	•	Storing raw credentials in DB or logs.
	•	Making ML decisions opaque; models must be explainable for operators.
	•	Ignoring per-org isolation in multi-tenant flows.

⸻

19. Decision Authorities & Escalation
	•	Product owner owns priorities and API ergonomics.
	•	Tech lead owns architecture & infra trade-offs.
	•	Security lead approves all secrets/crypto changes.
	•	In disagreements, prefer the option that maximizes developer velocity while minimizing long-term tech debt.

⸻

20. If Claude Code must make a judgement call
	•	Default to developer-first UX, safety & security, and small, testable increments.
	•	If two reasonable architectural choices remain, choose the option with fewer moving parts (faster to iterate) and document decision + rollback plan.

⸻

21. Quick Reference (cheat-sheet)
	•	Telemetry schema: robot_id, ts, status, position, battery_level, metrics
	•	Alert severities: INFO | WARNING | CRITICAL
	•	DB: Timescale hypertable + S3 raw ETL
	•	SDK promise: 7 lines to monitor + event emitter + auto-retry
	•	Security: JWT scopes + end-to-end optional telemetry encryption
	•	ML: Python microservice, explainability required, human-in-loop for first deployments

⸻

22. Appendices (snippets)

Canonical telemetry TypeScript type

type Telemetry = {
  robot_id: string;
  ts: string; // ISO
  status: 'active'|'idle'|'maintenance'|'error';
  position?: { lat: number; lon: number; frame?: string };
  battery_level?: number;
  metrics?: Record<string, number | string>;
}

Sample alert rule (JSON)

{
  "id": "rule-low-battery",
  "name": "Low Battery",
  "condition": "telemetry.battery_level < 20",
  "severity": "WARNING",
  "actions": ["notify"],
  "dedupe_window_sec": 600
}


⸻

Final note to Claude Code implementers

Always ask: Does this make it easier for a developer to start monitoring robots in under 5 minutes? If yes — ship it. If no — iterate until the smallest, polished experience exists.