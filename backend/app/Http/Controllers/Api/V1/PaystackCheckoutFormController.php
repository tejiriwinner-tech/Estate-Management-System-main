<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaystackCheckoutFormController extends Controller
{
    /**
     * Charge card via Paystack inline checkout simulation.
     */
    public function charge(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:100',
            'email' => 'required|email',
            'channel' => 'required|string',
            'card' => 'nullable|array',
        ]);

        $reference = 'PST_' . time() . '_' . rand(1000, 9999);

        return response()->json([
            'status' => 'send_otp',
            'reference' => $reference,
            'message' => 'OTP sent to mobile phone linked to card',
            'data' => [
                'reference' => $reference,
                'amount' => $validated['amount'],
                'currency' => 'NGN',
                'channel' => $validated['channel'],
                'customer' => [
                    'email' => $validated['email'],
                ]
            ]
        ]);
    }

    /**
     * Submit OTP verification for 3D Secure Paystack transaction.
     */
    public function submitOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reference' => 'required|string',
            'otp' => 'required|string',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Payment authorized and settled successfully',
            'receipt' => [
                'reference' => $validated['reference'],
                'amount' => 5000,
                'paidAt' => now()->toISOString(),
                'channel' => 'card',
                'serviceName' => 'Estate Utility Bill',
                'residentEmail' => 'demo@paystack.com',
                'residentUnit' => 'LEHN125',
                'status' => 'success',
            ]
        ]);
    }

    /**
     * Verify transaction reference.
     */
    public function verifyReference(string $reference): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'reference' => $reference,
                'status' => 'success',
                'amount' => 5000,
                'gateway_response' => 'Successful',
                'paid_at' => now()->toISOString(),
            ]
        ]);
    }
}
