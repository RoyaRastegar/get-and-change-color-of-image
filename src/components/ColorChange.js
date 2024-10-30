import { useEffect, useRef, useState } from "react";
import Img from "../assets/photo_2024-10-30_12-36-26.jpg";

const ColorChange = () => {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [colorMap, setColorMap] = useState(new Map());

  const isSimilarColor = (color1, color2, threshold = 30) => {
    return (
      Math.abs(color1[0] - color2[0]) < threshold &&
      Math.abs(color1[1] - color2[1]) < threshold &&
      Math.abs(color1[2] - color2[2]) < threshold
    );
  };

  const floodFill = (
    ctx,
    startX,
    startY,
    targetColor,
    fillColor,
    threshold = 50
  ) => {
    const { width, height } = ctx.canvas;
    const pixelStack = [[startX, startY]];
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    while (pixelStack.length) {
      const [x, y] = pixelStack.pop();
      const index = (y * width + x) * 4;

      const currentColor = [
        data[index],
        data[index + 1],
        data[index + 2],
        data[index + 3],
      ];

      if (!isSimilarColor(currentColor, targetColor, threshold)) {
        continue;
      }

      data[index] = fillColor[0];
      data[index + 1] = fillColor[1];
      data[index + 2] = fillColor[2];
      data[index + 3] = fillColor[3];

      // اضافه کردن پیکسل‌های همسایه به استک
      if (x > 0) pixelStack.push([x - 1, y]); // چپ
      if (x < width - 1) pixelStack.push([x + 1, y]); // راست
      if (y > 0) pixelStack.push([x, y - 1]); // بالا
      if (y < height - 1) pixelStack.push([x, y + 1]);
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const handleClick = (event) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(event.clientX - rect.left);
    const y = Math.floor(event.clientY - rect.top);

    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    const targetColor = [
      pixelData[0],
      pixelData[1],
      pixelData[2],
      pixelData[3],
    ];
    const fillColor = [255, 0, 0, 255];

    const targetKey = `${x},${y}`;

    if (colorMap.has(targetKey)) {
      const originalColor = colorMap.get(targetKey);
      floodFill(ctx, x, y, fillColor, originalColor);
      colorMap.delete(targetKey);
    } else {
      colorMap.set(targetKey, targetColor);
      floodFill(ctx, x, y, targetColor, fillColor);
    }

    setColorMap(new Map(colorMap));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const img = imgRef.current;

    const loadImage = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.addEventListener("load", loadImage);
    return () => {
      img.removeEventListener("load", loadImage);
    };
  }, []);

  return (
    <div>
      <img
        crossOrigin="anonymous"
        ref={imgRef}
        src={Img}
        alt="img"
        style={{ display: "none" }}
        // onClick={handleClick}
      />
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        style={{ border: "1px solid black" }}
      />
    </div>
  );
};
export default ColorChange;