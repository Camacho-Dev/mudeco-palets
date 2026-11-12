import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión · Mudeco Palets",
  description:
    "Accede a tu cuenta de cliente o panel administrativo en Mudeco Palets.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

