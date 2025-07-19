<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class HCPRegisterController extends Controller
{
    public function getPreRegisteredData(Request $request)
    {
        $validator = Validator::make($request->all(), [
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

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employeeNumber' => 'required|string|exists:users,employeeNumber',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'middle_name' => 'nullable|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'date_of_birth' => 'nullable|date',
            'EmpAddress' => 'nullable|string|max:500',
            'profile_image' => 'nullable|string', // Accepts base64 encoded string
            'profile_image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048' // Alternative file upload
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

        // Handle profile image
        $profileImagePath = null;
        
        // Option 1: If profile_image (base64 string) is provided
        if ($request->has('profile_image') && $request->profile_image) {
            $profileImagePath = $this->storeBase64Image($request->profile_image);
        }
        // Option 2: If profile_image_file (file upload) is provided
        elseif ($request->hasFile('profile_image_file')) {
            $profileImagePath = $this->storeUploadedImage($request->file('profile_image_file'));
        }

        // Update user with registration data
        $updateData = [
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'middle_name' => $request->middle_name,
            'suffix' => $request->suffix,
            'date_of_birth' => $request->date_of_birth,
            'EmpAddress' => $request->EmpAddress,
            'EmpStatus' => 'registered',
            'status' => 'active',
            'requires_password_setup' => false,
            'email_verified_at' => now()
        ];

        if ($profileImagePath) {
            $updateData['profile_image'] = $profileImagePath;
        }

        $user->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
            'data' => $user->makeHidden(['password'])
        ]);
    }

    /**
     * Store base64 encoded image and return path
     */
  protected function storeBase64Image($base64String)
{
    try {
        // Validate base64 string
        if (!preg_match('/^data:image\/(\w+);base64,/', $base64String, $matches)) {
            throw new \Exception('Invalid base64 image format');
        }

        $extension = strtolower($matches[1]);
        if (!in_array($extension, ['jpeg', 'jpg', 'png', 'gif'])) {
            throw new \Exception('Invalid image type');
        }

        $imageData = base64_decode(preg_replace('/^data:image\/\w+;base64,/', '', $base64String));
        
        if ($imageData === false) {
            throw new \Exception('Base64 decode failed');
        }

        $imageName = 'profile_'.time().'_'.Str::random(10).'.'.$extension;
        $storagePath = 'profile_images/'.$imageName;

        Storage::disk('public')->put($storagePath, $imageData);

        return $storagePath;
    } catch (\Exception $e) {
        \Log::error('Profile image upload failed: '.$e->getMessage());
        return null;
    }
}

protected function storeUploadedImage($imageFile)
{
    try {
        $extension = strtolower($imageFile->getClientOriginalExtension());
        
        if (!in_array($extension, ['jpeg', 'jpg', 'png', 'gif'])) {
            throw new \Exception('Invalid image type');
        }

        $imageName = 'profile_'.time().'_'.Str::random(10).'.'.$extension;
        $storagePath = 'profile_images/'.$imageName;

        // Store with visibility set to public
        Storage::disk('public')->put($storagePath, file_get_contents($imageFile), 'public');

        return $storagePath;
    } catch (\Exception $e) {
        \Log::error('Profile image upload failed: '.$e->getMessage());
        return null;
    }
}
}