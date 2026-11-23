<?php

namespace App\Http\Controllers\Api\V1\Store;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\StoreInvoice;
use App\Models\StoreProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/** A store owner's own store: registration, plan, open/closed, products and dashboard. */
class StoreOwnerController extends Controller
{
    private function store(Request $r): ?Store
    {
        return Store::where('owner_id', $r->user()->id)->first();
    }

    private function mine(Request $r): Store
    {
        return $this->store($r) ?? abort(404, 'You have not registered a store yet.');
    }

    private function storeOut(Store $s): array
    {
        return [
            'id' => $s->id, 'name' => $s->name, 'category' => $s->category, 'phone' => $s->phone, 'address' => $s->address,
            'description' => $s->description, 'logo' => $s->logo, 'plan' => $s->plan, 'isOpen' => $s->is_open, 'openWeekends' => $s->open_weekends,
            'settlementMethod' => $s->settlement_method, 'settlementFrequency' => $s->settlement_frequency, 'joinedAt' => $s->created_at->toDateString(),
        ];
    }

    public static function productOut(StoreProduct $p): array
    {
        return [
            'id' => (string) $p->id, 'name' => $p->name, 'sku' => $p->sku, 'category' => $p->category, 'price' => $p->price_kobo / 100,
            'stock' => (int) $p->stock, 'description' => $p->description ?? '', 'image' => $p->image ?? '', 'featured' => (bool) $p->featured,
        ];
    }

    public function me(Request $r): JsonResponse
    {
        $s = $this->store($r);
        return response()->json(['data' => $s ? $this->storeOut($s) : null]);
    }

    public function register(Request $r): JsonResponse
    {
        abort_if($this->store($r), 422, 'You already have a registered store.');
        $d = $r->validate([
            'name' => 'required|string|max:150', 'category' => 'nullable|string|max:100', 'phone' => 'nullable|string|max:30',
            'address' => 'required|string|max:255', 'description' => 'nullable|string|max:2000',
            'logo' => 'nullable|string|max:1500000', 'open_weekends' => 'boolean',
            'settlement_method' => 'nullable|string|max:40', 'settlement_frequency' => ['nullable', Rule::in(['Weekly', 'Monthly', 'Quarterly'])],
        ]);
        $s = Store::create($d + ['owner_id' => $r->user()->id]);

        return response()->json(['data' => $this->storeOut($s)], 201);
    }

    public function update(Request $r): JsonResponse
    {
        $s = $this->mine($r);
        $d = $r->validate([
            'name' => 'sometimes|required|string|max:150', 'category' => 'nullable|string|max:100', 'phone' => 'nullable|string|max:30',
            'address' => 'sometimes|required|string|max:255', 'description' => 'nullable|string|max:2000', 'is_open' => 'sometimes|boolean',
            'open_weekends' => 'sometimes|boolean',
            'settlement_method' => 'sometimes|string|max:40', 'settlement_frequency' => ['sometimes', Rule::in(['Weekly', 'Monthly', 'Quarterly'])],
        ]);
        $s->update($d);

        return response()->json(['data' => $this->storeOut($s->fresh())]);
    }

    /** Switch plan and raise an invoice for it. No payment is taken here; it stays "pending" until paid. */
    public function choosePlan(Request $r): JsonResponse
    {
        $s = $this->mine($r);
        $plan = $r->validate(['plan' => ['required', Rule::in(array_keys(Store::PLANS))]])['plan'];
        if ($s->plan !== $plan) {
            $s->update(['plan' => $plan]);
            StoreInvoice::create([
                'store_id' => $s->id, 'reference' => 'SINV-'.strtoupper(Str::random(8)), 'description' => "$plan plan",
                'amount_kobo' => Store::PLANS[$plan] * 100, 'status' => 'pending', 'issued_on' => today(),
            ]);
        }

        return response()->json(['data' => $this->storeOut($s->fresh())]);
    }

    public function invoices(Request $r): JsonResponse
    {
        return response()->json(['data' => $this->mine($r)->invoices()->latest('issued_on')->latest('id')->get()->map(fn ($i) => [
            'id' => $i->reference, 'date' => $i->issued_on->format('M d, Y'), 'amount' => '₦'.number_format($i->amount_kobo / 100, 0), 'status' => ucfirst($i->status),
        ])->values()]);
    }

