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
        Schema::create('bond_otnrs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('investment_id');
            $table->integer('quantity');
            $table->decimal('face_value_per_unit', 15, 2);
            $table->decimal('coupon_rate_annual', 5, 4);
            $table->enum('coupon_frequency', ['monthly', 'quarterly', 'annually']);
            $table->string('isin')->nullable();
            $table->string('custodian_institution')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bond_otnrs');
    }
};
