<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('submission_id')->nullable();
            $table->string('slug', 180)->unique();
            $table->string('status', 16)->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->boolean('show_in_hero')->default(false);
            $table->integer('hero_sort_order')->default(0);

            // Organizer (denormalized)
            $table->string('organizer_name', 160);
            $table->string('organizer_phone', 40)->nullable();
            $table->string('organizer_email', 190)->nullable();
            $table->string('organizer_website', 255)->nullable();

            // Main content
            $table->string('title', 200);
            $table->string('title_bn', 200)->nullable();
            $table->text('description');
            $table->text('description_bn')->nullable();
            $table->string('poster_url', 500);
            $table->string('poster_alt', 255)->nullable();
            $table->string('poster_alt_bn', 255)->nullable();

            // Location
            $table->foreignId('city_id')->constrained('cities')->restrictOnDelete();
            $table->foreignId('sub_area_id')->constrained('sub_areas')->restrictOnDelete();
            $table->string('venue_name', 200);
            $table->string('venue_name_bn', 200)->nullable();
            $table->string('area_details', 500)->nullable();
            $table->string('area_details_bn', 500)->nullable();

            // Schedule
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->time('start_time')->nullable();

            // Price
            $table->string('price_type', 16)->default('free');
            $table->decimal('price_min', 10, 2)->nullable();
            $table->decimal('price_max', 10, 2)->nullable();
            $table->string('price_note', 255)->nullable();

            // Outbound
            $table->string('outbound_link', 500);
            $table->string('outbound_button_label', 80)->nullable();

            // Curation (admin-only)
            $table->string('source_link', 500)->nullable();
            $table->text('admin_notes')->nullable();

            // Timestamps
            $table->timestamp('published_at')->nullable();
            $table->timestamp('starts_at')->nullable(); // denormalized for fast range filter
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'starts_at']);
            $table->index('city_id');
            $table->index('sub_area_id');
            $table->index('is_featured');
            $table->index(['show_in_hero', 'hero_sort_order']);
            $table->index('published_at');
            $table->index('start_date');

            $table->foreign('submission_id')
                ->references('id')->on('submissions')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
