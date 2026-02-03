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
        Schema::create('financial_scores', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->integer('score'); // 0-100
            $table->json('criteria_json')->nullable();
            $table->timestamp('generated_at');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_scores');
    }
};
