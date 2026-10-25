import React, { useEffect, useRef, useState } from 'react';

/**
 * Interactive Sketchbook Entertainment: "Corat-Coret Mini" Canvas
 * (RFC-007, UI-1, UI-4, design: 06_pelacak_pesanan_real_time/code.html)
 */
export default function MiniDoodleCanvas() {
    const canvasRef = useRef(null);
    const [hasDrawn, setHasDrawn] = useState(false);
    const [activeColor, setActiveColor] = useState('#4A2C17');
    const isDrawingRef = useRef(false);

    const colors = [
        { hex: '#4A2C17', label: 'Espresso' },
        { hex: '#FF7A59', label: 'Terakota' },
        { hex: '#FFC93C', label: 'Kuning' },
        { hex: '#7B563E', label: 'Cokelat' },
    ];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        function setupCanvasSize() {
            const rect = canvas.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                // Save current canvas content before resize
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const tempCtx = tempCanvas.getContext('2d');
                if (canvas.width > 0 && canvas.height > 0) {
                    tempCtx.drawImage(canvas, 0, 0);
                }

                canvas.width = rect.width;
                canvas.height = rect.height;

                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.lineWidth = 3.5;
                ctx.strokeStyle = activeColor;

                // Restore previous strokes
                if (tempCanvas.width > 0 && tempCanvas.height > 0) {
                    ctx.drawImage(tempCanvas, 0, 0);
                }
            }
        }

        setupCanvasSize();
        window.addEventListener('resize', setupCanvasSize);
        return () => window.removeEventListener('resize', setupCanvasSize);
    }, []);

    // Update stroke style when active color changes
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.strokeStyle = activeColor;
        }
    }, [activeColor]);

    const getCoords = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };
    };

    const startDraw = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        isDrawingRef.current = true;
        setHasDrawn(true);

        const { x, y } = getCoords(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e) => {
        if (!isDrawingRef.current) return;
        if (e.cancelable && e.type.startsWith('touch')) {
            e.preventDefault();
        }
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const { x, y } = getCoords(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDraw = () => {
        if (isDrawingRef.current) {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.closePath();
            }
            isDrawingRef.current = false;
        }
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
    };

    return (
        <div className="rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container)] p-4 marker-shadow">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[22px] text-[var(--color-promo)]">
                        brush
                    </span>
                    <span className="font-extrabold text-[var(--color-ink)]">Corat-Coret Mini</span>
                </div>
                <button
                    type="button"
                    onClick={handleClear}
                    className="rounded-lg border border-[var(--color-ink)] bg-[var(--color-surface-container-high)] px-2.5 py-1 text-xs font-extrabold text-[var(--color-ink)] shadow-[1.5px_1.5px_0px_var(--color-ink)] active:translate-y-0.5 active:shadow-none transition-all"
                >
                    Hapus Kanvas
                </button>
            </div>

            <p className="mt-1 text-xs italic text-[var(--color-ink-soft)]">
                “Secangkir kopi, sejuta inspirasi corat-coret.”
            </p>

            {/* Canvas Frame */}
            <div className="relative mt-2.5 h-36 w-full touch-none overflow-hidden rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface)] shadow-[2px_2px_0px_var(--color-ink)] cursor-crosshair">
                <canvas
                    ref={canvasRef}
                    className="block h-full w-full"
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={stopDraw}
                />
                {!hasDrawn && (
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-[var(--color-outline)] transition-opacity">
                        <span className="material-symbols-outlined text-[28px]">stylus</span>
                        <span className="mt-1 text-xs font-bold">Sentuh & gambar bebas di sini!</span>
                    </div>
                )}
            </div>

            {/* Quick Doodle Palette */}
            <div className="mt-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {colors.map((c) => (
                        <button
                            key={c.hex}
                            type="button"
                            title={c.label}
                            onClick={() => setActiveColor(c.hex)}
                            style={{ backgroundColor: c.hex }}
                            className={`h-6 w-6 rounded-full border-2 border-[var(--color-ink)] shadow-xs transition-transform ${
                                activeColor === c.hex ? 'scale-125 ring-2 ring-[var(--color-promo)]' : 'hover:scale-110'
                            }`}
                        />
                    ))}
                </div>
                <span className="text-[11px] font-bold text-[var(--color-ink-soft)]">
                    Tersimpan otomatis di layarmu ✨
                </span>
            </div>
        </div>
    );
}
