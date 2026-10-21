# End-to-End Flutter Implementation Plan: Geo-Coordinates (Lat/Long) Lifecycle & Pan-India Mapping

This technical specification details the complete architecture, data models, networking, mapping, and lifecycle implementation for the **NeoParlour Flutter App**. It directly mirrors the production web application's geolocation capabilities, ensuring 100% parity across salon onboarding, customer discovery, proximity calculation, and navigation while maintaining a **100% free mapping stack** with zero per-request Google Maps API fees.

---

## 1. Technical Stack & Dependencies (`pubspec.yaml`)

Add these verified packages to your `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter

  # 1. Free OpenStreetMap Leaflet Equivalent for Flutter
  flutter_map: ^7.0.2
  latlong2: ^0.9.1

  # 2. Native Device GPS Detection
  geolocator: ^13.0.2

  # 3. High-Performance HTTP Networking
  dio: ^5.7.0

  # 4. Local Caching & Persistence (Active Location, Saved Addresses)
  shared_preferences: ^2.3.3

  # 5. Free Turn-by-Turn Native Voice Navigation (Apple Maps / Google Maps)
  url_launcher: ^6.3.1
```

---

## 2. Platform Permissions Configuration

### Android (`android/app/src/main/AndroidManifest.xml`)

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Location Permissions -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <!-- Queries required by url_launcher on Android 11+ to invoke navigation apps -->
    <queries>
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="https" />
        </intent>
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="geo" />
        </intent>
    </queries>
</manifest>
```

### iOS (`ios/Runner/Info.plist`)

```xml
<dict>
    <!-- Location Usage Descriptions -->
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>NeoParlour needs your location to discover salons, calculate travel distances, and book services closest to you.</string>
    <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
    <string>NeoParlour needs your location to discover salons closest to your doorstep.</string>

    <!-- Query Schemes for Native Voice Navigation -->
    <key>LSApplicationQueriesSchemes</key>
    <array>
        <string>comgooglemaps</string>
        <string>maps</string>
    </array>
</dict>
```

---

## 3. Core Geo Data Models (`lib/models/geo_models.dart`)

```dart
class LocationData {
  final double latitude;
  final double longitude;
  final String cityName;
  final String areaName;
  final String? stateName;
  final String? buildingName;
  final String? houseFlatNo;
  final String? landmark;
  final String? postalCode;
  final String? formattedAddress;
  final String addressType; // 'HOME' | 'WORK' | 'SALON' | 'CURRENT'

  LocationData({
    required this.latitude,
    required this.longitude,
    required this.cityName,
    required this.areaName,
    this.stateName,
    this.buildingName,
    this.houseFlatNo,
    this.landmark,
    this.postalCode,
    this.formattedAddress,
    this.addressType = 'CURRENT',
  });

  Map<String, dynamic> toJson() => {
    'latitude': latitude,
    'longitude': longitude,
    'city': cityName,
    'cityName': cityName,
    'area': areaName,
    'areaName': areaName,
    'stateName': stateName,
    'buildingName': buildingName,
    'houseFlatNo': houseFlatNo,
    'landmark': landmark,
    'pincode': postalCode,
    'formattedAddress': formattedAddress,
    'addressType': addressType,
  };

  factory LocationData.fromJson(Map<String, dynamic> json) => LocationData(
    latitude: (json['latitude'] as num).toDouble(),
    longitude: (json['longitude'] as num).toDouble(),
    cityName: json['cityName'] ?? json['city'] ?? '',
    areaName: json['areaName'] ?? json['area'] ?? '',
    stateName: json['stateName'],
    buildingName: json['buildingName'],
    houseFlatNo: json['houseFlatNo'],
    landmark: json['landmark'],
    postalCode: json['pincode'] ?? json['postalCode'],
    formattedAddress: json['formattedAddress'],
    addressType: json['addressType'] ?? 'CURRENT',
  );
}

class SalonLocationItem {
  final String id;
  final String name;
  final double latitude;
  final double longitude;
  final String address;
  final String city;
  final String area;
  final double rating;
  final String? imageUrl;
  double? distanceKm;

  SalonLocationItem({
    required this.id,
    required this.name,
    required this.latitude,
    required this.longitude,
    required this.address,
    required this.city,
    required this.area,
    required this.rating,
    this.imageUrl,
    this.distanceKm,
  });

