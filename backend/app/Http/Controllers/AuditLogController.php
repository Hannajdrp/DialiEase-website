<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AuditLog;
use App\Models\User;

class AuditLogController extends Controller
{
    public function index()
    {
        try {
            $logs = AuditLog::with('user')
                ->orderBy('timestamp', 'desc')
                ->get()
                ->map(function ($log) {
                    return [
                        'audit_id' => $log->audit_id,
                        'user_name' => $log->user 
                            ? trim($log->user->first_name . ' ' . ($log->user->middle_name ? $log->user->middle_name . ' ' : '') . $log->user->last_name)
                            : 'System',
                        'user_type' => $log->user 
                            ? ucfirst($log->user->userLevel) 
                            : 'System',
                        'action' => $log->action,
                        'timestamp' => $log->timestamp,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $logs
            ]);
        } catch (\Exception $e) {
            \Log::error('AuditLog Error: '.$e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch audit logs',
                'error' => $e->getMessage() // Remove or mask in production
            ], 500);
        }
    }
}
