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
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('name');
            $table->enum('type', ['savings', 'checking', 'investment', 'credit_card']);
            $table->string('currency', 3)->default('AOA');
            $table->decimal('current_balance', 15, 2);
            $table->decimal('initial_balance', 15, 2)->nullable();
            $table->string('institution_name')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->index('user_id');
            $table->index('type');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
