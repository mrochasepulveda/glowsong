// ============================================================
// Supabase — TypeScript Database Types
// Generado manualmente basado en schema.sql
// En producción: usar `supabase gen types typescript`
// ============================================================

export type Database = {
  public: {
    Tables: {
      locals: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          type: 'bar' | 'pub' | 'cocteleria' | 'cerveceria' | 'restaurante' | 'discoteca' | 'otro';
          address: string | null;
          city: string;
          capacity: number | null;
          status: 'pending_spotify' | 'configured' | 'active' | 'inactive';
          spotify_device_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['locals']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['locals']['Insert']>;
      };
      music_profiles: {
        Row: {
          id: string;
          local_id: string;
          genres: string[];
          energy_level: 'low' | 'medium' | 'high' | 'auto';
          bpm_min: number;
          bpm_max: number;
          popularity_min: number;
          explicit_allowed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['music_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['music_profiles']['Insert']>;
      };
      blocks: {
        Row: {
          id: string;
          local_id: string;
          type: 'genre' | 'artist' | 'track';
          scope: 'permanent' | 'session';
          value: string;
          display_name: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['blocks']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['blocks']['Insert']>;
      };
      session_events: {
        Row: {
          id: string;
          local_id: string;
          spotify_track_id: string;
          track_name: string;
          artist_name: string;
          album_art_url: string | null;
          duration_ms: number | null;
          genre: string | null;
          energy_level: 'low' | 'medium' | 'high' | null;
          source: 'algorithm' | 'consumer_vote' | 'consumer_paid';
          time_slot: 'opening' | 'afternoon' | 'early_night' | 'peak_night' | 'closing' | null;
          day_of_week: number | null;
          played_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['session_events']['Row'], 'id' | 'created_at'>;
        Update: never; // append-only, no updates
      };
      spotify_credentials: {
        Row: {
          id: string;
          local_id: string;
          access_token: string;
          refresh_token: string;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['spotify_credentials']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['spotify_credentials']['Insert']>;
      };
    };
    Views: {
      dashboard_state: {
        Row: {
          local_id: string;
          local_name: string;
          local_status: string;
          owner_id: string;
          genres: string[] | null;
          energy_level: string | null;
          explicit_allowed: boolean | null;
          blocks_count: number;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
