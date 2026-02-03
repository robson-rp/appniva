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
        Schema::create('split_expense_participants', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('split_expense_id');
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->decimal('amount_owed', 15, 2);
            $table->decimal('amount_paid', 15, 2)->default(0);
            $table->boolean('is_creator')->default(false);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('split_expense_participants');
    }
};
