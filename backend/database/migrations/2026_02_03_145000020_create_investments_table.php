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
        Schema::create('investments', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('name');
            $table->enum('investment_type', ['term_deposit', 'bond', 'otnr', 'stock', 'mutual_fund', 'crypto']);
            $table->decimal('principal_amount', 15, 2);
            $table->date('start_date');
            $table->date('maturity_date')->nullable();
            $table->char('currency', 3)->default('AOA');
            $table->string('institution_name')->nullable();
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('investments');
    }
};
