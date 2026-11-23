<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\EstateAlert;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\ReportExport;
use App\Models\User;
use App\Services\Finance\Ledger;
use Illuminate\Http\JsonResponse;

/**
 * Admin report centre. Everything is computed from the finance tables and
 * estate_alerts; nothing is hard-coded.
 */
class ReportsController extends Controller
{
    private const PALETTE = [
        ['bg-primary', '#B22222', 'bg-primary'],
        ['bg-accent', '#C9A227', 'bg-primary/65'],
        ['bg-border', '#D1D5DB', 'bg-dark/65'],
        ['bg-accent/60', '#E5C86B', 'bg-primary/40'],
    ];

    private static function m(int $kobo): float
    {
        return round($kobo / 100 / 1_000_000, 2);
    }

    private static function label(int $kobo): string
    {
        $n = $kobo / 100;
        if ($n >= 1_000_000) return '₦'.round($n / 1_000_000, 1).'M';
        if ($n >= 1_000) return '₦'.round($n / 1_000, 1).'k';
        return '₦'.number_format($n, 0);
    }

    public function index(): JsonResponse
    {
        $now = now();
        $payments = Payment::with('invoice')->where('status', 'success')->whereNotNull('paid_at')->get();
        $invoices = Invoice::with('user')->get();

        $year = $payments->filter(fn ($p) => $p->paid_at->year === $now->year);

        // Monthly trend (current year)
        $monthly = [];
        for ($i = 1; $i <= 12; $i++) {
            $kobo = (int) $year->filter(fn ($p) => $p->paid_at->month === $i)->sum('amount_kobo');
            $monthly[] = ['month' => date('M', mktime(0, 0, 0, $i, 1)), 'valueM' => self::m($kobo), 'showMarker' => $kobo > 0, '_kobo' => $kobo];
        }

        // Revenue by service (current year)
        $byService = $year->groupBy(fn ($p) => $p->invoice?->service_name ?? 'Other')
            ->map(fn ($g) => (int) $g->sum('amount_kobo'))->sortDesc();
        $yearTotal = max(1, (int) $byService->sum());
        $shares = [];
        foreach ($byService->take(4)->keys() as $idx => $name) {
            [$dot, $stroke] = self::PALETTE[$idx];
            $shares[] = [
                'id' => strtolower(preg_replace('/\W+/', '-', $name)), 'name' => $name,
                'percentage' => (int) round($byService[$name] / $yearTotal * 100), 'dotColorClass' => $dot, 'strokeColor' => $stroke,
            ];
        }

        // Yearly (last 5 years)
        $yearly = [];
        for ($y = $now->year - 4; $y <= $now->year; $y++) {
            $yearly[] = ['year' => (string) $y, 'valueM' => self::m((int) $payments->filter(fn ($p) => $p->paid_at->year === $y)->sum('amount_kobo'))];
        }

        // Collection status (invoices issued this year)
        $yi = $invoices->filter(fn ($i) => $i->issued_on->year === $now->year);
        $billed = (int) $yi->sum('amount_kobo');
        $paid = (int) $yi->sum('paid_kobo');
        $rate = $billed > 0 ? round($paid / $billed * 100, 1) : 0.0;
        $collection = [
            'statusLabel' => $billed === 0 ? 'NO DATA' : ($rate >= 85 ? 'HEALTHY' : ($rate >= 60 ? 'WATCH' : 'AT RISK')),
            'paidPercentage' => $rate, 'paidAmountLabel' => self::label($paid),
            'outstandingAmountLabel' => self::label(max(0, $billed - $paid)),
            'outstandingPercentage' => $billed > 0 ? round(100 - $rate, 1) : 0.0,
        ];

        // KPIs
        $active = collect($monthly)->filter(fn ($m) => $m['_kobo'] > 0);
        $avg = $active->count() ? (int) round($active->avg('_kobo')) : 0;
        $ratios = $yi->groupBy('service_name')->map(fn ($g) => $g->sum('amount_kobo') > 0 ? $g->sum('paid_kobo') / $g->sum('amount_kobo') : null)->filter(fn ($v) => $v !== null);
        $kpis = [
            ['id' => 'collection-rate', 'label' => 'COLLECTION RATE', 'value' => $rate.'%', 'subtext' => self::label($paid).' of '.self::label($billed), 'trendDirection' => 'stable', 'iconType' => 'collection'],
            ['id' => 'avg-revenue', 'label' => 'AVG REVENUE', 'value' => self::label($avg), 'subtext' => 'per active month', 'trendDirection' => 'stable', 'iconType' => 'revenue'],
            ['id' => 'top-service', 'label' => 'TOP SERVICE', 'value' => $byService->keys()->first() ?? '-', 'subtext' => $byService->isEmpty() ? 'No payments yet' : self::label($byService->first()).' collected', 'trendDirection' => 'stable', 'iconType' => 'top_service'],
            ['id' => 'laggard', 'label' => 'LAGGARD', 'value' => $ratios->isEmpty() ? '-' : $ratios->sort()->keys()->first(), 'subtext' => $ratios->isEmpty() ? 'No invoices yet' : round($ratios->min() * 100).'% collected', 'trendDirection' => $ratios->isEmpty() ? 'stable' : 'down', 'iconType' => 'laggard'],
        ];

        // Defaulters (largest overdue balances)
        $today = $now->copy()->startOfDay();
        $defaulters = $invoices->filter(fn ($i) => $i->balanceKobo() > 0 && $i->due_date->lt($today))
            ->sortByDesc(fn ($i) => $i->balanceKobo())->take(10)->values()
            ->map(fn ($i) => [
                'id' => $i->id, 'resident_name' => $i->user?->name ?? 'Unknown', 'unit' => $i->user?->unit_number ?? '-',
                'service' => $i->service_name, 'amount_due' => '₦'.number_format(Ledger::naira($i->balanceKobo()), 0),
                'days_overdue' => (int) $i->due_date->diffInDays($today),
            ]);

        // Mobile
        $last6 = collect($monthly)->filter(fn ($m, $k) => $k <= $now->month - 1)->take(-6)->values();
        $max = max(1, (int) $last6->max('_kobo'));
        $opac = ['bg-primary/30', 'bg-primary/55', 'bg-primary/70', 'bg-primary/85', 'bg-primary/95', 'bg-primary'];
        $bars = $last6->values()->map(fn ($m, $k) => [
            'month' => $m['month'], 'heightPct' => (int) round($m['_kobo'] / $max * 100), 'amountLabel' => self::label($m['_kobo']),
            'opacityClass' => $opac[$k + (6 - $last6->count())] ?? 'bg-primary',
        ]);
        $thisMonthKobo = (int) $payments->filter(fn ($p) => $p->paid_at->isSameMonth($now))->sum('amount_kobo');
        $openInv = $invoices->filter(fn ($i) => $i->balanceKobo() > 0);
        $residents = User::where('role', 'resident')->count();
        $mobileKpis = [
            ['id' => 'total-revenue', 'label' => 'REVENUE THIS MONTH', 'value' => self::label($thisMonthKobo), 'subtext' => 'collected so far', 'subtextType' => 'growth', 'iconType' => 'revenue'],
            ['id' => 'residents', 'label' => 'ACTIVE RESIDENTS', 'value' => (string) $residents, 'subtext' => $openInv->pluck('user_id')->unique()->count().' with open invoices', 'subtextType' => 'growth', 'iconType' => 'leased'],
            ['id' => 'outstanding-dues', 'label' => 'OUTSTANDING DUES', 'value' => self::label((int) $openInv->sum(fn ($i) => $i->balanceKobo())), 'subtext' => $openInv->count().' invoices pending', 'subtextType' => 'warning', 'iconType' => 'dues'],
        ];
        $topMax = max(1, (int) ($byService->first() ?? 1));
        $cats = [];
        foreach ($byService->take(3)->keys() as $idx => $name) {
            $cats[] = ['id' => strtolower(preg_replace('/\W+/', '-', $name)), 'name' => $name, 'amountLabel' => self::label($byService[$name]),
                'fillPct' => (int) round($byService[$name] / $topMax * 100), 'barColorClass' => self::PALETTE[$idx][2]];
        }
        $generated = ReportExport::latest()->take(10)->get()->map(fn ($e) => [
            'id' => $e->id, 'title' => $e->file_name, 'meta' => strtoupper($e->format).' • '.$e->created_at->format('M d, Y'), 'fileName' => $e->file_name,
        ]);

        // Alerts
        $alertOut = fn ($a) => [
            'id' => $a->id, 'name' => $a->sender?->name ?? 'Unknown', 'house_number' => $a->location ?: ($a->sender?->unit_number ?? '-'),
            'date' => $a->created_at->format('d-m-Y'),
        ];
        $life = EstateAlert::with('sender')->where('category', 'life_threat')->latest()->take(100)->get();
        $intel = EstateAlert::with('sender')->where('category', 'intelligence')->latest()->take(100)->get();

        return response()->json(['status' => 'success', 'data' => [
            'kpis' => $kpis,
            'monthlyRevenue' => array_map(fn ($m) => array_diff_key($m, ['_kobo' => 1]), $monthly),
            'serviceShares' => $shares, 'yearlyBars' => $yearly, 'collection' => $collection, 'defaulters' => $defaulters,
            'mobileKpis' => $mobileKpis, 'mobileTrendBars' => $bars, 'mobileCategories' => $cats, 'generatedReports' => $generated,
            'lifeThreatAlerts' => $life->map($alertOut)->values(),
            'lifeThreatTotal' => EstateAlert::where('category', 'life_threat')->count(),
            'intelligenceReports' => $intel->map(fn ($a) => $alertOut($a) + ['summary' => $a->message])->values(),
        ]]);
    }
}
