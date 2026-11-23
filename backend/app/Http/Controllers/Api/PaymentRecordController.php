<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\Finance\Ledger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentRecordController extends Controller
{
    private function label(string $state): string
    {
        return match ($state) { 'paid' => 'Paid', 'overdue' => 'Overdue', default => 'Pending' };
    }

    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status', 'All Status');
        $service = $request->query('service', 'All Services');
        $search = trim((string) $request->query('search', ''));
        $perPage = max(1, min(100, (int) $request->query('per_page', 10)));

        $q = Invoice::with(['user', 'payments' => fn ($p) => $p->where('status', 'success')->latest('paid_at')])->latest('issued_on')->latest('id');
        if ($service !== 'All Services') {
            $q->where('service_name', $service);
        }
        if ($search !== '') {
            $q->where(fn ($w) => $w->where('reference', 'like', "%{$search}%")
                ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%")->orWhere('unit_number', 'like', "%{$search}%"))
                ->orWhereHas('payments', fn ($p) => $p->where('reference', 'like', '%'.ltrim($search, '#').'%')));
        }
        // Status is derived from amounts + due date, so apply it with SQL equivalents.
        $today = now()->toDateString();
        match ($status) {
            'Paid' => $q->whereColumn('paid_kobo', '>=', 'amount_kobo'),
            'Overdue' => $q->whereColumn('paid_kobo', '<', 'amount_kobo')->where('due_date', '<', $today),
            'Pending' => $q->whereColumn('paid_kobo', '<', 'amount_kobo')->where('due_date', '>=', $today),
            default => null,
        };

        $page = $q->paginate($perPage);
        $rows = collect($page->items())->map(function (Invoice $i) {
            $last = $i->payments->first();
            return [
                'id' => (string) $i->id,
                'receiptNumber' => '#'.($last?->reference ?? $i->reference),
                'residentName' => $i->user?->name ?? 'Unknown',
                'property' => $i->user?->unit_number ?? '-',
                'servicePaid' => $i->service_name,
                'amount' => Ledger::naira($i->amount_kobo),
                'date' => ($last?->paid_at ?? $i->issued_on)?->format('M d, Y'),
                'method' => $last?->method ?? '-',
                'status' => $this->label($i->state()),
            ];
        })->values();

        $paidKobo = (int) Payment::where('status', 'success')->sum('amount_kobo');
        $open = Invoice::whereColumn('paid_kobo', '<', 'amount_kobo');

        return response()->json([
            'status' => 'success',
            'summary' => [
                'totalRevenue' => Ledger::naira($paidKobo),
                'paidItems' => Invoice::whereColumn('paid_kobo', '>=', 'amount_kobo')->count(),
                'pendingItems' => (clone $open)->where('due_date', '>=', $today)->count(),
                'overdueItems' => (clone $open)->where('due_date', '<', $today)->count(),
            ],
            'pagination' => [
                'currentPage' => $page->currentPage(), 'perPage' => $page->perPage(),
                'totalRecords' => $page->total(), 'totalPages' => $page->lastPage(),
            ],
            'data' => $rows,
        ]);
    }

    public function mobileSummary(Request $request): JsonResponse
    {
        $todayKobo = (int) Payment::where('status', 'success')->where('paid_at', '>=', now()->startOfDay())->sum('amount_kobo');
        $pending = Invoice::whereColumn('paid_kobo', '<', 'amount_kobo')->count();

        $recent = Payment::with(['user', 'invoice'])->where('status', 'success')->latest('paid_at')->limit(5)->get()->map(fn (Payment $p) => [
            'id' => (string) $p->id,
            'name' => $p->user?->name ?? 'Unknown',
            'purpose' => $p->invoice?->service_name ?? '-',
            'amount' => '₦'.number_format($p->amount_kobo / 100, 2),
            'status' => 'Paid',
            'iconType' => 'user',
        ])->values();

        return response()->json([
            'status' => 'success',
            'metrics' => ['collectedToday' => '₦'.number_format($todayKobo / 100, 2), 'pendingActive' => $pending.' Active'],
            'recentPayments' => $recent,
        ]);
    }
}
