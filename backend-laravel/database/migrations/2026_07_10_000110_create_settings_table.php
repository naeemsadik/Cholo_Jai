<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('site_name', 120)->default('Cholo Jai');
            $table->string('tagline', 255)->nullable();
            $table->string('default_city', 80)->default('Dhaka');
            $table->string('default_outbound_label', 80)->default('Register');
            $table->json('outbound_labels');
            $table->json('pixels');
            $table->json('meta_tags');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
