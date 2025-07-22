<?php


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\ProviderController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\PatientRegistrationController;
use App\Http\Controllers\staff_PatientListController;
use App\Http\Controllers\StaffSchedulingController;
use App\Http\Controllers\TreatmentController;
use App\Http\Controllers\PatientsController;
use App\Http\Controllers\PatientDashboardController;
use App\Http\Controllers\PatientScheduleController;
use App\Http\Controllers\DoctorTreatmentController;
use App\Http\Controllers\StaffDashboardController;
use App\Http\Controllers\View_ScheduleController;
use App\Http\Controllers\Treatments_Controller;
use App\Http\Controllers\IotController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\HCPRegisterController;
use App\Http\Controllers\ValidateEmployeeController;
use App\Http\Controllers\OTPController;
use App\Http\Controllers\PatientTreatmentController;
use App\Http\Controllers\DoctorDashboardController;
use App\Http\Controllers\LabResultController;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\DoctorCheckupController;
use App\Http\Controllers\StaffPatientTreatmentController;
use App\Http\Controllers\staff_PDtreatmentController;
use App\Http\Controllers\PatientScheduleListController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\StaffProfileController;

use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\SavePrescriptionController;

use App\Http\Controllers\ADMIN_ADDHCproviderController;


// Public Routes
Route::post('/login', [LoginController::class, 'login'])->name('api.login');

Route::post('/validate-employee', [RegisterController::class, 'validateEmployee']);
Route::post('/employee-register', [RegisterController::class, 'employeeRegister']);
Route::post('/employee-change-credentials', [RegisterController::class, 'employeeChangeCredentials']);
Route::get('/verify-email/{token}', [RegisterController::class, 'verifyEmail']);


//prescription and medicine routes
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('prescriptions')->group(function () {
        Route::get('/', [PrescriptionController::class, 'index']);
        Route::post('/medicines', [PrescriptionController::class, 'storeMedicine']);
        
    });
});



Route::middleware('auth:api')->group(function() {
    Route::post('/prescriptions/generate', [SavePrescriptionController::class, 'generatePrescription']);
    Route::post('/prescriptions/generate-pdf', [SavePrescriptionController::class, 'generatePdf']);
});


// Patient Registration Routes
Route::post('/validate-employee', [RegisterController::class, 'validateEmployee']);
Route::post('/send-otp', [RegisterController::class, 'sendOTP']);
Route::post('/verify-otp', [RegisterController::class, 'verifyOTP']);
Route::post('/employee-register', [RegisterController::class, 'employeeRegister']);
Route::post('/employee-change-credentials', [RegisterController::class, 'employeeChangeCredentials']);
Route::get('/verify-email/{token}', [RegisterController::class, 'verifyEmail']);
// Protected Routes (Requires Sanctum Authentication)
Route::middleware('auth:sanctum')->group(function () {
    // User route
    Route::get('/user', function (Request $request) {
        return response()->json([
            'success' => true,
            'user' => $request->user()
        ]);
    });
    
    Route::post('/logout', [LoginController::class, 'logout']);

        // Providers
        Route::prefix('providers')->group(function () {
            Route::get('/', [ProviderController::class, 'index']);
            Route::post('/', [ProviderController::class, 'store']);
            Route::put('/{id}', [ProviderController::class, 'update']);
            Route::put('/{id}/deactivate', [ProviderController::class, 'deactivate']);
            Route::put('/{id}/activate', [ProviderController::class, 'activate']);
        });
    });

// Patient List
Route::get('/patients', [staff_PatientListController::class, 'index']);
Route::put('/patients/{id}/archive', [staff_PatientListController::class, 'archivePatient'])->middleware('auth:sanctum');
Route::get('/patient-history/{id}', [staff_PatientListController::class, 'getPatientHistory'])->middleware('auth:sanctum');

