<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateCmsPageRequest;
use App\Http\Resources\CmsPageResource;
use App\Models\CmsPage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CmsPageController extends Controller
{
    /**
     * GET /api/cms/pages — admin listing (all statuses).
     */
    public function index(): JsonResponse
    {
        $pages = CmsPage::query()->orderBy('title')->get();

        return response()->json([
            'pages' => $pages->map(fn ($p) => [
                'id' => $p->id,
                'slug' => $p->slug,
                'title' => $p->title,
                'updated_at' => $p->updated_at?->toIso8601String(),
                'block_count' => is_array($p->blocks) ? count($p->blocks) : 0,
                'published' => (bool) $p->published,
            ])->all(),
        ]);
    }

    /**
     * GET /api/cms/pages/{id} — admin read (any status).
     */
    public function show(int $id): JsonResponse
    {
        $page = CmsPage::query()->find($id);
        if (! $page) {
            return response()->json(['message' => 'Page not found.'], 404);
        }

        return response()->json((new CmsPageResource($page))->toArray(request()));
    }

    /**
     * PUT /api/cms/pages/{id}
     */
    public function update(UpdateCmsPageRequest $request, int $id): JsonResponse
    {
        $page = CmsPage::query()->find($id);
        if (! $page) {
            return response()->json(['message' => 'Page not found.'], 404);
        }

        $data = $request->validated();
        $page->title = $data['title'];
        $page->blocks = $data['blocks'];
        $page->published = (bool) ($data['published'] ?? $page->published);
        $page->updated_by = $request->user()?->id;
        $page->save();

        return response()->json((new CmsPageResource($page->fresh()))->toArray($request));
    }
}
