-- !!! Query is not converted to CH syntax yet.  Delete this line when it gets converted
SELECT
    FORMAT_ISO8601(
        DATE_TRUNC(
            :granularity,
            PARSE_TIMESTAMP_ISO8601(workflow.created_at) AT TIME ZONE :timezone
        )
    ) AS granularity_bucket,
    workflow.name,
    COUNT(*) as count,
FROM
    workflow_run workflow
WHERE
    PARSE_TIMESTAMP_ISO8601(workflow.created_at) >= PARSE_DATETIME_ISO8601(:startTime)
    AND PARSE_TIMESTAMP_ISO8601(workflow.created_at) < PARSE_DATETIME_ISO8601(:stopTime)
    AND workflow.name IN (
        'pull',
        'trunk',
        'nightly',
        'periodic',
        'inductor',
        'inductor-periodic',
        'inductor-A100-perf-compare',
        'inductor-A100-perf-nightly',
        'inductor-cu124',
        'rocm',
        'inductor-rocm'
    )
    AND workflow.repository.full_name like :repo
GROUP BY
    granularity_bucket,
    workflow.name
ORDER BY
    count DESC
