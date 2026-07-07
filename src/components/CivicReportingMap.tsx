"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Building2, MapPin, Navigation } from "lucide-react";
import type { CivicComplaint } from "@/context/AppContext";

interface CivicReportingMapProps {
  complaints: CivicComplaint[];
  currentLocation?: { latitude: number; longitude: number; label: string } | null;
}

export default function CivicReportingMap({ complaints, currentLocation }: CivicReportingMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setMapError("Google Maps is unavailable without a public API key.");
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    if (document.getElementById("janmitra-google-maps-script")) {
      if ((window as any).google?.maps) {
        setMapReady(true);
      }
      return;
    }

    const script = document.createElement("script");
    script.id = "janmitra-google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapReady(true);
    script.onerror = () => setMapError("Google Maps could not be loaded.");
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!mapReady || !containerRef.current || typeof window === "undefined") return;

    const google = (window as any).google;
    const center = currentLocation
      ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
      : complaints.find((item) => item.latitude && item.longitude)
        ? { lat: complaints.find((item) => item.latitude && item.longitude)!.latitude!, lng: complaints.find((item) => item.latitude && item.longitude)!.longitude! }
        : { lat: 28.6139, lng: 77.209 }; 

    const map = new google.maps.Map(containerRef.current, {
      center,
      zoom: 12,
      disableDefaultUI: false,
      mapTypeControl: false,
      styles: [
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#dce6f4" }] },
      ],
    });

    const infoWindow = new google.maps.InfoWindow();

    const addMarker = (position: { lat: number; lng: number }, icon: string, title: string, content: string) => {
      const marker = new google.maps.Marker({
        map,
        position,
        title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: icon === "office" ? 8 : 10,
          fillColor: icon === "office" ? "#0f766e" : "#ef4444",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      marker.addListener("click", () => {
        infoWindow.setContent(`<div style="max-width:220px;font-family:Inter,sans-serif"><strong>${title}</strong><div style="margin-top:4px;font-size:12px;color:#475569">${content}</div></div>`);
        infoWindow.open({ map, anchor: marker });
      });
    };

    if (currentLocation) {
      addMarker({ lat: currentLocation.latitude, lng: currentLocation.longitude }, "user", "Your location", currentLocation.label);
    }

    complaints
      .filter((item) => item.latitude && item.longitude)
      .forEach((item) => {
        addMarker(
          { lat: item.latitude!, lng: item.longitude! },
          "issue",
          item.title,
          `${item.category} • ${item.status}`
        );
      });

    const offices = [
      { name: "Ward Office", position: { lat: center.lat + 0.005, lng: center.lng + 0.005 } },
      { name: "Public Works Department", position: { lat: center.lat - 0.003, lng: center.lng + 0.008 } },
    ];

    offices.forEach((office) => {
      addMarker(office.position, "office", office.name, "Government service desk");
    });
  }, [complaints, currentLocation, mapReady]);

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Civic Incident Map</h3>
          <p className="text-sm text-slate-500">Nearby complaints and government offices.</p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          Live overview
        </div>
      </div>
      {mapError ? (
        <div className="flex min-h-[260px] items-center justify-center rounded-[20px] border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500 dark:border-slate-800">
          <div>
            <AlertTriangle className="mx-auto mb-2 h-5 w-5 text-amber-500" />
            {mapError}
          </div>
        </div>
      ) : (
        <div ref={containerRef} className="min-h-[280px] w-full rounded-[20px] border border-slate-200 dark:border-slate-800" />
      )}
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-rose-500" />Your report</span>
        <span className="flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5 text-amber-500" />Complaint markers</span>
        <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-teal-600" />Government office</span>
      </div>
    </div>
  );
}
