import { useEffect, useRef } from "react";
import { ColorPicker, useColor } from "react-color-palette";
import { useDispatch, useSelector } from "react-redux";
import { setColor, updateColorMap } from "../featurs/changeColor/colorSlice";
import Img from "../assets/photo_2024-10-30_12-36-26.jpg";
import "./colorchange.css";
import "react-color-palette/css";

const ColorChange = () => {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const dispatch = useDispatch();
  const color = useSelector((state) => state.color.color);
  const [currentColor] = useColor(color);
  const colorMap = useSelector((store) => store.color.colorMap);

  const isSimilarColor = (color1, color2, threshold = 10) => {
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
    threshold = 10
  ) => {
    if (
      targetColor[0] === fillColor[0] &&
      targetColor[1] === fillColor[1] &&
      targetColor[2] === fillColor[2] &&
      targetColor[3] === fillColor[3]
    ) {
      return [];
    }

    const { width, height } = ctx.canvas;
    const pixelStack = [[startX, startY]];
    const visitedPixels = [];
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

      if (!isSimilarColor(currentColor, targetColor, threshold)) continue;
      visitedPixels.push([x, y]);
      data[index] = fillColor[0];
      data[index + 1] = fillColor[1];
      data[index + 2] = fillColor[2];
      data[index + 3] = fillColor[3];

      if (x > 0) pixelStack.push([x - 1, y]);
      if (x < width - 1) pixelStack.push([x + 1, y]);
      if (y > 0) pixelStack.push([x, y - 1]);
      if (y < height - 1) pixelStack.push([x, y + 1]);
    }
    ctx.putImageData(imageData, 0, 0);
    return visitedPixels;
  };

  const handleClick = (event) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(event.clientX - rect.left);
    const y = Math.floor(event.clientY - rect.top);

    const hexToRgb = (hex) => {
      const bigint = parseInt(hex.slice(1), 16);
      return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255, 255];
    };

    const targetKey = `${x}-${y}`;
    if (colorMap[targetKey]) {
      const originalColor = colorMap[targetKey];
      floodFill(ctx, x, y, hexToRgb(color), originalColor, 10);
      const newColorMap = { ...colorMap };
      delete newColorMap[targetKey];
      dispatch(updateColorMap(newColorMap));
    } else {
      const pixelData = ctx.getImageData(x, y, 1, 1).data;
      const targetColor = [
        pixelData[0],
        pixelData[1],
        pixelData[2],
        pixelData[3],
      ];
      const fillColor = hexToRgb(color);
      floodFill(ctx, x, y, targetColor, fillColor, 10);
      dispatch(updateColorMap({ ...colorMap, [targetKey]: targetColor }));
    }
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
    <div className="container">
      <div className="pallet">
        <ColorPicker
          color={currentColor}
          onChange={(newColor) => {
            dispatch(setColor(newColor.hex));
          }}
        />
      </div>

      <div className="img">
        <img crossOrigin="anonymous" ref={imgRef} src={Img} alt="img" />
        <canvas ref={canvasRef} onClick={handleClick} />
      </div>
    </div>
  );
};
export default ColorChange;
