--
-- PostgreSQL database dump
--

-- Project Epoch — Full Database Schema
-- Dumped from PostgreSQL with PostGIS
-- To recreate: createdb project_epoch && psql -d project_epoch -f schema.sql

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: topology; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA topology;


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: postgis_topology; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;


--
-- Name: enum_asset_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_asset_category AS ENUM (
    'Museum',
    'Fort',
    'Castle',
    'Monument',
    'Artifact',
    'Textile (Kente, etc.)',
    'Jewelry / Beadwork',
    'Audio / Music',
    'Photograph / Digital Media',
    'Other'
);


--
-- Name: enum_asset_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_asset_type AS ENUM (
    'Site (Geography / Ruins)',
    'Object (Physical Artifact)',
    'Intangible Heritage (Tradition, Music)',
    'Document (Photo, Map, Archive)'
);


--
-- Name: enum_condition; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_condition AS ENUM (
    'Excellent',
    'Good',
    'Fair',
    'Poor',
    'Critical / Dilapidated'
);


--
-- Name: enum_conservation_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_conservation_status AS ENUM (
    'Protected / National Monument',
    'Unprotected',
    'Restored',
    'Endangered'
);


--
-- Name: enum_data_source; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_data_source AS ENUM (
    'Field Survey',
    'Literature / Archives',
    'Oral History / Interview'
);


--
-- Name: enum_location_accuracy; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_location_accuracy AS ENUM (
    'Exact (GPS Verified)',
    'Estimated (Vicinity)',
    'Unknown'
);


--
-- Name: enum_verification_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_verification_status AS ENUM (
    'Verified (Field Surveyed)',
    'Unverified (Pending Review)',
    'Inferred from Literature'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: heritage_assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.heritage_assets (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    name text,
    alternative_name text,
    description text,
    asset_type text,
    asset_category text,
    cultural_group text,
    geom public.geometry(Geometry,4326) NOT NULL,
    location_accuracy text,
    elevation_m numeric,
    gps_accuracy_m numeric,
    region text,
    district text,
    community text,
    location_description text,
    height_m numeric,
    width_m numeric,
    length_m numeric,
    diameter_m numeric,
    weight_kg numeric,
    material text,
    secondary_material text,
    technique text,
    condition text,
    damage_type text,
    conservation_status text,
    period text,
    period_start integer,
    period_end integer,
    estimated_age text,
    discovered_date date,
    recorded_date date,
    origin_known boolean DEFAULT true,
    origin_location text,
    current_location text,
    ownership text,
    data_completeness_score integer,
    verification_status text,
    data_source text,
    notes text,
    observer text,
    survey_method text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    deleted_at timestamp without time zone DEFAULT NULL,
    search_vector tsvector GENERATED ALWAYS AS (
      setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(alternative_name, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(region, '')), 'C') ||
      setweight(to_tsvector('english', coalesce(district, '')), 'C') ||
      setweight(to_tsvector('english', coalesce(community, '')), 'C') ||
      setweight(to_tsvector('english', coalesce(asset_category, '')), 'C') ||
      setweight(to_tsvector('english', coalesce(cultural_group, '')), 'D')
    ) STORED
);


