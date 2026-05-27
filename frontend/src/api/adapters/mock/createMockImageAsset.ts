import type { ImageAsset } from "../../contracts";
import { SanilApiError } from "../../errors";

const readImageSize = (imageUrl: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    const imageElement = new Image();
    imageElement.onload = () => resolve({ width: imageElement.naturalWidth, height: imageElement.naturalHeight });
    imageElement.onerror = () => reject(new SanilApiError("validation", "이미지 크기를 확인할 수 없습니다."));
    imageElement.src = imageUrl;
  });

export async function createMockImageAsset(imageFile: File, imageUuidPrefix: string): Promise<ImageAsset> {
  if (imageFile.size === 0) {
    throw new SanilApiError("validation", "이미지 파일이 비어 있습니다.");
  }

  if (!imageFile.type.startsWith("image/")) {
    throw new SanilApiError("validation", "이미지 파일만 등록할 수 있습니다.");
  }

  const imageUrl = window.URL.createObjectURL(imageFile);

  try {
    const size = await readImageSize(imageUrl);
    const timestamp = Date.now().toString(36);
    return {
      imageUuid: `${imageUuidPrefix}-${timestamp}`,
      originalFilename: imageFile.name || "image",
      mimeType: imageFile.type,
      width: size.width,
      height: size.height,
      imageUrl,
      thumbnailUrl: imageUrl,
    };
  } catch (error) {
    window.URL.revokeObjectURL(imageUrl);
    throw error;
  }
}
