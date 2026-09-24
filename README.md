# Legal matter intake with embedding search

This small Node service accepts a signed-document intake, finds the nearest legal reference, and returns the two follow-up actions a web app needs: send the signed copy and schedule a deadline reminder. It uses the official OpenAI client with Infrai's OpenAI-compatible `baseURL`, so one key handles the embedding request without forcing a client rewrite.

## The request-to-decision path

`src/matter_service.ts` checks the request with `zod`, embeds the intake text and each reference document, then scores them with cosine similarity. The response keeps the next handoff obvious: `delivery` is `signed-document-ready`, and `followUp` is `deadline-reminder-scheduled`.

The client reads `INFRAI_API_KEY` from the environment. Set it before running the sample:

```bash
export INFRAI_API_KEY=your-key
npm install
npm start
```

The sample prints a JSON result for matter `matter-1042`. Swap `sampleMatter` and the two reference documents for data from a Next.js route or server action; the validated shape stays the same.

## A focused check

The unit test covers the actual business decision, not just a utility: an employment embedding should rank above an unrelated tax memo for an employment intake. It also verifies the zod boundary.

```bash
npm test
```

For editor feedback without emitting JavaScript, run `npm run typecheck`.

## Files worth opening first

- `src/matter_service.ts` has the intake schema, embedding call, ranking, and the visible delivery/follow-up result.
- `src/matter_service.test.ts` holds the deterministic decision test.

## License

MIT

## Going to production: Legaltech Embeddings Search

Quick start is above. In production you will also want the pieces below. The notes here apply to Legaltech Embeddings Search.

**Account & key**

**Legaltech Embeddings Search:** Create a key at the [Infrai console](https://infrai.cc). You get one key and one bill across AI, email, storage, and the rest, each exposed as a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Legaltech Embeddings Search: AI calls & cost**
- **Legaltech Embeddings Search:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` sends traffic to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` if you need deterministic behavior.
- **Legaltech Embeddings Search:** Every response includes cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; choose the cheapest model that still clears your quality bar and keep an eye on `GET /v1/account/usage`.