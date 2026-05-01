const https = require('https');
const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const DATA_DIR = 'data';
const RESULTS_FILE = path.join(DATA_DIR, 'raw-results.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DOTNET_PATTERNS = [
  '.net6.0',
  '.net7.0',
  '.net8.0',
  '.net9.0',
  '.netframework4',
  '.netcore3.1',
  '.netstandard2',
  'TargetFramework'
];

const PROJECT_FILES = [
  '.csproj',
  '.vbproj',
  '.fsproj'
];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'dotnet-version-scanner'
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 100)}`));
          } else {
            resolve(JSON.parse(data));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function searchRepositories() {
  console.log('Starting .NET version scan...');
  const results = [];
  const searchQueries = [
    'language:csharp',
    'language:fsharp',
    'language:"visual basic .net"',
    'filename:.csproj',
    'filename:.vbproj',
    'filename:.fsproj'
  ];

  for (const query of searchQueries) {
    try {
      console.log(`Searching: ${query}`);
      const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=100`;
      
      const searchData = await makeRequest(searchUrl);
      
      if (searchData.items) {
        for (const repo of searchData.items.slice(0, 20)) {
          console.log(`  Found: ${repo.full_name}`);
          
          // Search for .csproj files in this repo
          for (const fileType of PROJECT_FILES) {
            try {
              const codeSearchUrl = `https://api.github.com/search/code?q=repo:${repo.full_name}+filename:${fileType}&per_page=10`;
              const codeData = await makeRequest(codeSearchUrl);
              
              if (codeData.items) {
                for (const file of codeData.items) {
                  for (const pattern of DOTNET_PATTERNS) {
                    if (file.name.includes('.') && file.name.endsWith(fileType)) {
                      results.push({
                        repository: repo.full_name,
                        owner: repo.owner.login,
                        owner_type: repo.owner.type,
                        file_path: file.path,
                        file_name: file.name,
                        version: pattern,
                        url: repo.html_url,
                        file_url: `${repo.html_url}/blob/${repo.default_branch}/${file.path}`,
                        stars: repo.stargazers_count,
                        language: repo.language,
                        last_updated: repo.updated_at,
                        scanned_at: new Date().toISOString()
                      });
                    }
                  }
                }
              }
            } catch (e) {
              console.log(`    Skipping code search: ${e.message}`);
            }
          }
          
          // Rate limit handling
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Delay between queries
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Error searching with query "${query}":`, error.message);
    }
  }

  console.log(`\nScan complete. Found ${results.length} entries.`);
  
  // Save raw results
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
  console.log(`Results saved to ${RESULTS_FILE}`);

  return results;
}

searchRepositories().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
