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
        Schema::create('goals', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('name');
            $table->decimal('target_amount', 15, 2);
            $table->date('target_date');
            $table->decimal('current_saved_amount', 15, 2)->default(0);
            $table->enum('status', ['active', 'completed', 'abandoned'])->default('active');
            $table->char('currency', 3)->default('AOA');
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('goals');
    }
};
