"use client";

import { useState } from "react";
import QRButton from "./components/QRButton";
import QRGeneratePopup from "./components/QRGeneratePopup";
import QRScannerPopup from "./components/QRScannerPopup";
import { QrCodeIcon, SearchIcon, XIcon } from "./components/icons";

export default function Home() {
  const [textValue, setTextValue] = useState("");
  const [scanResult, setScanResult] = useState("");
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [qrGenerateOpen, setQrGenerateOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <main className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">QR Generator & Reader</h1>
        <p className="mt-2 text-sm text-slate-600">
          Γράψε κείμενο για δημιουργία QR ή διάβασε QR από κάμερα/εικόνα.
        </p>

        <div className="mt-6 flex items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              title="Κείμενο QR"
              aria-label="Κείμενο QR"
              value={textValue}
              onChange={(event) => setTextValue(event.target.value)}
              placeholder="Γράψε το κείμενο που θες για QR..."
              className="w-full rounded border border-gray-300 py-2.5 pl-10 pr-10 text-sm text-gray-700 outline-none transition focus-visible:ring-2 focus-visible:ring-[#003d82]"
            />
            {textValue && (
              <button
                type="button"
                title="Καθαρισμός κειμένου"
                aria-label="Καθαρισμός κειμένου"
                onClick={() => setTextValue("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 transition hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-[#003d82]"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          <QRButton
            title="Δημιουργία QR από κείμενο"
            label="Generate QR"
            onClick={() => setQrGenerateOpen(true)}
            icon={<QrCodeIcon className="h-5 w-5" />}
            className="bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600 disabled:bg-emerald-300"
            disabled={!textValue.trim()}
          />
            <QRButton
                title="Άνοιγμα σαρωτή QR"
                label="Read QR"
                onClick={() => setQrScannerOpen(true)}
                icon={<QrCodeIcon className="h-5 w-5" />}
                className="bg-[#003d82] text-white hover:bg-[#002d62] focus-visible:ring-[#003d82]"
            />

        </div>

        {scanResult && (
          <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            Τελευταίο QR αποτέλεσμα: <span className="font-semibold">{scanResult}</span>
          </div>
        )}
      </main>

      <QRScannerPopup
        open={qrScannerOpen}
        onClose={() => setQrScannerOpen(false)}
        onScanSuccess={(raw) => {
          setTextValue(raw);
          setScanResult(raw);
        }}
        labels={{
          title: "Σάρωση QR Code",
          description: "Επιλέξτε τρόπο σάρωσης QR code",
          cameraOptionLabel: "Χρήση Κάμερας",
          uploadOptionLabel: "Ανέβασμα Εικόνας",
        }}
      />

      <QRGeneratePopup
        open={qrGenerateOpen}
        value={textValue}
        onClose={() => setQrGenerateOpen(false)}
        labels={{
          title: "Generate QR",
          subtitle: "QR από το κείμενο που έδωσες.",
        }}
      />
    </div>
  );
}
