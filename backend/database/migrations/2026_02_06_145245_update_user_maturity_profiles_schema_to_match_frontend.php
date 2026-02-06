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
        Schema::table('user_maturity_profiles', function (Blueprint $table) {
            $table->dropColumn('level');
            $table->renameColumn('progress_tracking', 'progress_steps_completed');
            $table->integer('total_progress_steps')->default(10)->after('onboarding_completed');
        });

        Schema::table('user_maturity_profiles', function (Blueprint $table) {
            $table->enum('level', ['basic', 'intermediate', 'advanced'])->default('basic')->after('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_maturity_profiles', function (Blueprint $table) {
            $table->dropColumn('level');
            $table->renameColumn('progress_steps_completed', 'progress_tracking');
            $table->dropColumn('total_progress_steps');
        });

        Schema::table('user_maturity_profiles', function (Blueprint $table) {
            $table->enum('level', ['beginner', 'intermediate', 'advanced'])->default('beginner')->after('user_id');
        });
    }
};
