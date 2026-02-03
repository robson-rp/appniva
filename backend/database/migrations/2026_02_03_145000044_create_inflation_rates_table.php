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
        Schema::create('inflation_rates', function (Blueprint $table) {
            $table->id();
            $table->char('country', 2);
            $table->char('month', 7); // YYYY-MM format
            $table->decimal('annual_rate', 5, 4);
            $table->decimal('monthly_rate', 5, 4);
            $table->string('source');
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inflation_rates');
    }
};
