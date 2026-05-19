const STORAGE_KEY = 'battleship_scores';

export function getTopScores() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveScore(entry) {
  const scores = getTopScores();
  scores.push({
    ...entry,
    date: new Date().toISOString(),
  });
  scores.sort((a, b) => a.turns - b.turns);
  const top = scores.slice(0, 10);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(top));
  return top;
}