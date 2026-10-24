<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_modifiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // e.g., 'susu', 'topping'
            $table->string('name');
            $table->integer('extra_price'); // stored in Rupiah (e.g. 6000 = +Rp 6.000)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_modifiers');
    }
};
