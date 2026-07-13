import React, { useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

export default function SitemapXML() {
  useEffect(() => {
    const fetchAndRender = async () => {
      try {
        // 1. Get cities dynamically from the database
        let cities = ['Pune', 'Mumbai', 'Bangalore', 'Chennai', 'Delhi'];
        try {
          const citiesRes = await axiosInstance.get('/salons/search/cities');
          if (citiesRes.data && citiesRes.data.length > 0) {
            cities = citiesRes.data;
          }
        } catch (e) {
          console.error("Failed to fetch cities from API, using defaults:", e);
        }

        // 2. Fetch salons for all cities
        let allSalons = [];
        for (const city of cities) {
          try {
            const res = await axiosInstance.get('/salons/by-city', { params: { cityName: city } });
            const salons = res.data?.content || res.data || [];
            allSalons.push(...salons);
          } catch (e) {
            console.error(`Failed to fetch salons for city ${city}:`, e);
          }
        }

        // 3. Build XML
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        // Home
        xml += `  <url>\n    <loc>https://neoparlour.com/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

        // Cities and their areas
        for (const city of cities) {
          const cityLower = city.toLowerCase();
          xml += `  <url>\n    <loc>https://neoparlour.com/salons/${cityLower}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;

          // Areas in this city
          const citySalons = allSalons.filter(s => (s.cityName || '').toLowerCase() === cityLower);
          const areas = [...new Set(citySalons.map(s => s.areaName).filter(Boolean))];
          for (const area of areas) {
            xml += `  <url>\n    <loc>https://neoparlour.com/salons/${cityLower}/${area.toLowerCase()}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
          }
        }

        // Salons
        const generateSlug = (name, city) => {
          const cleanName = (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const cleanCity = (city || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          return `${cleanName}-${cleanCity}`;
        };

        for (const salon of allSalons) {
          const slug = generateSlug(salon.salonName || salon.name, salon.cityName);
          xml += `  <url>\n    <loc>https://neoparlour.com/salon/${slug}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
        }

        // Active SEO Directory Pretty URLs (only for city/area combinations with registered salons)
        const cleanParam = (p) => encodeURIComponent(p || '').replace(/&/g, '&amp;');
        const activePairs = new Set();
        allSalons.forEach(s => {
          if (s.cityName && s.areaName) {
            const key = `${s.cityName.trim()}__${s.areaName.trim()}`;
            activePairs.add(key);
          }
        });

        const seoServices = [
          'Hair Cut', 'Hair Styling', 'Hair Wash', 'Blow Dry', 'Hair Coloring',
          'Highlights / Streaks', 'Hair Spa', 'Hair Treatment', 'Keratin Treatment',
          'Hair Smoothening', 'Hair Straightening', 'Perming / Curling', 'Hair Extensions',
          'Facial', 'Cleanup', 'Skin Polishing', 'Bleaching', 'De-Tan Treatment',
          'Face Treatment', 'Anti-Aging Treatment', 'Acne Treatment', 'Skin Brightening Treatment',
          'Chemical Peel', 'Waxing', 'Threading', 'Eyebrow Shaping', 'Upper Lip',
          'Forehead', 'Full Face Waxing', 'Full Body Waxing', 'Manicure', 'Pedicure',
          'Nail Cutting', 'Nail Shaping', 'Nail Art', 'Nail Extensions', 'Gel Polish',
          'Party Makeup', 'Bridal Makeup', 'Engagement Makeup', 'Reception Makeup',
          'HD Makeup', 'Basic Makeup', 'Beard Trim', 'Beard Styling', 'Shaving',
          'Moustache Styling', 'Eyebrow Styling', 'Eyelash Services', 'Head Massage',
          'Body Massage', 'Relaxation Massage', 'Aroma Therapy', 'Body Scrub', 'Body Wrap',
          'Bridal Hair', 'Bridal Facial', 'Bridal Manicure/Pedicure', 'Pre-Bridal Package',
          'Hair Fall Treatment', 'Dandruff Treatment', 'Scalp Treatment', 'Damage Repair',
          'Protein Treatment'
        ];

        activePairs.forEach(pair => {
          const [city, area] = pair.split('__');
          seoServices.forEach(service => {
            xml += `  <url>\n    <loc>https://neoparlour.com/seo-salons/${cleanParam(city)}/${cleanParam(area)}/${cleanParam(service)}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
          });
        });

        xml += `</urlset>`;

        // Output raw XML and replace the document structure
        document.open("text/xml", "replace");
        document.write(xml);
        document.close();

      } catch (err) {
        console.error("Error generating sitemap.xml:", err);
      }
    };

    fetchAndRender();
  }, []);

  return null;
}
