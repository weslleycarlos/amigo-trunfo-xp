import React, { useRef, useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Check } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

const ASPECT_RATIO = 3 / 4;
const OUTPUT_WIDTH = 600;

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCropComplete, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      setImage(img);
      // Center initially
      const initialScale = Math.max(OUTPUT_WIDTH / img.width, (OUTPUT_WIDTH / ASPECT_RATIO) / img.height);
      setScale(initialScale);
    };
  }, [imageSrc]);

  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;
    
    const drawX = centerX - (imgWidth / 2) + offset.x;
    const drawY = centerY - (imgHeight / 2) + offset.y;

    ctx.drawImage(image, drawX, drawY, imgWidth, imgHeight);

  }, [image, scale, offset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    if (canvasRef.current) {
      onCropComplete(canvasRef.current.toDataURL('image/png'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#ECE9D8] p-1 rounded-lg shadow-2xl border-2 border-[#0054E3] w-full max-w-lg">
        {/* Windows XP Title Bar */}
        <div className="bg-gradient-to-r from-[#0058EE] via-[#2F82FF] to-[#0054E3] px-2 py-1 flex justify-between items-center rounded-t mb-1">
          <span className="text-white font-bold text-sm font-sans drop-shadow-md">Cortar Imagem (Editor v1.0)</span>
          <button onClick={onCancel} className="bg-[#D84631] hover:bg-[#E85641] text-white w-5 h-5 flex items-center justify-center rounded border border-white text-xs shadow-inner">X</button>
        </div>

        <div className="p-4 bg-white border-2 border-[#ACA899] inset-shadow">
          <div className="relative overflow-hidden border-2 border-dashed border-gray-400 mx-auto" style={{ width: 300, height: 400 }}>
             <canvas
                ref={canvasRef}
                width={OUTPUT_WIDTH}
                height={OUTPUT_WIDTH / ASPECT_RATIO}
                className="w-full h-full cursor-move touch-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
             />
             <div className="absolute inset-0 pointer-events-none border-2 border-blue-500 opacity-30 mix-blend-difference grid grid-cols-3 grid-rows-3">
                <div className="border-r border-blue-500"></div>
                <div className="border-r border-blue-500"></div>
                <div></div>
                <div className="border-t border-blue-500 col-span-3"></div>
                <div className="border-t border-blue-500 col-span-3"></div>
             </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-4">
            <button onClick={() => setScale(s => Math.max(0.1, s - 0.1))} className="p-2 bg-gray-200 rounded hover:bg-gray-300 shadow"><ZoomOut size={16} /></button>
            <input 
              type="range" 
              min="0.1" 
              max="3" 
              step="0.05" 
              value={scale} 
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-32"
            />
            <button onClick={() => setScale(s => s + 0.1)} className="p-2 bg-gray-200 rounded hover:bg-gray-300 shadow"><ZoomIn size={16} /></button>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-2 px-2 pb-2">
            <button onClick={onCancel} className="px-4 py-1 bg-white border border-gray-400 rounded hover:bg-gray-50 text-sm">Cancelar</button>
            <button onClick={handleCrop} className="px-4 py-1 bg-[#3A9E2D] border border-[#2B7A1F] text-white font-bold rounded shadow-sm hover:brightness-110 text-sm flex items-center gap-2">
               <Check size={14} /> Confirmar
            </button>
        </div>
      </div>
    </div>
  );
};