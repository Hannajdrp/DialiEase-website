<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StaffDashboardController extends Controller
{
 public function getDashboardData()
{
    $user = auth()->user();
    
    if (!$user || !in_array($user->userLevel, ['staff', 'nurse'])) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }

    $currentDate = Carbon::now()->format('Y-m-d');
    $yesterday = Carbon::yesterday()->format('Y-m-d');
    $tomorrow = Carbon::tomorrow()->format('Y-m-d');
    $nextWeek = Carbon::now()->addDays(7)->format('Y-m-d');
    
    // First, check for and process any missed appointments
    $this->processMissedAppointments();
    
    // All schedules for the staff member
    $allSchedules = DB::table('patients')
        ->join('users', 'patients.userID', '=', 'users.userID')
        ->join('schedule', 'patients.patientID', '=', 'schedule.patient_id')
        ->select(
            'patients.patientID',
            'users.first_name',
            'users.last_name',
            'patients.hospitalNumber',
            'schedule.checkup_status',
            'schedule.appointment_date',
            'users.date_of_birth',
            'schedule.schedule_id',
            'schedule.confirmation_status',
            'schedule.reschedule_requested_date',
            'schedule.reschedule_reason',
            'schedule.checkup_remarks',
            'schedule.new_appointment_date',
            'schedule.missed_count'
        )
        ->orderBy('schedule.appointment_date', 'asc')
        ->get();

    // Today's scheduled patients
    $patientsToday = $allSchedules->filter(function ($schedule) use ($currentDate) {
        return $schedule->appointment_date && 
               Carbon::parse($schedule->appointment_date)->format('Y-m-d') === $currentDate;
    })->values();

    // Tomorrow's scheduled patients
    $patientsTomorrow = $allSchedules->filter(function ($schedule) use ($tomorrow) {
        return $schedule->appointment_date && 
               Carbon::parse($schedule->appointment_date)->format('Y-m-d') === $tomorrow;
    })->values();

    // Next week's patients
    $nextWeekPatients = $allSchedules->filter(function ($schedule) use ($currentDate, $nextWeek) {
        if (!$schedule->appointment_date) return false;
        $appointmentDate = Carbon::parse($schedule->appointment_date);
        return $appointmentDate->between($currentDate, $nextWeek);
    })->values();

    // Confirmed patients (all upcoming)
    $confirmedPatients = $allSchedules->filter(function ($schedule) use ($currentDate) {
        return $schedule->confirmation_status === 'confirmed' && 
               Carbon::parse($schedule->appointment_date)->gte($currentDate);
    })->values();

    // Pending reschedule requests
    $rescheduledPatients = $allSchedules->filter(function ($schedule) {
        return $schedule->confirmation_status === 'pending_reschedule';
    })->values();

    // Upcoming appointments (next 7 days)
    $upcomingAppointments = $allSchedules->filter(function ($schedule) use ($currentDate, $nextWeek) {
        if (!$schedule->appointment_date) return false;
        $appointmentDate = Carbon::parse($schedule->appointment_date);
        return $appointmentDate->between($currentDate, $nextWeek) &&
               $schedule->confirmation_status === 'confirmed';
    })->values();

    // Get all unrescheduled missed appointments (past appointments with Pending status)
    $unrescheduledMissed = $allSchedules->filter(function ($schedule) use ($currentDate) {
        return $schedule->appointment_date && 
               Carbon::parse($schedule->appointment_date)->format('Y-m-d') < $currentDate &&
               $schedule->checkup_status === 'Pending' &&
               empty($schedule->checkup_remarks);
    })->values();

    // Get yesterday's specifically for the notification - using direct DB query for consistency
    $yesterdaysUnrescheduled = DB::table('schedule')
        ->whereDate('appointment_date', $yesterday)
        ->where('checkup_status', 'Pending')
        ->whereNull('checkup_remarks')
        ->count();

    // Patient statistics (last 6 months)
    $patientStats = DB::table('schedule')
        ->select(
            DB::raw('DATE_FORMAT(appointment_date, "%Y-%m") as month'),
            DB::raw('COUNT(*) as count')
        )
        ->where('appointment_date', '>=', Carbon::now()->subMonths(6))
        ->groupBy('month')
        ->orderBy('month', 'asc')
        ->get();

    // Counts for different statuses
    $counts = [
        'pending' => $allSchedules->where('checkup_status', 'Pending')->count(),
        'completed' => $allSchedules->where('checkup_status', 'Completed')->count(),
        'missed' => $allSchedules->where('checkup_status', 'Missed')->count(),
        'unrescheduled' => $unrescheduledMissed->count(),
        'yesterday_unrescheduled' => $yesterdaysUnrescheduled // Using the consistent DB count
    ];

    return response()->json([
        'allSchedules' => $allSchedules,
        'patientsToday' => $patientsToday,
        'patientsTomorrow' => $patientsTomorrow,
        'nextWeekPatients' => $nextWeekPatients,
        'confirmedPatients' => $confirmedPatients,
        'rescheduledPatients' => $rescheduledPatients,
        'upcomingAppointments' => $upcomingAppointments,
        'patientStats' => $patientStats,
        'counts' => $counts,
        'currentDate' => $currentDate,
        'unrescheduledMissed' => $unrescheduledMissed,
        'yesterdaysUnrescheduled' => $yesterdaysUnrescheduled,
    ]);
}

