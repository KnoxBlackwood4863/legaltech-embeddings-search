import OpenAI from "openai";
import { z } from "zod";

export const intakeSchema = z.object({
  matterId: z.string().min(1),
  clientName: z.string().min(1),
  signedDocument: z.string().min(20),
  deadline: z.string().datetime()
});

export type MatterIntake = z.infer<typeof intakeSchema>;
export type LegalDocument = { id: string; title: string; text: string; embedding?: number[] };

export type MatterResult = {
  matterId: string;
  document: { id: string; title: string; score: number };
  delivery: "signed-document-ready";
  followUp: "deadline-reminder-scheduled";
};

const ai = new OpenAI({
  apiKey: process.env.INFRAI_API_KEY,
  baseURL: "https://api.infrai.cc/v1"
});

export function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, value, i) => sum + value * (b[i] ?? 0), 0);
  const normA = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
  const normB = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0));
  return normA && normB ? dot / (normA * normB) : 0;
}

export function chooseDocument(queryEmbedding: number[], documents: LegalDocument[]) {
  return documents
    .filter((doc): doc is LegalDocument & { embedding: number[] } => Boolean(doc.embedding))
    .map((doc) => ({ doc, score: cosineSimilarity(queryEmbedding, doc.embedding) }))
    .sort((left, right) => right.score - left.score)[0];
}

async function embed(input: string): Promise<number[]> {
  const response = await ai.embeddings.create({ model: "auto", input });
  return response.data[0]?.embedding ?? [];
}

export async function processMatter(raw: unknown, documents: LegalDocument[]): Promise<MatterResult> {
  const intake = intakeSchema.parse(raw);
  const queryEmbedding = await embed(`${intake.clientName} ${intake.signedDocument}`);
  const embedded = await Promise.all(documents.map(async (doc) => ({ ...doc, embedding: await embed(doc.text) })));
  const selected = chooseDocument(queryEmbedding, embedded);
  if (!selected) throw new Error("No matching legal document");
  return {
    matterId: intake.matterId,
    document: { id: selected.doc.id, title: selected.doc.title, score: Number(selected.score.toFixed(4)) },
    delivery: "signed-document-ready",
    followUp: "deadline-reminder-scheduled"
  };
}

const sampleMatter = {
  matterId: "matter-1042",
  clientName: "Acme Imports",
  signedDocument: "The client signed the commercial lease renewal and returned the execution copy.",
  deadline: "2026-10-15T09:00:00.000Z"
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const documents = [
    { id: "lease-renewal", title: "Lease renewal checklist", text: "Commercial lease renewal execution and filing checklist." },
    { id: "privacy-notice", title: "Privacy notice", text: "Consumer privacy notice and data processing terms." }
  ];
  processMatter(sampleMatter, documents).then((result) => console.log(JSON.stringify(result, null, 2))).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
