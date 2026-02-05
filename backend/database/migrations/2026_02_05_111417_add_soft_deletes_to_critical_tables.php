<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add soft deletes to critical financial entities
        $tables = [
            'transactions',
            'accounts',
            'goals',
            'debts',
            'budgets',
            'investments',
            'kixikilas',
            'split_expenses',
        ];

        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->softDeletes();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'transactions',
            'accounts',
            'goals',
            'debts',
            'budgets',
            'investments',
            'kixikilas',
            'split_expenses',
        ];

        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }
    }
};
