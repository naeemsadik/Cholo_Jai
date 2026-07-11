<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analytics_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_type', 24); // page_view|outbound_click|form_completion
            $table->string('session_id', 128);
            $table->string('path', 500)->nullable();
            $table->unsignedBigInteger('event_id')->nullable();
            $table->string('label', 80)->nullable();
            $table->string('href', 500)->nullable();
            $table->string('form_id', 80)->nullable();
            $table->string('ref', 500)->nullable();
            $table->string('utm_source', 80)->nullable();
            $table->json('meta')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 255)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['event_type', 'created_at']);
            $table->index('session_id');
            $table->index('event_id');
            $table->index('created_at');

            $table->foreign('event_id')->references('id')->on('events')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_events');
    }
};
