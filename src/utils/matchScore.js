// Scores how well a lost item matches a found item (0 to 100)
const clean = (text) => (text || '').trim().toLowerCase();

export function matchScore(lost, found) {
  const name = clean(lost.item_name) === clean(found.item_name) ? 1 : 0;
  const category = clean(lost.category) === clean(found.category) ? 1 : 0;

  const place = clean(lost.lost_location) === clean(found.found_location) ? 1 : 0;

  return name * 50 + category * 20 + place * 30;
}

export function matchLabel(score) {
  return score >= 70 ? 'Likely match' : 'Check manually';
}
