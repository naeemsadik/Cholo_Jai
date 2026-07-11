<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->string('review_status', 16)->default('pending'); // pending|approved|rejected
            $table->text('review_note')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();

            // Organizer
            $table->string('organizer_name', 160);
            $table->string('organizer_phone', 40);
            $table->string('organizer_email', 190)->nullable();
            $table->string('organizer_website', 255)->nullable();

            // Content
            $table->string('title', 200);
            $table->string('title_bn', 200)->nullable();
            $table->text('description');
            $table->text('description_bn')->nullable();
            $table->string('poster_url', 500);
            $table->string('poster_alt', 255)->nullable();
            $table->string('poster_alt_bn', 255)->nullable();

            // Location (stored as names; resolved to FKs at promotion time)
            $table->string('city_name', 80)->default('Dhaka');
            $table->string('sub_area_name', 120);
            $table->string('venue_name', 200);
            $table->string('venue_name_bn', 200)->nullable();
            $table->string('area_details', 500)->nullable();
            $table->string('area_details_bn', 500)->nullable();

            // Schedule
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->time('start_time')->nullable();

            // Price
            $table->string('price_type', 16)->default('free'); // free|paid|donation
            $table->decimal('price_min', 10, 2)->nullable();
            $table->decimal('price_max', 10, 2)->nullable();
            $table->string('price_note', 255)->nullable();

            // Outbound
            $table->string('outbound_link', 500);
            $table->string('outbound_button_label', 80)->nullable();

            // Audience intent (text) — promoted into event_audience_tag on approval
            $table->json('category_names')->nullable();
            $table->json('audience_tag_names')->nullable();

            // Meta
            $table->string('source_link', 500)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 255)->nullable();

            $table->timestamps();

            $table->index(['review_status', 'created_at']);
            $table->index('sub_area_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
