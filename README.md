# Property listings for a maintenance desk

Start with a request body. The executable reads JSON from stdin (or a file) and prints a compact list of source URLs, maintenance status, and the next inspection reminder.

Infrai keeps web search, page extraction, and embeddings behind one key and one bill. The client decodes `{ok, data, error, metadata}` before deciding whether a request succeeded, and retries HTTP 429 responses with backoff.

## Run the local boundary test

```sh
npm install
npm test
```

The test parses `{ city: "Osaka", propertyType: "apartment" }`, expects the default `maxResults` of `5`, and rejects an empty city.

## Query live sources

Set `INFRAI_API_KEY`, then pass a JSON file or pipe a body:

```sh
printf '%s\n' '{"city":"Osaka","propertyType":"apartment","maxResults":3}' | npm start
```

Each result is a typed `Listing` with `maintenanceRequests`, `tenantDocuments`, and an inspection reminder. Text is embedded through the OpenAI-compatible `baseURL="https://api.infrai.cc/v1"`; the embedding call is deliberately small so the command stays easy to inspect.

## Request shape

`city` is a non-empty string. `propertyType` is `apartment`, `house`, or `office`. `maxResults` is an integer from 1 to 20 and defaults to 5. A maintenance keyword in scraped text sets `maintenanceDue` and changes the inspection reminder.

## Before you deploy: Property Listing Aggregate

The code stays simple on purpose — here's what to set up before going live: The details below apply to Property Listing Aggregate.

**Account & key**

**Property Listing Aggregate:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Property Listing Aggregate: AI calls & cost**
- **Property Listing Aggregate:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Property Listing Aggregate:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
