import { useEffect, useRef, useState } from 'react'
import { X, Zap, ZapOff } from 'lucide-react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

const BARCODE_FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.CODABAR,
  Html5QrcodeSupportedFormats.ITF,
]

function BarcodeScanner({ onScan, onClose }) {
  const scannerRef = useRef(null)
  const hasScannedRef = useRef(false)
  const containerId = 'barcode-scanner-region'

  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [torchOn, setTorchOn] = useState(false)
  const [torchSupported, setTorchSupported] = useState(false)

  useEffect(() => {
    const html5Qrcode = new Html5Qrcode(containerId, {
      formatsToSupport: BARCODE_FORMATS,
      useBarCodeDetectorIfSupported: true,
      verbose: false,
    })
    scannerRef.current = html5Qrcode

    html5Qrcode
      .start(
        { facingMode: 'environment' },
        {
          fps: 20,
          qrbox: { width: 300, height: 120 },
          aspectRatio: 1.7777778,
        },
        (decodedText) => {
          // Évite les scans multiples du même code sur des frames successives
          if (hasScannedRef.current) return
          hasScannedRef.current = true

          if (navigator.vibrate) navigator.vibrate(80)

          html5Qrcode.pause(true)
          onScan(decodedText)
        },
        () => {}
      )
      .then(() => {
        setReady(true)
        try {
          const supported = html5Qrcode
            .getRunningTrackCameraCapabilities()
            .torchFeature()
            .isSupported()
          setTorchSupported(supported)
        } catch {
          setTorchSupported(false)
        }
      })
      .catch(() => {
        setError("Impossible d'accéder à la caméra. Vérifiez les autorisations.")
      })

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {}).finally(() => {
          scannerRef.current.clear()
        })
      }
    }
  }, [])

  const toggleTorch = async () => {
    if (!scannerRef.current) return
    try {
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: !torchOn }],
      })
      setTorchOn((t) => !t)
    } catch {
      // Torche non disponible sur cet appareil, on ignore silencieusement
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4">
        <p className="text-white font-display font-medium">Scanner un code-barres</p>
        <div className="flex items-center gap-3">
          {torchSupported && (
            <button
              onClick={toggleTorch}
              className="text-white/80 hover:text-primary-from transition-colors p-1"
              aria-label="Activer la torche"
            >
              {torchOn ? <Zap size={22} /> : <ZapOff size={22} />}
            </button>
          )}
          <button
            onClick={onClose}
            className="text-white/80 hover:text-primary-from transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="relative flex-1">
        <div id={containerId} className="absolute inset-0" />

        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center px-8">
            <p className="text-white/80 text-sm text-center">{error}</p>
          </div>
        )}

        {ready && !error && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
              width: 300,
              height: 120,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {[
              { top: -2, left: -2, borderWidth: '3px 0 0 3px' },
              { top: -2, right: -2, borderWidth: '3px 3px 0 0' },
              { bottom: -2, left: -2, borderWidth: '0 0 3px 3px' },
              { bottom: -2, right: -2, borderWidth: '0 3px 3px 0' },
            ].map((pos, i) => (
              <div
                key={i}
                className="absolute w-6 h-6 border-primary-from rounded-sm"
                style={{ ...pos, borderStyle: 'solid' }}
              />
            ))}

            <div className="scanner-line absolute left-0 right-0 h-0.5" />
          </div>
        )}
      </div>

      <p className="text-white/70 text-sm text-center pb-6 px-6">
        Centrez le code-barres entier dans le cadre, à 10-15 cm de la caméra
      </p>
    </div>
  )
}

export default BarcodeScanner
