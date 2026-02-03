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
        Schema::create('split_expenses', function (Blueprint $table) {
            $table->id();
            $table->uuid('creator_id');
            $table->string('description');
            $table->decimal('total_amount', 15, 2);
            $table->date('expense_date');
            $table->char('currency', 3)->default('AOA');
            $table->boolean('is_settled')->default(false);
            $table->string('receipt_url')->nullable();
            $table->string('share_token')->nullable()->unique();
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('split_expenses');
    }
};
