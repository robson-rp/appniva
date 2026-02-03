<?php

// Ler todas as migrations
$migrationsDir = '/Users/robsonpaulo/Documents/GitHub/appniva/backend/database/migrations';
$files = glob($migrationsDir . '/*.php');

// Mapa de dependências
$dependencies = [];
$tableMap = [];

foreach ($files as $file) {
    $basename = basename($file);
    if (preg_match('/create_(\w+)_table/', $basename, $m)) {
        $tableName = $m[1];
        $content = file_get_contents($file);

        // Encontrar referências a outras tabelas
        $refs = [];
        preg_match_all('/->on\([\'"](\w+)[\'"]\)/', $content, $matches);
        $refs = $matches[1] ?? [];

        $dependencies[$tableName] = $refs;
        $tableMap[$tableName] = ['file' => $basename, 'timestamp' => substr($basename, 0, 16)];
    }
}

// Imprimir dependências
echo "Tabela => Dependências:\n";
foreach ($dependencies as $table => $deps) {
    echo "  $table => " . implode(', ', $deps ?: ['nenhuma']) . "\n";
}

// Detectar ciclos ou problemas
echo "\n\nProblemas detectados:\n";
foreach ($dependencies as $table => $deps) {
    foreach ($deps as $dep) {
        if (!isset($dependencies[$dep]) && $dep !== 'users') {
            echo "  ⚠️  $table depende de $dep, mas $dep não foi encontrada\n";
        }
    }
}

// Sugerir ordem
echo "\n\nOrdem sugerida (topological sort):\n";
$sorted = [];
$visited = [];
$visiting = [];

function visit($table, &$sorted, &$visited, &$visiting, $dependencies) {
    if (isset($visited[$table])) return;
    if (isset($visiting[$table])) {
        echo "CICLO DETECTADO!\n";
        return;
    }

    $visiting[$table] = true;

    if (isset($dependencies[$table])) {
        foreach ($dependencies[$table] as $dep) {
            if ($dep !== 'users' && isset($dependencies[$dep])) {
                visit($dep, $sorted, $visited, $visiting, $dependencies);
            }
        }
    }

    $visited[$table] = true;
    unset($visiting[$table]);
    $sorted[] = $table;
}

foreach ($dependencies as $table => $_) {
    visit($table, $sorted, $visited, $visiting, $dependencies);
}

foreach ($sorted as $i => $table) {
    echo ($i+1) . ". $table\n";
}
?>
