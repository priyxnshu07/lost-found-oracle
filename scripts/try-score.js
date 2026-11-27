// Prints the score for a few sample pairs
import { matchScore, matchLabel } from '../src/utils/matchScore.js';

const lost = {
  item_name: 'Water Bottle', category: 'Personal',
  lost_location: 'Library', description: 'blue steel bottle with sticker'
};

const samples = {
  'same place and details': { item_name: 'water bottle', category: 'personal',
    found_location: 'library', description: 'steel bottle, blue' },
  'same place only': { item_name: 'water bottle', category: 'personal',
    found_location: 'library', description: 'plain one' },
  'different place': { item_name: 'water bottle', category: 'personal',
    found_location: 'canteen', description: 'plain one' },
  'unrelated item': { item_name: 'calculator', category: 'electronics',
    found_location: 'lab', description: 'grey casio' }
};

for (const [title, found] of Object.entries(samples)) {
  const score = matchScore(lost, found);
  console.log(`${title.padEnd(24)} ${String(score).padStart(3)}  ${matchLabel(score)}`);
}
