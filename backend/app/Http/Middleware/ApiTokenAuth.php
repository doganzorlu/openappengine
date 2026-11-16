<?php

namespace App\Http\Middleware;

use App\Models\ApiToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiTokenAuth
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Yetkilendirme başlığı (Bearer token) bulunamadı.',
            ], 401);
        }

        $apiToken = ApiToken::where('token', hash('sha256', $token))
            ->orWhere('token', $token)
            ->first();

        if (!$apiToken || !$apiToken->user) {
            return response()->json([
                'success' => false,
                'message' => 'Geçersiz veya süresi dolmuş oturum jetonu.',
            ], 401);
        }

        // Update last used at
        $apiToken->update(['last_used_at' => now()]);

        // Bind user to request
        $request->setUserResolver(fn () => $apiToken->user);

        return $next($request);
    }
}
