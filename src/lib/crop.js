/**
 * 비율은 유지한 채 중앙을 1:1로만 자릅니다. 늘리거나 줄이지 않습니다.
 */
export function cropImageToSquare(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      const side = Math.min(width, height);
      const sx = Math.floor((width - side) / 2);
      const sy = Math.floor((height - side) / 2);
      const canvas = document.createElement("canvas");
      canvas.width = side;
      canvas.height = side;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, sx, sy, side, side, 0, 0, side, side);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error("crop failed"));
            return;
          }
          resolve(blob);
        },
        "image/png",
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image load failed"));
    };
    image.src = url;
  });
}