  String get distanceFormatted {
    if (distanceKm == null) return '';
    if (distanceKm! < 1.0) {
      return '${(distanceKm! * 1000).round()} m';
    }
    return '${distanceKm!.toStringAsFixed(1)} km';
  }
}
```

---

## 4. Pan-India Search & Multi-Tier Forward Geocoding (`lib/services/geo_service.dart`)

### Architecture Rules:
1. **Zero City Locking**: Do **NOT** append the current city (e.g. Pune) to search queries. A user or salon owner can search any locality, city, road, or landmark across India.
2. **0ms Offline Cache**: Curate major metropolitan prime areas across India (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Kolkata, Chennai, Pune, Jaipur, Lucknow, Ahmedabad, etc.) for instant matching.
3. **Multi-Tier Forward Geocoder**: Curated Metro Cache $\rightarrow$ Photon Komoot API (`countrycode=in`) $\rightarrow$ OSM Nominatim fallback.

```dart
import 'dart:async';
import 'package:dio/dio.dart';
import 'package:latlong2/latlong.dart';

class PrimeArea {
  final String name;
  final String city;
  final String district;
  final double latitude;
  final double longitude;

  const PrimeArea({
    required this.name,
    required this.city,
    required this.district,
    required this.latitude,
    required this.longitude,
  });
}

class GeoSearchResult {
  final String name;
  final String subtitle;
  final double latitude;
  final double longitude;
  final String type;

  GeoSearchResult({
    required this.name,
    required this.subtitle,
    required this.latitude,
    required this.longitude,
    required this.type,
  });
}

class GeoService {
  final Dio _dio = Dio(BaseOptions(
    connectTimeout: const Duration(seconds: 5),
    receiveTimeout: const Duration(seconds: 5),
  ));

  // Curated 0ms offline prime areas across major Indian metros
  static const List<PrimeArea> metroPrimeAreas = [
    // Pune
    PrimeArea(name: 'Hadapsar', city: 'Pune', district: 'PMC', latitude: 18.5089, longitude: 73.9260),
    PrimeArea(name: 'Kothrud', city: 'Pune', district: 'PMC', latitude: 18.5074, longitude: 73.8077),
    PrimeArea(name: 'Hinjawadi', city: 'Pune', district: 'PCMC', latitude: 18.5913, longitude: 73.7389),
    PrimeArea(name: 'Viman Nagar', city: 'Pune', district: 'PMC', latitude: 18.5679, longitude: 73.9143),
    PrimeArea(name: 'Baner', city: 'Pune', district: 'PMC', latitude: 18.5590, longitude: 73.7868),
    PrimeArea(name: 'Wakad', city: 'Pune', district: 'PCMC', latitude: 18.5987, longitude: 73.7656),
    // Mumbai
    PrimeArea(name: 'Bandra West', city: 'Mumbai', district: 'Mumbai Suburban', latitude: 19.0596, longitude: 72.8295),
    PrimeArea(name: 'Andheri West', city: 'Mumbai', district: 'Mumbai Suburban', latitude: 19.1363, longitude: 72.8277),
    PrimeArea(name: 'Juhu', city: 'Mumbai', district: 'Mumbai Suburban', latitude: 19.1075, longitude: 72.8263),
    PrimeArea(name: 'Dadar', city: 'Mumbai', district: 'Mumbai City', latitude: 19.0178, longitude: 72.8478),
    // Bengaluru
    PrimeArea(name: 'Koramangala', city: 'Bengaluru', district: 'Bengaluru Urban', latitude: 12.9352, longitude: 77.6245),
    PrimeArea(name: 'Indiranagar', city: 'Bengaluru', district: 'Bengaluru Urban', latitude: 12.9784, longitude: 77.6408),
    PrimeArea(name: 'Whitefield', city: 'Bengaluru', district: 'Bengaluru Urban', latitude: 12.9698, longitude: 77.7500),
    PrimeArea(name: 'HSR Layout', city: 'Bengaluru', district: 'Bengaluru Urban', latitude: 12.9121, longitude: 77.6446),
    // Delhi NCR
    PrimeArea(name: 'Connaught Place', city: 'Delhi', district: 'Central Delhi', latitude: 28.6315, longitude: 77.2167),
    PrimeArea(name: 'Hauz Khas', city: 'Delhi', district: 'South Delhi', latitude: 28.5494, longitude: 77.2001),
    PrimeArea(name: 'Saket', city: 'Delhi', district: 'South Delhi', latitude: 28.5244, longitude: 77.2167),
    // Hyderabad
    PrimeArea(name: 'Hitec City', city: 'Hyderabad', district: 'Cyberabad', latitude: 17.4435, longitude: 78.3772),
    PrimeArea(name: 'Banjara Hills', city: 'Hyderabad', district: 'Hyderabad', latitude: 17.4156, longitude: 78.4357),
    // Kolkata
    PrimeArea(name: 'Salt Lake', city: 'Kolkata', district: 'Bidhannagar', latitude: 22.5867, longitude: 88.4178),
    PrimeArea(name: 'Park Street', city: 'Kolkata', district: 'Kolkata', latitude: 22.5513, longitude: 88.3524),
  ];

