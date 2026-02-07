<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    /** @use HasFactory<\Database\Factories\DepartmentFactory> */
    use HasFactory;

    protected $fillable = [
        'company_id',
        'name',
        'code',
        'manager_id',
        'is_active',
    ];

    public function company(){
        return $this->belongsTo(Company::class);
    }

    public function manager(){
        return $this->belongsTo(Employee::class, 'manager_id');
    }

    public function employees(){
        return $this->hasMany(Employee::class);
    }
}