    public function products(Request $r): JsonResponse
    {
        return response()->json(['data' => $this->mine($r)->products()->orderBy('id')->get()->map(fn ($p) => self::productOut($p))->values()]);
    }

    private function rules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes|required' : 'required';
        return [
            'name' => "$req|string|max:150", 'category' => "$req|string|max:100", 'price' => "$req|numeric|min:0",
            'stock' => 'nullable|integer|min:0|max:1000000', 'description' => 'nullable|string|max:2000',
            'image' => 'nullable|string|max:1500000', 'featured' => 'boolean',
        ];
    }

    public function storeProduct(Request $r): JsonResponse
    {
        $s = $this->mine($r);
        $d = $r->validate($this->rules());
        $p = StoreProduct::create([
            'store_id' => $s->id, 'sku' => $this->sku($d['category']), 'name' => $d['name'], 'category' => $d['category'],
            'price_kobo' => (int) round($d['price'] * 100), 'stock' => $d['stock'] ?? 0, 'description' => $d['description'] ?? null,
            'image' => $d['image'] ?? null, 'featured' => $d['featured'] ?? false,
        ]);

        return response()->json(['data' => self::productOut($p)], 201);
    }

    public function updateProduct(Request $r, int $id): JsonResponse
    {
        $p = $this->mine($r)->products()->findOrFail($id);
        $d = $r->validate($this->rules(true));
        if (isset($d['price'])) { $d['price_kobo'] = (int) round($d['price'] * 100); unset($d['price']); }
        $p->update($d);

        return response()->json(['data' => self::productOut($p->fresh())]);
    }

    public function destroyProduct(Request $r, int $id): JsonResponse
    {
        $this->mine($r)->products()->findOrFail($id)->delete();
        return response()->json(['status' => 'success']);
    }

    private function sku(string $category): string
    {
        $prefix = 'LE-'.strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $category) ?: 'GEN', 0, 3)).'-';
        do { $sku = $prefix.str_pad((string) random_int(1, 9999), 4, '0', STR_PAD_LEFT); } while (StoreProduct::where('sku', $sku)->exists());
        return $sku;
    }

    /** Same shape the dashboard screen already consumes, computed for this owner's store. */
    public function dashboard(Request $r): JsonResponse
    {
        $s = $this->mine($r);
        $inv = $s->invoices()->latest('issued_on')->latest('id')->get();
        $pending = $inv->where('status', 'pending')->first();

        return response()->json(['data' => [
            'merchant' => [
                'name' => $s->name, 'merchantId' => 'ST-'.str_pad((string) $s->id, 4, '0', STR_PAD_LEFT), 'joinedAt' => $s->created_at->toDateString(),
                'tier' => $s->plan, 'totalRevenue' => '0.00', 'pendingSettlements' => '0.00',
                'activeProducts' => $s->products()->where('stock', '>', 0)->count(), 'orderVolume' => 0,
                'settlementMode' => $s->settlement_method, 'settlementFrequency' => $s->settlement_frequency, 'autoPayEnabled' => false, 'documentName' => '',
            ],
            'transactions' => $inv->map(fn ($i) => [
                'id' => $i->id, 'service' => $i->description, 'invoice' => $i->reference, 'amount' => number_format($i->amount_kobo / 100, 2, '.', ''),
                'date' => $i->issued_on->toDateString(), 'status' => $i->status,
            ])->values(),
            'urgentAction' => $pending ? ['title' => $pending->description, 'amount' => number_format($pending->amount_kobo / 100, 2, '.', ''),
                'dueDate' => $pending->issued_on->copy()->addDays(14)->toDateString(), 'overdueDays' => max(0, (int) $pending->issued_on->copy()->addDays(14)->diffInDays(today(), false))] : null,
            'nextBillingDate' => today()->addMonth()->startOfMonth()->toDateString(),
        ]]);
    }

    /** Public catalogue: products of open stores that are in stock or listed. */
    public function catalog(): JsonResponse
    {
        $rows = StoreProduct::whereHas('store', fn ($q) => $q->where('is_open', true))->orderByDesc('featured')->orderBy('id')->limit(500)->get();
        return response()->json(['data' => $rows->map(fn ($p) => self::productOut($p))->values()]);
    }
}
