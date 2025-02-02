import { createClient } from "@clickhouse/client";
import { readFileSync } from "fs";

export function getClickhouseClient() {
  return createClient({
    host: process.env.CLICKHOUSE_HUD_USER_URL ?? "http://localhost:8123",
    username: process.env.CLICKHOUSE_HUD_USER_USERNAME ?? "default",
    password: process.env.CLICKHOUSE_HUD_USER_PASSWORD ?? "",
  });
}

export async function queryClickhouse(
  query: string,
  params: Record<string, unknown>
): Promise<any[]> {
  /**
   * queryClickhouse
   * @param query: string, the sql query
   * @param params: Record<string, unknown>, the parameters to the query ex { sha: "abcd" }
   */
  const clickhouseClient = getClickhouseClient();
  const res = await clickhouseClient.query({
    query,
    format: "JSONEachRow",
    query_params: params,
    clickhouse_settings: { output_format_json_quote_64bit_integers: 0 },
  });

  return (await res.json()) as any[];
}

export async function queryClickhouseSaved(
  queryName: string,
  inputParams: Record<string, unknown>
) {
  /**
   * queryClickhouseSaved
   * @param queryName: string, the name of the query, which is the name of the folder in clickhouse_queries
   * @param inputParams: Record<string, unknown>, the parameters to the query, an object where keys are the parameter names
   *
   * This function will filter the inputParams to only include the parameters that are in the query params json file
   */
  const query = readFileSync(
    // https://stackoverflow.com/questions/74924100/vercel-error-enoent-no-such-file-or-directory
    `${process.cwd()}/clickhouse_queries/${queryName}/query.sql`,
    "utf8"
  );
  const paramsText = require(`clickhouse_queries/${queryName}/params.json`);

  const queryParams = new Map(
    Object.entries(paramsText).map(([key, _]) => [key, inputParams[key]])
  );
  return await queryClickhouse(query, Object.fromEntries(queryParams));
}

export function enableClickhouse() {
  // Use this to quickly toggle between clickhouse and rockset
  return process.env.USE_CLICKHOUSE == "true";
}
