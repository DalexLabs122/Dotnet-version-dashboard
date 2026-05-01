const fs = require('fs');
const path = require('path');

const DATA_DIR = 'data';
const RAW_RESULTS_FILE = path.join(DATA_DIR, 'raw-results.json');
const RESULTS_FILE = path.join(DATA_DIR, 'results.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');

function processResults() {
  console.log('Processing .NET version scan results...');

  // Read raw results
  let rawResults = [];
  if (fs.existsSync(RAW_RESULTS_FILE)) {
    rawResults = JSON.parse(fs.readFileSync(RAW_RESULTS_FILE, 'utf8'));
  }

  // Read existing results to merge
  let existingResults = [];
  if (fs.existsSync(RESULTS_FILE)) {
    existingResults = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
  }

  // Combine and deduplicate
  const allResults = [...existingResults];
  const keys = new Set();
  const keyMap = new Map();

  // Build key map from existing results
  allResults.forEach(r => {
    const key = `${r.repository}|${r.file_path}`;
    keys.add(key);
    keyMap.set(key, r);
  });

  // Add new results
  rawResults.forEach(r => {
    const key = `${r.repository}|${r.file_path}`;
    if (!keys.has(key)) {
      allResults.push(r);
      keys.add(key);
    } else {
      // Update existing entry with latest scan
      const idx = allResults.findIndex(x => `${x.repository}|${x.file_path}` === key);
      if (idx >= 0) {
        allResults[idx] = {
          ...allResults[idx],
          scanned_at: new Date().toISOString()
        };
      }
    }
  });

  // Sort by scanned_at descending
  allResults.sort((a, b) => {
    return new Date(b.scanned_at) - new Date(a.scanned_at);
  });

  // Calculate statistics
  const stats = calculateStats(allResults);

  // Save processed results
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(allResults, null, 2));
  console.log(`Processed results saved: ${allResults.length} entries`);

  // Save statistics
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
  console.log('Statistics calculated and saved');

  // Clean up raw results
  if (fs.existsSync(RAW_RESULTS_FILE)) {
    fs.unlinkSync(RAW_RESULTS_FILE);
    console.log('Cleaned up temporary files');
  }
}

function calculateStats(results) {
  const stats = {
    total_entries: results.length,
    unique_repos: new Set(results.map(r => r.repository)).size,
    unique_owners: new Set(results.map(r => r.owner)).size,
    versions: {},
    top_repos: [],
    top_owners: [],
    last_scan: new Date().toISOString(),
    scan_history: []
  };

  // Count versions
  results.forEach(r => {
    if (r.version) {
      stats.versions[r.version] = (stats.versions[r.version] || 0) + 1;
    }
  });

  // Top repositories
  const repoCount = {};
  results.forEach(r => {
    repoCount[r.repository] = (repoCount[r.repository] || 0) + 1;
  });
  stats.top_repos = Object.entries(repoCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([repo, count]) => ({ repository: repo, count }));

  // Top owners
  const ownerCount = {};
  results.forEach(r => {
    ownerCount[r.owner] = (ownerCount[r.owner] || 0) + 1;
  });
  stats.top_owners = Object.entries(ownerCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([owner, count]) => ({ owner, count }));

  return stats;
}

processResults();
