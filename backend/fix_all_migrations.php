<?php

$migrationsDir = __DIR__ . '/database/migrations';
$files = glob($migrationsDir . '/*.php');

$pattern = '/public function up\(\): void\s*\{\s*public function up\(\): void\s*\{/';
$replacement = 'public function up(): void' . "\n    {";

$fixed = 0;
foreach ($files as $file) {
    $content = file_get_contents($file);
    if (preg_match($pattern, $content)) {
        $newContent = preg_replace($pattern, $replacement, $content);
        file_put_contents($file, $newContent);
        $fixed++;
        echo "✓ Fixed: " . basename($file) . "\n";
    }
}

echo "\n✓ Fixed $fixed migration files\n";
?>
