import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'

function BarcodeScanner({ onScan, onClose }) {
  const scannerRef = useRef(null)
  const containerId = 'barcode-scanner-region'

  useEffect(() => {
    const html5Qrcode = new Html5Qrcode(containerId)
    scannerRef.current = html5Qrcode

    html5Qrcode
      .start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: { width: 300, height: 120 },
        },
        (decodedText) => {
          onScan(decodedText)
        },
        () => {}
      )
      .catch(() => {
        alert("Impossible d'accéder à la caméra. Vérifiez les autorisations.")
        onClose()
      })

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {}).finally(() => {
          scannerRef.current.clear()
        })
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4">
        <p className="text-white font-medium">Scanner un code-barres</p>
        <button onClick={onClose} className="text-white">
          <X size={24} />
        </button>
      </div>
      <div id={containerId} className="flex-1" />
      <p className="text-white/70 text-sm text-center pb-6 px-6">
        Centrez le code-barres entier dans le cadre, à 10-15 cm de la caméra
      </p>
    </div>
  )
}

export default BarcodeScanner
