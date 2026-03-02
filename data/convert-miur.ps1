# Script PowerShell per convertire il CSV MIUR in JSON ottimizzato per TopScuole.it
# Fonte: dati.istruzione.it — Anagrafe Scuole Statali 2025/26
# Mantiene solo le scuole superiori (esclude infanzia, primaria, media)

$csvPath  = "C:\Users\filip\Desktop\niccolò feo AI\website\data\miur_scuole_2526.csv"
$jsonPath = "C:\Users\filip\Desktop\niccolò feo AI\website\data\all-schools-italy.json"

# Tipi di scuola superiore da includere
$tipiSuperiori = @(
    "LICEO CLASSICO",
    "LICEO SCIENTIFICO",
    "LICEO ARTISTICO",
    "LICEO LINGUISTICO",
    "LICEO MUSICALE E COREUTICO",
    "LICEO DELLE SCIENZE UMANE",
    "ISTITUTO TECNICO INDUSTRIALE",
    "ISTITUTO TECNICO COMMERCIALE",
    "ISTITUTO TECNICO PER GEOMETRI",
    "ISTITUTO TECNICO AGRARIO",
    "ISTITUTO TECNICO NAUTICO",
    "ISTITUTO TECNICO AERONAUTICO",
    "ISTITUTO TECNICO PER IL TURISMO",
    "ISTITUTO PROFESSIONALE INDUSTRIA E ARTIGIANATO",
    "ISTITUTO PROFESSIONALE COMMERCIO",
    "ISTITUTO PROFESSIONALE AGRICOLTURA",
    "ISTITUTO PROFESSIONALE SERVIZI SOCIALI",
    "ISTITUTO PROFESSIONALE ALBERGHIERO",
    "ISTITUTO PROFESSIONALE",
    "ISTITUTO DI ISTRUZIONE SUPERIORE"
)

Write-Host "Lettura CSV MIUR..." -ForegroundColor Cyan
$rows = Import-Csv -Path $csvPath -Encoding UTF8 -Delimiter ","

Write-Host "Totale righe CSV: $($rows.Count)" -ForegroundColor Yellow

# Mappa tipo → sigla breve per la UI
function Get-TipoBreve($tipo) {
    switch -Wildcard ($tipo.ToUpper()) {
        "*LICEO CLASSICO*"          { return "Liceo Classico" }
        "*LICEO SCIENTIFICO*"       { return "Liceo Scientifico" }
        "*LICEO ARTISTICO*"         { return "Liceo Artistico" }
        "*LICEO LINGUISTICO*"       { return "Liceo Linguistico" }
        "*LICEO MUSICALE*"          { return "Liceo Musicale" }
        "*SCIENZE UMANE*"           { return "Liceo Scienze Umane" }
        "*TECNICO INDUSTRIALE*"     { return "ITIS" }
        "*TECNICO COMMERCIALE*"     { return "ITC" }
        "*GEOMETRI*"                { return "Istituto Tecnico" }
        "*TECNICO AGRARIO*"         { return "ITA" }
        "*TECNICO*"                 { return "Istituto Tecnico" }
        "*PROFESSIONALE*"           { return "Istituto Professionale" }
        "*ISTRUZIONE SUPERIORE*"    { return "IIS" }
        default                     { return "Scuola Superiore" }
    }
}

# Calcola iniziali dal nome
function Get-Initials($nome) {
    $words = $nome -replace "L\.|N\.|SS\.|STA\." -split "\s+" | Where-Object { $_.Length -gt 2 }
    if ($words.Count -ge 2) {
        return ($words[0][0].ToString() + $words[1][0].ToString()).ToUpper()
    } elseif ($words.Count -eq 1) {
        return $words[0].Substring(0, [Math]::Min(2, $words[0].Length)).ToUpper()
    }
    return "SC"
}

# Filtra solo sedi principali (SEDESCOLASTICA = NO = sede principale/direttiva)
# e solo scuole superiori
Write-Host "Filtraggio scuole superiori..." -ForegroundColor Cyan

