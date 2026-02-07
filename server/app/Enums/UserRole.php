<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'admin';
    case EMPLOYE = 'employé';
    case MANAGER = 'manager';

    public function label(): string
    {
        return match ($this) {
            self::ADMIN => "Admin",
            self::EMPLOYE => "Employé",
            self::MANAGER => "Manager",
        };
    }
}
