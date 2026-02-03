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
        Schema::create('debts', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('name');
            $table->decimal('principal_amount', 15, 2);
            $table->decimal('current_balance', 15, 2);
            $table->enum('type', ['personal_loan', 'credit_card', 'mortgage', 'auto_loan', 'student_loan', 'other']);
            $table->enum('status', ['active', 'paid_off', 'defaulted'])->default('active');
            $table->decimal('interest_rate_annual', 5, 4)->nullable();
            $table->enum('installment_frequency', ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annual'])->default('monthly');
            $table->decimal('installment_amount', 15, 2)->nullable();
            $table->date('next_payment_date')->nullable();
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('debts');
    }
};
