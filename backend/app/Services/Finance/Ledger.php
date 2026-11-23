<?php

namespace App\Services\Finance;

use App\Models\AppNotification;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

/** The one place that turns money received into payment rows and invoice balances. */
class Ledger
{
    public static function naira(int $kobo): float
    {
        return round($kobo / 100, 2);
    }

    public static function kobo(float|int|string $naira): int
    {
        return (int) round(((float) $naira) * 100);
    }

    /** Record a successful payment against an invoice. Over-payment is rejected. */
    public static function recordPayment(Invoice $invoice, int $amountKobo, string $method, ?int $recordedBy = null, ?string $gatewayRef = null): Payment
    {
        return DB::transaction(function () use ($invoice, $amountKobo, $method, $recordedBy, $gatewayRef) {
            $invoice = Invoice::lockForUpdate()->findOrFail($invoice->id);
            if ($amountKobo <= 0) {
                abort(422, 'Payment amount must be greater than zero.');
            }
            if ($amountKobo > $invoice->balanceKobo()) {
                abort(422, 'Payment is more than the balance due on this invoice.');
            }
            $payment = Payment::create([
                'invoice_id' => $invoice->id, 'user_id' => $invoice->user_id, 'amount_kobo' => $amountKobo,
                'method' => $method, 'reference' => Payment::nextReference(), 'gateway_reference' => $gatewayRef,
                'status' => 'success', 'paid_at' => now(), 'recorded_by' => $recordedBy,
            ]);
            $invoice->increment('paid_kobo', $amountKobo);

            AppNotification::create([
                'user_id' => $invoice->user_id, 'type' => 'system', 'title' => 'Payment received',
                'body' => $invoice->service_name.' - ₦'.number_format($amountKobo / 100, 2).' ('.$payment->reference.')',
                'data' => ['receipt' => $payment->reference],
            ]);
            return $payment;
        });
    }
}
