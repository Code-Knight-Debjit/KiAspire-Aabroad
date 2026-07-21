<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Throwable;

class AdminController extends Controller
{
    // POST /api/admin/login
    public function login(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => ['required', 'string', 'email'],
                'password' => ['required', 'string'],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => $validator->errors()->first() === 'The email field must be a valid email address.'
                        ? 'Please enter a valid email address'
                        : 'Email and password are required',
                ], 400);
            }

            $email = strtolower(trim((string) $request->input('email')));
            $password = (string) $request->input('password');

            $admin = User::where('email', $email)->where('role', 'admin')->first();

            if (! $admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid admin email or password',
                ], 401);
            }

            if (! $admin->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your admin account is inactive',
                ], 403);
            }

            if (! $admin->password || ! Hash::check($password, $admin->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid admin email or password',
                ], 401);
            }

            $admin->forceFill(['last_login' => now()])->save();

            $token = $admin->createToken('admin-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Admin login successful',
                'token' => $token,
                'admin' => [
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'email' => $admin->email,
                    'phone' => $admin->phone,
                    'role' => $admin->role,
                    'lastLogin' => $admin->last_login,
                ],
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Server error. Please try again.',
            ], 500);
        }
    }

    // GET /api/admin/profile
    public function profile(Request $request): JsonResponse
    {
        // $request->user() already has password/remember_token hidden
        // via the model's $hidden — no leak here.
        return response()->json([
            'success' => true,
            'admin' => $request->user(),
        ]);
    }

    // GET /api/admin/users
    public function getAllUsers(): JsonResponse
    {
        $users = User::where('role', 'user')->orderByDesc('created_at')->get();

        return response()->json([
            'success' => true,
            'count' => $users->count(),
            'users' => $users,
        ]);
    }

    // GET /api/admin/users/{id}
    public function getUserById(string $id): JsonResponse
    {
        $user = User::where('id', $id)->where('role', 'user')->first();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'user' => $user,
        ]);
    }

    // PATCH /api/admin/users/{id}/status
    public function updateUserStatus(Request $request, string $id): JsonResponse
    {
        if (! is_bool($request->input('isActive'))) {
            return response()->json([
                'success' => false,
                'message' => 'isActive must be true or false',
            ], 400);
        }

        $user = User::where('id', $id)->where('role', 'user')->first();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        $user->is_active = $request->boolean('isActive');
        $user->save();

        return response()->json([
            'success' => true,
            'message' => $user->is_active
                ? 'User activated successfully'
                : 'User deactivated successfully',
            'user' => $user,
        ]);
    }

    // DELETE /api/admin/users/{id}
    public function deleteUser(string $id): JsonResponse
    {
        $user = User::where('id', $id)->where('role', 'user')->first();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully',
        ]);
    }
}
