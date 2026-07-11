<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\AudienceTagResource;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\SubAreaResource;
use App\Models\AudienceTag;
use App\Models\Category;
use App\Models\City;
use App\Models\SubArea;
use Illuminate\Http\JsonResponse;

class LookupController extends Controller
{
    /**
     * GET /lookups — categories, audience tags, sub-areas, cities.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'categories' => CategoryResource::collection(
                Category::query()->where('is_active', true)->orderBy('sort_order')->orderBy('name')->get()
            ),
            'audience_tags' => AudienceTagResource::collection(
                AudienceTag::query()->where('is_active', true)->orderBy('sort_order')->orderBy('name')->get()
            ),
            'sub_areas' => SubAreaResource::collection(
                SubArea::query()->where('is_active', true)->orderBy('name')->get()
            ),
            'cities' => City::query()->where('is_active', true)->orderBy('name')->pluck('name')->all(),
        ]);
    }
}
