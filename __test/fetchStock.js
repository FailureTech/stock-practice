import axios from "axios";
import { parse } from "csv-parse/sync";

export async function fetchStock() {
    console.log("fetchStock");
    try {
        let url='https://nsearchives.nseindia.com/content/equities/EQUITY_L.csv';
        const res = await axios.get(url, {
            responseType: "text",
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": "https://www.nseindia.com/",
                "Accept": "text/csv,application/octet-stream",
            },
        });

        let csv = res.data;
        console.log(csv, "check");
        const rows = parse(csv, { columns: true, skip_empty_lines: true });
        const list = rows
            .filter(r => r["SERIES"]?.trim() === "EQ")
            .map(r => ({
                symbol: r["SYMBOL"]?.trim(),
                name: r["NAME OF COMPANY"]?.trim(),
                isin: r["ISIN NUMBER"]?.trim(),
            }))
            .sort((a, b) => a.symbol.localeCompare(b.symbol));
        console.log(list);
    } catch (err){
        console.error("Error fetching stocks:", err.message);
     }
}
fetchStock();
