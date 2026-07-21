<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Story;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Throwable;

class StoryController extends Controller
{
    // POST /api/story
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'studentName' => ['required', 'string'],
                'country' => ['required', 'string'],
                'university' => ['required', 'string'],
                'course' => ['required', 'string'],
                'title' => ['required', 'string'],
                // NOTE: the original Node controller checked "youtubeVideoId"
                // here but the schema actually required "youtubeUrl" — that
                // mismatch meant every story create failed. Fixed: one
                // consistent field, youtubeUrl, used throughout.
                'youtubeUrl' => ['required', 'string'],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please fill all required fields',
                ], 400);
            }

            $story = Story::create([
                'student_name' => $request->input('studentName'),
                'country' => $request->input('country'),
                'university' => $request->input('university'),
                'course' => $request->input('course'),
                'title' => $request->input('title'),
                'description' => $request->input('description', ''),
                'youtube_url' => $request->input('youtubeUrl'),
                'thumbnail' => $request->input('thumbnail', ''),
                'is_featured' => (bool) $request->input('isFeatured', false),
                'sort_order' => (int) $request->input('sortOrder', 0),
                'created_by' => $request->user()->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Story created successfully',
                'story' => $story,
            ], 201);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Server Error',
            ], 500);
        }
    }

    // GET /api/story
    public function index(): JsonResponse
    {
        $stories = Story::where('is_active', true)->orderBy('sort_order')->get();

        return response()->json([
            'success' => true,
            'count' => $stories->count(),
            'stories' => $stories,
        ]);
    }

    // GET /api/story/{id}
    public function show(string $id): JsonResponse
    {
        $story = Story::find($id);

        if (! $story) {
            return response()->json([
                'success' => false,
                'message' => 'Story not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'story' => $story,
        ]);
    }

    // PATCH /api/story/{id}
    public function update(Request $request, string $id): JsonResponse
    {
        $story = Story::find($id);

        if (! $story) {
            return response()->json([
                'success' => false,
                'message' => 'Story not found',
            ], 404);
        }

        $map = [
            'studentName' => 'student_name',
            'country' => 'country',
            'university' => 'university',
            'course' => 'course',
            'title' => 'title',
            'description' => 'description',
            'youtubeUrl' => 'youtube_url',
            'thumbnail' => 'thumbnail',
            'isFeatured' => 'is_featured',
            'isActive' => 'is_active',
            'sortOrder' => 'sort_order',
        ];

        foreach ($map as $incoming => $column) {
            if ($request->has($incoming)) {
                $story->{$column} = $request->input($incoming);
            }
        }

        $story->save();

        return response()->json([
            'success' => true,
            'message' => 'Story updated successfully',
            'story' => $story,
        ]);
    }

    // DELETE /api/story/{id}
    public function destroy(string $id): JsonResponse
    {
        $story = Story::find($id);

        if (! $story) {
            return response()->json([
                'success' => false,
                'message' => 'Story not found',
            ], 404);
        }

        $story->delete();

        return response()->json([
            'success' => true,
            'message' => 'Story deleted successfully',
        ]);
    }
}
