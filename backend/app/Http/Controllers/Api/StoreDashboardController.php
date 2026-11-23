<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StoreDashboardResource;
use App\Models\Merchant;

class StoreDashboardController extends Controller
{
    public function __invoke(): StoreDashboardResource
    {
        $merchant = Merchant::query()
            ->with(['transactions' => fn ($query) => $query->orderByDesc('transaction_date')])
            ->firstOrFail();

        return new StoreDashboardResource($merchant);
    }
}
