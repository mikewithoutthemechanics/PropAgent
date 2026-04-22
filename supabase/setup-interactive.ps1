# agent-loop Supabase Interactive Setup
# Run this to get copy-paste SQL commands

Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║         agent-loop Supabase Database Setup                      ║
╚════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Write-Host "Step 1: Open Supabase SQL Editor" -ForegroundColor Yellow
Write-Host "   URL: https://app.supabase.com/project/sehweutpfftnrcbqshsn/sql-editor" -ForegroundColor White
Write-Host ""

Write-Host "Step 2: Create exec_sql function (run first)" -ForegroundColor Yellow
Write-Host "----------------------------------------------" -ForegroundColor DarkGray
$functionSql = @'
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;
'@
Write-Host $functionSql -ForegroundColor Green
Write-Host "----------------------------------------------" -ForegroundColor DarkGray
Write-Host ""

Write-Host "Step 3: Run migration files in order:" -ForegroundColor Yellow

$migrations = Get-ChildItem -Path "$PSScriptRoot/migrations" -Filter "*.sql" | Sort-Object Name

foreach ($migration in $migrations) {
    Write-Host ""
    Write-Host "File: $($migration.Name)" -ForegroundColor Cyan
    Write-Host "----------------------------------------------" -ForegroundColor DarkGray
    Get-Content $migration.FullName | ForEach-Object { Write-Host $_ -ForegroundColor White }
    Write-Host "----------------------------------------------" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "Step 4: Verify tables created" -ForegroundColor Yellow
Write-Host "   Run: SELECT * FROM information_schema.tables WHERE table_schema = 'public';" -ForegroundColor White
Write-Host ""

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Connection details for n8n:" -ForegroundColor Cyan
Write-Host "   Host: https://sehweutpfftnrcbqshsn.supabase.co" -ForegroundColor White
Write-Host "   Tables: properties, tenants, inquiries, rent_reminders, property_descriptions, fica_documents, lead_scores" -ForegroundColor White
