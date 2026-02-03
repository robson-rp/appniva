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
        Schema::create('bank_reconciliations', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->unsignedBigInteger('account_id');
            $table->foreignId('transaction_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('external_amount', 15, 2);
            $table->date('external_date');
            $table->string('external_description');
            $table->enum('status', ['pending', 'matched', 'unmatched', 'resolved'])->default('pending');
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_reconciliations');
    }
};