public function rescheduleMissedBatch(Request $request)
{
    $validated = $request->validate([
        'schedule_ids' => 'required|array',
        'schedule_ids.*' => 'integer'
    ]);

    $successCount = 0;
    $errors = [];

    foreach ($validated['schedule_ids'] as $schedule_id) {
        try {
            $missedAppointment = DB::table('schedule')
                ->where('schedule_id', $schedule_id)
                ->first();

            if (!$missedAppointment) {
                $errors[] = "Appointment $schedule_id not found";
                continue;
            }

            // Calculate new appointment date (28 days from missed date)
            $missedDate = Carbon::parse($missedAppointment->appointment_date);
            $newDate = $missedDate->copy()->addDays(28);

            // Check daily limit
            $dailyCount = DB::table('schedule')
                ->whereDate('appointment_date', $newDate)
                ->where('confirmation_status', 'confirmed')
                ->count();

            $dailyLimit = 80;
            if ($dailyCount >= $dailyLimit) {
                $newDate->addDay();
            }

            // Calculate next appointment date
            $nextAppointmentDate = $newDate->copy()->addDays(28);

            DB::table('schedule')
                ->where('schedule_id', $schedule_id)
                ->update([
                    'appointment_date' => $newDate,
                    'new_appointment_date' => $nextAppointmentDate,
                    'missed_count' => DB::raw('missed_count + 1'),
                    'checkup_status' => 'Pending',
                    'confirmation_status' => 'confirmed',
                    'checkup_remarks' => 'Automatically rescheduled from missed appointment'
                ]);

            $successCount++;
        } catch (\Exception $e) {
            $errors[] = "Failed to reschedule appointment $schedule_id: " . $e->getMessage();
        }
    }

    return response()->json([
        'success' => true,
        'message' => "Successfully rescheduled $successCount appointments",
        'errors' => $errors
    ]);
}

 private function processMissedAppointments()
    {
        $now = Carbon::now();
        
        // Only process missed appointments after 10 PM
        if ($now->hour < 22) {
            return;
        }

        $yesterday = Carbon::yesterday()->format('Y-m-d');
        
        // Get all appointments that were yesterday and still pending
        $missedAppointments = DB::table('schedule')
            ->whereDate('appointment_date', $yesterday)
            ->where('checkup_status', 'Pending')
            ->whereNull('checkup_remarks')
            ->get();

        foreach ($missedAppointments as $appointment) {
            // Calculate new appointment date (28 days from today)
            $newAppointmentDate = Carbon::now()->addDays(28)->format('Y-m-d');
            
            // Check if the new date has reached the daily limit
            $dailyCount = DB::table('schedule')
                ->whereDate('appointment_date', $newAppointmentDate)
                ->where('confirmation_status', 'confirmed')
                ->count();

            $dailyLimit = 80;
            if ($dailyCount >= $dailyLimit) {
                // If limit reached, try the next day
                $newAppointmentDate = Carbon::parse($newAppointmentDate)->addDay()->format('Y-m-d');
            }

            // Calculate next appointment date (28 days after new appointment)
            $nextAppointmentDate = Carbon::parse($newAppointmentDate)->addDays(28)->format('Y-m-d');

            // Mark the original appointment as missed
            DB::table('schedule')
                ->where('schedule_id', $appointment->schedule_id)
                ->update([
                    'checkup_status' => 'Missed',
                    'checkup_remarks' => 'Patient missed appointment on ' . 
                        Carbon::parse($appointment->appointment_date)->format('F j, Y') . 
                        '. Automatically rescheduled to ' . Carbon::parse($newAppointmentDate)->format('F j, Y'),
                    'appointment_date' => $newAppointmentDate,
                    'new_appointment_date' => $nextAppointmentDate,
                ]);
        }
    }


    public function markAsCompleted(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|integer',
        ]);

        DB::table('schedule')
            ->where('patient_id', $validated['patient_id'])
            ->whereDate('appointment_date', Carbon::today())
            ->update(['checkup_status' => 'Completed']);

        return response()->json(['success' => true]);
    }

