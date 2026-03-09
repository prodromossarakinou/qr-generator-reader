import { QrCodeIcon } from "./icons";

export type QRGeneratePopupLabels = {
  ariaLabel: string;
  title: string;
  subtitle: string;
  emptyValueError: string;
  downloadLabel: string;
  closeLabel: string;
};

type QRGeneratePopupProps = {
  open: boolean;
  value: string;
  onClose: () => void;
  labels?: Partial<QRGeneratePopupLabels>;
};

const defaultLabels: QRGeneratePopupLabels = {
  ariaLabel: "Δημιουργία QR Code",
  title: "Generate QR",
  subtitle: "QR από το τρέχον κείμενο εισαγωγής.",
  emptyValueError: "Συμπλήρωσε πρώτα κείμενο στο search input.",
  downloadLabel: "Download QR",
  closeLabel: "Κλείσιμο",
};

export default function QRGeneratePopup({
  open,
  value,
  onClose,
  labels,
}: QRGeneratePopupProps) {
  if (!open) return null;

  const ui = { ...defaultLabels, ...labels };
  const trimmed = value.trim();
  const qrUrl = trimmed
    ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(trimmed)}`
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ui.ariaLabel}
        className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl"
      >
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <QrCodeIcon className="h-5 w-5 text-emerald-700" />
          {ui.title}
        </h2>
        <p className="mt-1 text-sm text-slate-600">{ui.subtitle}</p>

        {qrUrl ? (
          <div className="mt-4">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="Generated QR code" className="mx-auto h-64 w-64" />
            </div>
            <a
              title={ui.downloadLabel}
              href={qrUrl}
              download="generated-qr.png"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex rounded bg-[#003d82] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#002d62] focus-visible:ring-2 focus-visible:ring-[#003d82]"
            >
              {ui.downloadLabel}
            </a>
          </div>
        ) : (
          <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {ui.emptyValueError}
          </div>
        )}

        <div className="mt-4">
          <button
            type="button"
            title={ui.closeLabel}
            onClick={onClose}
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-[#003d82]"
          >
            {ui.closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
