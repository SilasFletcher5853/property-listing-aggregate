import assert from "node:assert/strict";
import { requestSchema } from "./property_aggregate.js";

const parsed = requestSchema.parse({ city: "Osaka", propertyType: "apartment" });
assert.equal(parsed.maxResults, 5);
assert.throws(() => requestSchema.parse({ city: "", propertyType: "apartment" }));
console.log("request boundary: valid defaults and empty-city rejection passed");
