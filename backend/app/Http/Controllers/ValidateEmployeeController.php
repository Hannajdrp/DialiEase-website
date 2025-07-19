<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ValidateEmployeeController extends Controller
{
    public function validateEmployee(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employeeNumber' => 'required|string|max:20',
            'registrationCode' => 'required|string|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        $user = User::where('employeeNumber', $request->employeeNumber)
                   ->where('reg_number', $request->registrationCode)
                   ->where('EmpStatus', 'pre-register')
                   ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid employee number or registration code'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'employeeNumber' => $user->employeeNumber,
                'firstName' => $user->first_name,
                'lastName' => $user->last_name,
                'phoneNumber' => $user->phone_number,
                'gender' => $user->gender,
                'userLevel' => $user->userLevel,
                'specialization' => $user->specialization,
                'regNumber' => $user->reg_number
            ]
        ]);
    }
}