import { useEffect, useRef } from 'react';
import { Button } from '../ui/Button';

export function ConfirmDialog({ 
  isOpen, onClose, onConfirm, title, description, isLoading, confirmText = 'Confirm', isDanger = false 
}: { 
  isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; description: string; isLoading: boolean; confirmText?: string; isDanger?: boolean 
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) ref.current?.showModal();
    else ref.current?.close();
  }, [isOpen]);

  return (
    <dialog 
      ref={ref} 
      onCancel={onClose} 
      className="m-auto rounded-xl p-0 shadow-xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      onClick={(e) => {
        // Close if clicking outside the modal content
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="w-full max-w-md p-6 bg-white rounded-xl">
        <h3 className="text-xl font-semibold text-surface-900">{title}</h3>
        <p className="mt-2 text-sm text-surface-600">{description}</p>
        <div className="mt-8 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button variant={isDanger ? 'danger' : 'primary'} onClick={onConfirm} isLoading={isLoading}>{confirmText}</Button>
        </div>
      </div>
    </dialog>
  );
}