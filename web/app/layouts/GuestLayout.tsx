import React from "react";
import Image from "next/image";
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
        layout="fill"
      />
      {children}
    </div>
  );
}
