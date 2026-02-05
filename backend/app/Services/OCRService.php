<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OCRService
{
    /**
     * Extract text from image using OCR
     */
    public function extractTextFromImage(string $imagePath): array
    {
        try {
            // TODO: Integrate with OCR service (Tesseract, Google Vision, AWS Textract)
            // For now, return mock data
            
            if (!file_exists($imagePath)) {
                throw new \Exception("Image file not found: {$imagePath}");
            }
            
            // Simulate OCR processing
            $extractedText = $this->mockOCRExtraction($imagePath);
            
            return [
                'success' => true,
                'text' => $extractedText,
                'confidence' => 0.95,
            ];
            
        } catch (\Exception $e) {
            Log::error('OCR extraction failed', [
                'image' => $imagePath,
                'error' => $e->getMessage(),
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
    
    /**
     * Parse receipt data from extracted text
     */
    public function parseReceipt(string $text): array
    {
        $data = [
            'merchant' => null,
            'date' => null,
            'total' => null,
            'items' => [],
            'tax' => null,
        ];
        
        // Extract merchant name (usually first line)
        $lines = explode("\n", $text);
        $data['merchant'] = trim($lines[0] ?? '');
        
        // Extract total amount (look for patterns like "Total: 150.00")
        if (preg_match('/total[:\s]+([0-9.,]+)/i', $text, $matches)) {
            $data['total'] = $this->parseAmount($matches[1]);
        }
        
        // Extract date (look for date patterns)
        if (preg_match('/(\d{2}[-\/]\d{2}[-\/]\d{4}|\d{4}[-\/]\d{2}[-\/]\d{2})/', $text, $matches)) {
            $data['date'] = $matches[1];
        }
        
        // Extract tax
        if (preg_match('/tax[:\s]+([0-9.,]+)/i', $text, $matches)) {
            $data['tax'] = $this->parseAmount($matches[1]);
        }
        
        // Extract line items (simplified)
        $data['items'] = $this->extractLineItems($text);
        
        return $data;
    }
    
    /**
     * Parse amount string to float
     */
    private function parseAmount(string $amount): float
    {
        // Remove currency symbols and spaces
        $amount = preg_replace('/[^\d.,]/', '', $amount);
        
        // Convert comma to decimal point
        $amount = str_replace(',', '.', $amount);
        
        return (float) $amount;
    }
    
    /**
     * Extract line items from receipt text
     */
    private function extractLineItems(string $text): array
    {
        $items = [];
        $lines = explode("\n", $text);
        
        foreach ($lines as $line) {
            // Look for patterns like "Item Name 10.00"
            if (preg_match('/^(.+?)\s+([0-9.,]+)$/', trim($line), $matches)) {
                if (strlen($matches[1]) > 3) {
                    $items[] = [
                        'description' => trim($matches[1]),
                        'amount' => $this->parseAmount($matches[2]),
                    ];
                }
            }
        }
        
        return $items;
    }
    
    /**
     * Mock OCR extraction for development
     */
    private function mockOCRExtraction(string $imagePath): string
    {
        return <<<TEXT
SUPERMERCADO ABC
Rua Principal, 123
Luanda, Angola

Data: 05/02/2025
Hora: 14:30

Arroz 5kg         2,500.00
Feijao 1kg        1,200.00
Oleo 1L             800.00
Acucar 1kg          600.00

Subtotal:        5,100.00
IVA (14%):         714.00
Total:           5,814.00

Obrigado pela preferencia!
TEXT;
    }
    
    /**
     * Suggest category based on merchant and items
     */
    public function suggestCategory(array $receiptData): ?int
    {
        $merchant = strtolower($receiptData['merchant'] ?? '');
        $items = $receiptData['items'] ?? [];
        
        // Simple rule-based categorization
        $keywords = [
            'food' => ['supermercado', 'mercado', 'restaurante', 'lanche', 'padaria'],
            'transport' => ['gasolina', 'taxi', 'uber', 'combustivel'],
            'utilities' => ['agua', 'luz', 'energia', 'telefone'],
            'health' => ['farmacia', 'hospital', 'clinica', 'medico'],
        ];
        
        foreach ($keywords as $category => $words) {
            foreach ($words as $word) {
                if (str_contains($merchant, $word)) {
                    // TODO: Map to actual category_id from database
                    return null; // Return category_id
                }
            }
        }
        
        return null;
    }
}
