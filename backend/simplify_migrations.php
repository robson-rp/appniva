<?php

$migrationsDir = '/Users/robsonpaulo/Documents/GitHub/appniva/backend/database/migrations';
$files = glob($migrationsDir . '/*.php');

foreach ($files as $file) {
    $content = file_get_contents($file);

    // Substituir todos os foreignId por unsignedBigInteger
    $content = preg_replace(
        '/\$table->foreignId\([\'"](\w+)[\'"]\)(?:,\s*[\'"](\w+)[\'"])?\s*->constrained\([\'"]?(\w*)[\'"]?\)[->]*(onDelete|nullOnDelete)\([\'"]?(\w+)[\'"]?\);/',
        "\$table->unsignedBigInteger('\$1');",
        $content
    );

    // Substituir index com múltiplos campos por index curto
    $content = preg_replace_callback(
        '/\$table->index\(\[(.*?)\]\);/',
        function($matches) {
            $fields = array_map('trim', str_getcsv($matches[1]));
            $shortName = 'idx_' . substr(implode('_', $fields), 0, 52);
            return "\$table->index([" . $matches[1] . "], '" . $shortName . "');";
        },
        $content
    );

    // Substituir index simples por index com nome curto
    $content = preg_replace(
        '/\$table->index\([\'"](\w+)[\'"]\);/',
        "\$table->index('\$1', 'idx_\$1');",
        $content
    );

    // Substituir foreign() declarations com nomes curtos
    $content = preg_replace_callback(
        '/\$table->foreign\([\'"](\w+)[\'"]\)->references\([\'"](\w+)[\'"]\)->on\([\'"](\w+)[\'"]\)(->onDelete\([\'"]?(\w+)[\'"]?\)|->nullOnDelete\(\))?;/',
        function($matches) {
            $col = $matches[1];
            $shortName = 'fk_' . substr($col, 0, 58);
            $onDelete = $matches[4] ?? '->onDelete(\'cascade\')';
            return "\$table->foreign('" . $col . "', '" . $shortName . "')->references('" . $matches[2] . "')->on('" . $matches[3] . "')" . $onDelete . ";";
        },
        $content
    );

    file_put_contents($file, $content);
}

echo "✓ Fixed all migrations to use short names\n";
?>
