<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Medicine;

class MedicineController extends Controller
{
    public function index()
    {
        try {
            $medicines = Medicine::orderBy('name')->get();
            
            return response()->json([
                'success' => true,
                'medicines' => $medicines
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch medicines: ' . $e->getMessage()
            ], 500);
        }
    }

    public function search(Request $request)
    {
        try {
            $query = $request->input('query');
            
            $medicines = Medicine::where('name', 'like', "%$query%")
                ->orWhere('generic_name', 'like', "%$query%")
                ->orderBy('name')
                ->get();
            
            return response()->json([
                'success' => true,
                'medicines' => $medicines
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search medicines: ' . $e->getMessage()
            ], 500);
        }
    }
}