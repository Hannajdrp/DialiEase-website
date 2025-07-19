<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\PasswordResetOtp;
use Carbon\Carbon;

class ForgotPasswordController extends Controller
{
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ], [
            'email.exists' => 'The provided email is not registered with us.'
        ]);

        $user = User::where('email', $request->email)->first();

        // Generate 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $otpExpires = Carbon::now()->addMinutes(10);

        // Save OTP to user record
        $user->update([
            'reset_token' => $otp,
            'reset_expires' => $otpExpires
        ]);

        // Send OTP email
        Mail::to($user->email)->send(new PasswordResetOtp($otp));

        return response()->json([
            'message' => 'OTP sent successfully',
            'email' => $user->email
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|digits:6'
        ]);

        $user = User::where('email', $request->email)
                    ->where('reset_token', $request->otp)
                    ->where('reset_expires', '>', Carbon::now())
                    ->first();

        if (!$user) {
            return response()->json([
                'message' => 'Invalid or expired OTP',
                'errors' => ['otp' => ['The provided OTP is invalid or has expired.']]
            ], 422);
        }

        return response()->json([
            'message' => 'OTP verified successfully',
            'email' => $user->email,
            'otp' => $request->otp
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|digits:6',
            'newPassword' => 'required|min:6|confirmed'
        ]);

        $user = User::where('email', $request->email)
                    ->where('reset_token', $request->otp)
                    ->where('reset_expires', '>', Carbon::now())
                    ->first();

        if (!$user) {
            return response()->json([
                'message' => 'Invalid or expired OTP',
                'errors' => ['otp' => ['The provided OTP is invalid or has expired.']]
            ], 422);
        }

        if (Hash::check($request->newPassword, $user->password)) {
            return response()->json([
                'message' => 'New password must be different from current password',
                'errors' => ['newPassword' => ['New password must be different from current password']]
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->newPassword),
            'reset_token' => null,
            'reset_expires' => null
        ]);

        return response()->json(['message' => 'Password reset successfully']);
    }

    public function resendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        $user = User::where('email', $request->email)->first();

        // Generate new 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $otpExpires = Carbon::now()->addMinutes(10);

        // Update user record with new OTP
        $user->update([
            'reset_token' => $otp,
            'reset_expires' => $otpExpires
        ]);

        // Resend OTP email
        Mail::to($user->email)->send(new PasswordResetOtp($otp));

        return response()->json([
            'message' => 'OTP resent successfully',
            'email' => $user->email
        ]);
    }
}