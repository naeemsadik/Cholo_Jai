<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReviewStatus;
use App\Exceptions\SubmissionPromotionException;
use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewSubmissionRequest;
use App\Http\Requests\UpdateSubmissionRequest;
use App\Http\Resources\SubmissionResource;
use App\Models\Submission;
use App\Services\SubmissionPromotionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubmissionController extends Controller
{
    public function __construct(private readonly SubmissionPromotionService $service) {}

    /**
     * GET /admin/submissions
     */
    public function index(Request $request): JsonResponse
    {
        $query = Submission::query()->orderByDesc('created_at');

        if ($status = $request->query('review_status')) {
            $query->where('review_status', $status);
        }

        $submissions = $query->get();

        return response()->json(
            SubmissionResource::collection($submissions)->collection->all()
        );
    }

    /**
     * PATCH /admin/submissions/{id}
     */
    public function update(UpdateSubmissionRequest $request, int $id): JsonResponse
    {
        $submission = Submission::query()->find($id);
        if (! $submission) {
            return response()->json(['message' => 'Submission not found.'], 404);
        }

        $data = $request->validated();
        $submission->fill($data);
        $submission->save();

        return response()->json((new SubmissionResource($submission->fresh()))->toArray($request));
    }

    /**
     * PATCH /admin/submissions/{id}/review
     *
     * review_status=approved atomically promotes the submission to an Event.
     */
    public function review(ReviewSubmissionRequest $request, int $id): JsonResponse
    {
        $submission = Submission::query()->find($id);
        if (! $submission) {
            return response()->json(['message' => 'Submission not found.'], 404);
        }

        $data = $request->validated();

        try {
            $result = $this->service->review(
                $submission,
                ReviewStatus::from($data['review_status']),
                $data['note'] ?? null,
                (bool) ($data['publish'] ?? false),
                $request->user()?->id,
            );
        } catch (SubmissionPromotionException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'submission' => (new SubmissionResource($result['submission']))->toArray($request),
            'promoted_event_id' => $result['promoted_event_id'],
        ]);
    }
}
