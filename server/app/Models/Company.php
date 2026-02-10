<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $fillable = [
        'company_name',
        'ice',
        'company_size',
        'cnss_employer_number',
        'address',
        'city',
        'phone',
        'email',
        'logo_url',
        'status',
    ];

    public function employees()
    {
        return $this->hasMany(Employee::class, 'company_id');
    }

    public function users()
    {
        return $this->hasMany(User::class, 'company_id');
    }
}
