<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_audience_tag', function (Blueprint $table) {
            $table->unsignedBigInteger('event_id');
            $table->unsignedBigInteger('audience_tag_id');

            $table->primary(['event_id', 'audience_tag_id']);
            $table->index('audience_tag_id');

            $table->foreign('event_id')->references('id')->on('events')->cascadeOnDelete();
            $table->foreign('audience_tag_id')->references('id')->on('audience_tags')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_audience_tag');
    }
};
