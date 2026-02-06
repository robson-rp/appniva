<?php

namespace App\Http\Controllers;

use App\Models\DailyRecommendation;
use App\Http\Requests\StoreDailyRecommendationRequest;
use App\Http\Requests\UpdateDailyRecommendationRequest;
use App\Http\Resources\DailyRecommendationResource;
use Illuminate\Http\Request;

class DailyRecommendationController extends Controller
{
    public function index(Request $request)
    {
        $today = now()->format('Y-m-d');
        $recommendation = DailyRecommendation::where('user_id', $request->user()->id)
            ->where('generated_at', $today)
            ->first();

        if (!$recommendation) {
            $recommendation = $this->generateForUser($request->user());
        }

        return new DailyRecommendationResource($recommendation);
    }

    public function generate(Request $request)
    {
        $today = now()->format('Y-m-d');
        DailyRecommendation::where('user_id', $request->user()->id)
            ->where('generated_at', $today)
            ->delete();

        $recommendation = $this->generateForUser($request->user());
        
        return new DailyRecommendationResource($recommendation);
    }

    private function generateForUser($user)
    {
        $today = now();
        $userId = $user->id;

        // Simplified generation logic for now (can be expanded)
        $totalBalance = \App\Models\Account::where('user_id', $userId)->where('is_active', true)->sum('current_balance');
        
        if ($totalBalance < 0) {
            return DailyRecommendation::create([
                'user_id' => $userId,
                'title' => 'Atenção Urgente',
                'message' => 'O teu saldo total está negativo. Revê as tuas despesas.',
                'action_label' => 'Ver Contas',
                'action_route' => '/accounts',
                'priority' => 'high',
                'generated_at' => $today->format('Y-m-d'),
            ]);
        }

        // Check for upcoming debts
        $upcomingDebt = \App\Models\Debt::where('user_id', $userId)
            ->where('status', 'active')
            ->whereNotNull('next_payment_date')
            ->whereDate('next_payment_date', '<=', $today->copy()->addDays(5))
            ->whereDate('next_payment_date', '>=', $today)
            ->first();

        if ($upcomingDebt) {
            return DailyRecommendation::create([
                'user_id' => $userId,
                'title' => 'Pagamento Próximo',
                'message' => "A prestação de \"{$upcomingDebt->name}\" vence em breve.",
                'action_label' => 'Ver Dívida',
                'action_route' => '/debts',
                'priority' => 'high',
                'generated_at' => $today->format('Y-m-d'),
            ]);
        }

        // Default
        return DailyRecommendation::create([
            'user_id' => $userId,
            'title' => 'Vê o Teu Score',
            'message' => 'Descobre como está a tua saúde financeira.',
            'action_label' => 'Ver Score',
            'action_route' => '/score',
            'priority' => 'low',
            'generated_at' => $today->format('Y-m-d'),
        ]);
    }
}
