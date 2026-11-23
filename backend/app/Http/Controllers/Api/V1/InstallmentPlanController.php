<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InstallmentPlanController extends Controller
{
    /**
     * List all installment plans with compliance status.
     */
    public function index(Request $request): JsonResponse
    {
        $installments = [
            [
                'id' => 'ins-001',
                'unitCode' => 'LEHN125',
                'residentName' => 'Adekunle Adeleke',
                'billType' => 'Security Bill',
                'monthTerm' => 'utd',
                'totalBill' => 5000,
                'totalPaid' => 5000,
                'installmentAmount' => 1250,
                'status' => 'paid',
                'paystackPlanCode' => 'PLN_sec_1250_a1',
            ],
            [
                'id' => 'ins-002',
                'unitCode' => 'LEHN126',
                'residentName' => 'Dr. Fatima Bello',
                'billType' => 'Security Bill',
                'monthTerm' => 'utd',
                'totalBill' => 5000,
                'totalPaid' => 5000,
                'installmentAmount' => 1250,
                'status' => 'paid',
                'paystackPlanCode' => 'PLN_sec_1250_b2',
            ],
            [
                'id' => 'ins-003',
                'unitCode' => 'LEHN127',
                'residentName' => 'Chinedu Okafor',
                'billType' => 'Security Bill',
                'monthTerm' => 'utd',
                'totalBill' => 5000,
                'totalPaid' => 5000,
                'installmentAmount' => 1250,
                'status' => 'processing',
                'paystackPlanCode' => 'PLN_sec_1250_c3',
            ],
            [
                'id' => 'ins-004',
                'unitCode' => 'LEHN128',
                'residentName' => 'Sarah Jenkins',
                'billType' => 'Security Bill',
                'monthTerm' => 'utd',
                'totalBill' => 5000,
                'totalPaid' => 5000,
                'installmentAmount' => 1250,
                'status' => 'paid',
                'paystackPlanCode' => 'PLN_sec_1250_d4',
            ],
            [
                'id' => 'ins-005',
                'unitCode' => 'LEHN129',
                'residentName' => 'Engr. Emeka Nwosu',
                'billType' => 'Security Bill',
                'monthTerm' => 'nutd',
                'totalBill' => 5000,
                'totalPaid' => 0,
                'installmentAmount' => 1250,
                'status' => 'default',
                'paystackPlanCode' => 'PLN_sec_1250_e5',
            ],
            [
                'id' => 'ins-006',
                'unitCode' => 'LEHN130',
                'residentName' => 'Chief Olumide Badmus',
                'billType' => 'Security Bill',
                'monthTerm' => 'utd',
                'totalBill' => 5000,
                'totalPaid' => 5000,
                'installmentAmount' => 1250,
                'status' => 'paid',
                'paystackPlanCode' => 'PLN_sec_1250_f6',
            ],
            [
                'id' => 'ins-007',
                'unitCode' => 'LEHN131',
                'residentName' => 'Bolanle Taylor',
                'billType' => 'Security Bill',
                'monthTerm' => 'utd',
                'totalBill' => 5000,
                'totalPaid' => 5000,
                'installmentAmount' => 1250,
                'status' => 'paid',
                'paystackPlanCode' => 'PLN_sec_1250_g7',
            ],
            [
                'id' => 'ins-008',
                'unitCode' => 'LEHN132',
                'residentName' => 'Alhaji Haruna Musa',
                'billType' => 'Security Bill',
                'monthTerm' => 'utd',
                'totalBill' => 5000,
                'totalPaid' => 5000,
                'installmentAmount' => 1250,
                'status' => 'paid',
                'paystackPlanCode' => 'PLN_sec_1250_h8',
            ],
            [
                'id' => 'ins-009',
                'unitCode' => 'LEHN133',
                'residentName' => 'Grace Danjuma',
                'billType' => 'Security Bill',
                'monthTerm' => 'utd',
                'totalBill' => 5000,
                'totalPaid' => 5000,
                'installmentAmount' => 1250,
                'status' => 'paid',
                'paystackPlanCode' => 'PLN_sec_1250_i9',
            ],
        ];

        return response()->json([
            'status' => 'success',
            'data' => $installments,
            'summary' => [
                'total_units' => count($installments),
                'paid_units' => 7,
                'processing_units' => 1,
                'default_units' => 1,
                'total_collected' => 40000,
            ]
        ]);
    }
}
