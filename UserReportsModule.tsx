@import "tailwindcss";

@layer utilities {
  .custom-scrollbar::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.2);
    border-radius: 9999px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 163, 184, 0.4);
  }
}

@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Hide all app wrapper elements during printing */
  body * {
    visibility: hidden !important;
  }

  /* Show only the targeted invoice canvas and its contents */
  #printable-invoice-canvas,
  #printable-invoice-canvas * {
    visibility: visible !important;
  }

  #printable-invoice-canvas {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    margin: 0 !important;
    box-shadow: none !important;
    border: none !important;
    background: #ffffff !important;
  }

  img {
    max-width: 100% !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .print\:hidden {
    display: none !important;
    visibility: hidden !important;
  }

  body,
  html,
  #root {
    background: #ffffff !important;
    color: #000000 !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    height: auto !important;
    overflow: visible !important;
  }

  .paper-a4 {
    width: 210mm !important;
    max-width: 210mm !important;
    margin: 0 auto !important;
    padding: 10mm !important;
  }

  .paper-a5 {
    width: 148mm !important;
    max-width: 148mm !important;
    margin: 0 auto !important;
    padding: 6mm !important;
    font-size: 11px !important;
  }

  .paper-pos3in {
    width: 78mm !important;
    max-width: 78mm !important;
    margin: 0 auto !important;
    padding: 3mm !important;
    font-size: 10px !important;
    font-family: monospace, sans-serif !important;
  }

  .paper-pos2in {
    width: 56mm !important;
    max-width: 56mm !important;
    margin: 0 auto !important;
    padding: 1.5mm !important;
    font-size: 8.5px !important;
    font-family: monospace, sans-serif !important;
  }
}
