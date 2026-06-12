"use client";

import dynamic from "next/dynamic";

const DestinationMap = dynamic(() => import("./DestinationMap"), { ssr: false });

export default function DestinationMapWrapper({ destination }: { destination: string | null }) {
  return <DestinationMap destination={destination} />;
}
