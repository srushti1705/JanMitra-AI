"use client";

import { useParams } from "next/navigation";
import ServiceDetailPage from "@/components/ServiceDetailPage";

export default function ServiceDetailRoute() {
  const params = useParams<{ serviceId: string }>();
  return <ServiceDetailPage serviceId={params.serviceId} />;
}