$filtered = $rows | Where-Object {
    $tipo = $_.DESCRIZIONETIPOLOGIAGRADOISTRUZIONESCUOLA.ToUpper()
    $isSuperior = $false
    foreach ($t in $tipiSuperiori) {
        if ($tipo -like "*$t*") { $isSuperior = $true; break }
    }
    # Includi indipendentemente dalla sede (alcune sedi dicono SI, alcune NO)
    $isSuperior
}

Write-Host "Scuole superiori trovate: $($filtered.Count)" -ForegroundColor Green

# Deduplica per CODICESCUOLA (prendi solo la prima occorrenza)
$unique = @{}
$deduped = @()
foreach ($row in $filtered) {
    $code = $row.CODICESCUOLA.Trim()
    if (-not $unique.ContainsKey($code)) {
        $unique[$code] = $true
        $deduped += $row
    }
}

Write-Host "Scuole uniche (dedup): $($deduped.Count)" -ForegroundColor Green

# Converti in oggetti JSON
Write-Host "Conversione in JSON..." -ForegroundColor Cyan

$schools = $deduped | ForEach-Object {
    $tipo = $_.DESCRIZIONETIPOLOGIAGRADOISTRUZIONESCUOLA.Trim()
    $nome = $_.DENOMINAZIONESCUOLA.Trim()
    $cod  = $_.CODICESCUOLA.Trim()

    [PSCustomObject]@{
        id                     = $cod
        codice_meccanografico  = $cod
        nome                   = $nome
        tipo                   = Get-TipoBreve $tipo
        tipo_completo          = $tipo
        indirizzo              = $_.INDIRIZZOSCUOLA.Trim()
        cap                    = $_.CAPSCUOLA.Trim()
        comune                 = $_.DESCRIZIONECOMUNE.Trim()
        provincia              = $_.PROVINCIA.Trim()
        regione                = $_.REGIONE.Trim()
        area_geografica        = $_.AREAGEOGRAFICA.Trim()
        email                  = if ($_.INDIRIZZOEMAILSCUOLA -eq "Non Disponibile") { "" } else { $_.INDIRIZZOEMAILSCUOLA.Trim() }
        sito_web               = if ($_.SITOWEBSCUOLA -eq "Non Disponibile") { "" } else { $_.SITOWEBSCUOLA.Trim() }
        initials               = Get-Initials $nome
        anno_scolastico        = "2025/26"
        score                  = $null
        recensioni             = 0
        lat                    = $null
        lng                    = $null
        cats                   = [PSCustomObject]@{
            didattica  = $null
            struttura  = $null
            ambiente   = $null
            org        = $null
            servizi    = $null
        }
    }
}

Write-Host "Scuole nel JSON finale: $($schools.Count)" -ForegroundColor Green

# Crea wrapper con metadati
$output = [PSCustomObject]@{
    fonte          = "MIUR - Ministero dell Istruzione e del Merito"
    url_fonte      = "https://dati.istruzione.it/opendata/opendata/catalogo/elements1/?area=Scuole"
    anno_scolastico = "2025/26"
    data_aggiornamento = (Get-Date -Format "yyyy-MM-dd")
    totale_scuole  = $schools.Count
    nota           = "Dati anagrafici ufficiali. Coordinate non disponibili per geocoding automatico."
    scuole         = $schools
}

# Salva JSON
Write-Host "Salvataggio JSON..." -ForegroundColor Cyan
$jsonContent = $output | ConvertTo-Json -Depth 5 -Compress
[System.IO.File]::WriteAllText($jsonPath, $jsonContent, [System.Text.Encoding]::UTF8)

$fileSizeMB = [Math]::Round((Get-Item $jsonPath).Length / 1MB, 2)
Write-Host "✅ JSON salvato: $jsonPath" -ForegroundColor Green
Write-Host "   Dimensione: ${fileSizeMB} MB" -ForegroundColor Green
Write-Host "   Scuole totali: $($schools.Count)" -ForegroundColor Green
