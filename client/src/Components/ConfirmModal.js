import React, { useEffect } from 'react';

export default function ConfirmModal({ title, message, confirmLabel = 'Delete', busyLabel = 'Deleting…', variant = 'danger', busy = false, error, onConfirm, onCancel }) {
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === 'Escape' && !busy) onCancel();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [busy, onCancel]);

    return (
        <div className="modal-backdrop" onClick={() => !busy && onCancel()}>
            <div
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id="confirm-modal-title" className="modal-title">{title}</h2>
                <p className="modal-message">{message}</p>
                {error && <div className="alert alert-error">{error}</div>}
                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onCancel} disabled={busy} autoFocus>Cancel</button>
                    <button className={`btn btn-${variant}`} onClick={onConfirm} disabled={busy}>
                        {busy ? busyLabel : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
