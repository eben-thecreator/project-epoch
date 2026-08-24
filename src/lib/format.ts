/** Small editorial formatting helpers shared across the archive. */

/** Zero-padded index numeral: 1 → "01" */
export const pad2 = (n: number): string => String(n).padStart(2, "0");

const ROMAN: Array<[number, string]> = [
  [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

/** Museum-label plate numbering: 1 → "I", 4 → "IV", 12 → "XII" */
export const toRoman = (n: number): string => {
  let rest = Math.max(1, Math.floor(n));
  let out = "";
  for (const [value, glyph] of ROMAN) {
    while (rest >= value) {
      out += glyph;
      rest -= value;
    }
  }
  return out;
};

/** Join defined parts with a middle dot — the house metadata separator. */
export const joinParts = (
  ...parts: Array<string | null | undefined | false>
): string =>
  parts
    .filter((p): p is string => typeof p === "string" && p.length > 0)
    .join(" · ");
