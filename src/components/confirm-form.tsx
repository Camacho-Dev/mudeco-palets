"use client";

import { useTransition } from "react";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  message: string;
  children: React.ReactNode;
  className?: string;
  hiddenFields?: Record<string, string>;
};

export function ConfirmForm({
  action,
  message,
  children,
  className,
  hiddenFields,
}: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className={className}
      action={(fd) => {
        if (!window.confirm(message)) return;
        startTransition(async () => {
          await action(fd);
        });
      }}
    >
      {hiddenFields
        ? Object.entries(hiddenFields).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))
        : null}
      <fieldset disabled={pending}>{children}</fieldset>
    </form>
  );
}
