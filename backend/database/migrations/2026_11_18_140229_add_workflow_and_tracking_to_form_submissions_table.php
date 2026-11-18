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
        Schema::table('form_submissions', function (Blueprint $table) {
            $table->string('status', 32)->default('new')->after('data');
            $table->string('tracking_token', 64)->nullable()->unique()->after('status');
            $table->boolean('is_public')->default(true)->after('tracking_token');
            $table->text('admin_notes')->nullable()->after('is_public');
            $table->json('history')->nullable()->after('admin_notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('form_submissions', function (Blueprint $table) {
            $table->dropColumn(['status', 'tracking_token', 'is_public', 'admin_notes', 'history']);
        });
    }
};
