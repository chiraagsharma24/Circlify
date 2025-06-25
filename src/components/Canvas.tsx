import React, { useRef, useEffect, useState, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
}

interface CanvasProps {
  onCircleComplete: (points: Point[]) => void;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ onCircleComplete, isDrawing, setIsDrawing }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);

  const getCanvasCoordinates = useCallback((e: MouseEvent | TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return { x: 0, y: 0 };
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  const startDrawing = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    const point = getCanvasCoordinates(e);
    setIsDrawing(true);
    setCurrentPath([point]);
    setLastPoint(point);
  }, [getCanvasCoordinates, setIsDrawing]);

  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const currentPoint = getCanvasCoordinates(e);
    
    if (lastPoint) {
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#3B82F6';
      ctx.globalCompositeOperation = 'source-over';
      
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();
    }

    setCurrentPath(prev => [...prev, currentPoint]);
    setLastPoint(currentPoint);
  }, [isDrawing, lastPoint, getCanvasCoordinates]);

  const stopDrawing = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    setIsDrawing(false);
    setLastPoint(null);
    
    if (currentPath.length > 10) {
      onCircleComplete(currentPath);
    }
    
    setCurrentPath([]);
  }, [isDrawing, currentPath, onCircleComplete, setIsDrawing]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mouse events
    const handleMouseDown = (e: MouseEvent) => startDrawing(e);
    const handleMouseMove = (e: MouseEvent) => draw(e);
    const handleMouseUp = (e: MouseEvent) => stopDrawing(e);

    // Touch events
    const handleTouchStart = (e: TouchEvent) => startDrawing(e);
    const handleTouchMove = (e: TouchEvent) => draw(e);
    const handleTouchEnd = (e: TouchEvent) => stopDrawing(e);

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startDrawing, draw, stopDrawing]);

  useEffect(() => {
    clearCanvas();
  }, []);

  return (
    <div className="relative group">
      {/* Canvas container with enhanced styling */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-4 border-4 border-white/20 backdrop-blur-sm">
        <canvas
          ref={canvasRef}
          width={350}
          height={350}
          className="rounded-2xl bg-white cursor-crosshair touch-none select-none shadow-inner border-2 border-gray-100 transition-all duration-300 group-hover:shadow-lg"
          style={{ touchAction: 'none' }}
        />
        
        {/* Clear button with enhanced styling */}
        <button
          onClick={clearCanvas}
          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl border-2 border-white z-10"
          aria-label="Clear canvas"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Drawing indicator */}
        {isDrawing && (
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse">
              Drawing...
            </div>
          </div>
        )}
      </div>

      {/* Canvas instructions overlay for first-time users */}
      {!isDrawing && currentPath.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/20 backdrop-blur-sm text-white px-6 py-3 rounded-2xl text-center border border-white/20">
            <p className="text-lg font-medium mb-1">🎯 Draw Here</p>
            <p className="text-sm opacity-90">Tap and drag to draw your circle</p>
          </div>
        </div>
      )}
    </div>
  );
};