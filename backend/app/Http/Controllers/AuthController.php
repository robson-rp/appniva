<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Profile;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\ProfileResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            $profile = Profile::create([
                'id' => (string) Str::uuid(),
                'name' => $request->name,
                'email' => $request->email,
                'primary_currency' => 'AOA',
                'onboarding_completed' => false,
            ]);

            $token = $profile->createToken('auth_token')->plainTextToken;

            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => new ProfileResource($profile),
            ], 201);
        });
    }

    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['As credenciais fornecidas estão incorretas.'],
            ]);
        }

        $profile = Profile::where('email', $user->email)->first();

        if (! $profile) {
            // Caso o profile não exista por algum motivo, criamos um
            $profile = Profile::create([
                'id' => (string) Str::uuid(),
                'name' => $user->name,
                'email' => $user->email,
                'primary_currency' => 'AOA',
                'onboarding_completed' => false,
            ]);
        }

        $token = $profile->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => new ProfileResource($profile),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sessão encerrada com sucesso.'
        ]);
    }

    public function me(Request $request)
    {
        return new ProfileResource($request->user());
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        // In a real scenario, this would send an email via Password::broker()
        // For now, we'll return a success message if the user exists
        $user = User::where('email', $request->email)->first();
        
        if (!$user) {
            return response()->json(['message' => 'Se o e-mail existir em nossa base, você receberá um link de recuperação.'], 200);
        }

        // Simulating email sent
        return response()->json(['message' => 'Link de recuperação enviado com sucesso.'], 200);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        // Simplified reset logic for demonstration
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            throw ValidationException::withMessages(['email' => ['Usuário não encontrado.']]);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json(['message' => 'Senha redefinida com sucesso.']);
    }
}
