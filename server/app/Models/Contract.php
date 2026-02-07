<?php

namespace App\Models;

use App\Enums\ContractType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contract extends Model
{
    /** @use HasFactory<\Database\Factories\ContractFactory> */
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'start_date',
        'end_date',
        'type',
        'status'
    ];
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'type' => ContractType::class
    ];
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
