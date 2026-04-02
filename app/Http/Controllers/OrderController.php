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
    public function index(Request $request)
    {
        $orders = Order::with(['supplier', 'items.product'])
            ->when($request->search, fn($q) => $q
                ->where('order_number', 'like', "%{$request->search}%")
                ->orWhereHas('supplier', fn($q) => $q->where('name', 'like', "%{$request->search}%")))
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'products' => Product::all(),
            'suppliers' => Supplier::all(),
            'filters' => $request->only(['search', 'type']),
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

        if ($request->type === 'sales' && $request->status === 'completed') {
            foreach ($request->items as $item) {
                $product = Product::find($item['product_id']);
                if ($product->stock < $item['quantity']) {
                    return back()->withErrors([
                        'items' => "Not enough stock for {$product->name}. Available: {$product->stock}"
                    ]);
                }
            }
        }


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
            }

            // Only update stock if order is created as completed
            if ($request->status === 'completed') {
                $this->updateStock($order, 'completed');
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

        $oldStatus = $order->status;
        $newStatus = $request->status;

        if ($oldStatus === 'pending' && $newStatus === 'completed' && $order->type === 'sales') {
            foreach ($order->items as $item) {
                $product = Product::find($item->product_id);
                if ($product->stock < $item->quantity) {
                    return back()->withErrors([
                        'items' => "Not enough stock for {$product->name}. Available: {$product->stock}"
                    ]);
                }
            }
        }


        DB::transaction(function () use ($request, $order, $oldStatus, $newStatus) {
            $order->update([
                'status' => $newStatus,
                'notes' => $request->notes,
            ]);

            // pending → completed: add/deduct stock
            if ($oldStatus === 'pending' && $newStatus === 'completed') {
                $this->updateStock($order, 'completed');
            }

            // completed → cancelled: reverse stock
            if ($oldStatus === 'completed' && $newStatus === 'cancelled') {
                $this->updateStock($order, 'cancelled');
            }

            // pending → cancelled: no stock change needed
        });

        return back()->with('success', 'Order updated successfully.');
    }

    public function destroy(Order $order)
    {
        DB::transaction(function () use ($order) {
            // If completed, reverse stock before deleting
            if ($order->status === 'completed') {
                $this->updateStock($order, 'cancelled');
            }
            $order->delete();
        });

        return back()->with('success', 'Order deleted successfully.');
    }

    private function updateStock(Order $order, string $action)
    {
        $order->load('items');

        foreach ($order->items as $item) {
            $product = Product::find($item->product_id);
            if (!$product) continue;

            if ($action === 'completed') {
                if ($order->type === 'purchase') {
                    // Buying → increase stock
                    $product->increment('stock', $item->quantity);
                } else {
                    // Selling → decrease stock
                    // Make sure we don't go below 0
                    $newStock = max(0, $product->stock - $item->quantity);
                    $product->update(['stock' => $newStock]);
                }
            } elseif ($action === 'cancelled') {
                if ($order->type === 'purchase') {
                    // Reverse purchase → decrease stock
                    $newStock = max(0, $product->stock - $item->quantity);
                    $product->update(['stock' => $newStock]);
                } else {
                    // Reverse sales → increase stock back
                    $product->increment('stock', $item->quantity);
                }
            }
        }
    }
}