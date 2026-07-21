<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Throwable;

class ServiceController extends Controller
{
    private function createSlug(string $name): string
    {
        $slug = Str::lower(trim($name));
        $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
        $slug = preg_replace('/\s+/', '-', trim($slug));

        return preg_replace('/-+/', '-', $slug);
    }

    // POST /api/services
    public function store(Request $request): JsonResponse
    {
        try {
            $name = trim((string) $request->input('name', ''));

            if ($name === '') {
                return response()->json([
                    'success' => false,
                    'message' => 'Service name is required',
                ], 400);
            }

            $slug = $this->createSlug($name);

            $existing = Service::where('name', $name)->orWhere('slug', $slug)->first();

            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Service already exists',
                ], 409);
            }

            $service = Service::create([
                'name' => $name,
                'slug' => $slug,
                'description' => trim((string) $request->input('description', '')),
                'icon' => trim((string) $request->input('icon', '')),
                'sort_order' => (int) $request->input('sortOrder', 0),
                'created_by' => $request->user()->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Service created successfully',
                'service' => $service,
            ], 201);
        } catch (QueryException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Service already exists',
            ], 409);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Server error. Please try again.',
            ], 500);
        }
    }

    // GET /api/services
    public function index(): JsonResponse
    {
        $services = Service::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'count' => $services->count(),
            'services' => $services,
        ]);
    }

    // GET /api/services/admin/all
    public function adminIndex(): JsonResponse
    {
        $services = Service::with('creator:id,name,email')
            ->orderBy('sort_order')
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'count' => $services->count(),
            'services' => $services,
        ]);
    }

    // PATCH /api/services/{id}
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $service = Service::find($id);

            if (! $service) {
                return response()->json([
                    'success' => false,
                    'message' => 'Service not found',
                ], 404);
            }

            if ($request->has('name')) {
                $name = trim((string) $request->input('name'));

                if ($name === '') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Service name cannot be empty',
                    ], 400);
                }

                $service->name = $name;
                $service->slug = $this->createSlug($name);
            }

            if ($request->has('description')) {
                $service->description = trim((string) $request->input('description'));
            }

            if ($request->has('icon')) {
                $service->icon = trim((string) $request->input('icon'));
            }

            if (is_bool($request->input('isActive'))) {
                $service->is_active = $request->boolean('isActive');
            }

            if ($request->has('sortOrder')) {
                $service->sort_order = (int) $request->input('sortOrder');
            }

            $service->save();

            return response()->json([
                'success' => true,
                'message' => 'Service updated successfully',
                'service' => $service,
            ]);
        } catch (QueryException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Another service already uses this name',
            ], 409);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Server error. Please try again.',
            ], 500);
        }
    }

    // DELETE /api/services/{id}
    public function destroy(string $id): JsonResponse
    {
        $service = Service::find($id);

        if (! $service) {
            return response()->json([
                'success' => false,
                'message' => 'Service not found',
            ], 404);
        }

        $service->delete();

        return response()->json([
            'success' => true,
            'message' => 'Service deleted successfully',
        ]);
    }
}
