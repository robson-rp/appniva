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
        Schema::create('profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email')->unique();
            $table->string('name');
            $table->string('primary_currency')->default('AOA');
            $table->decimal('monthly_income', 15, 2)->nullable();
            $table->boolean('onboarding_completed')->default(false);
            $table->boolean('is_suspended')->default(false);
            $table->uuid('suspended_by')->nullable();
            $table->timestamp('suspended_at')->nullable();
            $table->timestamps();
            
            $table->index('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
