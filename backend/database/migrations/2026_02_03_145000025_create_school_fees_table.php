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
        Schema::create('school_fees', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('school_name');
            $table->string('student_name');
            $table->decimal('amount', 15, 2);
            $table->char('academic_year', 4);
            $table->date('due_date');
            $table->string('education_level');
            $table->string('fee_type');
            $table->boolean('paid')->default(false);
            $table->string('payment_proof_url')->nullable();
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('school_fees');
    }
};
