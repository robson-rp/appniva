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
        Schema::create('user_maturity_profiles', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id')->unique();
            $table->enum('level', ['beginner', 'intermediate', 'advanced'])->default('beginner');
            $table->boolean('has_debts')->default(false);
            $table->boolean('has_investments')->default(false);
            $table->boolean('uses_budget')->default(false);
            $table->boolean('has_fixed_income')->default(false);
            $table->string('primary_goal')->nullable();
            $table->boolean('onboarding_completed')->default(false);
            $table->integer('progress_tracking')->default(0);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_maturity_profiles');
    }
};
