<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class DoctorTreatmentController extends Controller
{
    public function getPatientTreatments(Request $request)
    {
        $search = $request->query('search', '');
        $dateFrom = $request->query('date_from', '');
        $dateTo = $request->query('date_to', '');
        $status = $request->query('status', 'all');
        $statsPeriod = $request->query('stats_period', '7d');

        // Get the authenticated user
        $user = Auth::user();

        // Verify the user is a doctor
        if ($user->userLevel !== 'doctor') {
            return response()->json([
                'success' => false,
                'message' => 'Only doctors can access patient treatments'
            ], 403);
        }

        // Calculate date range based on stats period
        $dateRange = $this->calculateDateRange($statsPeriod);

        // First get all patients (even those without treatments)
        $patients = DB::table('patients as p')
            ->select(
                'p.patientID',
                'p.hospitalNumber',
                'p.legalRepresentative',
               
                DB::raw("CONCAT(u.first_name, ' ', COALESCE(u.middle_name, ''), ' ', u.last_name) AS name"),
                'u.first_name',
                'u.middle_name',
                'u.last_name',
                'u.date_of_birth',
                'u.gender'
            )
            ->join('users as u', 'p.userID', '=', 'u.userID')
            ->where('u.userLevel', 'patient')
            ->orderBy('name')
            ->get();

        if (!empty($search) && strlen($search) >= 2) {
            $patients = $patients->filter(function($patient) use ($search) {
                return stripos($patient->name, $search) !== false || 
                       stripos($patient->hospitalNumber, $search) !== false ||
                       stripos($patient->legalRepresentative, $search) !== false;
            });
        }

        $patientIds = $patients->pluck('patientID')->toArray();

        // Now get treatments for these patients
        $treatmentsQuery = DB::table('treatment as t')
            ->select(
                't.patientID',
                't.Treatment_ID',
                't.treatmentDate',
                't.TreatmentStatus',
                'i.VolumeIn',
                'o.VolumeOut',
                'o.Color'
            )
            ->leftJoin('insolution as i', 't.IN_ID', '=', 'i.IN_ID')
            ->leftJoin('outsolution as o', 't.OUT_ID', '=', 'o.OUT_ID')
            ->whereIn('t.patientID', $patientIds);

        if (!empty($dateFrom)) {
            $treatmentsQuery->whereDate('t.treatmentDate', '>=', $dateFrom);
        } else if ($dateRange['from']) {
            $treatmentsQuery->whereDate('t.treatmentDate', '>=', $dateRange['from']);
        }

        if (!empty($dateTo)) {
            $treatmentsQuery->whereDate('t.treatmentDate', '<=', $dateTo);
        } else if ($dateRange['to']) {
            $treatmentsQuery->whereDate('t.treatmentDate', '<=', $dateRange['to']);
        }

        $treatments = $treatmentsQuery->get()
            ->groupBy('patientID');

        // Combine patients with their treatments
        $patientsWithTreatments = [];
        foreach ($patients as $patient) {
            $patientTreatments = isset($treatments[$patient->patientID]) ? 
                $treatments[$patient->patientID]->map(function($treatment) {
                    return [
                        'Treatment_ID' => $treatment->Treatment_ID,
                        'treatmentDate' => $treatment->treatmentDate,
                        'TreatmentStatus' => $treatment->TreatmentStatus,
                        'VolumeIn' => $treatment->VolumeIn,
                        'VolumeOut' => $treatment->VolumeOut,
                        'Color' => $treatment->Color
                    ];
                })->toArray() : [];

            $patientsWithTreatments[] = [
                'patientID' => $patient->patientID,
                'name' => trim($patient->name),
                'middle_name' => $patient->middle_name,
                'hospitalNumber' => $patient->hospitalNumber,
                'date_of_birth' => $patient->date_of_birth,
                'gender' => $patient->gender,
                'legalRepresentative' => $patient->legalRepresentative,
             
                'treatments' => $patientTreatments
            ];
        }

        // Calculate summary statistics
        $summary = [
            'total_patients' => count($patientsWithTreatments),
            'total_treatments' => array_sum(array_map(function($patient) {
                return count($patient['treatments']);
            }, $patientsWithTreatments)),
            'non_compliant_patients' => 0,
            'fluid_retention_alerts' => 0,
            'abnormal_color_alerts' => 0,
            'severe_retention_cases' => 0
        ];

        foreach ($patientsWithTreatments as &$patient) {
            $treatmentDates = [];
            $severeRetentionDays = 0;
            
            foreach ($patient['treatments'] as $treatment) {
                $date = Carbon::parse($treatment['treatmentDate'])->toDateString();
                if (!isset($treatmentDates[$date])) {
                    $treatmentDates[$date] = [
                        'count' => 0,
                        'completed' => 0,
                        'retentionCount' => 0
                    ];
                }
                $treatmentDates[$date]['count']++;
                
                // Check for fluid retention
                $volumeIn = $treatment['VolumeIn'] ?? 0;
                $volumeOut = $treatment['VolumeOut'] ?? 0;
                if (($volumeOut - $volumeIn) < 0) {
                    $treatmentDates[$date]['retentionCount']++;
                }
                
                if (strtolower($treatment['TreatmentStatus']) === 'finished') {
                    $treatmentDates[$date]['completed']++;
                }
            }

            // Calculate compliance
            $incompleteDays = 0;
            foreach ($treatmentDates as $date => $data) {
                if ($data['completed'] < 3 && Carbon::parse($date)->isBefore(now()->startOfDay())) {
                    $incompleteDays++;
                }
                
                // Check for severe retention (all treatments in a day show retention)
                if ($data['retentionCount'] === $data['count'] && $data['count'] > 0) {
                    $severeRetentionDays++;
                }
            }

            $patient['incompleteDays'] = $incompleteDays;
            $patient['severeRetentionDays'] = $severeRetentionDays;
            
            // Calculate fluid retention alerts
            $totalVolumeIn = array_sum(array_column($patient['treatments'], 'VolumeIn'));
            $totalVolumeOut = array_sum(array_column($patient['treatments'], 'VolumeOut'));
            $treatmentCount = count($patient['treatments']);
            $avgVolumeIn = $treatmentCount > 0 ? $totalVolumeIn / $treatmentCount : 0;
            $avgVolumeOut = $treatmentCount > 0 ? $totalVolumeOut / $treatmentCount : 0;
            
            if (($avgVolumeIn - $avgVolumeOut) > 200) {
                $summary['fluid_retention_alerts']++;
            }

            // Calculate abnormal color alerts
            $abnormalColors = array_filter($patient['treatments'], function($treatment) {
                $color = strtolower($treatment['Color'] ?? '');
                return !empty($color) && !in_array($color, ['clear', 'yellow', 'amber']);
            });
                
            if (count($abnormalColors) > 0) {
                $summary['abnormal_color_alerts']++;
            }

            // Count severe retention cases
            if ($severeRetentionDays > 0) {
                $summary['severe_retention_cases']++;
            }

            // Count as non-compliant if any incomplete days
            if ($incompleteDays > 0) {
                $summary['non_compliant_patients']++;
            }
        }

        // Filter patients based on status
        if ($status === 'non-compliant') {
            $patientsWithTreatments = array_filter($patientsWithTreatments, function($patient) {
                return $patient['incompleteDays'] > 0;
            });
        } elseif ($status === 'abnormal') {
            $patientsWithTreatments = array_filter($patientsWithTreatments, function($patient) use ($summary) {
                $totalVolumeIn = array_sum(array_column($patient['treatments'], 'VolumeIn'));
                $totalVolumeOut = array_sum(array_column($patient['treatments'], 'VolumeOut'));
                $treatmentCount = count($patient['treatments']);
                $avgVolumeIn = $treatmentCount > 0 ? $totalVolumeIn / $treatmentCount : 0;
                $avgVolumeOut = $treatmentCount > 0 ? $totalVolumeOut / $treatmentCount : 0;
                $fluidDifference = $avgVolumeIn - $avgVolumeOut;
                
                $hasAbnormalColor = count(array_filter($patient['treatments'], function($treatment) {
                    $color = strtolower($treatment['Color'] ?? '');
                    return !empty($color) && !in_array($color, ['clear', 'yellow', 'amber']);
                })) > 0;
                
                return $patient['incompleteDays'] > 0 || 
                       $fluidDifference > 200 ||
                       $hasAbnormalColor ||
                       $patient['severeRetentionDays'] > 0;
            });
        }

        return response()->json([
            'success' => true,
            'patients' => array_values($patientsWithTreatments),
            'summary' => $summary
        ]);
    }

    private function calculateDateRange($period)
    {
        $now = Carbon::now();
        
        switch ($period) {
            case '1d':
                return ['from' => $now->subDay()->toDateString(), 'to' => null];
            case '7d':
                return ['from' => $now->subDays(7)->toDateString(), 'to' => null];
            case '30d':
                return ['from' => $now->subDays(30)->toDateString(), 'to' => null];
            case '90d':
                return ['from' => $now->subDays(90)->toDateString(), 'to' => null];
            default:
                return ['from' => null, 'to' => null];
        }
    }
}