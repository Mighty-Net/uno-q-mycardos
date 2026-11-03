
import { useEffect, useRef, useState } from 'react';
import './CameraCorrection.css';

interface CameraCorrectionProps {
  src?: string;
  interval?: number;
  showControls?: boolean;
  onChange?: (k1: number, k2: number) => void;
}

export default function CameraCorrection({
  src = '/stream',
  interval = 300,
  showControls = true,
  onChange,
}: CameraCorrectionProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const k1Ref = useRef(0);
  const k2Ref = useRef(0);

  const [k1, setK1] = useState(0);
  const [k2, setK2] = useState(0);

  const updateK1 = (value: number) => {
    k1Ref.current = value;
    setK1(value);
    onChange?.(value, k2Ref.current);
  };

  const updateK2 = (value: number) => {
    k2Ref.current = value;
    setK2(value);
    onChange?.(k1Ref.current, value);
  };

  useEffect(() => {
    const source = document.createElement('canvas');
    sourceCanvasRef.current = source;

    const timer = window.setInterval(() => {
      const img = imgRef.current;
      const canvas = canvasRef.current;

      if (!img || !canvas || !img.naturalWidth) return;

      const width = img.naturalWidth;
      const height = img.naturalHeight;

      if (
        canvas.width !== width ||
        canvas.height !== height
      ) {
        canvas.width = width;
        canvas.height = height;
        source.width = width;
        source.height = height;
      }

      const srcCtx = source.getContext('2d', {
        willReadFrequently: true,
      });

      const dstCtx = canvas.getContext('2d');

      if (!srcCtx || !dstCtx) return;

      try {
        srcCtx.drawImage(img, 0, 0, width, height);

        const src = srcCtx.getImageData(
          0, 0, width, height
        );

        const dst = dstCtx.createImageData(width, height);

        const cx = width / 2;
        const cy = height / 2;

        const a = k1Ref.current;
        const b = k2Ref.current;

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const nx = (x - cx) / cx;
            const ny = (y - cy) / cy;

            const r2 = nx * nx + ny * ny;
            const factor = 1 + a * r2 + b * r2 * r2;

            const sx = Math.round(cx + nx * factor * cx);
            const sy = Math.round(cy + ny * factor * cy);

            const di = (y * width + x) * 4;

            if (
              sx >= 0 &&
              sx < width &&
              sy >= 0 &&
              sy < height
            ) {
              const si = (sy * width + sx) * 4;

              dst.data[di] = src.data[si];
              dst.data[di + 1] = src.data[si + 1];
              dst.data[di + 2] = src.data[si + 2];
              dst.data[di + 3] = 255;
            } else {
              dst.data[di] = 0;
              dst.data[di + 1] = 0;
              dst.data[di + 2] = 0;
              dst.data[di + 3] = 255;
            }
          }
        }

        dstCtx.putImageData(dst, 0, 0);
      } catch (error) {
        console.error('Camera correction failed:', error);
      }
    }, interval);

    return () => {
      window.clearInterval(timer);
      sourceCanvasRef.current = null;
    };
  }, [interval]);

  return (
    <div className="camera-correction">
      <div className="camera-correction-preview">
        <div>
          <h4>Original</h4>
          <img
            ref={imgRef}
            src={src}
            alt="Camera Stream"
          />
        </div>

        <div>
          <h4>Corrected</h4>
          <canvas ref={canvasRef} />
        </div>
      </div>

      {showControls && (
        <div className="camera-correction-controls">
          <label>
            k1: {k1.toFixed(3)}
            <input
              type="range"
              min="-0.5"
              max="0.5"
              step="0.005"
              value={k1}
              onChange={(e) =>
                updateK1(Number(e.target.value))
              }
            />
          </label>

          <label>
            k2: {k2.toFixed(3)}
            <input
              type="range"
              min="-0.3"
              max="0.3"
              step="0.005"
              value={k2}
              onChange={(e) =>
                updateK2(Number(e.target.value))
              }
            />
          </label>

          <button
            type="button"
            onClick={() => {
              updateK1(0);
              updateK2(0);
            }}
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
