const ADJECTIVES = [
  "Curious",
  "Kind",
  "Brave",
  "Quiet",
  "Smart",
  "Gentle",
  "Friendly",
];

const NOUNS = [
  "Traveler",
  "Panda",
  "Tiger",
  "Fox",
  "Koala",
  "Seoulite",
  "Nomad",
];

export function generateRandomDisplayName() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(100 + Math.random() * 900);

  return `${adj}${noun}${num}`;
}
