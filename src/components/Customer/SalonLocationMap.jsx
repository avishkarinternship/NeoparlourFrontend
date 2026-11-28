import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, ExternalLink } from 'lucide-react';

const SalonLocationMap = ({
    latitude,
    longitude,
    salonName = 'Salon Studio',
    address = '',
    isDark = false
}) => {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const hasValidCoords = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

    const directionsUrl = hasValidCoords
        ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
        : address
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${salonName} ${address}`)}`
            : null;

    useEffect(() => {
        if (!hasValidCoords || !mapContainerRef.current) return;

        // Clean up any existing map instance
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
            center: [lat, lng],
            zoom: 16,
            zoomControl: false,
            scrollWheelZoom: false, // Avoid trapping page scroll
            dragging: !L.Browser.mobile, // Allow drag on desktop, avoid scroll trap on mobile
            touchZoom: true
        });

        // Add 100% free OpenStreetMap tiles (never requires an API key)
        const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

        L.tileLayer(tileUrl, {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Custom branded marker pin using salon theme
        const customPinIcon = L.divIcon({
            className: 'salon-marker-pin',
            html: `
                <div style="position: relative; width: 38px; height: 44px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;">
                    <div style="background-color: var(--color-primary, #FF0B01); color: #ffffff; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4); border: 2.5px solid white;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>
                    </div>
                    <div style="width: 10px; height: 4px; background: rgba(0,0,0,0.3); border-radius: 50%; margin-top: 2px;"></div>
                </div>
            `,
            iconSize: [38, 44],
            iconAnchor: [19, 44],
            popupAnchor: [0, -40]
        });

        const marker = L.marker([lat, lng], { icon: customPinIcon }).addTo(map);
        marker.bindPopup(`
            <div style="padding: 4px; font-family: sans-serif;">
                <b style="font-size: 13px; color: #111;">${salonName}</b>
                ${address ? `<p style="font-size: 11px; color: #666; margin: 4px 0 0;">${address}</p>` : ''}
            </div>
        `);

        mapInstanceRef.current = map;

        // Invalidate size to ensure 100% canvas paint
        const timer = setTimeout(() => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.invalidateSize();
            }
        }, 150);

        return () => {
            clearTimeout(timer);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [lat, lng, hasValidCoords, isDark, salonName, address]);

    if (!hasValidCoords) {
        return (
            <div className={`w-full h-44 sm:h-52 rounded-2xl border flex flex-col items-center justify-center p-4 text-center ${
                isDark ? 'bg-zinc-900/40 border-zinc-800 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
                <MapPin className="w-8 h-8 text-red-500/70 mb-2" />
                <p className="text-xs font-bold uppercase tracking-wider">Coordinates being updated</p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">{address || 'Studio address available'}</p>
                {directionsUrl && (
                    <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Search on Google Maps</span>
                    </a>
                )}
            </div>
        );
    }

    return (
        <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-inner group">
            {isDark && (
                <style>{`
                    .dark-map-tiles .leaflet-tile-pane {
                        filter: brightness(0.68) invert(1) contrast(1.25) hue-rotate(180deg) saturate(0.75);
                    }
                `}</style>
            )}
            {/* Leaflet Map Canvas */}
            <div ref={mapContainerRef} className={`w-full h-full z-0 ${isDark ? 'dark-map-tiles' : ''}`} />

            {/* Quick Directions Overlay Pill */}
            {directionsUrl && (
                <div className="absolute top-3 right-3 z-[400]">
                    <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            backgroundColor: 'var(--color-primary, #FF0B01)',
                            color: 'var(--color-button-text, #ffffff)'
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                        title="Get Turn-by-Turn Directions"
                    >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Directions</span>
                    </a>
                </div>
            )}

            {/* Coordinates Badge */}
            <div className="absolute bottom-2 left-2 z-[400] px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] text-white/90 font-mono font-medium">
                📍 {lat.toFixed(4)}, {lng.toFixed(4)}
            </div>
        </div>
    );
};

export default SalonLocationMap;
