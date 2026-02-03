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
        Schema::create('category_prediction_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('predicted_category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('description');
            $table->decimal('confidence', 3, 2); // 0-1
            $table->boolean('accepted')->default(false);
            $table->timestamp('created_at');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('category_prediction_logs');
    }
};
