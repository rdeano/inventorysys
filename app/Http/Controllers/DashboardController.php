<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
use App\Models\Supplier;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Stats
        $totalProducts = Product::count();
        $totalSuppliers = Supplier::count();
        $totalCategories = Category::count();
        $lowStockProducts = Product::whereColumn('stock', '<=', 'low_stock_threshold')->get();
        $outOfStock = Product::where('stock', 0)->count();

        // Orders
        $totalSalesAmount = Order::where('type', 'sales')->where('status', 'completed')->sum('total_amount');
        $totalPurchaseAmount = Order::where('type', 'purchase')->where('status', 'completed')->sum('total_amount');
        $pendingOrders = Order::where('status', 'pending')->count();

        // Recent Orders
        $recentOrders = Order::with(['supplier', 'items'])
            ->latest()
            ->take(5)
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

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalProducts' => $totalProducts,
                'totalSuppliers' => $totalSuppliers,
                'totalCategories' => $totalCategories,
                'lowStockCount' => $lowStockProducts->count(),
                'outOfStock' => $outOfStock,
                'totalSalesAmount' => $totalSalesAmount,
                'totalPurchaseAmount' => $totalPurchaseAmount,
                'pendingOrders' => $pendingOrders,
            ],
            'lowStockProducts' => $lowStockProducts,
            'recentOrders' => $recentOrders,
            'monthlySales' => $monthlySales,
            'monthlyPurchases' => $monthlyPurchases,
        ]);
    }
}