<?php

namespace App\Http\Controllers;

use App\Http\Resources\CompanyResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $fields = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string'
        ]);

        $user = User::create([
            'email' => $fields['email'],
            'name' => $fields['name'],
            'password' => Hash::make($fields['password'])
        ]);

        $user->assignRole('admin');

        Auth::login($user);
        $request->session()->regenerate();

        return response(['message' => 'User registered successfully'], 201);
    }

    public function login(Request $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $request->session()->regenerate();

        return response(['message' => 'Success'], 200);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        
        $company = $user->company;


        if (!$company) {
            return response()
                ->json(['user' => new UserResource($user)], 200);
        }

        return response()
            ->json(['user' => new UserResource($user), 'company' => new CompanyResource($company)], 200);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response(['message' => 'Logged out successfully'], 200);
    }
}