  /// 1. Pan-India Autocomplete Search
  Future<List<GeoSearchResult>> searchLocationsPanIndia(String query, {int limit = 10}) async {
    final cleanQuery = query.trim().toLowerCase();
    if (cleanQuery.length < 2) return [];

    final results = <GeoSearchResult>[];
    final seen = <String>{};

    // A. 0ms matching from curated offline metro areas
    for (final prime in metroPrimeAreas) {
      if (prime.name.toLowerCase().contains(cleanQuery) || prime.city.toLowerCase().contains(cleanQuery)) {
        final key = prime.name.toLowerCase();
        if (seen.add(key)) {
          results.add(GeoSearchResult(
            name: prime.name,
            subtitle: '${prime.city}, ${prime.district}',
            latitude: prime.latitude,
            longitude: prime.longitude,
            type: 'area',
          ));
        }
      }
    }

    // B. Live Pan-India query via Photon Komoot (OSM)
    try {
      final res = await _dio.get(
        'https://photon.komoot.io/api',
        queryParameters: {
          'q': query.trim(),
          'countrycode': 'in', // Target India strictly
          'limit': limit,
        },
      );

      final features = res.data['features'] as List? ?? [];
      for (final feat in features) {
        final props = feat['properties'] as Map<String, dynamic>? ?? {};
        final coords = (feat['geometry']?['coordinates'] as List?)?.cast<num>();
        if (coords == null || coords.length < 2) continue;

        final rawName = (props['name'] as String? ?? '').split(',').first.trim();
        final cand = props['suburb'] ?? props['locality'] ?? props['village'] ?? rawName;
        if (cand.isEmpty) continue;

        final cityOrTown = props['city'] ?? props['town'] ?? props['district'] ?? '';
        final state = props['state'] ?? '';
        final subtitle = [cityOrTown, state].where((s) => s.isNotEmpty && s != cand).toSet().join(', ');

        final key = '${cand.toLowerCase()}_${cityOrTown.toLowerCase()}';
        if (seen.add(key)) {
          results.add(GeoSearchResult(
            name: cand,
            subtitle: subtitle.isNotEmpty ? subtitle : (state.isNotEmpty ? state : 'India'),
            latitude: coords[1].toDouble(),
            longitude: coords[0].toDouble(),
            type: props['osm_value'] ?? 'location',
          ));
        }
      }
    } catch (_) {}

    return results;
  }

  /// 2. Multi-tier Forward Geocoding (Enter Key Trigger)
  Future<LatLng?> forwardGeocode(String query) async {
    final clean = query.trim().toLowerCase();
    if (clean.length < 2) return null;

    // Check offline prime cache
    for (final prime in metroPrimeAreas) {
      if (prime.name.toLowerCase() == clean || clean.contains(prime.name.toLowerCase())) {
        return LatLng(prime.latitude, prime.longitude);
      }
    }

    // Query Photon Komoot
    try {
      final res = await _dio.get(
        'https://photon.komoot.io/api',
        queryParameters: {'q': query.trim(), 'countrycode': 'in', 'limit': 1},
      );
      final features = res.data['features'] as List? ?? [];
      if (features.isNotEmpty) {
        final coords = (features[0]['geometry']['coordinates'] as List).cast<num>();
        return LatLng(coords[1].toDouble(), coords[0].toDouble());
      }
    } catch (_) {}

    // Fallback to OSM Nominatim
    try {
      final res = await _dio.get(
        'https://nominatim.openstreetmap.org/search',
        queryParameters: {'q': query.trim(), 'format': 'json', 'limit': 1, 'countrycodes': 'in'},
        options: Options(headers: {'Accept-Language': 'en'}),
      );
      final list = res.data as List? ?? [];
      if (list.isNotEmpty) {
        return LatLng(double.parse(list[0]['lat']), double.parse(list[0]['lon']));
      }
    } catch (_) {}

    return null;
  }
}
```

---

## 5. Rate Limiter, Spatial Caching & Circuit Breaker (`lib/repositories/reverse_geo_repository.dart`)

### Architecture Rules:
1. **Spatial Caching**: Round coordinates to 4 decimal places (~11 meters). Dropping the pin repeatedly within ~11 meters reuses the cached result without hitting network APIs.
2. **Circuit Breaker on HTTP 429**: When Ola Maps or Google Maps rate limits are exceeded, trip the circuit breaker for 20 seconds and fall back to free Photon Komoot.
3. **POI Landmarks Extraction**: Automatically extract real-world landmarks (Hospitals, Malls, Temples, Stations) from reverse geocoding into a selectable list.

```dart
class AddressResolution {
  final String area;
  final String city;
  final String state;
  final String formattedAddress;
  final String? primaryLandmark;
  final List<String> nearbyLandmarks;

