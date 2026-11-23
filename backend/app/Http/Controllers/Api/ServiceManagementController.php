<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceCharge;
use App\Services\Finance\Ledger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ServiceManagementController extends Controller
{
    private function out(ServiceCharge $s): array
    {
        return [
            'id' => 'SRV-'.str_pad((string) $s->id, 2, '0', STR_PAD_LEFT),
            'name' => $s->name, 'category' => $s->category, 'fee' => Ledger::naira($s->fee_kobo),
            'frequency' => $s->frequency, 'status' => $s->is_active ? 'Active' : 'Inactive',
            'dateCreated' => $s->created_at?->format('M d, Y'),
        ];
    }

    private function find(string $id): ServiceCharge
    {
        return ServiceCharge::findOrFail((int) preg_replace('/\D/', '', $id));
    }

    private function rules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes|required' : 'required';
        return [
            'name' => "$req|string|max:150",
            'category' => 'nullable|string|max:100',
            'fee' => "$req|numeric|min:0",
            'frequency' => [$partial ? 'sometimes' : 'required', Rule::in(['Monthly', 'Quarterly', 'Yearly', 'One-Time'])],
            'status' => ['nullable', Rule::in(['Active', 'Inactive'])],
        ];
    }

    public function index(): JsonResponse
    {
        $all = ServiceCharge::orderBy('id')->get();
        $active = $all->where('is_active', true);
        $monthlyEquiv = $active->sum(fn ($s) => match ($s->frequency) {
            'Monthly' => $s->fee_kobo, 'Quarterly' => $s->fee_kobo / 3, 'Yearly' => $s->fee_kobo / 12, default => 0,
        });
        $residents = \App\Models\User::where('role', 'resident')->count();
        $expectedKobo = (int) round($monthlyEquiv * max(1, $residents));

        return response()->json(['status' => 'success', 'data' => [
            'kpis' => [
                'totalServices' => $all->count(), 'activeServices' => $active->count(), 'inactiveServices' => $all->count() - $active->count(),
                'expectedRevenue' => '₦'.number_format($expectedKobo / 100, 2),
            ],
            'services' => $all->map(fn ($s) => $this->out($s))->values(),
            'forecastText' => "Active recurring services bill about ₦".number_format($expectedKobo / 100, 2)." per month across {$residents} residents.",
            'quickTipText' => '',
        ]]);
    }

    public function store(Request $r): JsonResponse
    {
        $d = $r->validate($this->rules());
        $s = ServiceCharge::create([
            'name' => $d['name'], 'category' => $d['category'] ?? 'General', 'fee_kobo' => Ledger::kobo($d['fee']),
            'frequency' => $d['frequency'], 'is_active' => ($d['status'] ?? 'Active') === 'Active',
        ]);
        return response()->json(['status' => 'success', 'service' => $this->out($s)], 201);
    }

    public function update(Request $r, string $id): JsonResponse
    {
        $d = $r->validate($this->rules(true));
        $s = $this->find($id);
        $s->update(array_filter([
            'name' => $d['name'] ?? null, 'category' => $d['category'] ?? null,
            'fee_kobo' => isset($d['fee']) ? Ledger::kobo($d['fee']) : null, 'frequency' => $d['frequency'] ?? null,
        ], fn ($v) => $v !== null) + (isset($d['status']) ? ['is_active' => $d['status'] === 'Active'] : []));
        return response()->json(['status' => 'success', 'service' => $this->out($s->fresh())]);
    }

    public function destroy(string $id): JsonResponse
    {
        $this->find($id)->delete();
        return response()->json(['status' => 'success']);
    }
}
