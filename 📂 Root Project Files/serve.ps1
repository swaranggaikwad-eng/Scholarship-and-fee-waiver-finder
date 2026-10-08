# Native PowerShell HTTP Server for Scholarship & Fee Waiver Finder
$port = 3000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")
$listener.Start()

Write-Host "🚀 Server successfully started and running at: http://localhost:$port/ and http://127.0.0.1:$port/"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $rawPath = $request.Url.LocalPath
        if ($rawPath -eq "/") { $rawPath = "/index.html" }
        
        $localPath = Join-Path "C:\Users\swara\.gemini\antigravity\scratch\scholarship-finder" $rawPath.TrimStart('/')
        
        if (Test-Path $localPath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            
            if ($rawPath.EndsWith(".html")) { $response.ContentType = "text/html; charset=utf-8" }
            elseif ($rawPath.EndsWith(".css")) { $response.ContentType = "text/css" }
            elseif ($rawPath.EndsWith(".js")) { $response.ContentType = "application/javascript" }
            elseif ($rawPath.EndsWith(".jpg") -or $rawPath.EndsWith(".jpeg")) { $response.ContentType = "image/jpeg" }
            elseif ($rawPath.EndsWith(".png")) { $response.ContentType = "image/png" }
            elseif ($rawPath.EndsWith(".json")) { $response.ContentType = "application/json" }
            else { $response.ContentType = "application/octet-stream" }
            
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 File Not Found")
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        $response.Close()
    }
} catch {
    Write-Host "Server error: $_"
} finally {
    $listener.Stop()
}
