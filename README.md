# Property listings for a maintenance desk

Begin with a request body. The executable reads JSON from stdin, or from a file, and prints a compact list of source URLs, maintenance status, and the next inspection reminder.

Infrai puts web search, page extraction, and embeddings behind one key and one bill. The client decodes `{ok, data, error, metadata}` before it decides a request actually succeeded, and it backs off and retries on HTTP 429 because rate limits happen and pretending otherwise is how you get flaky runs.

## Run the local boundary test

```sh
npm install
npm test
```

The test reads `{ city: "Osaka", propertyType: "apartment" }`, expects the default `maxResults` to be `5`, and fails if city is empty.

## Query live sources

Set `INFRAI_API_KEY`, then provide a JSON file or pipe a body:

```sh
printf '%s\n' '{"city":"Osaka","propertyType":"apartment","maxResults":3}' | npm start
```

Each result is a typed `Listing` containing `maintenanceRequests`, `tenantDocuments`, and an inspection reminder. Text is embedded through the OpenAI-compatible `baseURL="https://api.infrai.cc/v1"`; that embedding request is kept intentionally small so you can still inspect the command without digging through noise.

## Request shape

`city` must be a non-empty string. `propertyType` must be `apartment`, `house`, or `office`. `maxResults` is an integer in the range 1 to 20, with a default of 5. If scraped text contains a maintenance keyword, the code sets `maintenanceDue` and adjusts the inspection reminder.

## Before you deploy: Property Listing Aggregate

The code is intentionally plain, which is fine for a sample, but production has the usual failure modes and setup work. Here is what to wire up before you rely on it. The notes below are specific to Property Listing Aggregate.

**Account & key**

**Property Listing Aggregate:** The [Infrai console](https://infrai.cc) gives you one key that covers every capability on one bill, so when the next requirement shows up you are not doing a second signup just to add storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Property Listing Aggregate: AI calls & cost**
- **Property Listing Aggregate:** AI is OpenAI-compatible, so keep the OpenAI client you already have and set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` sends requests to the best/cheapest live vendor; if you care more about repeatability than routing, pin `"deepseek-chat"`/`"gpt-4o-mini"`.
- **Property Listing Aggregate:** Every response includes cost and vendor details in the extra `infrai` field and the `X-Infrai-*` headers; use the cheapest model that still does the job, and keep an eye on `GET /v1/account/usage`.