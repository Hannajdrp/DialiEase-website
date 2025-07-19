<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $primaryKey = 'userID';
    protected $keyType = 'int'; // Changed from string to int
    public $incrementing = true; // Changed from false to true

    protected $fillable = [
        'userID',
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'email',
        'employeeNumber',
        'date_of_birth',
        'gender',
        'phone_number',
        'specialization',
        'profile_image',
        'EmpAddress',
        'EmpStatus',
        'reg_number',
        'status',
        'userLevel',
        'custom_user_level',
        'password',
        'reset_token',
        'reset_expires',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'reset_token',
    ];

    public function patient()
    {
        return $this->hasOne(Patient::class, 'userID', 'userID');
    }

    public function isAdmin()
    {
        return $this->userLevel === 'admin';
    }

    public function empStatus()
    {
        return $this->hasOne(EmpStatus::class, 'userID', 'userID');
    }

    public function getFullNameAttribute()
    {
        return trim("{$this->first_name} {$this->last_name}");
    }
}