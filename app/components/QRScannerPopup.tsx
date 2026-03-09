"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CameraIcon, ScanIcon, UploadIcon } from "./icons";

type QRMode = "select" | "camera" | "upload";
type CameraPermission = "unknown" | "granted" | "denied" | "unsupported";

export type QRScannerPopupLabels = {
  ariaLabel: string;
  title: string;
  description: string;
  cameraOptionLabel: string;
  uploadOptionLabel: string;
  uploadOptionSubtext: string;
  cancelLabel: string;
  backLabel: string;
  chooseImageLabel: string;
  processingImageLabel: string;
  uploadHintLabel: string;
  scanningLabel: string;
  permissionLabel: string;
  unsupportedCameraError: string;
  unsupportedImageError: string;
  cameraPermissionDeniedError: string;
  cameraScanError: string;
  imageNoQrError: string;
  imageReadError: string;
};

type QRScannerPopupProps = {
  labels?: Partial<QRScannerPopupLabels>;
  onClose: () => void;
  onScanSuccess: (value: string) => void;
  open: boolean;
};

const defaultLabels: QRScannerPopupLabels = {
  ariaLabel: "Σάρωση QR Code",
  title: "Σάρωση QR Code",
  description: "Επιλέξτε τρόπο σάρωσης QR code για αναζήτηση ασθενή",
  cameraOptionLabel: "Χρήση Κάμερας",
  uploadOptionLabel: "Ανέβασμα Εικόνας",
  uploadOptionSubtext: "(PNG, JPG, JPEG)",
  cancelLabel: "Ακύρωση",
  backLabel: "Πίσω",
  chooseImageLabel: "Επιλογή Εικόνας",
  processingImageLabel: "Επεξεργασία εικόνας...",
  uploadHintLabel: "Επιλέξτε μια εικόνα με QR code",
  scanningLabel: "Σάρωση σε εξέλιξη...",
  permissionLabel: "Permission",
  unsupportedCameraError: "Το QR scanning δεν υποστηρίζεται από αυτόν τον browser.",
  unsupportedImageError: "Το QR scanning από εικόνα δεν υποστηρίζεται από αυτόν τον browser.",
  cameraPermissionDeniedError:
    "Δεν δόθηκε άδεια στην κάμερα. Ενεργοποίησέ την από τις ρυθμίσεις browser.",
  cameraScanError: "Αποτυχία σάρωσης από κάμερα.",
  imageNoQrError: "Δεν βρέθηκε QR code στην εικόνα.",
  imageReadError: "Αποτυχία ανάγνωσης της εικόνας.",
};

