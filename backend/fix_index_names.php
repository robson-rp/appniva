<?php

$migrationsDir = __DIR__ . '/database/migrations';
$files = glob($migrationsDir . '/*.php');

// Padrão para encontrar índices com múltiplos campos
$pattern = '/\$table->index\(\[(.*?)\]\);/';

$fixed = 0;
foreach ($files as $file) {
    $content = file_get_contents($file);

    // Encontrar todas as declarações de index
    if (preg_match_all($pattern, $content, $matches)) {
        $tableNameMatch = preg_match('/create_(\w+)_table/', basename($file), $tableMatch);
        if ($tableNameMatch) {
            $tableName = $tableMatch[1];

            foreach ($matches[1] as $fieldList) {
                // Criar índice curto
                $fields = array_map('trim', array_map('str_getcsv', str_getcsv($fieldList))[0]);
                $shortIndexName = 'idx_' . $tableName . '_' . implode('_', array_slice(explode('_', $fields[0]), 0, 3));
                $shortIndexName = substr($shortIndexName, 0, 64); // Limitar a 64 caracteres

                // Substituir
                $oldPattern = "\$table->index([" . preg_quote($fieldList) . "]);";
                $newPattern = "\$table->index([" . $fieldList . "], '" . $shortIndexName . "');";

                $content = str_replace($oldPattern, $newPattern, $content);
                $fixed++;
            }
        }
    }

    file_put_contents($file, $content);
}

echo "✓ Processed migrations (index length checks)\n";
?>
