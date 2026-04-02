import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import Ajv from "ajv";

const root = process.cwd();
const schemaPath = path.join(root, ".cursor", "v1.json");
const tokensDir = path.join(root, "src", "tokens");

const require = createRequire(import.meta.url);
const draft07Path = require.resolve("ajv/dist/refs/json-schema-draft-07.json");
const draft07SchemaRaw = JSON.parse(await readFile(draft07Path, "utf8"));
const draft07Schema = {
  ...draft07SchemaRaw,
  $id: "https://json-schema.org/draft-07/schema",
};
const schema = JSON.parse(await readFile(schemaPath, "utf8"));
const patchedSchema = structuredClone(schema);

const defs = patchedSchema.$defs ?? {};
// Allow ambiguous string literals (ex: references vs font families) during validation.
if (defs.literalValue?.oneOf) {
  defs.literalValue.anyOf = defs.literalValue.oneOf;
  delete defs.literalValue.oneOf;
}
if (defs.variableValue?.oneOf) {
  defs.variableValue.anyOf = defs.variableValue.oneOf;
  delete defs.variableValue.oneOf;
}
if (defs.modeObject?.additionalProperties?.oneOf) {
  defs.modeObject.additionalProperties.anyOf =
    defs.modeObject.additionalProperties.oneOf;
  delete defs.modeObject.additionalProperties.oneOf;
}

const ajv = new Ajv({ allErrors: true, strict: false });
if (!ajv.getSchema(draft07Schema.$id)) {
  ajv.addMetaSchema(draft07Schema);
}
const validate = ajv.compile(patchedSchema);

const formatError = (error) => {
  const pathLabel = error.instancePath || "/";
  return `${pathLabel} ${error.message ?? ""}`.trim();
};

const files = (await readdir(tokensDir))
  .filter((file) => file.endsWith(".json"))
  .sort();

let hasErrors = false;

for (const file of files) {
  const filePath = path.join(tokensDir, file);
  const contents = JSON.parse(await readFile(filePath, "utf8"));
  const ok = validate(contents);
  if (!ok) {
    hasErrors = true;
    console.error(`\n${file}`);
    for (const error of validate.errors ?? []) {
      console.error(`- ${formatError(error)}`);
    }
  }
}

if (hasErrors) {
  console.error("\nToken validation failed.");
  process.exit(1);
}

console.log("Token validation passed.");
