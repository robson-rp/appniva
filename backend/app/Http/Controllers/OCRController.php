<?php

namespace App\Http\Controllers;

use App\Services\OCRService;
use App\Services\CategorizationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class OCRController extends Controller
{
    public function __construct(
        protected OCRService $ocrService,
        protected CategorizationService $categorizationService
    ) {}

    /**
     * Process receipt image
     */
    public function processReceipt(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:10240', // 10MB max
        ]);

        // Store uploaded image
        $path = $request->file('image')->store('receipts', 'local');
        $fullPath = Storage::disk('local')->path($path);

        // Extract text
        $ocrResult = $this->ocrService->extractTextFromImage($fullPath);

        if (!$ocrResult['success']) {
            return response()->json([
                'error' => 'Failed to extract text from image',
                'message' => $ocrResult['error'] ?? 'Unknown error',
            ], 422);
        }

        // Parse receipt data
        $receiptData = $this->ocrService->parseReceipt($ocrResult['text']);

        // Suggest category
        $suggestedCategory = $this->ocrService->suggestCategory($receiptData);

        return response()->json([
            'success' => true,
            'receipt_data' => $receiptData,
            'suggested_category_id' => $suggestedCategory,
            'ocr_confidence' => $ocrResult['confidence'],
        ]);
    }

    /**
     * Parse text to receipt
     */
    public function parseText(Request $request)
    {
        $request->validate([
            'text' => 'required|string|min:10',
        ]);

        $receiptData = $this->ocrService->parseReceipt($request->text);
        $suggestedCategory = $this->ocrService->suggestCategory($receiptData);

        return response()->json([
            'success' => true,
            'receipt_data' => $receiptData,
            'suggested_category_id' => $suggestedCategory,
        ]);
    }
}
