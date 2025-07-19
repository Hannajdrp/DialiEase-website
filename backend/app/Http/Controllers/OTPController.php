<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use App\Mail\SendOTP;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class OTPController extends Controller
{
    public function sendOTP(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255|unique:users,email',
            'employeeNumber' => 'required|string|exists:users,employeeNumber'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        $user = User::where('employeeNumber', $request->employeeNumber)
                   ->where('EmpStatus', 'pre-register')
                   ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Employee not found or already registered'
            ], 404);
        }

        // Generate 6-digit numeric OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = Carbon::now()->addMinutes(15);

        // Store OTP in cache
        $cacheKey = 'otp_' . $request->employeeNumber . '_' . $request->email;
        Cache::put($cacheKey, [
            'otp' => $otp,
            'expires_at' => $expiresAt
        ], $expiresAt);

        // Send OTP via email
        Mail::to($request->email)->send(new SendOTP($otp));

        return response()->json([
            'success' => true,
            'message' => 'OTP sent successfully'
        ]);
    }

    public function verifyOTP(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'employeeNumber' => 'required|string',
            'otp' => 'required|string|digits:6' // Ensures exactly 6 digits
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        $cacheKey = 'otp_' . $request->employeeNumber . '_' . $request->email;
        $otpData = Cache::get($cacheKey);

        if (!$otpData || $otpData['otp'] !== $request->otp || Carbon::parse($otpData['expires_at'])->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid OTP or OTP expired'
            ], 400);
        }

        // Clear OTP from cache after successful verification
        Cache::forget($cacheKey);

        return response()->json([
            'success' => true,
            'message' => 'OTP verified successfully'
        ]);
    }
}