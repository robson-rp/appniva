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
        Schema::create('term_deposits', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('investment_id');
            $table->integer('term_days');
            $table->decimal('interest_rate_annual', 5, 4);
            $table->enum('interest_payment_frequency', ['monthly', 'quarterly', 'annually', 'at_maturity']);
            $table->boolean('auto_renew')->default(false);
            $table->decimal('tax_rate', 5, 4)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('term_deposits');
    }
};
