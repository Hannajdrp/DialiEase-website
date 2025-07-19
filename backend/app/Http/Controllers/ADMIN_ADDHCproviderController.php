<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use PDF;

class ADMIN_ADDHCproviderController extends Controller
{

public function preRegisterHCprovider(Request $request)
{
    $validator = Validator::make($request->all(), [
        'first_name' => 'required|string|max:255',
        'last_name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'employeeNumber' => 'required|string|unique:users,employeeNumber',
        'userLevel' => 'required|string',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422);
    }

    try {
        $password = Str::random(12);
        
        $userData = [
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'employeeNumber' => $request->employeeNumber,
            'password' => Hash::make($password),
            'phone_number' => '', // Changed to empty string
            'EmpStatus' => 'pre-register',
            'status' => 'inactive',
            'reg_number' => $this->generateRegistrationNumber(),
            'userLevel' => $request->userLevel,
        ];

        $user = User::create($userData);
        $this->logAudit(auth()->id(), 'Pre-registered healthcare provider: ' . $user->full_name);

        return response()->json([
            'message' => 'Healthcare provider pre-registered successfully',
            'userID' => $user->userID,
            'password' => $password
        ], 201);
    } catch (\Exception $e) {
        \Log::error('Registration Error: '.$e->getMessage());
        return response()->json([
            'message' => 'Registration failed',
            'error' => $e->getMessage()
        ], 500);
    }
}

public function registerHCprovider(Request $request)
{
    $validator = Validator::make($request->all(), [
        'first_name' => 'required|string|max:255',
        'middle_name' => 'nullable|string|max:255',
        'last_name' => 'required|string|max:255',
        'suffix' => 'nullable|string|max:50',
        'email' => 'required|email|unique:users,email',
        'employeeNumber' => 'required|string|unique:users,employeeNumber',
        'gender' => 'required|string|in:male,female,other',
        'specialization' => 'nullable|string|max:255',
        'userLevel' => 'required|string',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422);
    }

    try {
        $password = Str::random(12);
        
        $userData = [
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'last_name' => $request->last_name,
            'suffix' => $request->suffix,
            'email' => $request->email,
            'employeeNumber' => $request->employeeNumber,
            'gender' => $request->gender,
            'specialization' => $request->specialization,
            'phone_number' => '', // Changed to empty string
            'password' => Hash::make($password),
            'EmpStatus' => 'pre-signup',
            'status' => 'inactive',
            'reg_number' => $this->generateRegistrationNumber(),
            'userLevel' => $request->userLevel,
        ];

        $user = User::create($userData);
        $this->logAudit(auth()->id(), 'Registered healthcare provider: ' . $user->full_name);

        return response()->json([
            'message' => 'Healthcare provider registered successfully',
            'userID' => $user->userID,
            'password' => $password
        ], 201);
    } catch (\Exception $e) {
        \Log::error('Registration error: ' . $e->getMessage());
        return response()->json([
            'message' => 'Registration failed',
            'error' => $e->getMessage()
        ], 500);
    }
}
    public function generatePreRegisterPDF($userID)
    {
        try {
            $user = User::findOrFail($userID);
            
            $pdf = PDF::loadView('pdf.pre_register', [
                'user' => $user,
                'password' => request()->query('password')
            ]);
            
            return $pdf->stream('pre_register_' . $user->employeeNumber . '.pdf');
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate PDF',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function generateFullRegisterPDF($userID)
    {
        try {
            $user = User::findOrFail($userID);
            
            $pdf = PDF::loadView('pdf.full_register', [
                'user' => $user,
                'password' => request()->query('password')
            ]);
            
            return $pdf->stream('full_register_' . $user->employeeNumber . '.pdf');
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate PDF',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function listProviders()
{
    try {
        $providers = User::where('userLevel', '!=', 'patient')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                // Ensure EmpStatus and Status are included in the response
                return [
                    'userID' => $user->userID,
                    'employeeNumber' => $user->employeeNumber,
                    'first_name' => $user->first_name,
                    'middle_name' => $user->middle_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'phone_number' => $user->phone_number,
                    'specialization' => $user->specialization,
                    'userLevel' => $user->userLevel,
                    'EmpStatus' => $user->EmpStatus ?? 'pre-register', // Default to pre-register if null
                    'status' => $user->status ?? 'inactive', // Default to inactive if null
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                    // Include any other fields you need
                ];
            });

        return response()->json($providers);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to fetch providers',
            'error' => $e->getMessage()
        ], 500);
    }
}

    private function generateRegistrationNumber()
    {
        do {
            $regNumber = 'CAPD-' . date('Y') . '-' . strtoupper(Str::random(6));
        } while (User::where('reg_number', $regNumber)->exists());

        return $regNumber;
    }

    private function logAudit($userID, $action)
    {
        AuditLog::create([
            'userID' => $userID,
            'action' => $action,
            'timestamp' => now()
        ]);
    }


}