export default function QRScannerPopup({ open, onClose, onScanSuccess, labels }: QRScannerPopupProps) {
  const ui = { ...defaultLabels, ...labels };
  const [mode, setMode] = useState<QRMode>("select");
  const [permission, setPermission] = useState<CameraPermission>("unknown");
  const [scanError, setScanError] = useState("");
  const [processingImage, setProcessingImage] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const hasBarcodeDetector = useMemo(() => {
    return typeof window !== "undefined" && "BarcodeDetector" in window;
  }, []);

  const stopCamera = useCallback(() => {
    setIsScanning(false);

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const resetState = useCallback(() => {
    setMode("select");
    setPermission("unknown");
    setScanError("");
    setProcessingImage(false);
    stopCamera();
  }, [stopCamera]);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const detectFromCanvas = async (
    detector: BarcodeDetectorInstance,
    canvas: HTMLCanvasElement,
  ) => {
    const barcodes = await detector.detect(canvas);
    if (barcodes.length > 0) {
      const qr = barcodes.find((barcode) => barcode.format === "qr_code");
      const value = qr?.rawValue ?? barcodes[0].rawValue;
      if (value) {
        onScanSuccess(value);
        handleClose();
      }
    }
  };

  const startScanLoop = async () => {
    if (!videoRef.current || !canvasRef.current || !hasBarcodeDetector) {
      return;
    }

    const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tick = async () => {
      if (!videoRef.current || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        await detectFromCanvas(detector, canvas);
      } catch {
        setScanError(ui.cameraScanError);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  const requestCamera = async () => {
    setScanError("");
    setPermission("unknown");

    if (!hasBarcodeDetector) {
      setPermission("unsupported");
      setScanError(ui.unsupportedCameraError);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setPermission("granted");
      setIsScanning(true);
      void startScanLoop();
    } catch {
      setPermission("denied");
      setScanError(ui.cameraPermissionDeniedError);
    }
  };

  const openCameraMode = async () => {
    setMode("camera");
    await requestCamera();
  };

  const openUploadMode = () => {
    setMode("upload");
    setScanError("");
    stopCamera();
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    setScanError("");

    if (!hasBarcodeDetector) {
      setScanError(ui.unsupportedImageError);
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setProcessingImage(true);
      const imageBitmap = await createImageBitmap(file);
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const barcodes = await detector.detect(imageBitmap);

      if (!barcodes.length) {
        setScanError(ui.imageNoQrError);
      } else {
        const qr = barcodes.find((barcode) => barcode.format === "qr_code");
        const value = qr?.rawValue ?? barcodes[0].rawValue;
        if (value) {
          onScanSuccess(value);
          handleClose();
        }
      }
    } catch {
      setScanError(ui.imageReadError);
    } finally {
      setProcessingImage(false);
      event.target.value = "";
    }
  };

  useEffect(() => {
    if (!open) {
      resetState();
    }

    return () => {
      stopCamera();
    };
  }, [open, resetState, stopCamera]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ui.ariaLabel}
        className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl"
      >
        <div className="mb-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <ScanIcon className="h-5 w-5 text-[#003d82]" />
            {ui.title}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{ui.description}</p>
        </div>

        {mode === "select" && (
          <div className="space-y-3">
            <button
              type="button"
              title={ui.cameraOptionLabel}
              onClick={() => {
                void openCameraMode();
              }}
              className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded bg-[#003d82] text-white transition-colors hover:bg-[#002d62] focus-visible:ring-2 focus-visible:ring-[#003d82]"
            >
              <CameraIcon className="h-8 w-8" />
              <span className="text-sm font-medium">{ui.cameraOptionLabel}</span>
            </button>

            <button
              type="button"
              title={ui.uploadOptionLabel}
              onClick={openUploadMode}
              className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded border border-gray-300 bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-[#003d82]"
            >
              <UploadIcon className="h-8 w-8" />
              <span className="text-sm font-medium">{ui.uploadOptionLabel}</span>
              <span className="text-xs text-gray-500">{ui.uploadOptionSubtext}</span>
            </button>

            <button
              type="button"
              title={ui.cancelLabel}
              onClick={handleClose}
              className="mt-2 w-full rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-[#003d82]"
            >
              {ui.cancelLabel}
            </button>
          </div>
        )}

        {mode === "camera" && (
          <div>
            <div className="relative overflow-hidden rounded-lg bg-black">
              <video ref={videoRef} className="h-64 w-full object-cover" muted playsInline autoPlay />

              {isScanning && (
                <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded bg-white px-3 py-1 shadow-lg">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    {ui.scanningLabel}
                  </div>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />

            <p className="mt-2 text-xs text-slate-600">
              {ui.permissionLabel}: <span className="font-medium">{permission}</span>
            </p>

            {scanError && (
              <div className="mt-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-800">
                {scanError}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                title={ui.backLabel}
                onClick={() => {
                  stopCamera();
                  setMode("select");
                  setScanError("");
                }}
                className="flex-1 rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-[#003d82]"
              >
                {ui.backLabel}
              </button>
              <button
                type="button"
                title={ui.cancelLabel}
                onClick={handleClose}
                className="flex-1 rounded bg-[#003d82] px-4 py-2 text-sm text-white transition hover:bg-[#002d62] focus-visible:ring-2 focus-visible:ring-[#003d82]"
              >
                {ui.cancelLabel}
              </button>
            </div>
          </div>
        )}

        {mode === "upload" && (
          <div>
            {processingImage && (
              <div className="rounded bg-gray-50 p-4 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-b-2 border-b-[#003d82]" />
                <p className="mt-2 text-sm text-slate-600">{ui.processingImageLabel}</p>
              </div>
            )}

            {scanError && (
              <div className="mt-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-800">
                {scanError}
              </div>
            )}

            <p className="mt-4 text-sm text-slate-700">{ui.uploadHintLabel}</p>

            <button
              type="button"
              title={ui.chooseImageLabel}
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 rounded bg-[#003d82] px-4 py-2 text-sm text-white transition hover:bg-[#002d62] focus-visible:ring-2 focus-visible:ring-[#003d82]"
            >
              {ui.chooseImageLabel}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleImageUpload}
              className="hidden"
            />

            <div className="mt-4">
              <button
                type="button"
                title={ui.backLabel}
                onClick={() => {
                  setMode("select");
                  setScanError("");
                }}
                className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-[#003d82]"
              >
                {ui.backLabel}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
