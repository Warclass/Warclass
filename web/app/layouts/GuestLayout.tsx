import React from "react";
import Image from "next/image";
import Link from "next/link";
import backgroundImage from "@/assets/guest.png";

interface GuestLayoutProps {
  children: React.ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col text-foreground antialiased">
      <Image
        className="object-cover object-bottom fixed -z-10"
        src={backgroundImage}
        alt=""
        fill
        priority
      />
      {/* Top-left logo that links to home */}
      <div className="fixed top-4 left-4 z-20">
        <Link href="/" aria-label="Volver al inicio">
          <Image
            src="assets/logo-wow.svg"
            alt="Warclass logo"
            width={48}
            height={48}
            className="h-10 w-10 sm:h-12 sm:w-12 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
            priority
          />
        </Link>
      </div>
      {children}
    </div>
  );
}
