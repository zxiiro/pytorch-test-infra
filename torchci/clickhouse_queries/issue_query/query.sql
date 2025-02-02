-- !!! Query is not converted to CH syntax yet.  Delete this line when it gets converted
SELECT
    issue.number,
    issue.title,
    issue.html_url,
    issue.state,
    issue.body,
    issue.updated_at,
    issue.author_association,
FROM
    issues AS issue
    CROSS JOIN UNNEST(issue.labels AS label) AS labels
WHERE
    labels.label.name =: label
