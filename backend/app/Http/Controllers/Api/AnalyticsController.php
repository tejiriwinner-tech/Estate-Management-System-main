<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\Finance\Ledger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    private function paid($from, $to): int
    {
        return (int) Payment::where('status', 'success')->whereBetween('paid_at', [$from, $to])->sum('amount_kobo');
    }

    private function pct(float $now, float $before): ?float
    {
        return $before > 0 ? round(($now - $before) / $before * 100, 1) : null;
    }

    private function sign(?float $p, string $suffix): string
    {
        return $p === null ? 'No prior data' : (($p >= 0 ? '↗ +' : '↘ ').abs($p).'% '.$suffix);
    }

    public function index(Request $request): JsonResponse
    {
        $period = $request->query('period', 'this_month');
        $year = now()->year;

        // Collection rate this year vs last: paid / billed for invoices issued in each year.
        $rate = function (int $y): ?float {
            $q = Invoice::whereYear('issued_on', $y);
            $billed = (int) (clone $q)->sum('amount_kobo');
            return $billed > 0 ? round((int) (clone $q)->sum('paid_kobo') / $billed * 100, 1) : null;
        };
        $rateNow = $rate($year); $ratePrev = $rate($year - 1);

        $monthly = [];
        for ($m = 1; $m <= 12; $m++) {
            $from = now()->startOfYear()->month($m)->startOfMonth();
            $monthly[] = ['month' => $from->format('M'), 'amount' => round($this->paid($from, $from->copy()->endOfMonth()) / 100 / 1_000_000, 3)];
        }
        $monthsElapsed = max(1, now()->month);
        $avgNow = array_sum(array_column($monthly, 'amount')) / $monthsElapsed;
        $lm = $this->paid(now()->subMonth()->startOfMonth(), now()->subMonth()->endOfMonth());
        $tm = $this->paid(now()->startOfMonth(), now());

        $byService = Invoice::whereYear('issued_on', $year)->selectRaw('service_name, sum(paid_kobo) as paid, sum(amount_kobo) as billed')->groupBy('service_name')->get();
        $totalPaid = max(1, (int) $byService->sum('paid'));
        $palette = ['#B22222', '#7F1D1D', '#C9A227', '#1A1A1A', '#6B7280', '#0EA5E9'];
        $revenueByService = $byService->sortByDesc('paid')->values()->map(fn ($r, $i) => [
            'name' => $r->service_name, 'percentage' => round($r->paid / $totalPaid * 100, 1), 'color' => $palette[$i % count($palette)],
        ])->all();
        $rates = $byService->filter(fn ($r) => $r->billed > 0)->map(fn ($r) => ['name' => $r->service_name, 'rate' => $r->paid / $r->billed * 100]);
        $top = $rates->sortByDesc('rate')->first(); $lag = $rates->sortBy('rate')->first();

        $yearly = [];
        for ($y = $year - 4; $y <= $year; $y++) {
            $yearly[] = ['year' => (string) $y, 'amount' => round($this->paid(now()->setYear($y)->startOfYear(), now()->setYear($y)->endOfYear()) / 100 / 1_000_000, 3)];
        }

        $billed = (int) Invoice::whereYear('issued_on', $year)->sum('amount_kobo');
        $paidY = (int) Invoice::whereYear('issued_on', $year)->sum('paid_kobo');
        $paidPct = $billed > 0 ? round($paidY / $billed * 100, 1) : 0;

        return response()->json(['status' => 'success', 'period' => $period, 'data' => [
            'kpis' => [
                ['id' => 'collection-rate', 'label' => 'COLLECTION RATE', 'value' => $rateNow === null ? '—' : $rateNow.'%', 'subtext' => $this->sign($rateNow !== null && $ratePrev !== null ? round($rateNow - $ratePrev, 1) : null, 'vs LY'), 'trendType' => ($rateNow ?? 0) >= ($ratePrev ?? 0) ? 'up' : 'down', 'iconType' => 'collection'],
                ['id' => 'avg-revenue', 'label' => 'AVG REVENUE', 'value' => FinanceDashboardController::compact($avgNow * 1_000_000), 'subtext' => $this->sign($this->pct($tm, $lm), 'vs LM'), 'trendType' => $tm >= $lm ? 'up' : 'down', 'iconType' => 'revenue'],
                ['id' => 'top-service', 'label' => 'TOP SERVICE', 'value' => $top['name'] ?? '—', 'subtext' => $top ? round($top['rate']).'% collected' : 'No data', 'trendType' => 'neutral', 'iconType' => 'top_service'],
                ['id' => 'laggard', 'label' => 'LAGGARD', 'value' => $lag['name'] ?? '—', 'subtext' => $lag ? round($lag['rate']).'% collected' : 'No data', 'trendType' => 'down', 'iconType' => 'laggard'],
            ],
            'monthlyRevenueTrend' => $monthly,
            'revenueByService' => $revenueByService,
            'yearlyRevenueTrend' => $yearly,
            'collectionStatus' => [
                'statusLabel' => $paidPct >= 90 ? 'HEALTHY' : ($paidPct >= 70 ? 'WATCH' : 'AT RISK'),
                'collectionPercentage' => $paidPct,
                'paidAmount' => FinanceDashboardController::compact(Ledger::naira($paidY)),
                'paidPercentage' => $paidPct,
                'outstandingAmount' => FinanceDashboardController::compact(Ledger::naira(max(0, $billed - $paidY))),
                'outstandingPercentage' => $billed > 0 ? round(100 - $paidPct, 1) : 0,
            ],
        ]]);
    }
}
