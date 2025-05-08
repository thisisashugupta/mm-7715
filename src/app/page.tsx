'use client';

import ConnectButton from "@/components/ConnectButton";
import RequestPermissions from "@/components/RequestPermissions";
import { useAccount } from "wagmi";

export default function Home() {
  const { isConnected } = useAccount();
  return (
    <div className="flex items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {isConnected ? <RequestPermissions /> : <ConnectButton />}
    </div>
  );
}
