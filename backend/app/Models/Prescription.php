<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    use HasFactory;

    protected $table = 'prescriptions'; // Explicitly defined if table name isn't default plural

    protected $primaryKey = 'id'; // Only needed if different from 'id'

    protected $fillable = [
        'userID',
        'patientID',
        'prescription_file',
    ];

    protected $casts = [
        'prescription_date' => 'datetime',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patientID', 'patientID');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'userID', 'userID'); // Adjusted to match your table schema
    }
}
