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
        Schema::create('remittances', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('sender_name');
            $table->string('recipient_name');
            $table->decimal('amount_sent', 15, 2);
            $table->decimal('amount_received', 15, 2);
            $table->char('currency_from', 3);
            $table->char('currency_to', 3);
            $table->decimal('exchange_rate', 15, 6);
            $table->decimal('fee', 15, 2)->default(0);
            $table->string('service_provider');
            $table->date('transfer_date');
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('remittances');
    }
};
