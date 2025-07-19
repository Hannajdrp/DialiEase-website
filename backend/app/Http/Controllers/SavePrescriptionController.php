<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Prescription;
use PDF;
use Illuminate\Support\Facades\Storage;

class SavePrescriptionController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'medicines' => 'required|array',
            'additional_instructions' => 'nullable|string',
            'pd_data' => 'nullable|array'
        ]);

        try {
            // Get patient data
            $patient = \App\Models\Patient::findOrFail($validated['patient_id']);
            
            // Prepare data for PDF
            $pdfData = [
                'medicines' => $validated['medicines'],
                'pdData' => $validated['pd_data'] ?? null,
                'additionalInstructions' => $validated['additional_instructions'] ?? '',
                'date' => now()->format('Y-m-d H:i:s'),
                'patient' => $patient
            ];

            // Generate PDF
            $pdf = PDF::loadView('prescriptions.pdf', $pdfData);
            
            // Validate PDF generation
            $pdfContent = $pdf->output();
            if (empty($pdfContent)) {
                throw new \Exception("PDF generation failed - empty output");
            }

            // Save PDF to storage
            $fileName = 'prescription_'.$patient->id.'_'.time().'.pdf';
            $filePath = 'prescriptions/'.$fileName;
            
            Storage::makeDirectory('prescriptions');
            Storage::put($filePath, $pdfContent);

            // Create prescription record
            $prescription = Prescription::create([
                'userID' => auth()->id(),
                'patient_ID' => $validated['patient_id'],
                'prescription_file' => $filePath,
                'prescription_date' => now(),
                'additional_instructions' => $validated['additional_instructions'],
                'medicines_data' => json_encode($validated['medicines']),
                'pd_data' => isset($validated['pd_data']) ? json_encode($validated['pd_data']) : null
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Prescription generated successfully',
                'data' => $prescription,
                'pdf_url' => Storage::url($filePath)
            ]);

        } catch (\Exception $e) {
            \Log::error("Prescription generation failed: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate prescription: ' . $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTrace() : null
            ], 500);
        }
    }

    public function show($patientId)
    {
        // Ensure the patient can only see their own prescriptions
        $prescriptions = Prescription::with(['patient', 'doctor'])
            ->where('patient_ID', $patientId)
            ->latest()
            ->get()
            ->map(function($prescription) {
                return [
                    'id' => $prescription->id,
                    'date' => $prescription->prescription_date->format('Y-m-d H:i'),
                    'doctor' => $prescription->doctor->name,
                    'file_url' => Storage::url($prescription->prescription_file),
                    'additional_instructions' => $prescription->additional_instructions,
                    'medicines' => json_decode($prescription->medicines_data, true),
                    'pd_data' => $prescription->pd_data ? json_decode($prescription->pd_data, true) : null
                ];
            });

        return response()->json($prescriptions);
    }
}