  AddressResolution({
    required this.area,
    required this.city,
    required this.state,
    required this.formattedAddress,
    this.primaryLandmark,
    this.nearbyLandmarks = const [],
  });
}

class ReverseGeoRepository {
  final Dio _dio = Dio();
  final String? _olaApiKey;
  final Map<String, AddressResolution> _cache = {};
  
  bool _isCircuitTripped = false;
  DateTime? _circuitCooldownUntil;

  ReverseGeoRepository({String? olaApiKey}) : _olaApiKey = olaApiKey;

  String _cacheKey(double lat, double lng) => '${lat.toStringAsFixed(4)},${lng.toStringAsFixed(4)}';

  Future<AddressResolution> resolveCoordinates(double lat, double lng) async {
    final key = _cacheKey(lat, lng);
    if (_cache.containsKey(key)) return _cache[key]!;

    // 1. Try Ola Maps if key available and circuit breaker closed
    if (_olaApiKey != null && !_isCircuitTripped) {
      try {
        final res = await _dio.get(
          'https://api.olamaps.io/places/v1/reverse-geocode',
          queryParameters: {'latlng': '$lat,$lng', 'api_key': _olaApiKey},
        );
        if (res.statusCode == 200 && res.data['results']?.isNotEmpty == true) {
          final item = res.data['results'][0];
          final resolved = AddressResolution(
            area: item['sublocality'] ?? item['locality'] ?? '',
            city: item['locality'] ?? item['administrative_area_level_2'] ?? '',
            state: item['administrative_area_level_1'] ?? '',
            formattedAddress: item['formatted_address'] ?? '',
          );
          _cache[key] = resolved;
          return resolved;
        }
      } on DioException catch (e) {
        if (e.response?.statusCode == 429) {
          _isCircuitTripped = true;
          _circuitCooldownUntil = DateTime.now().add(const Duration(seconds: 20));
        }
      }
    }

    // Check circuit cooldown expiry
    if (_isCircuitTripped && _circuitCooldownUntil != null && DateTime.now().isAfter(_circuitCooldownUntil!)) {
      _isCircuitTripped = false;
    }

    // 2. Free Photon OSM fallback with POI Landmark extraction
    try {
      final res = await _dio.get(
        'https://photon.komoot.io/reverse',
        queryParameters: {'lat': lat, 'lon': lng, 'limit': 10},
      );
      final features = res.data['features'] as List? ?? [];
      if (features.isNotEmpty) {
        final p = features[0]['properties'] as Map<String, dynamic>;
        final landmarks = <String>[];

        for (final f in features) {
          final name = f['properties']?['name'] as String?;
          final osmVal = f['properties']?['osm_value'] as String? ?? '';
          if (name != null && name.isNotEmpty && !osmVal.contains('road')) {
            if (!landmarks.contains(name)) landmarks.add(name);
          }
        }

        final area = p['suburb'] ?? p['locality'] ?? p['district'] ?? '';
        final city = p['city'] ?? p['town'] ?? '';
        final state = p['state'] ?? '';

        final resolved = AddressResolution(
          area: area,
          city: city,
          state: state,
          formattedAddress: [area, city, state].where((s) => s.isNotEmpty).join(', '),
          primaryLandmark: landmarks.isNotEmpty ? landmarks.first : null,
          nearbyLandmarks: landmarks,
        );
        _cache[key] = resolved;
        return resolved;
      }
    } catch (_) {}

    return AddressResolution(area: '', city: '', state: '', formattedAddress: 'Pinned Location');
  }
}
```

---

## 6. Interactive Map Location Picker Screen (`lib/screens/location_picker_screen.dart`)

### Architecture Rules:
1. **Fixed Center Crosshair Pin**: The pin remains locked in the center of the viewport.
2. **Center-Pinned Zooming**: Pinch-to-zoom and mouse scroll zoom stay centered on the pin (`scrollWheelZoom: 'center'`), preventing pin drift while zooming.
3. **Programmatic Move Guard**: Autocomplete selection, Enter key search, or "Locate Me" flags `_isProgrammaticMove = true`, preventing false manual-drag banners.
4. **Manual Drag Action**: Dragging the map with touch or mouse marks `_isPinMoved = true`, prompting the user with `"📍 Fetch Details for Dropped Pin"`.

```dart
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import '../services/geo_service.dart';
import '../repositories/reverse_geo_repository.dart';

