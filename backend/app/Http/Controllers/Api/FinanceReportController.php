<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FinanceReportController extends Controller
{
    /**
     * GET /v1/finance/reports
     *
     * Returns the Finance Report Center templates, usage metrics, and recent exports (Task 17).
     */
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'filters' => [
                'month' => $request->query('month', 'Current Month'),
                'year' => $request->query('year', '2024'),
                'service' => $request->query('service', 'All Services'),
                'area' => $request->query('area', 'All Areas'),
                'status' => $request->query('status', 'All Status'),
            ],
            'data' => [
                'templates' => [
                    [
                        'id' => 'monthly-report',
                        'title' => 'Monthly Report',
                        'description' => 'Complete summary of income, expenses, and occupancy for the current billing cycle.',
                        'badgeLabel' => 'Auto-Generated',
                        'badgeTone' => 'neutral',
                        'iconType' => 'monthly',
                    ],
                    [
                        'id' => 'yearly-report',
                        'title' => 'Yearly Report',
                        'description' => 'Aggregate financial health metrics and growth analysis for the fiscal year 2023–2024.',
                        'badgeLabel' => 'Annual',
                        'badgeTone' => 'neutral',
                        'iconType' => 'yearly',
                    ],
                    [
                        'id' => 'service-report',
                        'title' => 'Service Report',
                        'description' => 'Operational efficiency report covering utility maintenance, security logs, and waste management.',
                        'badgeLabel' => 'Maintenance',
                        'badgeTone' => 'accent',
                        'iconType' => 'service',
                    ],
                    [
                        'id' => 'resident-payment-report',
                        'title' => 'Resident Payment Report',
                        'description' => 'Detailed ledger of all payments made by residents, including service fees and penalties.',
                        'badgeLabel' => 'Ledger',
                        'badgeTone' => 'neutral',
                        'iconType' => 'resident',
                    ],
                    [
                        'id' => 'outstanding-payment-report',
                        'title' => 'Outstanding Payment Report',
                        'description' => 'Track overdue accounts, total debt volume, and payment defaults by zone.',
                        'badgeLabel' => 'Critical',
                        'badgeTone' => 'critical',
                        'iconType' => 'outstanding',
                    ],
                ],
                'usageMetrics' => [
                    'title' => 'Report Usage Metrics',
                    'subtitle' => 'Total reports generated this month across all templates.',
                    'totalDownloads' => \App\Models\ReportExport::where('created_at', '>=', now()->startOfMonth())->count(),
                    'barHeights' => $this->weeklyBars(),
                ],
                'recentExports' => \App\Models\ReportExport::latest('id')->limit(5)->get()->map(fn ($e) => [
                    'id' => 'EXP-'.str_pad((string) $e->id, 2, '0', STR_PAD_LEFT),
                    'fileName' => $e->file_name,
                    'generatedBy' => \App\Models\User::find($e->generated_by)?->name ?? 'System',
                    'dateTime' => $e->created_at?->format('M d, Y • h:i A'),
                    'format' => strtoupper($e->format),
                    'downloadUrl' => \Illuminate\Support\Facades\Storage::disk('public')->url($e->path),
                ])->values(),
            ],
        ]);
    }

    /**
     * POST /v1/finance/reports/export
     *
     * Generates a PDF or XLSX report for a template or custom filter set.
     */
    /** Exports in the last 5 weeks, scaled 0-100 for the usage bars. */
    private function weeklyBars(): array
    {
        $counts = [];
        for ($w = 4; $w >= 0; $w--) {
            $from = now()->subWeeks($w)->startOfWeek();
            $counts[] = \App\Models\ReportExport::whereBetween('created_at', [$from, $from->copy()->endOfWeek()])->count();
        }
        $max = max(1, max($counts));
        return array_map(fn ($c) => (int) round($c / $max * 100), $counts);
    }

    /** Rows (header first) for each report template. */
    private function rows(string $template, ?string $service, ?string $status): array
    {
        $today = now()->toDateString();
        switch ($template) {
            case 'resident-payment-report':
                $rows = [['Receipt', 'Resident', 'Unit', 'Service', 'Amount (NGN)', 'Method', 'Paid at']];
                foreach (\App\Models\Payment::with(['user', 'invoice'])->where('status', 'success')->latest('paid_at')->get() as $p) {
                    if ($service && $service !== 'All Services' && $p->invoice?->service_name !== $service) continue;
                    $rows[] = [$p->reference, $p->user?->name, $p->user?->unit_number, $p->invoice?->service_name, $p->amount_kobo / 100, $p->method, $p->paid_at];
                }
                return $rows;
            case 'outstanding-payment-report':
                $rows = [['Invoice', 'Resident', 'Unit', 'Service', 'Balance (NGN)', 'Due date', 'Status']];
                foreach (\App\Models\Invoice::with('user')->whereColumn('paid_kobo', '<', 'amount_kobo')->orderBy('due_date')->get() as $i) {
                    if ($service && $service !== 'All Services' && $i->service_name !== $service) continue;
                    $rows[] = [$i->reference, $i->user?->name, $i->user?->unit_number, $i->service_name, $i->balanceKobo() / 100, $i->due_date->toDateString(), $i->state()];
                }
                return $rows;
            case 'service-report':
                $rows = [['Service', 'Billed (NGN)', 'Collected (NGN)', 'Balance (NGN)', 'Collection rate %']];
                foreach (\App\Models\Invoice::selectRaw('service_name, sum(amount_kobo) b, sum(paid_kobo) p')->groupBy('service_name')->get() as $r) {
                    $rows[] = [$r->service_name, $r->b / 100, $r->p / 100, ($r->b - $r->p) / 100, $r->b > 0 ? round($r->p / $r->b * 100, 1) : 0];
                }
                return $rows;
            case 'yearly-report':
                $rows = [['Year', 'Collected (NGN)']];
                for ($y = now()->year - 4; $y <= now()->year; $y++) {
                    $rows[] = [$y, \App\Models\Payment::where('status', 'success')->whereYear('paid_at', $y)->sum('amount_kobo') / 100];
                }
                return $rows;
            default: // monthly-report
                $rows = [['Month', 'Collected (NGN)', 'Billed (NGN)']];
                for ($m = 1; $m <= 12; $m++) {
                    $from = now()->startOfYear()->month($m)->startOfMonth(); $to = $from->copy()->endOfMonth();
                    $rows[] = [$from->format('M Y'),
                        \App\Models\Payment::where('status', 'success')->whereBetween('paid_at', [$from, $to])->sum('amount_kobo') / 100,
                        \App\Models\Invoice::whereBetween('issued_on', [$from->toDateString(), $to->toDateString()])->sum('amount_kobo') / 100];
                }
                return $rows;
        }
    }

    public function export(Request $request): JsonResponse
    {
        $v = $request->validate([
            'template_id' => 'required|in:monthly-report,yearly-report,service-report,resident-payment-report,outstanding-payment-report',
            'format'      => 'required|in:CSV,PDF,XLSX',
            'month'       => 'nullable|string',
            'year'        => 'nullable|string',
            'service'     => 'nullable|string',
            'area'        => 'nullable|string',
            'status'      => 'nullable|string',
        ]);
        if ($v['format'] !== 'CSV') {
            return response()->json(['status' => 'error', 'message' => 'Only CSV export is available right now. Choose CSV.'], 422);
        }

        $fh = fopen('php://temp', 'r+');
        foreach ($this->rows($v['template_id'], $v['service'] ?? null, $v['status'] ?? null) as $row) {
            fputcsv($fh, array_map(fn ($c) => $c instanceof \DateTimeInterface ? $c->format('Y-m-d H:i') : $c, $row));
        }
        rewind($fh);
        $csv = stream_get_contents($fh);
        fclose($fh);

        $name = str_replace('-', '_', $v['template_id']).'_'.now()->format('Ymd_His').'.csv';
        $path = 'exports/'.$name;
        \Illuminate\Support\Facades\Storage::disk('public')->put($path, $csv);
        $export = \App\Models\ReportExport::create([
            'template_id' => $v['template_id'], 'file_name' => $name, 'format' => 'CSV', 'path' => $path, 'generated_by' => $request->user()?->id,
        ]);

        return response()->json([
            'status' => 'success', 'message' => 'Report generated successfully.',
            'export' => [
                'id' => 'EXP-'.str_pad((string) $export->id, 2, '0', STR_PAD_LEFT), 'fileName' => $name,
                'generatedBy' => $request->user()?->name ?? 'System', 'dateTime' => now()->format('M d, Y • h:i A'),
                'format' => 'CSV', 'downloadUrl' => \Illuminate\Support\Facades\Storage::disk('public')->url($path),
            ],
        ], 201);
    }
}
