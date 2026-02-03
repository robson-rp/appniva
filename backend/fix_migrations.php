<?php
$dir = __DIR__ . '/database/migrations';
$files = glob("$dir/*_table.php");

foreach ($files as $file) {
    $content = file_get_contents($file);

    // Fix the duplicate "public function up()" pattern
    $content = preg_replace('/\{\s*public function up\(\): void\s*\{/', "{\n    public function up(): void\n    {", $content);

    // Remove extra closing braces
    $content = preg_replace('/\}\s*\}\s*\n\s*\/\*\*/', "}\n\n    /**", $content);

    file_put_contents($file, $content);
    echo "Fixed: " . basename($file) . "\n";
}

echo "\n✓ All migration files fixed!\n";
