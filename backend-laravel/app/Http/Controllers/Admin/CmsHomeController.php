<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateCmsHomeRequest;
use App\Http\Resources\CmsHomeResource;
use App\Models\CmsHome;
use Illuminate\Http\JsonResponse;

class CmsHomeController extends Controller
{
    /**
     * GET /api/cms/home
     */
    public function show(): JsonResponse
    {
        $home = CmsHome::singleton();

        return response()->json((new CmsHomeResource($home))->toArray(request()));
    }

    /**
     * PUT /api/cms/home
     */
    public function update(UpdateCmsHomeRequest $request): JsonResponse
    {
        $data = $request->validated();
        $home = CmsHome::singleton();

        // Map request key → DB column (since `order` is reserved in SQL).
        $home->order_section = $data['order'] ?? [];
        $home->sections = $data['sections'] ?? [];
        $home->updated_by = $request->user()?->id;
        $home->save();

        return response()->json((new CmsHomeResource($home->fresh()))->toArray($request));
    }
}
