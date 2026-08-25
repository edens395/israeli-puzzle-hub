import fs from 'node:fs';
import path from 'node:path';
import sampleEditions from '../assets/data/samplePuzzles.json';
import { generateNonogramFromMatrix } from './generators/nonogramGenerator';

export function bundleDailyPuzzles() {
  console.log('📦 Starting Daily Puzzle Batch Bundler...');

  const today = new Date();
  const bundledPackages = [];

  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateISO = d.toISOString().split('T')[0];

    // Cycle through sample editions seed data
    const seed = sampleEditions[i % sampleEditions.length];

    const packageItem = {
      dateISO,
      editionNumber: 42 + i,
      hebrewDate: `יום ${i + 1} למוסף היומי`,
      nonogram: seed.nonogram,
      sudoku: seed.sudoku,
      tashbetz: seed.tashbetz,
    };

    bundledPackages.push(packageItem);
  }

  const outputDirPath = path.resolve(__dirname, '../assets/data');
  if (!fs.existsSync(outputDirPath)) {
    fs.mkdirSync(outputDirPath, { recursive: true });
  }

  const outputPath = path.join(outputDirPath, 'puzzles-bundle.json');
  fs.writeFileSync(outputPath, JSON.stringify(bundledPackages, null, 2), 'utf-8');

  console.log(`✅ Successfully bundled ${bundledPackages.length} daily editions into: ${outputPath}`);
  return bundledPackages;
}

// Execute when called directly
if (require.main === module) {
  bundleDailyPuzzles();
}