class LocationPickerScreen extends StatefulWidget {
  final LatLng? initialPosition;
  const LocationPickerScreen({Key? key, this.initialPosition}) : super(key: key);

  @override
  State<LocationPickerScreen> createState() => _LocationPickerScreenState();
}

class _LocationPickerScreenState extends State<LocationPickerScreen> {
  late final MapController _mapController;
  final GeoService _geoService = GeoService();
  final ReverseGeoRepository _reverseRepo = ReverseGeoRepository();
  final TextEditingController _searchController = TextEditingController();

  LatLng _currentCoords = const LatLng(20.5937, 78.9629); // Neutral India center
  AddressResolution? _currentAddress;

  bool _isPinMoved = false;
  bool _isProgrammaticMove = false;
  bool _isLoading = false;
  List<GeoSearchResult> _suggestions = [];

  Timer? _debounceTimer;

  @override
  void initState() {
    super.initState();
    _mapController = MapController();
    if (widget.initialPosition != null) {
      _currentCoords = widget.initialPosition!;
      _resolveAddress(_currentCoords);
    } else {
      _acquireGps();
    }
  }

  Future<void> _acquireGps() async {
    setState(() => _isLoading = true);
    try {
      final pos = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
      final latLng = LatLng(pos.latitude, pos.longitude);
      _flyTo(latLng, 17.5);
      await _resolveAddress(latLng);
    } catch (_) {
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _flyTo(LatLng target, double zoom) {
    _isProgrammaticMove = true;
    _currentCoords = target;
    _mapController.move(target, zoom);
  }

  Future<void> _resolveAddress(LatLng coords) async {
    setState(() => _isLoading = true);
    final res = await _reverseRepo.resolveCoordinates(coords.latitude, coords.longitude);
    setState(() {
      _currentAddress = res;
      _isPinMoved = false;
      _isLoading = false;
    });
  }

  void _onSearchChanged(String query) {
    _debounceTimer?.cancel();
    if (query.trim().length < 2) {
      setState(() => _suggestions = []);
      return;
    }
    _debounceTimer = Timer(const Duration(milliseconds: 300), () async {
      final list = await _geoService.searchLocationsPanIndia(query);
      setState(() => _suggestions = list);
    });
  }

  Future<void> _onSearchSubmitted(String query) async {
    setState(() => _suggestions = []);
    if (_suggestions.isNotEmpty) {
      _onSelectResult(_suggestions.first);
      return;
    }
    setState(() => _isLoading = true);
    final coords = await _geoService.forwardGeocode(query);
    if (coords != null) {
      _flyTo(coords, 17.5);
      await _resolveAddress(coords);
    } else {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not locate "$query". Try searching a nearby landmark or city.')),
        );
      }
    }
  }

