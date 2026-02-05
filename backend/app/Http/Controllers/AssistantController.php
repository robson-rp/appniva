<?php

namespace App\Http\Controllers;

use App\Services\AssistantService;
use Illuminate\Http\Request;

class AssistantController extends Controller
{
    public function __construct(
        protected AssistantService $assistantService
    ) {}

    /**
     * Get financial summary
     */
    public function getSummary(Request $request)
    {
        $request->validate([
            'period' => 'nullable|in:week,month,quarter,year',
        ]);

        $summary = $this->assistantService->generateFinancialSummary(
            auth()->user(),
            $request->only(['period'])
        );

        return response()->json($summary);
    }

    /**
     * Ask financial question
     */
    public function askQuestion(Request $request)
    {
        $request->validate([
            'question' => 'required|string|min:5|max:500',
        ]);

        $response = $this->assistantService->answerQuestion(
            auth()->user(),
            $request->question
        );

        return response()->json($response);
    }

    /**
     * Get personalized recommendations
     */
    public function getRecommendations()
    {
        $recommendations = $this->assistantService->generateRecommendations(
            auth()->user()
        );

        return response()->json([
            'recommendations' => $recommendations,
            'count' => count($recommendations),
        ]);
    }
}
