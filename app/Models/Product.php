<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'sku',
        'category_id',
        'supplier_id',
        'unit',
        'price',
        'stock',
        'low_stock_threshold',
        'description',
        'image',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function supplier()  // 👈 This is missing
    {
        return $this->belongsTo(Supplier::class);
    }
}