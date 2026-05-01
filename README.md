# .NET Version Dashboard

An interactive GitHub native dashboard for tracking .NET versions across all GitHub repositories.

## 📊 Features

- **Automated Scanning**: Runs automatically every weekday at 6:00 AM EST (11:00 UTC)
- **Manual Triggers**: Can be triggered on-demand via GitHub Actions UI
- **Interactive Dashboard**: Real-time filtering and visualization
- **Advanced Filtering**: Filter by .NET version, repository, owner, and scan timestamp
- **Analytics**: Charts showing version distribution and top repositories
- **Detailed Results**: Clickable links to repositories and files
- **GitHub Pages Compatible**: Hosted directly from your repository

## 🚀 Quick Start

### 1. Enable GitHub Pages

1. Go to repository **Settings** → **Pages**
2. Set **Source** to `main` branch
3. Dashboard will be available at: `https://<username>.github.io/dotnet-version-dashboard/`

### 2. Run Initial Scan

1. Go to **Actions** tab
2. Select "Scan .NET Versions" workflow
3. Click "Run workflow" → "Run"
4. Wait for workflow to complete (takes a few minutes)

### 3. View Dashboard

Navigate to your GitHub Pages URL to view the dashboard.

## 📝 How It Works

### Workflow: `.github/workflows/scan-dotnet-versions.yml`

- **Scheduled**: `0 11 * * 1-5` (6:00 AM EST, Monday-Friday)
- **Manual Trigger**: Via `workflow_dispatch`
- **Permissions**: Requires `contents: write` and `search: read`

### Scripts

#### `search-dotnet.js`
Searches GitHub for:
- C#, F#, and VB.NET repositories
- Project files: `.csproj`, `.vbproj`, `.fsproj`
- .NET versions: 6.0, 7.0, 8.0, 9.0, Framework, Core, Standard

#### `process-results.js`
- Deduplicates results
- Merges with historical data
- Generates statistics
- Outputs to `data/results.json` and `data/stats.json`

### Dashboard: `index.html`
- Loads data from JSON files
- Real-time filtering and search
- Interactive charts (Chart.js)
- Responsive design for mobile/desktop

## 🎯 Dashboard Features

### Summary Cards
- Total entries found
- Unique repositories
- Unique owners
- Number of .NET versions detected

### Filters
- **.NET Version**: Select specific version
- **Repository**: Text search for repo name
- **Owner**: Text search for owner
- **Last Scanned**: Date range filter

### Charts
- **Version Distribution**: Bar chart of all .NET versions
- **Top Repositories**: Doughnut chart of most-referenced repos

### Results Table
- Repository link
- Owner badge
- Version badge
- File name
- Last scan timestamp
- Direct link to file on GitHub

## 📁 Project Structure

```
dotnet-version-dashboard/
├── .github/
│   ├── workflows/
│   │   └── scan-dotnet-versions.yml       # Automated workflow
│   └── scripts/
│       ├── search-dotnet.js                # Search logic
│       └── process-results.js              # Data processing
├── data/
│   ├── results.json                        # Scan results (auto-generated)
│   └── stats.json                          # Statistics (auto-generated)
├── index.html                              # Dashboard UI
└── README.md                               # This file
```

## ⚙️ Configuration

### Schedule
Edit the cron expression in `.github/workflows/scan-dotnet-versions.yml`:
```yaml
cron: '0 11 * * 1-5'  # Adjust as needed
```

### Search Queries
Modify `DOTNET_PATTERNS` in `.github/scripts/search-dotnet.js` to detect additional versions:
```javascript
const DOTNET_PATTERNS = [
  '.net6.0',
  '.net7.0',
  '.net8.0',
  '.net9.0',
  // Add more patterns...
];
```

### Dashboard Styling
Customize colors and layout in `index.html` CSS section.

## 🔐 Permissions Required

- `contents: write` - To commit results to repository
- `search: read` - To search GitHub API

The workflow uses `${{ secrets.GITHUB_TOKEN }}` automatically provided by GitHub Actions.

## 📊 Data Format

### results.json
```json
[
  {
    "repository": "owner/repo",
    "owner": "owner",
    "owner_type": "User",
    "file_path": "path/to/Project.csproj",
    "file_name": "Project.csproj",
    "version": ".net8.0",
    "url": "https://github.com/owner/repo",
    "file_url": "https://github.com/owner/repo/blob/main/path/to/Project.csproj",
    "stars": 100,
    "language": "C#",
    "last_updated": "2026-05-01T12:00:00Z",
    "scanned_at": "2026-05-01T11:00:00Z"
  }
]
```

### stats.json
```json
{
  "total_entries": 1000,
  "unique_repos": 500,
  "unique_owners": 250,
  "versions": {
    ".net6.0": 150,
    ".net7.0": 200,
    ".net8.0": 400,
    ".net9.0": 250
  },
  "top_repos": [...],
  "top_owners": [...],
  "last_scan": "2026-05-01T11:00:00Z"
}
```

## 🐛 Troubleshooting

### Dashboard shows "Loading scan information..."
- Run the workflow manually to generate initial data
- Wait for workflow to complete
- Refresh the browser

### No data appearing
1. Check workflow logs in **Actions** tab
2. Verify `data/results.json` has content
3. Check browser console for errors (F12)
4. Verify GitHub Pages is enabled

### GitHub API rate limits
- The workflow includes rate limit handling
- Default search returns top 20 results per query
- Adjust search queries if needed to reduce API calls

## 📈 Performance

- Initial scan: ~2-5 minutes
- Subsequent scans: ~1-2 minutes (incremental updates)
- Dashboard load: <1 second
- Pagination: 50 results per page

## 👥 Contributing

To improve this dashboard:
1. Modify script logic in `.github/scripts/`
2. Update dashboard UI in `index.html`
3. Test changes locally or in a branch
4. Create pull request with improvements

## 📝 License

MIT - Feel free to use and modify for your needs.

## 📞 Support

For issues or questions:
1. Check GitHub Issues
2. Review workflow logs in Actions tab
3. Verify GitHub Pages is properly configured
