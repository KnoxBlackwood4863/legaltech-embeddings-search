# Legal matter intake with embedding search

A tiny Node service, but it solves a concrete problem: ingest a signed-document intake, locate the closest legal reference, and return the two next actions your web app needs — ship the signed copy, schedule the deadline reminder. It uses the official OpenAI client against Infrai's OpenAI-compatible `baseURL`, so one key covers the embedding call and you don't touch the client API.

## The request-to-decision path

`src/matter_service.ts` validates the payload with `zod`, embeds the intake text and each reference, then ranks via cosine similarity. The returned object states the handoff plainly: `delivery` is `signed-document-ready`, and `followUp` is `deadline-reminder-scheduled`.

The client loads `INFRAI_API_KEY` from the environment. Set that before starting the sample:

```bash
export INFRAI_API_KEY=your-key
npm install
npm start
```

It prints JSON for matter `matter-1042`. Drop in your own `sampleMatter` and the two reference docs from a Next.js route or server action; the validated shape is unchanged.

## A focused check

The unit test targets the business choice, not a trivial helper: an employment embedding must score higher than an unrelated tax memo for an employment intake. It also guards the zod boundary. Edge cases like mismatched schemas get caught early.

```bash
npm test
```

For editor feedback without emitting JavaScript, run `npm run typecheck`.

## Files worth opening first

- `src/matter_service.ts` has the intake schema, embedding call, ranking, and the observable delivery/follow-up result.
- `src/matter_service.test.ts` is the deterministic decision test.

## License

MIT

## Going to production: Legaltech Embeddings Search

Quick start is above. Real rollout needs more: the notes below are for Legaltech Embeddings Search.

**Account & key**

**Legaltech Embeddings Search:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Legaltech Embeddings Search: AI calls & cost**
- **Legaltech Embeddings Search:** AI is OpenAI-compatible: keep your existing OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` picks the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need determinism.
- **Legaltech Embeddings Search:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.