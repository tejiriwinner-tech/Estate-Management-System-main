<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\Finance\Ledger;
use Illuminate\Http\JsonResponse;

class ReceiptController extends Controller
{
    public function show(string $receiptNumber): JsonResponse
    {
        $ref = ltrim($receiptNumber, '#');
        $payment = Payment::with(['invoice', 'user'])->where('reference', $ref)->firstOrFail();
        $inv = $payment->invoice;

        return response()->json([
            'status' => 'success',
            'data' => [
                'receiptNumber' => $payment->reference,
                'status' => $payment->status === 'success' ? 'Payment Success' : ucfirst($payment->status),
                'residentName' => $payment->user?->name ?? 'Unknown',
                'residentEmail' => $payment->user?->email ?? '',
                'propertyName' => $payment->user?->unit_number ?? '-',
                'estatePhase' => config('estate.name', 'LincolnEstate'),
                'lineItems' => [[
                    'id' => (string) $inv->id,
                    'serviceDescription' => $inv->service_name,
                    'subDescription' => 'Invoice '.$inv->reference,
                    'billingPeriod' => $inv->period_start && $inv->period_end
                        ? $inv->period_start->format('M d').' - '.$inv->period_end->format('M d, Y') : $inv->issued_on->format('M d, Y'),
                    'amount' => Ledger::naira($payment->amount_kobo),
                ]],
                'totalAmount' => Ledger::naira($payment->amount_kobo),
                'paymentMethod' => $payment->method,
                'transactionDate' => $payment->paid_at?->format('F d, Y | h:i A'),
                'generatedBy' => 'LincolnEstate Finance',
                'qrVerificationUrl' => rtrim((string) config('app.url'), '/').'/verify/'.$payment->reference,
                'authorizationStampText' => 'LINCOLN APPROVED',
                'disclaimer' => 'This is a computer-generated document. No physical signature is required.',
            ],
        ]);
    }
}
