import { readFile } from "node:fs/promises";
import { aggregateListings } from "./property_aggregate.js";

const raw = process.argv[2] ? await readFile(process.argv[2], "utf8") : await new Promise<string>(resolve => { let data = ""; process.stdin.setEncoding("utf8"); process.stdin.on("data", chunk => data += chunk); process.stdin.on("end", () => resolve(data)); });
const listings = await aggregateListings(JSON.parse(raw));
console.log(JSON.stringify({ listings }, null, 2));
