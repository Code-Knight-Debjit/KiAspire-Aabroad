<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Throwable;

class UserController extends Controller
{
    // POST /api/user/register
    public function register(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => ['required', 'string', 'min:3', 'regex:/^[a-zA-Z\s]+$/'],
                'email' => ['required', 'string', 'email'],
                'phone' => ['required', 'string', 'regex:/^(?:\+91|91|0)?[6-9]\d{9}$/'],
            ], [
                'name.required' => 'Name, email and phone are required',
                'email.required' => 'Name, email and phone are required',
                'phone.required' => 'Name, email and phone are required',
                'name.min' => 'Name must contain at least 3 characters',
                'name.regex' => 'Name can contain only letters and spaces',
                'email.email' => 'Please enter a valid email address',
                'phone.regex' => 'Please enter a valid Indian phone number',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => $validator->errors()->first(),
                ], 400);
            }

            $name = trim((string) $request->input('name'));
            $email = strtolower(trim((string) $request->input('email')));
            $phone = trim((string) $request->input('phone'));

            $existingUser = User::where('email', $email)->orWhere('phone', $phone)->first();

            if ($existingUser) {
                $duplicateField = $existingUser->email === $email ? 'Email' : 'Phone';

                return response()->json([
                    'success' => false,
                    'message' => "{$duplicateField} is already registered",
                ], 409);
            }

            $user = User::create([
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'role' => 'user',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User created successfully',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                ],
            ], 201);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Server error. Please try again.',
            ], 500);
        }
    }
}
