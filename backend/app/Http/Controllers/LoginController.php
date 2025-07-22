<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // First check if user exists and is an employee type
        $user = User::where('email', $credentials['email'])->first();

        if (!$user) {
            $this->logAudit(null, "Failed login attempt - email: {$credentials['email']}");
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Check if it's an employee type and has pre-register status
        if (in_array($user->userLevel, ['staff', 'doctor', 'admin', 'distributor'])) {
            if ($user->EmpStatus === 'pre-register') {
                $this->logAudit($user->id, "Attempted login with pre-register status");
                return response()->json([
                    'message' => 'Your account is not yet fully registered. Please complete your registration using the registration code and employee number you received.'
                ], 401);
            }
        }

        // Now attempt authentication
        if (!Auth::attempt($credentials)) {
            $this->logAudit($user->id, "Failed login attempt - invalid password");
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('api-token')->plainTextToken;

        $this->logAudit($user->id, "Successful login");

        return response()->json([
            'token' => $token,
            'user' => $user
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        $userId = $user ? $user->id : null;
        
        // Revoke the token that was used to authenticate the current request
        $request->user()->currentAccessToken()->delete();

        $this->logAudit($userId, "Logged out");

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    private function logAudit($userID, $action)
    {
        try {
            AuditLog::create([
                'userID' => $userID,
                'action' => $action,
                'timestamp' => now()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log audit trail: ' . $e->getMessage());
        }
    }
}