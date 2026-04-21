# Agent Loop Supabase Database Setup Script
# Execute migrations in order

param(
    [Parameter()]
    [string]$SupabaseUrl = "https://sehweutpfftnrcbqshsn.supabase.co",
    
    [Parameter()]
    [string]$ServiceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY
)

if (-not $ServiceRoleKey) {
    Write-Host "Error: SUPABASE_SERVICE_ROLE_KEY environment variable not set" -ForegroundColor Red
    Write-Host "Please set it with: `$env:SUPABASE_SERVICE_ROLE_KEY = 'your-key-here'" -ForegroundColor Yellow
    exit 1
}

$headers = @{
    "apikey" = $ServiceRoleKey
    "Authorization" = "Bearer $ServiceRoleKey"
    "Content-Type" = "application/json"
}

Write-Host "Connecting to Supabase: $SupabaseUrl" -ForegroundColor Cyan
Write-Host ""

# Get all SQL migration files and sort them
$migrations = Get-ChildItem -Path "migrations" -Filter "*.sql" | Sort-Object Name

foreach ($migration in $migrations) {
    Write-Host "Executing: $($migration.Name)" -ForegroundColor Yellow
    
    $sql = Get-Content -Path $migration.FullName -Raw
    
    # Use Supabase REST API to execute SQL
    $body = @{
        query = $sql
    } | ConvertTo-Json -Depth 10
    
    try {
        $response = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/rpc/exec_sql" -Method POST -Headers $headers -Body $body
        Write-Host "  ✓ Success" -ForegroundColor Green
    }
    catch {
        # Try alternative: run via pgAPI or SQL endpoint
        Write-Host "  ⚠ REST API failed, trying SQL endpoint..." -ForegroundColor Yellow
        
        try {
            $response = Invoke-RestMethod -Uri "$SupabaseUrl/pgrest/sql" -Method POST -Headers $headers -Body $body
            Write-Host "  ✓ Success" -ForegroundColor Green
        }
        catch {
            Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "  SQL may need to be run manually in Supabase SQL Editor" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
}

Write-Host "Migration execution complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Log into Supabase Dashboard: https://app.supabase.com/project/sehweutpfftnrcbqshsn" -ForegroundColor White
Write-Host "2. Navigate to SQL Editor and run the migration files manually if needed" -ForegroundColor White
Write-Host "3. Verify tables created in Table Editor" -ForegroundColor White
