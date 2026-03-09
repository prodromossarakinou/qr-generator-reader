declare global {
  interface DetectedBarcode {
    boundingBox: DOMRectReadOnly;
    cornerPoints: ReadonlyArray<{ x: number; y: number }>;
    format: string;
    rawValue?: string;
  }

  interface BarcodeDetectorOptions {
    formats?: string[];
  }

  interface BarcodeDetectorInstance {
    detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>;
  }

  interface BarcodeDetectorConstructor {
    new (options?: BarcodeDetectorOptions): BarcodeDetectorInstance;
    getSupportedFormats(): Promise<string[]>;
  }

  const BarcodeDetector: BarcodeDetectorConstructor;

  interface Window {
    BarcodeDetector: BarcodeDetectorConstructor;
  }
}

export {};
