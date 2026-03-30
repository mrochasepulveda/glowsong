import pg from 'pg';
import { config } from '../config/env.js';

/**
 * Seed script — Populates the riff schema with Chilean venues, genres, and sample data
 * Run with: npm run db:seed
 */
async function seed() {
  const client = new pg.Client({ connectionString: config.database.url });

  try {
    await client.connect();
    console.log('🌱 Seeding riff schema...');

    // ---- Genres ----
    await client.query(`
      INSERT INTO riff.genres (name, slug) VALUES
        ('Rock', 'rock'),
        ('Metal', 'metal'),
        ('Hardcore', 'hardcore'),
        ('Punk', 'punk'),
        ('Metalcore', 'metalcore'),
        ('Techno', 'techno'),
        ('House', 'house'),
        ('Electrónica', 'electronica'),
        ('Drum & Bass', 'drum-and-bass'),
        ('Reggaeton', 'reggaeton'),
        ('Trap', 'trap'),
        ('Urbano', 'urbano'),
        ('Cumbia', 'cumbia'),
        ('Hip Hop', 'hip-hop'),
        ('Pop', 'pop'),
        ('Indie', 'indie'),
        ('Folk', 'folk'),
        ('Jazz', 'jazz'),
        ('Blues', 'blues'),
        ('R&B', 'rnb'),
        ('Clásica', 'clasica'),
        ('Experimental', 'experimental'),
        ('Ambient', 'ambient'),
        ('Reggae', 'reggae'),
        ('Ska', 'ska'),
        ('Latin', 'latin')
      ON CONFLICT (slug) DO NOTHING;
    `);
    console.log('  ✅ Genres seeded');

    // ---- Venues (Chile) ----
    await client.query(`
      INSERT INTO riff.venues (name, city, address, capacity, instagram_handle) VALUES
        ('Movistar Arena', 'Santiago', 'Av. Beauchef 1285, Santiago', 15000, 'movistararena_cl'),
        ('Estadio Nacional', 'Santiago', 'Av. Grecia 2001, Ñuñoa', 50000, NULL),
        ('Teatro Caupolicán', 'Santiago', 'San Diego 850, Santiago', 5000, 'caupolicanchile'),
        ('Club Chocolate', 'Santiago', 'Constitución 40, Bellavista', 600, 'chocolateclubchile'),
        ('Blondie', 'Santiago', 'Alameda 2879, Santiago', 1200, 'blondiebar'),
        ('Club Subterráneo', 'Santiago', 'Simón Bolívar 4100, Ñuñoa', 300, NULL),
        ('KM Cero', 'Santiago', 'Nataniel Cox 51, Santiago', 400, NULL),
        ('Teatro La Cúpula', 'Santiago', 'Parque OHiggins, Santiago', 5600, NULL),
        ('Espacio Riesco', 'Santiago', 'Av. El Salto 5000, Huechuraba', 20000, NULL),
        ('Teatro Municipal de Santiago', 'Santiago', 'Agustinas 794, Santiago', 1500, NULL),
        ('Parque Bicentenario de Cerrillos', 'Santiago', 'Av. Pedro Aguirre Cerda 6542', 80000, NULL),
        ('Sala SCD Bellavista', 'Santiago', 'Bombero Núñez 159, Providencia', 350, NULL),
        ('Teatro Teletón', 'Santiago', 'Av. Libertador Bernardo OHiggins 4848', 3000, NULL),
        ('Club Amanda', 'Santiago', 'Av. Manuel Antonio Matta 305', 500, NULL),
        ('House of Rock', 'Santiago', 'Estado 120, Santiago', 400, NULL),
        ('Bar El Clan', 'Valparaíso', 'Blanco 1157, Valparaíso', 250, NULL),
        ('Sala Murano', 'Valparaíso', 'Errázuriz 1042, Valparaíso', 400, NULL),
        ('Arena Concepción', 'Concepción', 'Los Carrera 1390, Concepción', 3000, NULL)
      ON CONFLICT DO NOTHING;
    `);
    console.log('  ✅ Venues seeded');

    // ---- Sample Artists (with placeholder images) ----
    await client.query(`
      INSERT INTO riff.artists (name, country, is_local, popularity, image_url) VALUES
        ('Terror', 'US', false, 45, 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=600&fit=crop'),
        ('Knocked Loose', 'US', false, 52, 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&h=600&fit=crop'),
        ('Turnstile', 'US', false, 60, 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=600&fit=crop'),
        ('Charlotte de Witte', 'BE', false, 72, 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=600&h=600&fit=crop'),
        ('Amelie Lens', 'BE', false, 70, 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=600&fit=crop'),
        ('Andrea Paz', 'CL', true, 30, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop'),
        ('Bad Bunny', 'PR', false, 98, 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&h=600&fit=crop'),
        ('Karol G', 'CO', false, 95, 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=600&fit=crop'),
        ('Polimá Westcoast', 'CL', true, 68, 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&h=600&fit=crop'),
        ('Pailita', 'CL', true, 72, 'https://images.unsplash.com/photo-1504680177321-2e6a879aac86?w=600&h=600&fit=crop'),
        ('Mon Laferte', 'CL', true, 78, 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&h=600&fit=crop'),
        ('Francisca Valenzuela', 'CL', true, 55, 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=600&h=600&fit=crop'),
        ('Drefquila', 'CL', true, 45, 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=600&fit=crop'),
        ('Gianluca', 'CL', true, 48, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=600&fit=crop'),
        ('FloyyMenor', 'CL', true, 65, 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&h=600&fit=crop')
      ON CONFLICT DO NOTHING;
    `);
    console.log('  ✅ Artists seeded');

    // ---- Scraping Sources ----
    await client.query(`
      INSERT INTO riff.scraping_sources (name, type, url, is_active, scrape_interval_minutes) VALUES
        ('PuntoTicket', 'puntoticket', 'https://www.puntoticket.com', true, 360),
        ('Ticketmaster Chile', 'ticketmaster', 'https://www.ticketmaster.cl', true, 360),
        ('Passline', 'passline', 'https://www.passline.com/eventos?q=&region=12&mes=&categoria=', true, 360),
        ('Ticketplus', 'ticketplus', 'https://ticketplus.cl/', true, 360),
        ('DG Medios Instagram', 'instagram', 'https://www.instagram.com/dgmedios/', true, 720),
        ('Move Concerts Instagram', 'instagram', 'https://www.instagram.com/moveconcertschile/', true, 720),
        ('Bizarro Instagram', 'instagram', 'https://www.instagram.com/bizarrocl/', true, 720),
        ('Lotus Instagram', 'instagram', 'https://www.instagram.com/lotuscl/', true, 720),
        ('Transistor Instagram', 'instagram', 'https://www.instagram.com/transistor_cl/', true, 720),
        ('Fauna Prod Instagram', 'instagram', 'https://www.instagram.com/faunaprod/', true, 720),
        ('Street Machine Instagram', 'instagram', 'https://www.instagram.com/streetmachinecl/', true, 720),
        ('Caupolicán Instagram', 'instagram', 'https://www.instagram.com/caupolicanchile/', true, 720),
        ('Teatro Coliseo Instagram', 'instagram', 'https://www.instagram.com/teatrocoliseo/', true, 720),
        ('Movistar Arena Instagram', 'instagram', 'https://www.instagram.com/movistararena_cl/', true, 720),
        ('Club Chocolate Instagram', 'instagram', 'https://www.instagram.com/chocolateclubchile/', true, 720),
        ('Matucana 100 Instagram', 'instagram', 'https://www.instagram.com/matucana100/', true, 720),
        ('Blondie Instagram', 'instagram', 'https://www.instagram.com/blondiebar/', true, 720),
        ('Club Subterráneo Instagram', 'instagram', 'https://www.instagram.com/clubsubterraneo.oficial/', true, 720),
        ('Bar El Clan Instagram', 'instagram', 'https://www.instagram.com/barelclan/', true, 720),
        ('Trotamundos Quilpué Instagram', 'instagram', 'https://www.instagram.com/trotamundosquilpue/', true, 720),
        ('Escena Techno Chile', 'instagram', 'https://www.instagram.com/escenatechnochile/', true, 720),
        ('Chile Festivales', 'instagram', 'https://www.instagram.com/chilefestivales/', true, 720)
      ON CONFLICT DO NOTHING;
    `);
    console.log('  ✅ Scraping sources seeded');

    // ---- Sample Events ----
    await client.query(`
      INSERT INTO riff.events (title, artist_id, venue_id, date, price_min, price_max, currency, status, source)
      SELECT
        a.name || ' en ' || v.name,
        a.id,
        v.id,
        NOW() + (random() * 90 || ' days')::interval,
        CASE WHEN random() > 0.3 THEN (10000 + floor(random() * 40000))::int ELSE NULL END,
        CASE WHEN random() > 0.3 THEN (30000 + floor(random() * 70000))::int ELSE NULL END,
        'CLP',
        'confirmed',
        'seed'
      FROM riff.artists a
      CROSS JOIN riff.venues v
      WHERE v.city = 'Santiago'
      AND random() > 0.85
      LIMIT 20;
    `);
    console.log('  ✅ Sample events seeded');

    console.log('\n🎉 Riff schema seeded successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
