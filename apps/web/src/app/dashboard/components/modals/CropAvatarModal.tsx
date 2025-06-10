import { Button } from "$/components/ui/Button";
import { Modal } from "$/components/ui/Modal";
import { toast } from "$/components/ui/Toast";
import { useRef, useState } from "react";
import { ReactCrop, type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface CropAvatarModalProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onCrop: (croppedImage: Blob) => void;
  onCancel: () => void;
}

export function CropAvatarModal({
  isOpen,
  onClose,
  imageUrl,
  onCrop,
  onCancel,
}: CropAvatarModalProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });

  // Fix oval shape on non-1:1 images
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const size = Math.min(width, height);

    setCrop({
      unit: "px",
      width: size,
      height: size,
      x: (width - size) / 2,
      y: (height - size) / 2,
    });
  };

  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const getCroppedImage = async () => {
    const image = imageRef.current;
    if (!image) {
      throw new Error("No image");
    }

    // Create a webp preview of the image rescaled to 256x256 with quality of 0.9
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("No 2d context");
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = 256;
    canvas.height = 256;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      256,
      256,
    );

    return new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          }
        },
        "image/webp",
        0.9,
      );
    });
  };

  const handleCrop = async () => {
    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImage();
      onCrop(croppedImage);
    } catch (error) {
      console.error("Error cropping image:", error);
      toast.error("Ocorreu um erro ao tentar cortar a imagem.");
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  if (!imageUrl) {
    return null;
  }

  return (
    <Modal title="Ajustar o avatar" isOpen={isOpen} onClose={onCancel}>
      <div className="mt-8">
        <div className="grid">
          <ReactCrop
            className="mx-auto"
            crop={crop}
            onChange={(c) => {
              setCrop(c);
            }}
            aspect={1}
            circularCrop
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              className="max-h-[256px] max-w-[256px]"
              src={imageUrl}
              alt="Prévia do corte"
              onLoad={handleImageLoad}
            />
          </ReactCrop>
        </div>
        <div className="mt-12 flex gap-4">
          <Button
            className="w-full max-w-48"
            type="submit"
            onClick={handleCrop}
            variant="accent"
            isLoading={isProcessing}
          >
            Cortar
          </Button>
          <Button onClick={onCancel}>Cancelar</Button>
        </div>
      </div>
    </Modal>
  );
}
