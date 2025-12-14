const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
const BASE = 36n;

export function encodeBase36(n: bigint): string {
  if (n < 0n) throw new Error("negative not supported");
  if (n === 0n) return "0";
  let x = n;
  let out = "";
  while (x > 0n) {
    const r = x % BASE;
    out = ALPHABET[Number(r)] + out;
    x = x / BASE;
  }
  return out;
}

export function decodeBase36(s: string): bigint {
  if (!/^[0-9a-z]+$/.test(s)) throw new Error("invalid base36");
  let out = 0n;
  for (const ch of s) {
    const v = BigInt(ALPHABET.indexOf(ch));
    if (v < 0n) throw new Error("invalid base36 char");
    out = out * BASE + v;
  }
  return out;
}
