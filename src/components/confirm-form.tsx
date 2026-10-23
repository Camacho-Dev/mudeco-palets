"use client";

import { useState, useTransition, useRef } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  message: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  children: React.ReactNode;
  className?: string;
  hiddenFields?: Record<string, string>;
};

export function ConfirmForm({
  action,
  message,
  title = "Confirmar acción",
  confirmLabel = "Sí, confirmar",
  cancelLabel = "Cancelar",
  isDestructive = true,
  children,
  className,
  hiddenFields,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleTrigger(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  }

  function handleConfirm() {
    setIsOpen(false);
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    startTransition(async () => {
      await action(fd);
    });
  }

  return (
    <>
      <form
        ref={formRef}
        className={className}
        onSubmit={(e) => {
          e.preventDefault();
          setIsOpen(true);
        }}
      >
        {hiddenFields
          ? Object.entries(hiddenFields).map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))
          : null}
        <fieldset
          disabled={pending}
          onClick={handleTrigger}
          className="contents cursor-pointer"
        >
          {children}
        </fieldset>
      </form>

      <ConfirmDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title={title}
        description={message}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        isDestructive={isDestructive}
        isPending={pending}
      />
    </>
  );
}
