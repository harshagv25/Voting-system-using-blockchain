import { createHash } from "crypto";
import { promisify } from "util";
import { scrypt, randomBytes } from "crypto";

const scryptAsync = promisify(scrypt);

export function sha256(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

export function generateVoterId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "VTR";
  for (let i = 0; i < 9; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const [hashedPassword, salt] = stored.split(".");
  if (!hashedPassword || !salt) return false;
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return buf.toString("hex") === hashedPassword;
}

export function computeBlockHash(data: {
  index: number;
  voterId: string;
  candidateId: number;
  timestamp: string;
  previousHash: string;
  nonce: number;
}): string {
  const content = JSON.stringify(data);
  return sha256(content);
}
