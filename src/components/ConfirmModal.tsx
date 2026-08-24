import { AlertTriangle } from 'lucide-react'

function ConfirmModal({ open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, danger = true }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end z-[60]">
      <div className="surface rounded-t-3xl w-full p-6">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className={`icon-badge icon-badge-lg ${danger ? 'icon-badge-rose' : 'icon-badge-violet'}`}>
            <AlertTriangle size={26} />
          </div>
          <div>
            <h2 className="heading text-lg mb-1">{title}</h2>
            {message && <p className="text-sm text-muted">{message}</p>}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className={`flex-1 ${danger ? 'btn-danger' : 'btn-primary'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
