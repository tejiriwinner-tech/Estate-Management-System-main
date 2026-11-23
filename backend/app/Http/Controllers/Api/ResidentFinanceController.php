<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\ServiceCharge;
use App\Models\User;
use App\Services\Finance\Ledger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResidentFinanceController extends Controller
{
    private function icon(string $service): string
    {
        $s = strtolower($service);
        return match (true) {
            str_contains($s, 'secur') => 'security',
            str_contains($s, 'waste'), str_contains($s, 'trash') => 'waste',
            default => 'utility',
        };
    }

    public function show(string $id): JsonResponse
    {
        $user = User::findOrFail((int) $id);
        $invoices = Invoice::where('user_id', $user->id)->latest('issued_on')->get();
        $payments = Payment::where('user_id', $user->id)->where('status', 'success')->with('invoice')->latest('paid_at')->get();
        $open = $invoices->filter(fn ($i) => $i->balanceKobo() > 0);
        $last = $payments->first();

        $recurring = ServiceCharge::where('is_active', true)->whereIn('name', $invoices->pluck('service_name')->unique())->get();

        return response()->json(['status' => 'success', 'data' => [
            'profile' => [
                'id' => (string) $user->id, 'name' => $user->name, 'unit' => $user->unit_number ?? '-',
                'street' => '', 'phone' => $user->phone ?? '', 'status' => strtoupper($user->status ?? 'ACTIVE'),
            ],
            'kpis' => [
                'totalPaid' => Ledger::naira((int) $payments->sum('amount_kobo')),
                'outstandingBalance' => Ledger::naira((int) $open->sum(fn ($i) => $i->balanceKobo())),
                'lastPaymentDate' => $last?->paid_at?->format('M d, Y') ?? '-',
                'activeServicesCount' => $recurring->count(),
            ],
            'paymentTimeline' => $payments->take(10)->values()->map(fn ($p) => [
                'id' => 'TL-'.$p->id, 'serviceName' => $p->invoice?->service_name ?? '-', 'invoiceNumber' => '#'.($p->invoice?->reference ?? ''),
                'iconType' => $this->icon($p->invoice?->service_name ?? ''), 'amount' => Ledger::naira($p->amount_kobo),
                'date' => $p->paid_at?->format('M d, Y'), 'status' => 'PAID',
            ]),
            'outstandingBills' => $open->values()->map(fn ($i) => [
                'id' => (string) $i->id, 'title' => $i->service_name, 'dueDate' => $i->due_date->format('M d, Y'),
                'amount' => Ledger::naira($i->balanceKobo()),
                'daysOverdue' => $i->due_date->lt(now()->startOfDay()) ? (int) $i->due_date->diffInDays(now()->startOfDay()) : 0,
                'status' => $i->state() === 'overdue' ? 'OVERDUE' : 'PENDING',
            ]),
            'nextBillingNotice' => '',
            'preferences' => [
                'preferredMethod' => $payments->groupBy('method')->sortByDesc(fn ($g) => $g->count())->keys()->first() ?? '-',
                'billingFrequency' => $recurring->first()?->frequency ?? '-',
                'autoPayStatus' => 'Disabled',
                'documentName' => '', 'documentUrl' => '',
            ],
        ]]);
    }

    public function recordPayment(Request $request, string $id): JsonResponse
    {
        $v = $request->validate([
            'service_id' => 'required|string',            // the invoice id (digits; "BILL-12" style ids accepted)
            'amount' => 'required|numeric|min:1',          // naira
            'method' => 'required|string|in:Bank Transfer,Card,Cash,Paystack',
            'reference' => 'nullable|string|max:120',
        ]);
        $invoice = Invoice::where('user_id', (int) $id)->findOrFail((int) preg_replace('/\D/', '', $v['service_id']));
        $payment = Ledger::recordPayment($invoice, Ledger::kobo($v['amount']), $v['method'], $request->user()?->id, $v['reference'] ?? null);

        return response()->json([
            'status' => 'success', 'message' => "Payment recorded for {$invoice->reference}.",
            'receipt_number' => $payment->reference,
        ], 201);
    }

    /** POST /v1/finance/invoices/generate - bill a service to every resident (or the given user_ids). */
    public function generateInvoices(Request $request): JsonResponse
    {
        $v = $request->validate([
            'service_charge_id' => 'required|integer|exists:service_charges,id',
            'due_date' => 'required|date|after_or_equal:today',
            'user_ids' => 'nullable|array', 'user_ids.*' => 'integer|exists:users,id',
            'period_start' => 'nullable|date', 'period_end' => 'nullable|date|after_or_equal:period_start',
        ]);
        $service = ServiceCharge::findOrFail($v['service_charge_id']);
        $users = User::where('role', 'resident')->where('status', 'active')
            ->when($v['user_ids'] ?? null, fn ($q, $ids) => $q->whereIn('id', $ids))->get();

        $created = 0;
        foreach ($users as $u) {
            // One invoice per resident, service and period.
            $exists = Invoice::where('user_id', $u->id)->where('service_charge_id', $service->id)
                ->where('period_start', $v['period_start'] ?? null)->where('due_date', $v['due_date'])->exists();
            if ($exists) continue;
            Invoice::create([
                'user_id' => $u->id, 'service_charge_id' => $service->id, 'service_name' => $service->name,
                'reference' => Invoice::nextReference(), 'amount_kobo' => $service->fee_kobo, 'issued_on' => now()->toDateString(),
                'due_date' => $v['due_date'], 'period_start' => $v['period_start'] ?? null, 'period_end' => $v['period_end'] ?? null,
            ]);
            $created++;
        }
        return response()->json(['status' => 'success', 'created' => $created, 'skipped' => $users->count() - $created], 201);
    }
}
