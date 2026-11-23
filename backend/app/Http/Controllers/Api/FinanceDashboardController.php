<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\Finance\Ledger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinanceDashboardController extends Controller
{
    public static function compact(float $naira): string
    {
        $abs = abs($naira);
        return match (true) {
            $abs >= 1_000_000 => '₦'.rtrim(rtrim(number_format($naira / 1_000_000, 2), '0'), '.').'M',
            $abs >= 1_000 => '₦'.rtrim(rtrim(number_format($naira / 1_000, 1), '0'), '.').'K',
            default => '₦'.number_format($naira, 0),
        };
    }

    private function paidBetween($from, $to): int
    {
        return (int) Payment::where('status', 'success')->whereBetween('paid_at', [$from, $to])->sum('amount_kobo');
    }

    private function trend(int $now, int $before, string $suffix): string
    {
        if ($before <= 0) return $now > 0 ? 'New activity' : '—';
        $pct = round(($now - $before) / $before * 100, 1);
        return ($pct >= 0 ? '↗ ' : '↘ ').abs($pct).'% '.$suffix;
    }

    public function overview(Request $request): JsonResponse
    {
        $yearStart = now()->startOfYear();
        $total = (int) Payment::where('status', 'success')->sum('amount_kobo');
        $thisYear = $this->paidBetween($yearStart, now());
        $lastYear = $this->paidBetween(now()->subYear()->startOfYear(), now()->subYear()->endOfYear());
        $thisMonth = $this->paidBetween(now()->startOfMonth(), now());
        $lastMonth = $this->paidBetween(now()->subMonth()->startOfMonth(), now()->subMonth()->endOfMonth());
        $billedYear = (int) Invoice::where('issued_on', '>=', $yearStart->toDateString())->sum('amount_kobo');

        $open = Invoice::whereColumn('paid_kobo', '<', 'amount_kobo')->get();
        $owingUsers = $open->filter(fn ($i) => $i->state() === 'overdue')->pluck('user_id')->unique();
        $billedUsers = Invoice::distinct()->pluck('user_id');
        $paidUsers = $billedUsers->diff($open->pluck('user_id')->unique());

        $metrics = [
            ['id' => 'total-revenue', 'title' => 'TOTAL REVENUE', 'value' => self::compact(Ledger::naira($total)), 'subtitle' => $this->trend($thisYear, $lastYear, 'vs last year'), 'subtitleType' => $thisYear >= $lastYear ? 'trend-up' : 'warning', 'icon' => 'wallet', 'badgeBg' => 'bg-blue-50 text-blue-600', 'iconColor' => 'text-blue-600'],
            ['id' => 'monthly-revenue', 'title' => 'MONTHLY REV.', 'value' => self::compact(Ledger::naira($thisMonth)), 'subtitle' => $this->trend($thisMonth, $lastMonth, 'vs last month'), 'subtitleType' => $thisMonth >= $lastMonth ? 'trend-up' : 'warning', 'icon' => 'calendar', 'badgeBg' => 'bg-emerald-50 text-emerald-600', 'iconColor' => 'text-emerald-600'],
            ['id' => 'yearly-revenue', 'title' => 'YEARLY REV.', 'value' => self::compact(Ledger::naira($thisYear)), 'subtitle' => 'Billed: '.self::compact(Ledger::naira($billedYear)), 'subtitleType' => 'neutral', 'icon' => 'chart', 'badgeBg' => 'bg-purple-50 text-purple-600', 'iconColor' => 'text-purple-600'],
            ['id' => 'outstanding', 'title' => 'OUTSTANDING', 'value' => self::compact(Ledger::naira((int) $open->sum(fn ($i) => $i->balanceKobo()))), 'subtitle' => $open->count().' Pending Invoices', 'subtitleType' => 'warning', 'icon' => 'hourglass', 'badgeBg' => 'bg-amber-50 text-amber-600', 'iconColor' => 'text-amber-600'],
            ['id' => 'total-paid', 'title' => 'TOTAL PAID', 'value' => (string) $paidUsers->count(), 'subtitle' => 'RESIDENTS', 'subtitleType' => 'neutral', 'icon' => 'check', 'badgeBg' => 'bg-emerald-50 text-emerald-600', 'iconColor' => 'text-emerald-600'],
            ['id' => 'total-owing', 'title' => 'TOTAL OWING', 'value' => (string) $owingUsers->count(), 'subtitle' => 'RESIDENTS', 'subtitleType' => 'warning', 'icon' => 'alert', 'badgeBg' => 'bg-rose-50 text-rose-500', 'iconColor' => 'text-rose-500'],
        ];

        $revenueHistory = [];
        for ($m = 1; $m <= 12; $m++) {
            $from = now()->startOfYear()->month($m)->startOfMonth();
            $revenueHistory[] = ['month' => $from->format('M'), 'amount' => Ledger::naira($this->paidBetween($from, $from->copy()->endOfMonth()))];
        }

        $palette = ['#10B981', '#3B82F6', '#F97316', '#06B6D4', '#8B5CF6', '#EC4899', '#EAB308'];
        $styles = [
            ['security', 'bg-blue-50', 'text-blue-600'], ['waste', 'bg-emerald-50', 'text-emerald-600'], ['electricity', 'bg-amber-50', 'text-amber-500'],
            ['water', 'bg-cyan-50', 'text-cyan-500'], ['maintenance', 'bg-slate-100', 'text-slate-600'],
        ];
        $perService = Invoice::selectRaw('service_name, sum(amount_kobo) as billed, sum(paid_kobo) as paid')->groupBy('service_name')->orderByDesc('paid')->get();
        $revenueByService = $perService->values()->map(fn ($r, $i) => ['name' => $r->service_name, 'value' => Ledger::naira((int) $r->paid), 'color' => $palette[$i % count($palette)]])->all();
        $breakdowns = $perService->values()->map(function ($r, $i) use ($styles) {
            $s = $styles[$i % count($styles)];
            $billed = (int) $r->billed; $paid = (int) $r->paid;
            return [
                'id' => (string) ($i + 1), 'serviceName' => $r->service_name, 'icon' => $s[0], 'iconBg' => $s[1], 'iconColor' => $s[2],
                'totalAmount' => Ledger::naira($billed), 'totalPayments' => Ledger::naira($paid), 'balanceDue' => Ledger::naira(max(0, $billed - $paid)),
                'collectionRate' => $billed > 0 ? (int) round($paid / $billed * 100) : 0,
            ];
        })->all();

        return response()->json(['status' => 'success', 'data' => compact('metrics', 'revenueHistory', 'revenueByService', 'breakdowns')]);
    }

    public function mobileOverview(Request $request): JsonResponse
    {
        $thisYear = $this->paidBetween(now()->startOfYear(), now());
        $lastYear = $this->paidBetween(now()->subYear()->startOfYear(), now()->subYear()->endOfYear());
        $total = (int) Payment::where('status', 'success')->sum('amount_kobo');
        $thisMonth = $this->paidBetween(now()->startOfMonth(), now());
        $billedMonth = (int) Invoice::whereBetween('issued_on', [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()])->sum('amount_kobo');
        $outstanding = (int) Invoice::whereColumn('paid_kobo', '<', 'amount_kobo')->selectRaw('coalesce(sum(amount_kobo - paid_kobo),0) as b')->value('b');

        $metrics = [
            ['id' => 'total-revenue', 'label' => 'TOTAL REVENUE', 'value' => '₦'.number_format($total / 100), 'accentColor' => 'emerald', 'icon' => 'wallet', 'badgeType' => 'trend', 'badgeValue' => $this->trend($thisYear, $lastYear, '')],
            ['id' => 'monthly-target', 'label' => 'BILLED THIS MONTH', 'value' => '₦'.number_format($billedMonth / 100), 'accentColor' => 'amber', 'icon' => 'flag', 'badgeType' => 'radial', 'badgeValue' => ($billedMonth > 0 ? (int) round(min($thisMonth, $billedMonth) / $billedMonth * 100) : 0).'%'],
            ['id' => 'outstanding', 'label' => 'OUTSTANDING', 'value' => '₦'.number_format($outstanding / 100), 'accentColor' => 'rose', 'icon' => 'briefcase', 'badgeType' => 'action', 'actionText' => 'View'],
        ];

        $trendMonths = [];
        for ($k = 5; $k >= 0; $k--) {
            $from = now()->subMonths($k)->startOfMonth();
            $trendMonths[] = ['month' => strtoupper($from->format('M')), 'value' => Ledger::naira($this->paidBetween($from, $from->copy()->endOfMonth())), 'isSelected' => $k === 0];
        }

        $recent = Payment::with(['user', 'invoice'])->where('status', 'success')->latest('paid_at')->limit(5)->get()->map(fn ($p) => [
            'id' => (string) $p->id, 'title' => ($p->user?->unit_number ? $p->user->unit_number.' - ' : '').($p->invoice?->service_name ?? 'Payment'),
            'subtitle' => $p->paid_at?->format('M d, Y').' • '.$p->reference, 'amount' => '+₦'.number_format($p->amount_kobo / 100),
            'type' => 'income', 'status' => 'PAID', 'icon' => 'home',
        ])->values();

        return response()->json(['status' => 'success', 'data' => [
            'greetingName' => request()->user()?->name ? explode(' ', request()->user()->name)[0] : 'Finance',
            'metrics' => $metrics, 'trendMonths' => $trendMonths, 'recentTransactions' => $recent,
        ]]);
    }
}
