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
        Schema::create('financial_products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('product_type', ['savings_account', 'term_deposit', 'investment', 'loan', 'insurance', 'other']);
            $table->string('institution_name');
            $table->decimal('min_amount', 15, 2)->nullable();
            $table->decimal('max_amount', 15, 2)->nullable();
            $table->decimal('interest_rate_annual', 5, 4)->nullable();
            $table->integer('term_min_days')->nullable();
            $table->integer('term_max_days')->nullable();
            $table->json('features')->nullable();
            $table->json('requirements')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_products');
    }
};