--
-- Name: heritage_asset_media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.heritage_asset_media (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    asset_id text NOT NULL,
    media_type text NOT NULL,
    file_path text NOT NULL,
    file_name text,
    caption text,
    alt_text text,
    sort_order integer DEFAULT 0,
    is_primary boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: map_districts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.map_districts (
    id integer NOT NULL,
    name text,
    label text,
    geom public.geometry(MultiPolygon,4326)
);


--
-- Name: map_districts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.map_districts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: map_districts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.map_districts_id_seq OWNED BY public.map_districts.id;


--
-- Name: map_protected_areas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.map_protected_areas (
    id integer NOT NULL,
    name text,
    geom public.geometry(MultiPolygon,4326)
);


--
-- Name: map_protected_areas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.map_protected_areas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: map_protected_areas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.map_protected_areas_id_seq OWNED BY public.map_protected_areas.id;


--
-- Name: map_regions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.map_regions (
    id integer NOT NULL,
    name text,
    name_en text,
    geom public.geometry(MultiPolygon,4326)
);


--
-- Name: map_regions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.map_regions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: map_regions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.map_regions_id_seq OWNED BY public.map_regions.id;


--
-- Name: map_rivers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.map_rivers (
    id integer NOT NULL,
    name text,
    geom public.geometry(LineString,4326)
);


--
-- Name: map_rivers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.map_rivers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: map_rivers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.map_rivers_id_seq OWNED BY public.map_rivers.id;


--
-- Name: map_roads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.map_roads (
    id integer NOT NULL,
    name text,
    geom public.geometry(LineString,4326)
);


--
-- Name: map_roads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.map_roads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: map_roads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.map_roads_id_seq OWNED BY public.map_roads.id;


--
-- Name: map_districts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.map_districts ALTER COLUMN id SET DEFAULT nextval('public.map_districts_id_seq'::regclass);


--
-- Name: map_protected_areas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.map_protected_areas ALTER COLUMN id SET DEFAULT nextval('public.map_protected_areas_id_seq'::regclass);


--
-- Name: map_regions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.map_regions ALTER COLUMN id SET DEFAULT nextval('public.map_regions_id_seq'::regclass);


--
-- Name: map_rivers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.map_rivers ALTER COLUMN id SET DEFAULT nextval('public.map_rivers_id_seq'::regclass);


--
-- Name: map_roads id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.map_roads ALTER COLUMN id SET DEFAULT nextval('public.map_roads_id_seq'::regclass);


--
-- Name: heritage_asset_media heritage_asset_media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.heritage_asset_media
    ADD CONSTRAINT heritage_asset_media_pkey PRIMARY KEY (id);


--
-- Name: heritage_assets heritage_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.heritage_assets
    ADD CONSTRAINT heritage_assets_pkey PRIMARY KEY (id);


--
-- Name: map_districts map_districts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.map_districts
    ADD CONSTRAINT map_districts_pkey PRIMARY KEY (id);


--
-- Name: map_protected_areas map_protected_areas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.map_protected_areas
    ADD CONSTRAINT map_protected_areas_pkey PRIMARY KEY (id);


--
-- Name: map_regions map_regions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.map_regions
    ADD CONSTRAINT map_regions_pkey PRIMARY KEY (id);


--
-- Name: map_rivers map_rivers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.map_rivers
    ADD CONSTRAINT map_rivers_pkey PRIMARY KEY (id);


--
-- Name: map_roads map_roads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.map_roads
    ADD CONSTRAINT map_roads_pkey PRIMARY KEY (id);


--
-- Name: heritage_assets_geom_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX heritage_assets_geom_idx ON public.heritage_assets USING gist (geom);


--
-- Name: idx_ha_asset_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ha_asset_category ON public.heritage_assets USING btree (asset_category);


--
-- Name: idx_ha_asset_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ha_asset_type ON public.heritage_assets USING btree (asset_type);


--
-- Name: idx_ha_condition; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ha_condition ON public.heritage_assets USING btree (condition);


--
-- Name: idx_ha_conservation_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ha_conservation_status ON public.heritage_assets USING btree (conservation_status);


--
-- Name: idx_ha_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ha_created_at ON public.heritage_assets USING btree (created_at DESC);


--
-- Name: idx_ha_cultural_group; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ha_cultural_group ON public.heritage_assets USING btree (cultural_group);


--
-- Name: idx_ha_district; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ha_district ON public.heritage_assets USING btree (district);


--
-- Name: idx_ha_material; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ha_material ON public.heritage_assets USING btree (material);


--
-- Name: idx_ha_ownership; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ha_ownership ON public.heritage_assets USING btree (ownership);


--
-- Name: idx_ha_period; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ha_period ON public.heritage_assets USING btree (period);


--
-- Name: idx_ha_region; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ha_region ON public.heritage_assets USING btree (region);


--
-- Name: idx_ha_verification_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ha_verification_status ON public.heritage_assets USING btree (verification_status);


--
-- Name: idx_heritage_asset_media_asset_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_heritage_asset_media_asset_id ON public.heritage_asset_media USING btree (asset_id);


--
-- Name: idx_heritage_asset_media_sort_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_heritage_asset_media_sort_order ON public.heritage_asset_media USING btree (asset_id, sort_order, created_at);


--
-- Name: map_districts_geom_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX map_districts_geom_idx ON public.map_districts USING gist (geom);


--
-- Name: map_protected_areas_geom_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX map_protected_areas_geom_idx ON public.map_protected_areas USING gist (geom);


--
-- Name: map_regions_geom_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX map_regions_geom_idx ON public.map_regions USING gist (geom);


--
-- Name: map_rivers_geom_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX map_rivers_geom_idx ON public.map_rivers USING gist (geom);


--
-- Name: map_roads_geom_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX map_roads_geom_idx ON public.map_roads USING gist (geom);


--
-- Name: heritage_asset_media heritage_asset_media_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.heritage_asset_media
    ADD CONSTRAINT heritage_asset_media_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.heritage_assets(id) ON DELETE CASCADE;


--
-- Name: idx_ha_search; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ha_search ON public.heritage_assets USING GIN (search_vector);


--
-- Name: idx_ha_artifacts; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ha_artifacts ON public.heritage_assets (id)
WHERE (
  (asset_type = 'Object (Physical Artifact)' OR asset_category IN ('Artifact', 'Jewelry / Beadwork'))
  AND asset_category IS DISTINCT FROM 'Textile (Kente, etc.)'
);


--
-- Name: idx_ha_museums; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ha_museums ON public.heritage_assets (id)
WHERE (
  asset_type = 'Site (Geography / Ruins)'
  OR asset_category IN ('Museum', 'Fort', 'Castle', 'Monument')
);


--
-- Name: idx_ha_textiles; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ha_textiles ON public.heritage_assets (id)
WHERE asset_category = 'Textile (Kente, etc.)';


--
-- Name: idx_ha_documents; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ha_documents ON public.heritage_assets (id)
WHERE (
  asset_type = 'Document (Photo, Map, Archive)'
  OR asset_category IN ('Photograph / Digital Media', 'Audio / Music')
);


--
-- Name: idx_ha_needs_review; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ha_needs_review ON public.heritage_assets (id)
WHERE asset_type IS NULL OR asset_category IS NULL;


--
-- Name: idx_ha_created_at_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ha_created_at_id ON public.heritage_assets (created_at DESC, id);


--
-- Name: idx_ha_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ha_deleted_at ON public.heritage_assets (deleted_at)
WHERE deleted_at IS NOT NULL;


--
-- Name: idx_ha_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ha_active ON public.heritage_assets (id)
WHERE deleted_at IS NULL;


--
-- Name: tg_heritage_assets_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tg_heritage_assets_updated
BEFORE UPDATE ON heritage_assets
FOR EACH ROW EXECUTE FUNCTION update_timestamp();


--
-- Name: tg_heritage_asset_media_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tg_heritage_asset_media_updated
BEFORE UPDATE ON heritage_asset_media
FOR EACH ROW EXECUTE FUNCTION update_timestamp();


--
-- Name: update_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


--
-- PostgreSQL database dump complete
--

-- End of schema

