<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'patient_id',
        'prescription_file',
        'prescription_date',
        'additional_instructions',
        'medicines_data',
        'pd_data'
    ];

    protected $casts = [
        'medicines_data' => 'array',
        'pd_data' => 'array'
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}