// Audit Log
Route::post('/audit-logs', function(Request $request) {
    $user = $request->user();
    
    DB::table('audittrail')->insert([
        'userID' => $user->userID,
        'action' => $request->action,
        'timestamp' => now()
    ]);
    
    return response()->json(['message' => 'Audit log created']);
})->middleware('auth:sanctum');

    // Admin Routes
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard-stats', [AdminController::class, 'getDashboardStats']);
        Route::get('/patient-list', [PatientController::class, 'index']);
        Route::get('/audit-logs', [AuditLogController::class, 'index']);
    });

// Doctor Routes
Route::prefix('doctor')->middleware('auth:sanctum')->group(function () {
    Route::get('/patient-treatments', [DoctorTreatmentController::class, 'getPatientTreatments']);
    Route::get('/all-patient-treatments', [DoctorTreatmentController::class, 'getAllPatientTreatments']);
});

// Patient Routes
Route::prefix('patient')->middleware('auth:sanctum')->group(function () {
    // Dashboard routes
    Route::get('/dashboard', [PatientDashboardController::class, 'getDashboardData']);
    
    // Treatment routes
    Route::prefix('/treatments')->group(function () {
        Route::get('/', [TreatmentController::class, 'getPatientTreatments']);
        Route::post('/', [TreatmentController::class, 'startTreatment']);
        Route::post('/{id}/complete', [TreatmentController::class, 'completeTreatment']);
        Route::get('/today-count', [TreatmentController::class, 'getTodayTreatmentCount']);
        Route::get('/ongoing', [PatientDashboardController::class, 'getOngoingTreatment']);
        Route::get('/recent', [PatientDashboardController::class, 'getRecentTreatments']);
    });

    // Checkup routes
    Route::get('/upcoming-checkups', [PatientScheduleController::class, 'getUpcomingCheckups']);
});

Route::middleware('auth:sanctum')->group(function () {
    // Staff Dashboard
    Route::get('/staff/dashboard', [StaffDashboardController::class, 'getDashboardData']);
    Route::post('/staff/mark-completed', [StaffDashboardController::class, 'markAsCompleted']);
    Route::post('/staff/mark-notifications-read', [StaffDashboardController::class, 'markNotificationsAsRead']);
    Route::post('/staff/reschedule-missed', [StaffDashboardController::class, 'rescheduleMissedAppointment']);
    Route::post('/staff/reschedule-missed-batch', [StaffDashboardController::class, 'rescheduleMissedBatch']);
    Route::get('/staff/reschedule-requests', [StaffDashboardController::class, 'getRescheduleRequests']);
    Route::get('/staff/missed-appointments', [StaffDashboardController::class, 'getMissedAppointments']);
    
    // View schedules
    Route::get('/View_schedulesList', [View_ScheduleController::class, 'index']);
    Route::patch('/schedules/{schedule}/status', [View_ScheduleController::class, 'updateStatus']);
});



Route::post('/patient/check-email', [PatientRegistrationController::class, 'checkEmail']);
Route::post('/patient/send-otp', [PatientRegistrationController::class, 'sendOtp']);
Route::post('/patient/verify-otp', [PatientRegistrationController::class, 'verifyOtp']);
Route::get('/schedules/available-dates', [PatientRegistrationController::class, 'getAvailableDates']);
Route::post('/patient/register', [PatientRegistrationController::class, 'registerPatient']);
Route::post('/patient/generate-certificate', [PatientRegistrationController::class, 'generateCertificate']);