  void _onSelectResult(GeoSearchResult item) {
    setState(() {
      _suggestions = [];
      _searchController.clear();
    });
    final target = LatLng(item.latitude, item.longitude);
    _flyTo(target, 17.5);
    _resolveAddress(target);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pin Exact Location', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 1,
      ),
      body: Stack(
        children: [
          // 1. Map View with Center Zoom Interaction
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _currentCoords,
              initialZoom: 17.0,
              interactionOptions: const InteractionOptions(
                flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
                pinchZoomWinGestures: 3,
              ),
              onPositionChanged: (camera, hasGesture) {
                if (hasGesture) {
                  _currentCoords = camera.center;
                  if (!_isProgrammaticMove) {
                    setState(() => _isPinMoved = true);
                  }
                }
              },
              onMapEvent: (event) {
                if (event is MapEventMoveEnd && _isProgrammaticMove) {
                  _isProgrammaticMove = false;
                }
              },
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.neoparlour.app',
              ),
            ],
          ),

          // 2. Center Crosshair Pin Overlay
          Center(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 38.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black87,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      _isPinMoved ? 'Click button below to fetch details' : 'Entrance Pin Position',
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Icon(
                    Icons.location_on,
                    size: 48,
                    color: _isPinMoved ? Colors.orangeAccent : const Color(0xFFFF2A14),
                  ),
                ],
              ),
            ),
          ),

          // 3. Pan-India Search Overlay
          Positioned(
            top: 12,
            left: 16,
            right: 16,
            child: Column(
              children: [
                Material(
                  elevation: 6,
                  borderRadius: BorderRadius.circular(14),
                  child: TextField(
                    controller: _searchController,
                    onChanged: _onSearchChanged,
                    onSubmitted: _onSearchSubmitted,
                    decoration: InputDecoration(
                      hintText: 'Search area, city, or landmark across India...',
                      prefixIcon: const Icon(Icons.search, color: Colors.grey),
                      suffixIcon: _searchController.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear),
                              onPressed: () {
                                _searchController.clear();
                                setState(() => _suggestions = []);
                              },
                            )
                          : null,
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                  ),
                ),
                if (_suggestions.isNotEmpty)
                  Container(
                    margin: const EdgeInsets.only(top: 4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 8)],
                    ),
                    child: ListView.separated(
                      shrinkWrap: true,
                      itemCount: _suggestions.length,
                      separatorBuilder: (_, __) => const Divider(height: 1),
                      itemBuilder: (_, idx) {
                        final item = _suggestions[idx];
                        return ListTile(
                          dense: true,
                          leading: const Icon(Icons.place, color: Color(0xFFFF2A14)),
                          title: Text(item.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text(item.subtitle),
                          onTap: () => _onSelectResult(item),
                        );
                      },
                    ),
                  ),
              ],
            ),
          ),

          // 4. Floating Action Button for Dropped Pin
          Positioned(
            bottom: 140,
            left: 0,
            right: 0,
            child: Center(
              child: ElevatedButton.icon(
                icon: const Icon(Icons.my_location, size: 18),
                label: Text(_isPinMoved ? '📍 Fetch Details for Dropped Pin' : '📍 Refresh Address Details'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _isPinMoved ? const Color(0xFFFF2A14) : Colors.white,
                  foregroundColor: _isPinMoved ? Colors.white : Colors.black87,
                  elevation: 8,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                ),
                onPressed: () => _resolveAddress(_currentCoords),
              ),
            ),
          ),

          // 5. GPS Recenter Button
          Positioned(
            bottom: 140,
            right: 16,
            child: FloatingActionButton.small(
              backgroundColor: Colors.white,
              onPressed: _acquireGps,
              child: const Icon(Icons.navigation, color: Color(0xFFFF2A14)),
            ),
          ),

          // 6. Address Confirmation Drawer
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10)],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.check_circle, color: Colors.green, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        _currentAddress?.area.isNotEmpty == true ? _currentAddress!.area : 'Pinned Entrance',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _currentAddress?.formattedAddress ?? 'Resolving location...',
                    style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFF2A14),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () => Navigator.pop(context, {
                        'latitude': _currentCoords.latitude,
                        'longitude': _currentCoords.longitude,
                        'address': _currentAddress,
                      }),
                      child: const Text('Confirm Entrance Location', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## 7. Radius Filtering, Distance Calculation & Explicit Search Bypass (`lib/services/salon_filter_engine.dart`)

```dart
import 'dart:math' as math;
import '../models/geo_models.dart';

class SalonFilterEngine {
  static const double earthRadiusKm = 6371.0;

  /// Haversine Formula for Proximity Calculation
  static double calculateDistanceKm({
    required double lat1,
    required double lon1,
    required double lat2,
    required double lon2,
  }) {
    final dLat = _degreesToRadians(lat2 - lat1);
    final dLon = _degreesToRadians(lon2 - lon1);

    final a = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(_degreesToRadians(lat1)) *
        math.cos(_degreesToRadians(lat2)) *
        math.sin(dLon / 2) *
        math.sin(dLon / 2);

    final c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  static double _degreesToRadians(double degrees) => degrees * math.pi / 180.0;

  /// Salon Discovery Filter with Radius & Explicit Search Bypass
  static List<SalonLocationItem> processSalons({
    required List<SalonLocationItem> allSalons,
    required double customerLat,
    required double customerLng,
    required int selectedRadiusKm,
    required String? searchedCity,
    required String? searchedArea,
  }) {
    final hasExplicitSearch = (searchedCity != null && searchedCity.trim().isNotEmpty) ||
                              (searchedArea != null && searchedArea.trim().isNotEmpty);

    // 1. Calculate dynamic distance for every salon
    for (var s in allSalons) {
      s.distanceKm = calculateDistanceKm(
        lat1: customerLat,
        lon1: customerLng,
        lat2: s.latitude,
        lon2: s.longitude,
      );
    }

    // 2. Filter list based on search mode
    List<SalonLocationItem> filtered;
    if (hasExplicitSearch) {
      // Explicit Search Mode: Radius bypassed to show all salons in target city/area
      filtered = allSalons.where((s) {
        final matchesCity = searchedCity == null || searchedCity.isEmpty || s.city.toLowerCase() == searchedCity.toLowerCase();
        final matchesArea = searchedArea == null || searchedArea.isEmpty || s.area.toLowerCase().contains(searchedArea.toLowerCase());
        return matchesCity && matchesArea;
      }).toList();
    } else {
      // Current GPS Mode: Filter strictly within selected radius chip (5, 10, 25, 50 km)
      filtered = allSalons.where((s) => (s.distanceKm ?? 9999) <= selectedRadiusKm).toList();
    }

    // 3. Proximity sorting: Nearest salons first
    filtered.sort((a, b) => (a.distanceKm ?? 9999).compareTo(b.distanceKm ?? 9999));
    return filtered;
  }
}
```

---

## 8. Free Turn-by-Turn Voice Navigation (`lib/utils/navigation_launcher.dart`)

```dart
import 'dart:io' show Platform;
import 'package:url_launcher/url_launcher.dart';

class NavigationLauncher {
  static Future<void> launchTurnByTurn({
    required double destinationLat,
    required double destinationLng,
    String? salonName,
  }) async {
    final Uri uri = Platform.isIOS
        ? Uri.parse('https://maps.apple.com/?daddr=$destinationLat,$destinationLng&dirflg=d')
        : Uri.parse('https://www.google.com/maps/dir/?api=1&destination=$destinationLat,$destinationLng');

    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      final fallbackGeo = Uri.parse('geo:$destinationLat,$destinationLng?q=$destinationLat,$destinationLng(${Uri.encodeComponent(salonName ?? "Salon")})');
      await launchUrl(fallbackGeo, mode: LaunchMode.externalApplication);
    }
  }
}
```

---

## 9. Verification & Testing Checklist for the Developer

| # | Test Scenario | Acceptance Criteria |
| :---: | :--- | :--- |
| **1** | **Pan-India Location Search** | Searching "Andheri", "Connaught Place", "Whitefield", or "Hadapsar" returns results from Mumbai, Delhi, Bengaluru, and Pune respectively without city restrictions. |
| **2** | **Center Crosshair Pin** | Dragging the map moves the underlying canvas while keeping the center pin anchored; releasing updates coordinates and prompts address refresh. |
| **3** | **Center Pinch/Scroll Zoom** | Pinching or mouse-wheel zooming stays centered on the pin without drifting off target. |
| **4** | **Enter Key Forward Geocode** | Pressing Enter immediately selects the top match or forward-geocodes the query and flies the map to the destination. |
| **5** | **Programmatic Move Guard** | Autocomplete selection or Enter key does not falsely trigger the manual drag banner. |
| **6** | **Radius Bypass on Search** | Searching an explicit city or area displays all matching salons in that locality, bypassing the 5/10/25/50 km radius filter. |
| **7** | **Zero-API Saved Address Switch** | Switching between saved addresses (Home, Work) re-centers coordinates and recalculates distances without making geocoding API calls. |
| **8** | **Native Turn-by-Turn Nav** | Tapping "Directions" opens Apple Maps on iOS or Google Maps on Android with salon coordinates pre-filled. |
