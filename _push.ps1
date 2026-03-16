$token = $env:GITHUB_TOKEN  # Set via: $env:GITHUB_TOKEN = "your-token"
$owner = "mikelninh"
$repo = "Gefuehle-Memory"
$headers = @{ Authorization = "token $token"; Accept = "application/vnd.github.v3+json" }
$base = "https://api.github.com/repos/$owner/$repo"

# Get current commit SHA
$ref = Invoke-RestMethod "$base/git/ref/heads/main" -Headers $headers
$parentSha = $ref.object.sha
Write-Host "Parent commit: $parentSha"

# Collect all files to push
$files = @(
  "index.html",
  "css/style.css",
  "js/data.js",
  "js/culture.js",
  "js/game.js",
  "js/ai.js",
  "js/card-art.js",
  "js/learn-data.js",
  "js/learn.js",
  "README.md",
  "LICENSE",
  "CHANGELOG.md",
  ".gitignore",
  "manifest.json",
  "sw.js",
  "VISION.txt"
)

$treeItems = @()
foreach ($f in $files) {
  $path = Join-Path "C:\Users\User\gefuehle-memory" $f
  if (!(Test-Path $path)) { Write-Host "SKIP (not found): $f"; continue }
  
  $bytes = [System.IO.File]::ReadAllBytes($path)
  $b64 = [Convert]::ToBase64String($bytes)
  
  $body = @{ content = $b64; encoding = "base64" } | ConvertTo-Json
  $blob = Invoke-RestMethod "$base/git/blobs" -Method Post -Headers $headers -Body $body -ContentType "application/json; charset=utf-8"
  Write-Host "Blob: $f -> $($blob.sha)"
  
  $treeItems += @{
    path = $f.Replace("\", "/")
    mode = "100644"
    type = "blob"
    sha  = $blob.sha
  }
}

Write-Host "`nCreating tree with $($treeItems.Count) files..."
$treeBody = @{ base_tree = $parentSha; tree = $treeItems } | ConvertTo-Json -Depth 5
$tree = Invoke-RestMethod "$base/git/trees" -Method Post -Headers $headers -Body $treeBody -ContentType "application/json; charset=utf-8"
Write-Host "Tree: $($tree.sha)"

Write-Host "Creating commit..."
$commitBody = @{
  message = "feat: v3.0 - Card Art, AI, Journal, Flashcards, Emotion Wheel, Learning Mode"
  tree    = $tree.sha
  parents = @($parentSha)
} | ConvertTo-Json -Depth 3
$commit = Invoke-RestMethod "$base/git/commits" -Method Post -Headers $headers -Body $commitBody -ContentType "application/json; charset=utf-8"
Write-Host "Commit: $($commit.sha)"

Write-Host "Updating main branch..."
$refBody = @{ sha = $commit.sha; force = $true } | ConvertTo-Json
Invoke-RestMethod "$base/git/refs/heads/main" -Method Patch -Headers $headers -Body $refBody -ContentType "application/json; charset=utf-8" | Out-Null
Write-Host "`nDONE! Pushed to https://github.com/$owner/$repo"
