<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Schedule;
use App\Models\Patient;
use App\Models\User;
use App\Models\Prescription;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class DoctorDashboardController extends Controller
{
   public function getDashboardData()
{
    try {
        // Get all schedules for patients (userLevel = 'patient') with patient and user data
        $allSchedules = Schedule::with(['patient.user', 'patient', 'patient.schedules' => function($query) {
            $query->where('appointment_date', '>', Carbon::now())
                  ->orderBy('appointment_date', 'asc')
                  ->limit(1);
        }])
        ->whereHas('patient.user', function($query) {
            $query->where('userLevel', 'patient');
        })
        ->orderBy('appointment_date', 'asc')
        ->get()
        ->map(function ($schedule) {
            $nextAppointment = $schedule->patient->schedules->first();
            
            return [
                'schedule_id' => $schedule->schedule_id,
                'patient_id' => $schedule->patient_id,
                'patientID' => $schedule->patient_id,
                'first_name' => $schedule->patient->user->first_name,
                'last_name' => $schedule->patient->user->last_name,
                'hospitalNumber' => $schedule->patient->hospitalNumber,
                'appointment_date' => $schedule->appointment_date,
                'confirmation_status' => $schedule->confirmation_status,
                'checkup_status' => $schedule->checkup_status,
                'remarks' => $schedule->remarks,
                'reschedule_requested_date' => $schedule->reschedule_requested_date,
                'reschedule_reason' => $schedule->reschedule_reason,
                'doctor_id' => $schedule->userID,
                // Add patient demographic information
                'gender' => $schedule->patient->user->gender,
                'date_of_birth' => $schedule->patient->user->date_of_birth,
                'phone_number' => $schedule->patient->user->phone_number,
                'email' => $schedule->patient->user->email,
                'address' => $schedule->patient->user->address,

                // Add next appointment if exists
                'next_appointment' => $nextAppointment ? $nextAppointment->appointment_date : null,
            ];
        });


        // Get today's date
        $today = Carbon::today()->toDateString();
        
        // Filter today's patients
        $patientsToday = $allSchedules->filter(function ($schedule) use ($today) {
            return Carbon::parse($schedule['appointment_date'])->isToday();
        })->values();

        // Get upcoming appointments (next 7 days)
        $upcomingAppointments = $allSchedules->filter(function ($schedule) {
            return Carbon::parse($schedule['appointment_date'])->isFuture();
        })->take(7)->values();

        // Get confirmed patients
        $confirmedPatients = $allSchedules->filter(function ($schedule) {
            return $schedule['confirmation_status'] === 'confirmed';
        })->values();

        // Get rescheduled patients
        $rescheduledPatients = $allSchedules->filter(function ($schedule) {
            return $schedule['confirmation_status'] === 'pending_reschedule';
        })->values();

        // Counts for stats
        $counts = [
            'pending' => $allSchedules->where('checkup_status', 'Pending')->count(),
            'in_progress' => $allSchedules->where('checkup_status', 'In Progress')->count(),
            'completed' => $allSchedules->where('checkup_status', 'Completed')->count(),
        ];

        return response()->json([
            'success' => true,
            'allSchedules' => $allSchedules,
            'patientsToday' => $patientsToday,
            'appointments' => $upcomingAppointments,
            'confirmedPatients' => $confirmedPatients,
            'rescheduledPatients' => $rescheduledPatients,
            'counts' => $counts,
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch dashboard data: ' . $e->getMessage()
        ], 500);
    }
}

    public function markAsCompleted(Request $request)
    {
        try {
            $request->validate([
                'patient_id' => 'required|integer|exists:schedule,patient_id',
            ]);

            // Find the schedule for this patient
            $schedule = Schedule::where('patient_id', $request->patient_id)
                ->firstOrFail();

            // Update the checkup status
            $schedule->checkup_status = 'Completed';
            $schedule->save();

            return response()->json([
                'success' => true,
                'message' => 'Patient marked as completed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark as completed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function approveReschedule(Request $request)
    {
        try {
            $request->validate([
                'schedule_id' => 'required|integer|exists:schedule,schedule_id',
                'approve' => 'required|boolean',
            ]);

            // Find the schedule
            $schedule = Schedule::findOrFail($request->schedule_id);

            if ($request->approve) {
                // Approve the reschedule
                $schedule->appointment_date = $schedule->reschedule_requested_date;
                $schedule->confirmation_status = 'confirmed';
                $schedule->reschedule_requested_date = null;
                $schedule->reschedule_reason = null;
                $schedule->save();
            } else {
                // Reject the reschedule
                $schedule->confirmation_status = 'confirmed';
                $schedule->reschedule_requested_date = null;
                $schedule->reschedule_reason = null;
                $schedule->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Reschedule request ' . ($request->approve ? 'approved' : 'rejected') . ' successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process reschedule request: ' . $e->getMessage()
            ], 500);
        }
    }

    public function createPrescription(Request $request)
    {
        try {
            $request->validate([
                'patient_id' => 'required|integer|exists:patient,patientID',
                'prescription_text' => 'nullable|string',
                'prescription_file' => 'nullable|file|mimes:pdf,jpg,png|max:2048',
            ]);

            $doctorId = Auth::id();

            $prescriptionData = [
                'userID' => $doctorId,
                'patient_ID' => $request->patient_id,
                'prescription_date' => now(),
            ];

            if ($request->has('prescription_text')) {
                $prescriptionData['prescription_text'] = $request->prescription_text;
            }

            if ($request->hasFile('prescription_file')) {
                $file = $request->file('prescription_file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $file->storeAs('prescriptions', $fileName, 'public');
                $prescriptionData['prescription_file'] = $fileName;
            }

            Prescription::create($prescriptionData);

            return response()->json([
                'success' => true,
                'message' => 'Prescription created successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create prescription: ' . $e->getMessage()
            ], 500);
        }
    }
}