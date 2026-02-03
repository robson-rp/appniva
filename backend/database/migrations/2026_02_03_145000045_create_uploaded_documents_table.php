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
        Schema::create('uploaded_documents', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('file_url');
            $table->string('original_filename');
            $table->enum('file_type', ['receipt', 'invoice', 'statement', 'other'])->default('other');
            $table->json('extracted_data')->nullable();
            $table->boolean('processed')->default(false);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('uploaded_documents');
    }
};
