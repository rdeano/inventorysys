<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index()
    {
        // Stock Summary
        $totalProducts = Product::count();
        $lowStockProducts = Product::whereColumn('stock', '<=', 'low_stock_threshold')->get();
        $outOfStockProducts = Product::where('stock', 0)->count();

        // Orders Summary
        $totalPurchaseOrders = Order::where('type', 'purchase')->count();
        $totalSalesOrders = Order::where('type', 'sales')->count();
        $totalPurchaseAmount = Order::where('type', 'purchase')->where('status', 'completed')->sum('total_amount');
        $totalSalesAmount = Order::where('type', 'sales')->where('status', 'completed')->sum('total_amount');

        // Stock by Category
        $stockByCategory = Category::withCount('products')
            ->withSum('products', 'stock')
            ->get();

        // Recent Orders
        $recentOrders = Order::with(['supplier', 'items.product'])
            ->latest()
            ->take(10)
            ->get();

        // Monthly Sales (last 6 months)
        $monthlySales = Order::where('type', 'sales')
            ->where('status', 'completed')
            ->where('order_date', '>=', now()->subMonths(6))
            ->selectRaw('DATE_FORMAT(order_date, "%Y-%m") as month, SUM(total_amount) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Monthly Purchases (last 6 months)
        $monthlyPurchases = Order::where('type', 'purchase')
            ->where('status', 'completed')
            ->where('order_date', '>=', now()->subMonths(6))
            ->selectRaw('DATE_FORMAT(order_date, "%Y-%m") as month, SUM(total_amount) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return Inertia::render('Reports/Index', [
            'stats' => [
                'totalProducts' => $totalProducts,
                'lowStockCount' => $lowStockProducts->count(),
                'outOfStockCount' => $outOfStockProducts,
                'totalPurchaseOrders' => $totalPurchaseOrders,
                'totalSalesOrders' => $totalSalesOrders,
                'totalPurchaseAmount' => $totalPurchaseAmount,
                'totalSalesAmount' => $totalSalesAmount,
            ],
            'lowStockProducts' => $lowStockProducts,
            'stockByCategory' => $stockByCategory,
            'recentOrders' => $recentOrders,
            'monthlySales' => $monthlySales,
            'monthlyPurchases' => $monthlyPurchases,
        ]);
    }
}