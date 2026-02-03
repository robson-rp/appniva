<?php

// Abordagem simples: encontrar todas as migrations e remover Foreign Keys e Indexes inline
// Deixar só as colunas simples

$migrationsDir = '/Users/robsonpaulo/Documents/GitHub/appniva/backend/database/migrations';
$files = glob($migrationsDir . '/*create_*.php');

foreach ($files as $file) {
    $content = file_get_contents($file);
    
    // Remover TODAS as linhas com $table->foreign, $table->index, $table->unique
    $content = preg_replace('/^\s*\$table->(foreign|index|unique)\(.*?\);?\s*$/m', '', $content);
    
    // Também remover foreignId e deixar só unsignedBigInteger ou o que já é
    $content = preg_replace(
        '/\$table->foreignId\([\'"](\w+)[\'"]\)(?:,\s*[\'"](\w+)[\'"])?\s*->constrained\([\'"]?(\w*)[\'"]?\)[->]*(onDelete|nullOnDelete)\([\'"]?(\w+)[\'"]?\);/',
        "\$table->unsignedBigInteger('\$1');",
        $content
    );
    
    // Limpar linhas vazias múltiplas
    $content = preg_replace('/\n\n\n+/', "\n\n", $content);
    
    file_put_contents($file, $content);
    echo "✓ Cleaned: " . basename($file) . "\n";
}

echo "\n✓ All migrations cleaned\n";
?>
