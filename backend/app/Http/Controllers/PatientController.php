<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function index()
    {
        try {
            $patients = Patient::with('user')->get()->map(function($patient) {
                return [
                    'hospitalNumber' => $patient->hospitalNumber,
                    'name' => $patient->user->first_name . ' ' . $patient->user->last_name,
                    'address' => $patient->address,
                    'age' => $this->calculateAge($patient->user->date_of_birth),
                    'email' => $patient->user->email,
                    'contactNo' => $patient->user->phone_number,
                    'legalRepresentative' => $patient->legalRepresentative,
                    'created_at' => $patient->created_at->format('Y-m-d H:i:s'),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $patients
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch patients',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function calculateAge($birthdate)
    {
        if (!$birthdate) return null;
        
        $birthDate = new \DateTime($birthdate);
        $today = new \DateTime();
        $age = $today->diff($birthDate);
        return $age->y;
    }
}