<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with(['supplier', 'items.product'])
            ->latest()
            ->paginate(10);

        $products = Product::all();
        $suppliers = Supplier::all();

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'products' => $products,
            'suppliers' => $suppliers,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:purchase,sales',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'customer_name' => 'nullable|string',
            'order_date' => 'required|date',
            'status' => 'required|in:pending,completed,cancelled',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($request) {
            $total = collect($request->items)->sum(fn($i) => $i['quantity'] * $i['unit_price']);

            $order = Order::create([
                'type' => $request->type,
                'supplier_id' => $request->supplier_id,
                'customer_name' => $request->customer_name,
                'order_date' => $request->order_date,
                'total_amount' => $total,
                'status' => $request->status,
                'notes' => $request->notes,
            ]);

            foreach ($request->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['quantity'] * $item['unit_price'],
                ]);

                // Update stock
                $product = Product::find($item['product_id']);
                if ($request->type === 'purchase') {
                    $product->increment('stock', $item['quantity']);
                } else {
                    $product->decrement('stock', $item['quantity']);
                }
            }
        });

        return back()->with('success', 'Order created successfully.');
    }

    public function update(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,completed,cancelled',
            'notes' => 'nullable|string',
        ]);

        $order->update($request->only('status', 'notes'));
        return back()->with('success', 'Order updated successfully.');
    }

    public function destroy(Order $order)
    {
        $order->delete();
        return back()->with('success', 'Order deleted successfully.');
    }
}