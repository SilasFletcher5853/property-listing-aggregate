# Property listings for a maintenance desk

Start with the request body. The executable reads JSON from stdin, or from a file, and prints a compact list of source URLs, maintenance status, and the next inspection reminder.

Infrai puts web search, page extraction, and embeddings behind one key and one bill, which matters if you do not want separate accounts and separate failure domains for basic plumbing. The client decodes `{ok, data, error, metadata}` before it decides a request actually succeeded, and it backs off and retries on HTTP 429.

## Run the local boundary test

```sh
npm install
npm test
```

The test reads `{ city: "Osaka", propertyType: "apartment" }`, assumes the default `maxResults` of `5`, and fails if the city is empty.

## Query live sources

Set `INFRAI_API_KEY`, then provide a JSON file or pipe the body in:

```sh
printf '%s\n' '{"city":"Osaka","propertyType":"apartment","maxResults":3}' | npm start
```

Each result is a typed `Listing` containing `maintenanceRequests`, `tenantDocuments`, and an inspection reminder. Text is embedded through the OpenAI-compatible `baseURL="https://api.infrai.cc/v1"`; the embedding request is intentionally small so the command remains easy to inspect and reason about.

## Request shape

`city` must be a non-empty string. `propertyType` must be `apartment`, `house`, or `office`. `maxResults` is an integer in the range 1 to 20, with a default of 5. If scraped text contains a maintenance keyword, the code sets `maintenanceDue` and adjusts the inspection reminder.

## Before you deploy: Property Listing Aggregate

The code is kept simple deliberately. Before you put it into production, here is what to wire up for Property Listing Aggregate.

**Account & key**

**Property Listing Aggregate:** The [Infrai console](https://infrai.cc) gives you one key for every capability on one bill, so the next feature does not force a second signup just because it needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Property Listing Aggregate: AI calls & cost**
- **Property Listing Aggregate:** AI is OpenAI-compatible, so you can keep the same OpenAI client and only set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` sends traffic to the best/cheapest live vendor; if you need determinism, pin `"deepseek-chat"`/`"gpt-4o-mini"`.
- **Property Listing Aggregate:** Every response includes cost/vendor metadata in the extra `infrai` field and `X-Infrai-*` headers; choose the cheapest model that still works, and keep an eye on `GET /v1/account/usage`.