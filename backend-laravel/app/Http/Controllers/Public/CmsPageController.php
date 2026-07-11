<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\CmsPageResource;
use App\Models\CmsPage;
use Illuminate\Http\JsonResponse;

class CmsPageController extends Controller
{
    /**
     * GET /cms/pages — public listing; only published pages.
     */
    public function index(): JsonResponse
    {
        $pages = CmsPage::query()
            ->where('published', true)
            ->orderBy('title')
            ->get();

        return response()->json(CmsPageResource::collection($pages)->collection->all());
    }

    /**
     * GET /cms/pages/{id} — by page id; 404 if not published.
     */
    public function show(int $id): JsonResponse
    {
        $page = CmsPage::query()->where('published', true)->find($id);

        if (! $page) {
            return response()->json(['message' => 'Page not found.'], 404);
        }

        return response()->json((new CmsPageResource($page))->toArray(request()));
    }
}
