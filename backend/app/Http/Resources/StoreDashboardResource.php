<?php

namespace App\Http\Resources;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoreDashboardResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'merchant' => [
                'name' => $this->name,
                'merchantId' => $this->merchant_id,
                'joinedAt' => $this->joined_at->toDateString(),
                'tier' => $this->tier,
                'totalRevenue' => $this->total_revenue,
                'pendingSettlements' => $this->pending_settlements,
                'activeProducts' => $this->active_products,
                'orderVolume' => $this->order_volume,
                'settlementMode' => $this->settlement_mode,
                'settlementFrequency' => $this->settlement_frequency,
                'autoPayEnabled' => $this->auto_pay_enabled,
                'documentName' => $this->document_name,
            ],
            'transactions' => $this->whenLoaded(
                'transactions',
                fn () => $this->transactions->map(fn (Transaction $transaction) => [
                    'id' => $transaction->id,
                    'service' => $transaction->service,
                    'invoice' => $transaction->invoice,
                    'amount' => $transaction->amount,
                    'date' => $transaction->transaction_date->toDateString(),
                    'status' => $transaction->status,
                ]),
            ),
            'urgentAction' => [
                'title' => 'Quarterly Service Fee (Q4)',
                'amount' => '150000.00',
                'dueDate' => '2023-11-15',
                'overdueDays' => 12,
            ],
            'nextBillingDate' => '2023-12-20',
        ];
    }
}
