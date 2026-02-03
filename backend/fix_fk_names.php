<?php

$migrationsDir = '/Users/robsonpaulo/Documents/GitHub/appniva/backend/database/migrations';
$files = glob($migrationsDir . '/*.php');

$fixed = 0;
foreach ($files as $file) {
    $content = file_get_contents($file);

    // Encontrar todas as declarações de foreignId sem alias
    if (preg_match_all('/\$table->foreignId\([\'"](\w+)[\'"]\)->constrained\([\'"](\w+)[\'"]\)(->onDelete\(\'cascade\'\)|->nullOnDelete\(\))?;/', $content, $matches, PREG_OFFSET_CAPTURE)) {
        foreach ($matches[0] as $i => $match) {
            $columnName = $matches[1][$i][0];
            $tableName = $matches[2][$i][0];
            $onDelete = $matches[3][$i][0] ?? '->onDelete(\'cascade\')';

            // Criar um nome curto para a constraint
            $shortName = substr($columnName, 0, 10) . '_fk_' . substr($tableName, 0, 10);
            $shortName = str_replace('_', '', $shortName);
            $shortName = 'fk_' . substr($shortName, 0, 58);

            // Substituir
            $oldPattern = "\$table->foreignId('" . $columnName . "')->constrained('" . $tableName . "')" . $onDelete . ";";
            $newPattern = "\$table->unsignedBigInteger('" . $columnName . "');\n            // Foreign key added in separate migration";

            // Mas na verdade, vou manter o foreignId mas usar o alias
            $newPattern = "\$table->foreignId('" . $columnName . "', '" . $shortName . "')->constrained('" . $tableName . "')" . $onDelete . ";";

            $content = str_replace($oldPattern, $newPattern, $content);
            $fixed++;
        }
    }

    file_put_contents($file, $content);
}

echo "Processed $fixed patterns\n";
?>
