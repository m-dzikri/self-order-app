<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('price'); // stored in Rupiah (e.g. 22000 = Rp 22.000)
            $table->string('image_path')->nullable(); // relative path e.g. "menu_images/coffee.jpg"
            $table->string('badge')->nullable(); // will be cast to enum
            $table->boolean('is_active')->default(true);
            $table->boolean('is_in_stock')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};
