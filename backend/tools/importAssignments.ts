import 'dotenv/config';
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Assignment from '../src/models/Assignment';

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

type CliOptions = {
  filePath: string;
  dryRun: boolean;
};

const DEFAULT_DB = 'mongodb://localhost:27017/vedaai';

const parseArgs = (): CliOptions => {
  const args = process.argv.slice(2);
  const filePath = args.find((arg) => !arg.startsWith('--'));
  const dryRun = args.includes('--dry-run');

  if (!filePath) {
    console.error('Usage: ts-node tools/importAssignments.ts <path-to-json> [--dry-run]');
    process.exit(1);
  }

  return { filePath, dryRun };
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return Object.prototype.toString.call(value) === '[object Object]';
};

const normalizeExtendedJson = (value: JsonValue): JsonValue => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeExtendedJson(item));
  }

  if (isPlainObject(value)) {
    const keys = Object.keys(value);

    if (keys.length === 1 && keys[0] === '$oid' && typeof value['$oid'] === 'string') {
      return new mongoose.Types.ObjectId(value['$oid']) as unknown as JsonValue;
    }

    if (keys.length === 1 && keys[0] === '$date') {
      const dateValue = value['$date'];
      return new Date(typeof dateValue === 'string' || typeof dateValue === 'number' ? dateValue : String(dateValue)) as unknown as JsonValue;
    }

    const output: Record<string, JsonValue> = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      output[key] = normalizeExtendedJson(nestedValue as JsonValue);
    }
    return output;
  }

  return value;
};

const resolveInputPath = (inputPath: string): string => {
  return path.isAbsolute(inputPath) ? inputPath : path.resolve(process.cwd(), inputPath);
};

const loadAssignments = (inputPath: string): JsonValue[] => {
  const raw = fs.readFileSync(inputPath, 'utf-8');
  const parsed = JSON.parse(raw) as JsonValue;

  if (!Array.isArray(parsed)) {
    throw new Error('Expected a JSON array of assignments.');
  }

  return parsed;
};

const buildOperations = (assignments: JsonValue[]) => {
  const operations = [] as mongoose.AnyBulkWriteOperation[];

  for (const rawAssignment of assignments) {
    if (!isPlainObject(rawAssignment)) {
      continue;
    }

    const normalized = normalizeExtendedJson(rawAssignment) as Record<string, unknown>;
    const rawId = normalized._id;

    if (!rawId) {
      console.warn('[Import] Skipping entry without _id.');
      continue;
    }

    let objectId: mongoose.Types.ObjectId | undefined;
    if (rawId instanceof mongoose.Types.ObjectId) {
      objectId = rawId;
    } else if (typeof rawId === 'string' && mongoose.isValidObjectId(rawId)) {
      objectId = new mongoose.Types.ObjectId(rawId);
    }

    const { _id: _removed, ...data } = normalized;

    operations.push({
      updateOne: {
        filter: { _id: objectId ?? rawId },
        update: { $set: data },
        upsert: true,
      },
    });
  }

  return operations;
};

const main = async () => {
  const { filePath, dryRun } = parseArgs();
  const resolvedPath = resolveInputPath(filePath);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`[Import] File not found: ${resolvedPath}`);
    process.exit(1);
  }

  const assignments = loadAssignments(resolvedPath);
  const operations = buildOperations(assignments);

  if (!operations.length) {
    console.error('[Import] No valid assignments to import.');
    process.exit(1);
  }

  if (dryRun) {
    console.log(`[Import] Dry run: ${operations.length} assignments ready for upsert.`);
    return;
  }

  const mongoUri = process.env.MONGODB_URI || DEFAULT_DB;
  await mongoose.connect(mongoUri);

  try {
    const result = await Assignment.bulkWrite(operations, { ordered: true });
    console.log(`[Import] Upserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}`);
  } finally {
    await mongoose.disconnect();
  }
};

main().catch((err) => {
  console.error('[Import] Failed:', err);
  process.exit(1);
});
