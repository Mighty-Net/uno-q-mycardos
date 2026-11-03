import { useEffect, useRef, useState } from 'react';
import CameraCorrection from "./components/CameraCorrection"

function App() {
  const imgRef = useRef<HTMLImageElement>(null);
  const busyRef = useRef(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const timer = setInterval(async () => {
      const img = imgRef.current;
      if (busyRef.current || !img?.naturalWidth) return;

      busyRef.current = true;

      try {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d')!.drawImage(img, 0, 0);

        const blob = await new Promise<Blob | null>(
          resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85)
        );
        if (!blob) return;

        const form = new FormData();
        form.append('file', blob, 'frame.jpg');

        const res = await fetch('/api/vision/detect', {
          method: 'POST',
          body: form
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setResult({
          ...data,
          detected: data.success,
          image: {
            width: data.width,
            height: data.height
          },
          corners: data.corners
            ? [
                [data.corners.topLeft.x, data.corners.topLeft.y],
                [data.corners.topRight.x, data.corners.topRight.y],
                [data.corners.bottomRight.x, data.corners.bottomRight.y],
                [data.corners.bottomLeft.x, data.corners.bottomLeft.y]
              ]
            : []
        });
      } catch (err) {
        console.error(err);
      } finally {
        busyRef.current = false;
      }
    }, 300);

    return () => clearInterval(timer);
  }, []);

  const handleCapture = () => {
    const img = imgRef.current;
    if (!img?.naturalWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = 'business-card.jpg';
      a.click();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/jpeg', 0.85);
  };

  // return <CameraCorrection/>

  return (
    <div>
      <h2>MyCard Camera</h2>
      <button onClick={handleCapture}>
  Capture
</button>
      <div style={{display:'flex'}}>
      <div style={{ position: 'relative', width: 800, height: 450 }}>
        <img
          ref={imgRef}
          src="/stream"
          alt="Camera Stream"
          style={{ width: 800, height: 450, display: 'block' }}
        />

        {result?.detected && (
          <svg
            viewBox={`0 0 ${result.image.width} ${result.image.height}`}
            preserveAspectRatio="none"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          >
            <polygon
              points={result.corners.map(
                ([x, y]: number[]) => `${x},${y}`
              ).join(' ')}
              fill="none"
              stroke="lime"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}
      </div>

      <pre>{JSON.stringify(result, null, 2)}</pre>
      </div>
    </div>
  );
}

export default App;