<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FinanceDashboardController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\ManagementDashboardController;
use App\Http\Controllers\Api\PaymentRecordController;
use App\Http\Controllers\Api\ReceiptController;
use App\Http\Controllers\Api\OutstandingPaymentController;
use App\Http\Controllers\Api\ResidentFinanceController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\FinanceReportController;
use App\Http\Controllers\Api\ServiceManagementController;
use App\Http\Controllers\Api\PaystackController;

/*
|--------------------------------------------------------------------------
| API Routes for Lincoln Estate Management
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Task 1: Finance Dashboard 1 Overview
    Route::get('/finance/overview', [FinanceDashboardController::class, 'overview']);
    // Task 3: Finance Mobile Dashboard Overview
    Route::get('/finance/mobile-overview', [FinanceDashboardController::class, 'mobileOverview']);

    // Task 2: Staff Management & Deletion Confirmation
    Route::apiResource('staffs', StaffController::class);

    // Task 4: Management Dashboard Overview (Nav Icon Only)
    Route::get('/management/overview', [ManagementDashboardController::class, 'overview']);

    // Task 6 & 7: Payment Records (Dynamic filtering & pagination + Mobile Summary)
    Route::get('/payments/records', [PaymentRecordController::class, 'index']);
    Route::get('/payments/mobile-summary', [PaymentRecordController::class, 'mobileSummary']);

    // Task 10: Payment Receipt
    Route::get('/payments/receipt/{receiptNumber}', [ReceiptController::class, 'show']);

    // Task 14: Outstanding Payments
    Route::get('/payments/outstanding', [OutstandingPaymentController::class, 'index']);
    Route::post('/payments/outstanding/{id}/remind', [OutstandingPaymentController::class, 'sendReminder']);
    Route::post('/payments/outstanding/remind-all', [OutstandingPaymentController::class, 'sendBulkReminders']);

    // Task 15: Resident Finance Summary
    Route::get('/residents/{id}/finance-summary', [ResidentFinanceController::class, 'show']);
    Route::post('/residents/{id}/record-payment', [ResidentFinanceController::class, 'recordPayment']);
    Route::post('/finance/invoices/generate', [ResidentFinanceController::class, 'generateInvoices']);

    // Task 16: Payment Analytics
    Route::get('/finance/analytics', [AnalyticsController::class, 'index']);

    // Task 17: Finance Report Center
    Route::get('/finance/reports', [FinanceReportController::class, 'index']);
    Route::post('/finance/reports/export', [FinanceReportController::class, 'export']);

    // Task 18: Service Management
    Route::apiResource('finance/services', ServiceManagementController::class);

    // Task 19: Paystack Checkout & Payment Types
    Route::get('/payments/types', [PaystackController::class, 'paymentTypes']);
    Route::post('/payments/paystack/initialize', [PaystackController::class, 'initialize']);
    Route::get('/payments/paystack/verify/{reference}', [PaystackController::class, 'verify']);

    // Task 20: Estate Services Billing & Paystack Collection
    Route::get('/payments/estate-services', [\App\Http\Controllers\Api\V1\EstateServicesBillingController::class, 'index']);
    Route::post('/payments/estate-services', [\App\Http\Controllers\Api\V1\EstateServicesBillingController::class, 'store']);

    // Task 21: Paystack Installment Plans & Service Ledger
    Route::get('/payments/installments', [\App\Http\Controllers\Api\V1\InstallmentPlanController::class, 'index']);

    // Task 22: Paystack Checkout Form & 3DS OTP Verification
    Route::post('/payments/paystack/charge', [\App\Http\Controllers\Api\V1\PaystackCheckoutFormController::class, 'charge']);
    Route::post('/payments/paystack/submit-otp', [\App\Http\Controllers\Api\V1\PaystackCheckoutFormController::class, 'submitOtp']);
    Route::get('/payments/paystack/verify-reference/{reference}', [\App\Http\Controllers\Api\V1\PaystackCheckoutFormController::class, 'verifyReference']);
});
