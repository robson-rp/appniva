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
        Schema::create('scenarios', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('name');
            $table->integer('time_horizon_years')->default(5);
            $table->decimal('monthly_income_estimate', 15, 2)->nullable();
            $table->decimal('monthly_expense_estimate', 15, 2)->nullable();
            $table->decimal('salary_increase_rate', 5, 4)->nullable();
            $table->decimal('inflation_rate', 5, 4)->nullable();
            $table->decimal('investment_return_rate', 5, 4)->nullable();
            $table->decimal('exchange_rate_projection', 15, 4)->nullable();
            $table->json('future_expenses')->nullable();
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scenarios');
    }
};
