ALTER TABLE `tutor_quotas` ADD `generated` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `tutor_quotas` ADD `checked` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
-- Preserve the shared request counter and count retained sentence attempts,
-- including revisions and provider failures. Quota-denied attempts were not sent.
INSERT INTO tutor_quotas (user_id, day, used, generated, checked)
SELECT sessions.user_id, date(json_extract(operation.value, '$.createdAt')), 0,
  SUM(CASE WHEN json_extract(operation.value, '$.action') = 'generate' THEN json_extract(sessions.data, '$.count') ELSE 0 END),
  SUM(CASE WHEN json_extract(operation.value, '$.action') = 'check' THEN json_extract(sessions.data, '$.count') ELSE 0 END)
FROM tutor_sessions AS sessions,
  json_each(CASE WHEN json_valid(sessions.data) THEN sessions.data ELSE '{}' END, '$.operations') AS operation
WHERE json_extract(CASE WHEN json_valid(sessions.data) THEN sessions.data ELSE '{}' END, '$.kind') = 'translation-v1'
  AND json_extract(sessions.data, '$.count') BETWEEN 1 AND 12
  AND json_extract(operation.value, '$.action') IN ('generate', 'check')
  AND date(json_extract(operation.value, '$.createdAt')) IS NOT NULL
  AND COALESCE(json_extract(operation.value, '$.error'), '') NOT LIKE 'Daily AI limit reached%'
GROUP BY sessions.user_id, date(json_extract(operation.value, '$.createdAt'))
ON CONFLICT (user_id, day) DO UPDATE SET generated = excluded.generated, checked = excluded.checked;
