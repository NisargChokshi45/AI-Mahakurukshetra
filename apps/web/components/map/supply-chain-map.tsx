'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';

type Facility = {
  id: string;
  name: string;
  facilityType: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  supplier: {
    name: string;
    slug: string;
    riskScore: number;
    tier: string;
  };
};

type SupplyChainMapProps = {
  facilities: Facility[];
};

function getRiskColor(score: number): string {
  if (score >= 70) return '#ef4444'; // critical - red
  if (score >= 50) return '#f59e0b'; // high - amber
  if (score >= 30) return '#eab308'; // medium - yellow
  return '#22c55e'; // low - green
}

function getRiskLabel(score: number): string {
  if (score >= 70) return 'Critical';
  if (score >= 50) return 'High';
  if (score >= 30) return 'Medium';
  return 'Low';
}

function getFacilityIcon(type: string): string {
  switch (type.toLowerCase()) {
    case 'factory':
      return '🏭';
    case 'warehouse':
      return '📦';
    case 'port':
      return '⚓';
    case 'office':
      return '🏢';
    default:
      return '📍';
  }
}

export function SupplyChainMap({ facilities }: SupplyChainMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on global view
    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    // Add facilities as markers
    facilities.forEach((facility) => {
      const color = getRiskColor(facility.supplier.riskScore);
      const riskLabel = getRiskLabel(facility.supplier.riskScore);
      const icon = getFacilityIcon(facility.facilityType);

      // Create custom icon using divIcon
      const customIcon = L.divIcon({
        html: `
          <div style="
            background-color: ${color};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            ${icon}
          </div>
        `,
        className: 'custom-facility-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });

      const marker = L.marker([facility.latitude, facility.longitude], {
        icon: customIcon,
      }).addTo(map);

      // Add popup with facility info
      const popupContent = `
        <div style="min-width: 200px;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">
            ${facility.name}
          </div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
            ${icon} ${facility.facilityType.charAt(0).toUpperCase() + facility.facilityType.slice(1)} • ${facility.city}, ${facility.country}
          </div>
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0;">
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
              Supplier: <strong>${facility.supplier.name}</strong>
            </div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
              Tier: <strong>${facility.supplier.tier}</strong>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
              <span style="font-size: 11px; color: #64748b;">Risk Score:</span>
              <span style="
                background-color: ${color};
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
              ">
                ${facility.supplier.riskScore} - ${riskLabel}
              </span>
            </div>
          </div>
          <div style="margin-top: 12px;">
            <a
              href="/suppliers/${facility.supplier.slug}"
              style="
                color: #3b82f6;
                font-size: 12px;
                text-decoration: none;
                font-weight: 500;
              "
            >
              View supplier details →
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
    });

    // Cleanup
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [facilities]);

  return (
    <div className="space-y-4">
      <div
        ref={mapRef}
        className="border-border/70 h-[600px] w-full overflow-hidden rounded-[24px] border shadow-sm"
      />

      {/* Legend */}
      <div className="border-border/70 bg-background/80 flex flex-wrap items-center gap-6 rounded-[24px] border p-4">
        <div className="text-muted-foreground text-sm font-semibold">
          Risk Level:
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#22c55e]" />
          <span className="text-sm">Low (&lt;30)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#eab308]" />
          <span className="text-sm">Medium (30-49)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#f59e0b]" />
          <span className="text-sm">High (50-69)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#ef4444]" />
          <span className="text-sm">Critical (≥70)</span>
        </div>
        <div className="text-muted-foreground ml-auto text-sm">
          {facilities.length} facilities
        </div>
      </div>
    </div>
  );
}
