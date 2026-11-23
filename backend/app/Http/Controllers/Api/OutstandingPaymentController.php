<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\Invoice;
use App\Services\Finance\Ledger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OutstandingPaymentController extends Controller
{
    private function open()
    {
        return Invoice::with('user')->whereColumn('paid_kobo', '<', 'amount_kobo');
    }

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'service_type' => 'nullable|string|max:100',
            'status' => 'nullable|in:overdue,pending,partial',
            'sort_by' => 'nullable|in:due_date,amount,days_overdue,name',
            'per_page' => 'nullable|integer|min:5|max:100',
        ]);
        $today = now()->toDateString();

        $q = $this->open()
            ->when($request->service_type, fn ($b, $v) => $b->where('service_name', $v))
            ->when($request->status === 'overdue', fn ($b) => $b->where('due_date', '<', $today))
            ->when($request->status === 'pending', fn ($b) => $b->where('due_date', '>=', $today)->where('paid_kobo', 0))
            ->when($request->status === 'partial', fn ($b) => $b->where('due_date', '>=', $today)->where('paid_kobo', '>', 0));

        match ($request->query('sort_by', 'due_date')) {
            'amount' => $q->orderByRaw('(amount_kobo - paid_kobo) desc'),
            'days_overdue' => $q->orderBy('due_date'),
            'name' => $q->orderBy(\App\Models\User::select('name')->whereColumn('users.id', 'fin_invoices.user_id')),
            default => $q->orderBy('due_date'),
        };

        $page = $q->paginate((int) $request->query('per_page', 15));
        $rows = collect($page->items())->map(function (Invoice $i) use ($today) {
            $days = $i->due_date->lt(now()->startOfDay()) ? (int) $i->due_date->diffInDays(now()->startOfDay()) : 0;
            return [
                'id' => (string) $i->id,
                'residentId' => (string) $i->user_id,
                'residentName' => $i->user?->name ?? 'Unknown',
                'propertyAddress' => $i->user?->unit_number ?? '-',
                'serviceType' => $i->service_name,
                'amountDue' => Ledger::naira($i->balanceKobo()),
                'amountPaid' => Ledger::naira($i->paid_kobo),
                'dueDate' => $i->due_date->format('M d, Y'),
                'daysOverdue' => $days,
                'status' => $days > 0 ? 'overdue' : ($i->paid_kobo > 0 ? 'partial' : 'pending'),
                'invoiceNumber' => $i->reference,
            ];
        })->values();

        $all = $this->open()->get();
        return response()->json([
            'data' => $rows,
            'summary' => [
                'totalOutstanding' => Ledger::naira((int) $all->sum(fn ($i) => $i->balanceKobo())),
                'overdueCount' => $all->filter(fn ($i) => $i->state() === 'overdue')->count(),
                'pendingCount' => $all->filter(fn ($i) => $i->state() === 'pending')->count(),
                'partialCount' => $all->filter(fn ($i) => $i->state() === 'partial')->count(),
            ],
            'meta' => ['current_page' => $page->currentPage(), 'per_page' => $page->perPage(), 'total' => $page->total(), 'last_page' => $page->lastPage()],
        ]);
    }

    private function remind(Invoice $i): void
    {
        AppNotification::create([
            'user_id' => $i->user_id, 'type' => 'system',
            'title' => 'Payment reminder: '.$i->service_name,
            'body' => '₦'.number_format($i->balanceKobo() / 100, 2).' due '.$i->due_date->format('M d, Y').' ('.$i->reference.')',
            'data' => ['invoice' => $i->reference],
        ]);
        $i->update(['last_reminded_at' => now()]);
    }

    public function sendReminder(string $id): JsonResponse
    {
        $invoice = Invoice::whereColumn('paid_kobo', '<', 'amount_kobo')->findOrFail($id);
        $this->remind($invoice);
        return response()->json(['message' => "Reminder sent to the resident for {$invoice->reference}.", 'sent_at' => now()->toIso8601String()]);
    }

    public function sendBulkReminders(Request $request): JsonResponse
    {
        $invoices = $this->open()->when($request->status === 'overdue', fn ($b) => $b->where('due_date', '<', now()->toDateString()))->get();
        foreach ($invoices as $i) {
            $this->remind($i);
        }
        return response()->json(['message' => "Reminders sent for {$invoices->count()} invoices.", 'count' => $invoices->count(), 'queued_at' => now()->toIso8601String()]);
    }
}
