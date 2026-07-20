<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name', 'Laravel') }}</title>
    <style>
        body {
            margin: 0;
            font-family: Arial, Helvetica, sans-serif;
            background: linear-gradient(135deg, #0f172a, #1e293b);
            color: #e2e8f0;
            min-height: 100vh;
            display: grid;
            place-items: center;
        }

        .card {
            background: rgba(15, 23, 42, 0.72);
            border: 1px solid rgba(148, 163, 184, 0.25);
            border-radius: 20px;
            padding: 40px;
            max-width: 640px;
            box-shadow: 0 24px 80px rgba(15, 23, 42, 0.45);
        }

        h1 {
            margin-top: 0;
            font-size: 2.5rem;
        }

        p {
            line-height: 1.7;
            color: #cbd5e1;
        }

        code {
            background: rgba(148, 163, 184, 0.14);
            padding: 2px 6px;
            border-radius: 6px;
        }
    </style>
</head>
<body>
<main class="card">
    <h1>Laravel backend ready</h1>
    <p>This is the starter backend for <strong>{{ config('app.name') }}</strong>.</p>
    <p>Use <code>/api/v1/health</code> or <code>/api/v1/ping</code> to verify the API.</p>
</main>
</body>
</html>