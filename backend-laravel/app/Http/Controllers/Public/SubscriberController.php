<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSubscriberRequest;
use App\Http\Resources\EmailSubscriberResource;
use App\Models\EmailSubscriber;
use Illuminate\Http\JsonResponse;

class SubscriberController extends Controller
{
    /**
     * POST /subscribers
     */
    public function store(StoreSubscriberRequest $request): JsonResponse
    {
        $data = $request->validated();

        $subscriber = EmailSubscriber::create([
            'email' => $data['email'],
            'source' => $data['source'] ?? 'homepage',
            'ip_address' => $request->ip(),
        ]);

        return response()->json(
            (new EmailSubscriberResource($subscriber))->toArray($request),
            201
        );
    }
}
