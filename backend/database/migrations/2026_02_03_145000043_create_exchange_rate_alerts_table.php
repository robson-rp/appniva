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
        Schema::create('exchange_rate_alerts', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->char('base_currency', 3);
            $table->char('target_currency', 3);
            $table->decimal('threshold_rate', 15, 6);
            $table->enum('alert_direction', ['above', 'below']);
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_triggered_at')->nullable();
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exchange_rate_alerts');
    }
};
