<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Since we are changing the ID type, existing integer IDs might not be compatible if we had any.
        // But here we likely have mismatched data anyway or empty data.
        // Easiest and safest for SQLite/MySQL compatibility without heavy dependencies is to drop and recreate the columns.
        
        // First truncate tokens as they will be invalid without the ID linking
        DB::table('personal_access_tokens')->truncate();

        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->dropMorphs('tokenable');
        });

        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->uuidMorphs('tokenable');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('personal_access_tokens')->truncate();
        
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->dropMorphs('tokenable');
        });

        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->morphs('tokenable');
        });
    }
};
