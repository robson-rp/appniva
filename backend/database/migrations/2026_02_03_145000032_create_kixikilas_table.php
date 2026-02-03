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
        Schema::create('kixikilas', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('name');
            $table->decimal('contribution_amount', 15, 2);
            $table->enum('frequency', ['weekly', 'biweekly', 'monthly']);
            $table->integer('current_round')->default(1);
            $table->integer('total_members')->default(1);
            $table->enum('status', ['active', 'completed', 'suspended'])->default('active');
            $table->char('currency', 3)->default('AOA');
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kixikilas');
    }
};
