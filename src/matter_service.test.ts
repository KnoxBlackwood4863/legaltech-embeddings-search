import assert from "node:assert/strict";
import { chooseDocument, cosineSimilarity, intakeSchema } from "./matter_service.js";

const valid = intakeSchema.parse({ matterId: "m-1", clientName: "Northwind", signedDocument: "A signed employment agreement for review.", deadline: "2026-12-01T10:00:00.000Z" });
assert.equal(valid.matterId, "m-1");
assert.equal(cosineSimilarity([1, 0], [1, 0]), 1);
const picked = chooseDocument([1, 0], [
  { id: "employment", title: "Employment agreement", text: "", embedding: [0.99, 0.01] },
  { id: "tax", title: "Tax memo", text: "", embedding: [0, 1] }
]);
assert.equal(picked?.doc.id, "employment");
console.log("matter decision test passed");
