<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSettingsRequest;
use App\Http\Resources\SettingsResource;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    /**
     * GET /api/settings
     */
    public function show(): JsonResponse
    {
        $settings = Setting::singleton();

        return response()->json((new SettingsResource($settings))->toArray(request()));
    }

    /**
     * PUT /api/settings
     */
    public function update(UpdateSettingsRequest $request): JsonResponse
    {
        $data = $request->validated();

        $settings = Setting::singleton();
        $settings->fill($data);
        $settings->updated_by = $request->user()?->id;
        $settings->save();

        return response()->json((new SettingsResource($settings->fresh()))->toArray($request));
    }
}
