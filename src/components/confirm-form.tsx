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
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleTrigger(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setIsOpen(true);
  }

  function handleConfirm() {
    if (!formRef.current) return;
    setError(null);
    const fd = new FormData(formRef.current);
    startTransition(async () => {
      try {
        await action(fd);
        setIsOpen(false);
      } catch (err) {
        if (
          err &&
          typeof err === "object" &&
          "digest" in err &&
          typeof (err as { digest?: unknown }).digest === "string" &&
          (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
        ) {
          setIsOpen(false);
          throw err;
        }
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo completar la acción."
        );
      }
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
        onClose={() => {
          setError(null);
          setIsOpen(false);
        }}
        onConfirm={handleConfirm}
        title={title}
        description={message}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        isDestructive={isDestructive}
        isPending={pending}
        error={error}
      />
    </>
  );
}
