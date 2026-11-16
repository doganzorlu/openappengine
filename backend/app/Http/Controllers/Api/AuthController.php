<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiToken;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * User Login with user_code OR email + password
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $login = trim($request->input('login'));
        $password = $request->input('password');

        $user = User::where('user_code', $login)
            ->orWhere('email', $login)
            ->with('sites')
            ->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Hatalı kullanıcı kodu / e-posta veya parola.',
            ], 401);
        }

        // Generate unique token
        $plainToken = Str::random(60);
        $user->apiTokens()->create([
            'token' => hash('sha256', $plainToken),
            'name' => 'Web Session (' . $request->ip() . ')',
            'expires_at' => now()->addDays(30),
        ]);

        $roles = [];
        foreach ($user->sites as $site) {
            $roles[$site->slug] = $site->pivot->role;
        }

        return response()->json([
            'success' => true,
            'message' => 'Giriş başarılı.',
            'token' => $plainToken,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'user_code' => $user->user_code,
                'email' => $user->email,
                'is_super_admin' => $user->is_super_admin,
                'roles' => $roles,
            ],
        ]);
    }

    /**
     * Get authenticated user info
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false], 401);
        }

        $user->load('sites');
        $roles = [];
        foreach ($user->sites as $site) {
            $roles[$site->slug] = $site->pivot->role;
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'user_code' => $user->user_code,
                'email' => $user->email,
                'is_super_admin' => $user->is_super_admin,
                'roles' => $roles,
            ],
        ]);
    }

    /**
     * Logout and revoke current token
     */
    public function logout(Request $request): JsonResponse
    {
        $token = $request->bearerToken();
        if ($token) {
            ApiToken::where('token', hash('sha256', $token))
                ->orWhere('token', $token)
                ->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Oturum kapatıldı.',
        ]);
    }
}
