<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Models\Patient;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use PDF;

class SavePrescriptionController extends Controller
{
    public function generatePrescription(Request $request)
    {
        try {
            $validated = $request->validate([
                'patientName' => 'required|string',
                'patientHospitalNumber' => 'nullable|string',
                'medicines' => 'required|array|min:1',
                'medicines.*.name' => 'required|string',
                'medicines.*.dosage' => 'required|string',
                'medicines.*.frequency' => 'required|string',
                'medicines.*.duration' => 'required|string',
                'additional_instructions' => 'nullable|string',
                'pd_data' => 'nullable|array'
            ]);

            $doctor = auth()->user();
            if (!$doctor) {
                throw new \Exception("User not authenticated");
            }

            // Find or create patient
            $patient = null;
            if (!empty($validated['patientHospitalNumber'])) {
                $patient = Patient::where('hospitalNumber', $validated['patientHospitalNumber'])->first();
                
                if (!$patient) {
                    // Create new patient if not found
                    $patient = Patient::create([
                        'hospitalNumber' => $validated['patientHospitalNumber'],
                        'AccStatus' => 'active',
                        'TermsAndCondition' => 'accepted',
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);

                    $this->logAudit($doctor->userID, 
                        "Created new patient with hospital number: {$validated['patientHospitalNumber']}"
                    );
                }
            }

            // Generate PDF data
            $pdfData = [
                'patient' => [
                    'name' => $validated['patientName'],
                    'hospitalNumber' => $validated['patientHospitalNumber'] ?? null
                ],
                'medicines' => $validated['medicines'],
                'additional_instructions' => $validated['additional_instructions'] ?? '',
                'pd_data' => $validated['pd_data'] ?? null,
                'doctor' => [
                    'name' => $doctor->first_name . ' ' . $doctor->last_name,
                    'specialization' => $doctor->specialization ?? 'General Physician',
                ],
                'date' => now()->format('F j, Y'),
                'time' => now()->format('g:i A')
            ];

            // Generate PDF
            $pdf = PDF::loadView('prescription', $pdfData);
            $pdfContent = $pdf->output();

            // Generate unique filename
            $fileName = 'prescriptions/prescription_' . time() . '_' . uniqid() . '.pdf';

            // Store the PDF file
            Storage::put($fileName, $pdfContent);

            // Save to database
            $prescriptionData = [
                'userID' => $doctor->userID, // Add the doctor's userID here
                'prescription_file' => $fileName,
                'pd_data' => json_encode($validated['pd_data'] ?? null),
                'prescription_blob' => $pdfContent,
                'created_at' => now(),
                'updated_at' => now()
            ];

            // Add patientID if available
            if ($patient) {
                $prescriptionData['patientID'] = $patient->patientID;
            }

            $prescription = Prescription::create($prescriptionData);

            // Log the prescription creation
            $this->logAudit($doctor->userID, 
                "Created prescription #{$prescription->id} for " . 
                ($patient ? "patient {$patient->hospitalNumber}" : "new patient")
            );

            return response()->json([
                'success' => true,
                'message' => 'Prescription saved successfully',
                'prescription_id' => $prescription->id,
                'file_path' => $fileName
            ]);

        } catch (\Exception $e) {
            Log::error('Prescription generation failed: ' . $e->getMessage());
            
            // Log the failed attempt if we have the doctor info
            if (isset($doctor)) {
                $this->logAudit($doctor->userID, 
                    "Failed to create prescription: " . $e->getMessage()
                );
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate prescription: ' . $e->getMessage()
            ], 500);
        }
    }

    public function generatePdf(Request $request)
    {
        try {
            $validated = $request->validate([
                'patientName' => 'required|string',
                'patientHospitalNumber' => 'nullable|string',
                'medicines' => 'required|array|min:1',
                'medicines.*.name' => 'required|string',
                'medicines.*.dosage' => 'required|string',
                'medicines.*.frequency' => 'required|string',
                'medicines.*.duration' => 'required|string',
                'additional_instructions' => 'nullable|string',
                'pd_data' => 'nullable|array'
            ]);

            $doctor = auth()->user();
            if (!$doctor) {
                Log::warning('PDF generation blocked: unauthenticated');
                return response()->json([
                    'success' => false,
                    'message' => 'User is not authenticated'
                ], 401);
            }

            $pdfData = [
                'patient' => [
                    'name' => $validated['patientName'],
                    'hospitalNumber' => $validated['patientHospitalNumber'] ?? null
                ],
                'medicines' => $validated['medicines'],
                'additional_instructions' => $validated['additional_instructions'] ?? '',
                'pd_data' => $validated['pd_data'] ?? null,
                'doctor' => [
                    'name' => $doctor->first_name . ' ' . $doctor->last_name,
                    'specialization' => $doctor->specialization ?? 'General Physician',
                ],
                'date' => now()->format('F j, Y'),
                'time' => now()->format('g:i A')
            ];

            $pdf = PDF::loadView('prescription', $pdfData);
            
            // Log the PDF preview generation
            $this->logAudit($doctor->userID, 
                "Generated PDF preview for patient: {$validated['patientName']}" . 
                ($validated['patientHospitalNumber'] ? " (HN: {$validated['patientHospitalNumber']})" : "")
            );

            return $pdf->stream('prescription_preview.pdf');

        } catch (\Exception $e) {
            Log::error('PDF generation failed: ' . $e->getMessage());
            
            if (isset($doctor)) {
                $this->logAudit($doctor->userID, 
                    "Failed to generate PDF preview: " . $e->getMessage()
                );
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate PDF: ' . $e->getMessage()
            ], 500);
        }
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