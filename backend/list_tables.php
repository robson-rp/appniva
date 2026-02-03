<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$tables = DB::select("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = '" . env('DB_DATABASE') . "' ORDER BY TABLE_NAME");

echo "✓ Total de tabelas criadas: " . count($tables) . "\n\n";

$entityTables = array_filter($tables, fn($t) => !in_array($t->TABLE_NAME, ['users', 'cache', 'jobs', 'migrations', 'personal_access_tokens']));

echo "Tabelas de entidades (47 esperadas):\n";
foreach ($entityTables as $i => $table) {
    echo ($i+1) . ". " . $table->TABLE_NAME . "\n";
}

echo "\nTabelas do sistema (Laravel):\n";
$systemTables = array_filter($tables, fn($t) => in_array($t->TABLE_NAME, ['users', 'cache', 'jobs', 'migrations', 'personal_access_tokens']));
foreach ($systemTables as $table) {
    echo "  - " . $table->TABLE_NAME . "\n";
}
