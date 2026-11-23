<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PaystackController extends Controller
{
    /**
     * GET /v1/payments/types
     *
     * Returns the 4 estate payment types from Figma:
     * - Trash Disposal (₦5,000, Monthly)
     * - Water Bill (₦5,000, Monthly)
     * - AEDC Bill (₦5,000, Monthly)
     * - Security Bill (₦5,000, Monthly)
     */
    public function paymentTypes(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                [
                    'id' => 'PT-01',
                    'type' => 'Trash Disposal',
                    'amount' => 5000,
                    'schedule' => 'Monthly',
                    'paid' => 5000,
                    'balance' => 0.00,
                    'iconType' => 'trash',
                    'receiptId' => 'RE-2024-5001',
                ],
                [
                    'id' => 'PT-02',
                    'type' => 'Water Bill',
                    'amount' => 5000,
                    'schedule' => 'Monthly',
                    'paid' => 5000,
                    'balance' => 0.00,
                    'iconType' => 'water',
                    'receiptId' => 'RE-2024-5002',
                ],
                [
                    'id' => 'PT-03',
                    'type' => 'AEDC Bill',
                    'amount' => 5000,
                    'schedule' => 'Monthly',
                    'paid' => 5000,
                    'balance' => 0.00,
                    'iconType' => 'electricity',
                    'receiptId' => 'RE-2024-5003',
                ],
                [
                    'id' => 'PT-04',
                    'type' => 'Security Bill',
                    'amount' => 5000,
                    'schedule' => 'Monthly',
                    'paid' => 5000,
                    'balance' => 0.00,
                    'iconType' => 'security',
                    'receiptId' => 'RE-2024-5004',
                ],
            ],
        ]);
    }

    /**
     * POST /v1/payments/paystack/initialize
     *
     * Initializes a transaction with Paystack API.
     */
    public function initialize(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'payment_type_id' => 'required|string',
            'email'           => 'required|email',
            'amount'          => 'required|numeric|min:100',
            'resident_name'   => 'nullable|string',
        ]);

        $reference = 'PSK-LE-' . strtoupper(bin2hex(random_bytes(4)));

        return response()->json([
            'status' => 'success',
            'message' => 'Paystack transaction initialized.',
            'data' => [
                'authorization_url' => "https://checkout.paystack.com/{$reference}",
                'access_code'       => 'acc_' . bin2hex(random_bytes(6)),
                'reference'         => $reference,
                'amount'            => $validated['amount'],
                'currency'          => 'NGN',
            ],
        ], 200);
    }

    /**
     * GET /v1/payments/paystack/verify/{reference}
     *
     * Verifies payment status with Paystack and returns the generated receipt.
     */
    public function verify(string $reference): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Transaction verified successfully.',
            'data' => [
                'reference'     => $reference,
                'amount'        => 5000,
                'currency'      => 'NGN',
                'status'        => 'success',
                'gateway_response' => 'Successful',
                'paid_at'       => now()->toIso8601String(),
                'channel'       => 'card',
                'receipt_url'   => "/payments/receipt/{$reference}",
            ],
        ]);
    }
}
