export function generateUniqueId(prefix: string): string {
  const rand = Math.floor(Math.random() * 2 ** 48);
  return `${prefix}_${rand.toString(36)}`;
}

// Generate a random permutation using the Fisher-Yates/Knuth shuffle algorithm
export function randomPermutation(size: number): number[] {
  const arr = Array.from({ length: size }, (_, i) => i);
  for (let i = size - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
