<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    protected $primaryKey = 'patientID';
    public $incrementing = true;
    protected $keyType = 'integer';
    
    protected $fillable = [
        'userID',
        'hospitalNumber',
        'address',
        'legalRepresentative',
        'AccStatus',
        'TermsAndCondition',
    ];

    public $timestamps = false;

public function user()
{
    return $this->belongsTo(User::class, 'userID', 'userID');
}

public function treatments()
{
    return $this->hasMany(Treatment::class, 'patientID', 'patientID');
}

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'patient_id', 'patientID');
    }

}