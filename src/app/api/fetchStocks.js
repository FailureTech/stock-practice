import axios from "axios";
import { parse } from "csv-parse/sync";

let cache = null;
let lastFetched = 0;
const DAY = 24 * 60 * 60 * 1000;

export async function GET() {
  if (cache && Date.now() - lastFetched < DAY) return Response.json(cache);

  const sources = [
    "https://nsearchives.nseindia.com/content/equities/EQUITY_L.csv",
    "https://archives.nseindia.com/content/equities/EQUITY_L.csv",
  ];

  let csv;
  for (const url of sources) {
    try {
      const res = await axios.get(url, {
        responseType: "text",
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Referer": "https://www.nseindia.com/",
          "Accept": "text/csv,application/octet-stream",
        },
      });
      csv = res.data;
      break;
    } catch (err) {
      console.error("Error fetching stocks:", err.message);
    }
  }
  if (!csv) return Response.json({ error: "Unable to fetch NSE list" }, { status: 502 });

  const rows = parse(csv, { columns: true, skip_empty_lines: true });

  // Normalize column names by trimming keys to handle leading spaces
  const normalizedRows = rows.map(row => {
    const normalized = {};
    for (const key in row) {
      normalized[key.trim()] = row[key];
    }
    return normalized;
  });

  // Try to get the first row to see what columns we have
  if (normalizedRows.length > 0) {
    console.log("Normalized first row keys:", Object.keys(normalizedRows[0]));
  }

  const list = normalizedRows
    .filter(r => r["SERIES"]?.trim() === "EQ")
    .map(r => ({
      symbol: r["SYMBOL"]?.trim(),
      name: r["NAME OF COMPANY"]?.trim(),
      isin: r["ISIN NUMBER"]?.trim(),
    }))
    .filter(item => item.symbol && item.name) // Filter out any invalid entries
    .sort((a, b) => (a.symbol || "").localeCompare(b.symbol || ""));

  cache = list;
  lastFetched = Date.now();
  return Response.json(list);
}