public function rescheduleMissedAppointment(Request $request)
{
    $validated = $request->validate([
        'schedule_id' => 'required|integer',
    ]);

    // Get the missed appointment
    $missedAppointment = DB::table('schedule')
        ->where('schedule_id', $validated['schedule_id'])
        ->first();

    if (!$missedAppointment) {
        return response()->json(['error' => 'Appointment not found'], 404);
    }

    // Calculate new appointment date (28 days from missed date)
    $missedDate = Carbon::parse($missedAppointment->appointment_date);
    $newDate = $missedDate->copy()->addDays(28);

    // Check if the new date has reached the daily limit
    $dailyCount = DB::table('schedule')
        ->whereDate('appointment_date', $newDate)
        ->where('confirmation_status', 'confirmed')
        ->count();

    $dailyLimit = 80;
    if ($dailyCount >= $dailyLimit) {
        // If limit reached, try the next day
        $newDate->addDay();
    }

    // Calculate next appointment date (28 days after new date)
    $nextAppointmentDate = $newDate->copy()->addDays(28);

    // Update the appointment
    DB::table('schedule')
        ->where('schedule_id', $validated['schedule_id'])
        ->update([
            'appointment_date' => $newDate,
            'new_appointment_date' => $nextAppointmentDate,
            'missed_count' => DB::raw('missed_count + 1'),
            'checkup_status' => 'Pending',
            'confirmation_status' => 'confirmed'
        ]);

    return response()->json(['success' => true]);
}

public function getMissedAppointments()
{
    $user = auth()->user();
    
    if (!$user || !in_array($user->userLevel, ['staff', 'nurse'])) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }

    $today = Carbon::today()->format('Y-m-d');
    
    $missedAppointments = DB::table('schedule')
        ->join('patients', 'schedule.patient_id', '=', 'patients.patientID')
        ->join('users', 'patients.userID', '=', 'users.userID')
        ->whereDate('schedule.appointment_date', '<', $today)
        ->where('schedule.checkup_status', 'Pending')
        ->whereNull('schedule.checkup_remarks')
        ->select(
            'schedule.schedule_id',
            'users.first_name',
            'users.last_name',
            'users.date_of_birth',
            'patients.hospitalNumber',
            'schedule.appointment_date',
            'schedule.checkup_status',
            'schedule.missed_count',
            'schedule.new_appointment_date',
            'schedule.reschedule_reason' // Add this line to include the reason
        )
        ->get();

    return response()->json([
        'count' => $missedAppointments->count(),
        'appointments' => $missedAppointments
    ]);
}


    public function approveReschedule(Request $request)
    {
        $validated = $request->validate([
            'schedule_id' => 'required|integer',
            'approve' => 'required|boolean'
        ]);

        $schedule = DB::table('schedule')
            ->where('schedule_id', $validated['schedule_id'])
            ->first();

        if (!$schedule) {
            return response()->json(['error' => 'Schedule not found'], 404);
        }

        if ($validated['approve']) {
            // Check if the new date has reached the daily limit
            $newDate = Carbon::parse($schedule->reschedule_requested_date)->format('Y-m-d');
            $dailyCount = DB::table('schedule')
                ->whereDate('appointment_date', $newDate)
                ->where('confirmation_status', 'confirmed')
                ->count();

            $dailyLimit = 80;
            if ($dailyCount >= $dailyLimit) {
                return response()->json([
                    'error' => 'The daily patient limit has been reached for the selected date'
                ], 400);
            }

            DB::table('schedule')
                ->where('schedule_id', $validated['schedule_id'])
                ->update([
                    'appointment_date' => $schedule->reschedule_requested_date,
                    'confirmation_status' => 'confirmed',
                    'reschedule_request_date' => null,
                    'reschedule_requested_date' => null,
                    'reschedule_reason' => null
                ]);
        } else {
            DB::table('schedule')
                ->where('schedule_id', $validated['schedule_id'])
                ->update([
                    'confirmation_status' => 'pending',
                    'reschedule_request_date' => null,
                    'reschedule_requested_date' => null,
                    'reschedule_reason' => null
                ]);
        }

        return response()->json(['success' => true]);
    }

    public function getRescheduleRequests()
    {
        $user = auth()->user();
        
        if (!$user || !in_array($user->userLevel, ['staff', 'nurse'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $requests = DB::table('schedule')
            ->join('patients', 'schedule.patient_id', '=', 'patients.patientID')
            ->join('users', 'patients.userID', '=', 'users.userID')
            ->select(
                'schedule.schedule_id',
                'schedule.appointment_date',
                'schedule.new_appointment_date',
                'schedule.reschedule_requested_date',
                'schedule.reschedule_reason',
                'schedule.reschedule_request_date',
                'schedule.confirmation_status',
                'users.first_name',
                'users.last_name',
                'patients.hospitalNumber'
            )
            ->whereNotNull('reschedule_requested_date')
            ->orWhere(function($query) {
                $query->where('confirmation_status', 'pending_reschedule')
                      ->whereNotNull('reschedule_request_date');
            })
            ->orderBy('reschedule_request_date', 'desc')
            ->get();

        return response()->json($requests);
    }
}