Route::prefix('patient')->group(function () {
    Route::post('/send-phone-otp', [PatientRegistrationController::class, 'sendPhoneOtp']);
    Route::post('/verify-phone-otp', [PatientRegistrationController::class, 'verifyPhoneOtp']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::prefix('patient/treatments')->group(function () {
        
        Route::middleware('auth:sanctum')->post('/patient/treatments', [Treatments_Controller::class, 'startTreatment']);
        Route::get('/history', [Treatments_Controller::class, 'getTreatmentHistory']);
        Route::get('/{id}', [Treatments_Controller::class, 'getTreatmentDetails']);
        Route::post('/complete', [Treatments_Controller::class, 'endTreatment']);
    });
});



// Route::prefix('patient')->middleware('auth:api')->group(function() {
//     Route::post('/treatments/end', [Treatments_Controller::class, 'endTreatment']);
//     Route::get('/patient/treatments/ongoing', [Treatments_Controller::class, 'checkOngoingTreatment']);
// });

Route::middleware('auth:sanctum')->group(function () {
    // Patient schedule routes
    Route::prefix('patient')->group(function () {
        Route::get('/upcoming-checkups', [PatientScheduleController::class, 'getUpcomingCheckups']);
        Route::post('/request-reschedule', [PatientScheduleController::class, 'requestReschedule']);
    });
});


Route::middleware(['auth:sanctum'])->group(function () {
    // Patient schedule routes
    Route::prefix('patient')->group(function () {
        Route::get('/upcoming-checkups', [PatientScheduleController::class, 'upcomingCheckups']);
        Route::get('/confirmation-status', [PatientScheduleController::class, 'confirmationStatus']);
        Route::post('/daily-limit-status', [PatientScheduleController::class, 'dailyLimitStatus']);
        Route::post('/confirm-appointment', [PatientScheduleController::class, 'confirmAppointment']);
        Route::post('/request-reschedule', [PatientScheduleController::class, 'requestReschedule']);
    });
});


Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::prefix('admin')->middleware(['auth:api'])->group(function () {
    // Healthcare providers routes
    Route::get('/providers', [ProviderController::class, 'index']);
    Route::post('/providers', [ProviderController::class, 'store']);
    Route::put('/providers/{id}', [ProviderController::class, 'update']);
    Route::put('/providers/{id}/activate', [ProviderController::class, 'activate']);
    Route::put('/providers/{id}/deactivate', [ProviderController::class, 'deactivate']);
    
});


Route::middleware('auth:sanctum')->group(function () {
    // User profile routes
    Route::get('/profile', [UserController::class, 'getProfile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    
    // Admin-only route
    Route::get('/users/{id}', [UserController::class, 'getUser'])->middleware('can:view,user');
});

// routes/api.php
Route::prefix('admin')->group(function () {
    Route::get('/generate-numbers', [ProviderController::class, 'generateNumbers']);
    Route::post('/admin/providers', [ProviderController::class, 'store'])->middleware('auth:api');
 
});


//for staff and nurse access to patient schedules
Route::middleware('auth:sanctum')->group(function () {
    // Patient schedules routes
    Route::prefix('patient-schedules')->group(function () {
        Route::get('/', [PatientScheduleListController::class, 'index']);
        Route::get('/upcoming', [PatientScheduleListController::class, 'upcoming']);
        Route::get('/missed', [PatientScheduleListController::class, 'missed']);
        Route::get('/completed', [PatientScheduleListController::class, 'completed']);
    });
});


//Admin Dashboard Routes
Route::middleware(['auth:sanctum'])->group(function() {
    Route::prefix('admin')->group(function() {
        // Dashboard stats
        Route::get('/dashboard-stats', [AdminDashboardController::class, 'getDashboardStats']);
        Route::get('/appointment-counts', [AdminDashboardController::class, 'getAppointmentCounts']);
        
        // Reminders
        Route::get('/reminders', [AdminDashboardController::class, 'getReminders']);
        Route::post('/reminders', [AdminDashboardController::class, 'addReminder']);
        Route::put('/reminders/{id}', [AdminDashboardController::class, 'updateReminder']);
        Route::delete('/reminders/{id}', [AdminDashboardController::class, 'deleteReminder']);
    });
});



Route::prefix('iot')->group(function () {
    Route::get('health', [IotController::class, 'health']);
    Route::get('device-status', [IotController::class, 'getDeviceStatus']);
    Route::get('weight', [IotController::class, 'getWeight']);
    Route::get('status', [IotController::class, 'getStatus']);
    
    Route::post('weight', [IotController::class, 'storeWeight']);
    Route::post('status', [IotController::class, 'updateStatus']);
    Route::post('device-status', [IotController::class, 'updateDeviceStatus']);
    Route::post('connect', [IotController::class, 'connectDevice']);
});



Route::middleware('auth:api')->group(function () {
    Route::get('/patient/terms-status', [PatientRegistrationController::class, 'checkTermsStatus']);
    Route::post('/patient/accept-terms', [PatientRegistrationController::class, 'acceptTerms']);
    // ... your other routes ...
});


Route::post('/validate-employee', [ValidateEmployeeController::class, 'validateEmployee']);
Route::post('/send-otp', [OTPController::class, 'sendOTP']);
Route::post('/verify-otp', [OTPController::class, 'verifyOTP']);
Route::post('/hcp-register', [HCPRegisterController::class, 'register']);



Route::middleware(['auth:sanctum'])->group(function () {
    // Treatment history routes
    Route::get('/patient/treatments', [PatientTreatmentController::class, 'getTreatments']);
    Route::get('/patient/treatments/stats', [PatientTreatmentController::class, 'getTreatmentStats']);
});

//for staff and nurse access to patient treatments
Route::middleware(['auth:sanctum'])->prefix('v1')->group(function() {
    Route::get('/staff-patient-treatments/{patientId}', 
        [StaffPatientTreatmentController::class, 'staffGetPatientTreatments']);
    
    Route::get('/staff-patient-treatments-stats/{patientId}', 
        [StaffPatientTreatmentController::class, 'staffGetTreatmentStats']);
});

Route::middleware('auth:api')->group(function () {
    // Staff PD Treatments routes
    Route::get('/staff/treatments', [staff_PDtreatmentController::class, 'getAllTreatments']);
    Route::get('/staff/treatments/patient/{patientId}', [staff_PDtreatmentController::class, 'getPatientTreatments']);
});


Route::middleware(['auth:sanctum'])->group(function () {
    // Doctor Dashboard Routes
    Route::prefix('doctor')->group(function () {
        Route::get('/dashboard', [DoctorDashboardController::class, 'getDashboardData']);
        Route::post('/mark-completed', [DoctorDashboardController::class, 'markAsCompleted']);
        Route::post('/approve-reschedule', [DoctorDashboardController::class, 'approveReschedule']);
        Route::post('/create-prescription', [DoctorDashboardController::class, 'createPrescription']);
    });
});

Route::post('/upload-lab-result', [LabResultController::class, 'upload']);



Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    // Healthcare provider registration routes
    Route::post('pre-register-hcprovider', [ADMIN_ADDHCproviderController::class, 'preRegisterHCprovider']);
    Route::post('register-hcprovider', [ADMIN_ADDHCproviderController::class, 'registerHCprovider']);
    
    Route::get('generate-pre-register-pdf/{userID}', [ADMIN_ADDHCproviderController::class, 'generatePreRegisterPDF']);
    Route::get('generate-full-register-pdf/{userID}', [ADMIN_ADDHCproviderController::class, 'generateFullRegisterPDF']);
    
    //don't change this route because it is already working in other files
    Route::get('providers', [ADMIN_ADDHCproviderController::class, 'listProviders']);
});

// Staff Profile Routes

Route::middleware(['auth:sanctum'])->group(function () {
    // Staff profile routes
    Route::prefix('staff')->group(function () {
        Route::get('/profile', [StaffProfileController::class, 'getProfile']);
        Route::post('/profile/update', [StaffProfileController::class, 'updateProfile']);
    });
});



Route::post('/forgot-password', [ForgotPasswordController::class, 'sendOtp']);
Route::post('/verify-otp', [ForgotPasswordController::class, 'verifyOtp']);
Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);
Route::post('/resend-otp', [ForgotPasswordController::class, 'resendOtp']);



Route::middleware(['auth:sanctum'])->group(function () {
    Route::group(['middleware' => ['doctor']], function () {
        // Checkup management
        Route::get('/doctor/checkup', [DoctorCheckupController::class, 'getCheckupData']);
        Route::post('/doctor/start-checkup', [DoctorCheckupController::class, 'startCheckup']);
        Route::post('/doctor/complete-checkup', [DoctorCheckupController::class, 'completeCheckup']);
        
        // Prescription management
        Route::get('/patient/{patientId}/prescriptions', [DoctorCheckupController::class, 'getPatientPrescriptions']);
        Route::post('/doctor/submit-prescription', [DoctorCheckupController::class, 'submitPrescription']);
    });
});