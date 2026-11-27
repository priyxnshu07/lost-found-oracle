// Scores how well a lost item matches a found item (0 to 100)
const clean = (text) => (text || '').trim().toLowerCase();

export function matchScore(lost, found) {
  const name = clean(lost.item_name) === clean(found.item_name) ? 1 : 0;
  const category = clean(lost.category) === clean(found.category) ? 1 : 0;

  const words = clean(lost.description).split(/\W+/).filter((w) => w.length > 3);
  const hit = words.some((w) => clean(found.description).includes(w)) ? 1 : 0;

  return name * 50 + category * 30 + hit * 20;
}

export function matchLabel(score) {
  return score >= 70 ? 'Likely match' : 'Check manually';
}
