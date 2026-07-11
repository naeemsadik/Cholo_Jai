<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UploadRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    /**
     * POST /admin/uploads — multipart file, returns { url }.
     */
    public function store(UploadRequest $request): JsonResponse
    {
        $file = $request->file('file') ?? $request->file('image');

        // Non-guessable path: uploads/YYYY/MM/{hash}.{ext}
        $path = $file->store('uploads/'.now()->format('Y/m'), 'public');

        // Compute a stable URL — APP_URL is what nginx + Laravel serve from.
        $url = rtrim((string) config('app.url'), '/').'/storage/'.$path;

        return response()->json(['url' => $url]);
    }
}
