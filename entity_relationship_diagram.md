# Project Epoch — Database Entity Relationship Diagram (ERD)

This document contains the complete **Chen Entity Relationship Diagram (ERD)** for the **Project Epoch** database, provided in both **Interactive Mermaid Diagrams** and **Markdown Visual ASCII/Unicode Illustrations**.

---

## 🔑 ERD Symbol Legend (Chen Notation)

```
  +--------------------+         (                    )         /                    \
  |    ENTITY NAME     |         (   ATTRIBUTE NAME   )        /  RELATIONSHIP NAME   \
  |    (Rectangle)     |         (       (Oval)       )        \      (Diamond)       /
  +--------------------+         (                    )         \                    /
```
- **Rectangles `[ ]`**: Entity sets (database tables)
- **Ovals `( )`**: Attributes (table columns, metadata, geometry)
  - **<u>Double Line / Underlined</u>**: Primary Key (PK) attribute
  - **Dashed Oval**: Foreign Key (FK) or Derived attribute
- **Diamonds `{ }`**: Relationships connecting entities with cardinalities (`1:N`, `M:N`, `1:1`)

---

## 1. High-Level Entity-Relationship Connection Map (ASCII Illustration)

```
                                          ( name_en )        ( name )       ( geom )
                                               \                |              /
                                            +-------------------------------------+
                                            |             MAP_REGIONS             |
                                            +-------------------------------------+
                                               | (1)                           | (1)
                                               |                               |
                                      /-----------------\             /-----------------\
                                     / CONTAINS_DISTRICT \           / LOCATED_IN_REGION \
                                     \                   /           \                   /
                                      \-----------------/             \-----------------/
                                               | (N)                           | (N)
                                               v                               v
    ( label )   ( name )   ( geom )         +---------------+                  |
        \          |          /             | MAP_DISTRICTS |                  |
     +--------------------------+           +---------------+                  |
     |       MAP_DISTRICTS      |                  ^                           |
     +--------------------------+                  |                           |
                   ^                               | (1)                       |
                   |                      /-------------------\                |
                   +---------------------/ LOCATED_IN_DISTRICT \               |
                                         \                     /               |
                                          \-------------------/                |
                                                    ^                          |
                                                    | (N)                      |
   ( file_path ) ( media_type )                     |                          |
        \             /                             |                          |
    /---------------------\      (1)     +--------------------+                |
   /      HAS_MEDIA        \-------------|  HERITAGE_ASSETS   |<---------------+
   \                       /             +--------------------+
    \---------------------/                         |
               | (N)                                | (M)
               v                                    v
   +-----------------------+              /--------------------\
   | HERITAGE_ASSET_MEDIA  |             / WITHIN_PROTECTED_   \
   +-----------------------+            /        AREA           \
        |         |                      \                      /
     ( id )   ( asset_id )                \--------------------/
      (PK)       (FK)                               | (N)
                                                    v
                                         +---------------------+
                                         | MAP_PROTECTED_AREAS |
                                         +---------------------+
                                                    |
                                            ( name )  ( geom )
```

---

## 2. Complete Chen ERD — Full System Mermaid Diagram

```mermaid
flowchart TD
    %% Styling Node Types
    classDef entity fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#fff,font-weight:bold;
    classDef weakEntity fill:#31103f,stroke:#c084fc,stroke-width:2px,color:#fff,font-weight:bold;
    classDef pkAttr fill:#431407,stroke:#f97316,stroke-width:2px,color:#ffedd5;
    classDef fkAttr fill:#701a75,stroke:#f43f5e,stroke-width:2px,color:#ffe4e6;
    classDef attr fill:#0f172a,stroke:#38bdf8,stroke-width:1px,color:#e2e8f0;
    classDef rel fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#ecfdf5;

    %% Entities (Rectangles)
    HA[HERITAGE_ASSETS]:::entity
    HAM[HERITAGE_ASSET_MEDIA]:::weakEntity
    MR[MAP_REGIONS]:::entity
    MD[MAP_DISTRICTS]:::entity
    MPA[MAP_PROTECTED_AREAS]:::entity
    MRIV[MAP_RIVERS]:::entity
    MROA[MAP_ROADS]:::entity

    %% Primary Key Attributes (Ovals)
    PK_HA(["<u>PK: id</u>"]):::pkAttr
    PK_HAM(["<u>PK: id</u>"]):::pkAttr
    PK_MR(["<u>PK: id</u>"]):::pkAttr
    PK_MD(["<u>PK: id</u>"]):::pkAttr
    PK_MPA(["<u>PK: id</u>"]):::pkAttr
    PK_MRIV(["<u>PK: id</u>"]):::pkAttr
    PK_MROA(["<u>PK: id</u>"]):::pkAttr

    %% Attach PKs
    PK_HA --- HA
    PK_HAM --- HAM
    PK_MR --- MR
    PK_MD --- MD
    PK_MPA --- MPA
    PK_MRIV --- MRIV
    PK_MROA --- MROA

    %% Relationship Diamonds
    R1{HAS_MEDIA}:::rel
    R2{LOCATED_IN_DISTRICT}:::rel
    R3{LOCATED_IN_REGION}:::rel
    R4{WITHIN_PROTECTED_AREA}:::rel
    R5{NEAR_RIVER}:::rel
    R6{ACCESSIBLE_BY_ROAD}:::rel
    R7{CONTAINS_DISTRICT}:::rel

    %% Connections
    HA ---|1| R1 ---|0..N| HAM
    HA ---|N| R2 ---|1| MD
    HA ---|N| R3 ---|1| MR
    HA ---|M| R4 ---|N| MPA
    HA ---|M| R5 ---|N| MRIV
    HA ---|M| R6 ---|N| MROA
    MR ---|1| R7 ---|0..N| MD
```

---

## 3. Entity Detailed Chen Diagrams & Connections

### 3.1 Entity 1: `HERITAGE_ASSETS` (Main Entity)

```
                                  ( <u>id</u> [PK] )
                                         |
    ( asset_category ) ---------+        |        +--------- ( name )
    ( asset_type ) -------------|        |        | --------- ( alternative_name )
    ( cultural_group ) ---------|        |        | --------- ( description )
    ( condition ) --------------+--+-----+-----+--+--------- ( data_completeness_score )
    ( conservation_status ) -------|  HERITAGE |----------- ( geom [PostGIS Geometry] )
    ( verification_status ) -------|   ASSETS  |----------- ( elevation_m )
    ( data_source ) --------------+--+-----+-----+--+--------- ( gps_accuracy_m )
    ( location_accuracy ) ------|        |        | --------- ( region )
    ( material ) ---------------|        |        | --------- ( district )
    ( secondary_material ) -----|        |        | --------- ( community )
    ( technique ) --------------+        |        +--------- ( location_description )
                                         |
                       ( dimensions: height/width/length )
                       ( temporal: period/dates/age )
                       ( provenance: origin/ownership )
```

```mermaid
flowchart LR
    classDef entity fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#fff;
    classDef pkAttr fill:#431407,stroke:#f97316,stroke-width:2px,color:#ffedd5;
    classDef attr fill:#0f172a,stroke:#38bdf8,stroke-width:1px,color:#e2e8f0;

    HA[HERITAGE_ASSETS]:::entity

    A1(["<u>PK: id</u>"]):::pkAttr
    A2(["name"]):::attr
    A3(["alternative_name"]):::attr
    A4(["description"]):::attr
    A5(["asset_type"]):::attr
    A6(["asset_category"]):::attr
    A7(["cultural_group"]):::attr
    A8(["geom (PostGIS)"]):::attr
    A9(["location_accuracy"]):::attr
    A10(["elevation_m"]):::attr
    A11(["gps_accuracy_m"]):::attr
    A12(["region"]):::attr
    A13(["district"]):::attr
    A14(["community"]):::attr
    A15(["location_description"]):::attr
    A16(["dimensions (h,w,l,d,wt)"]):::attr
    A17(["material & technique"]):::attr
    A18(["condition"]):::attr
    A19(["damage_type"]):::attr
    A20(["conservation_status"]):::attr
    A21(["period & dates"]):::attr
    A22(["origin & ownership"]):::attr
    A23(["data_completeness_score"]):::attr
    A24(["verification_status"]):::attr
    A25(["data_source"]):::attr

    HA --- A1
    HA --- A2
    HA --- A3
    HA --- A4
    HA --- A5
    HA --- A6
    HA --- A7
    HA --- A8
    HA --- A9
    HA --- A10
    HA --- A11
    HA --- A12
    HA --- A13
    HA --- A14
    HA --- A15
    HA --- A16
    HA --- A17
    HA --- A18
    HA --- A19
    HA --- A20
    HA --- A21
    HA --- A22
    HA --- A23
    HA --- A24
    HA --- A25
```

---

### 3.2 Entity 2: `HERITAGE_ASSET_MEDIA` (Weak Entity & `HAS_MEDIA` Relationship)

```
  +------------------+                    /-----------\                   +-----------------------+
  | HERITAGE_ASSETS  |-----( 1 )---------/  HAS_MEDIA  \-----( 0..N )---->| HERITAGE_ASSET_MEDIA  |
  +------------------+                   \-----------/                   +-----------------------+
                                               |                                     |
                                        ( Relationship )           +-----------------+-----------------+
                                                                   |                 |                 |
                                                            ( <u>id</u> [PK] )   ( asset_id [FK] )   ( media_type )
                                                                                     |                 |
                                                                              ( file_path )      ( file_name )
                                                                                     |                 |
                                                                              ( caption )        ( is_primary )
```

```mermaid
flowchart TD
    classDef entity fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#fff;
    classDef weakEntity fill:#31103f,stroke:#c084fc,stroke-width:2px,color:#fff;
    classDef pkAttr fill:#431407,stroke:#f97316,stroke-width:2px,color:#ffedd5;
    classDef fkAttr fill:#701a75,stroke:#f43f5e,stroke-width:2px,color:#ffe4e6;
    classDef attr fill:#0f172a,stroke:#38bdf8,stroke-width:1px,color:#e2e8f0;
    classDef rel fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#ecfdf5;

    HA[HERITAGE_ASSETS]:::entity
    HAM[HERITAGE_ASSET_MEDIA]:::weakEntity

    REL{HAS_MEDIA}:::rel

    M_PK(["<u>PK: id</u>"]):::pkAttr
    M_FK(["FK: asset_id"]):::fkAttr
    M1(["media_type"]):::attr
    M2(["file_path"]):::attr
    M3(["file_name"]):::attr
    M4(["caption"]):::attr
    M5(["alt_text"]):::attr
    M6(["sort_order"]):::attr
    M7(["is_primary"]):::attr

    HAM --- M_PK
    HAM --- M_FK
    HAM --- M1
    HAM --- M2
    HAM --- M3
    HAM --- M4
    HAM --- M5
    HAM --- M6
    HAM --- M7

    HA ---|1| REL ---|0..N| HAM
```

---

### 3.3 Spatial GIS Reference Entities & Relationships

```
                                      +--------------------+
                                      |    MAP_REGIONS     |
                                      +--------------------+
                                         |              |
                           ( <u>id</u>, name, geom )          | (1)
                                                        v
                                             /-------------------\
                                            / CONTAINS_DISTRICT   \
                                            \                     /
                                             \-------------------/
                                                        | (N)
                                                        v
                                      +--------------------+
                                      |   MAP_DISTRICTS    |
                                      +--------------------+
                                                |
                                     ( <u>id</u>, name, label, geom )

 -----------------------------------------------------------------------------------------

  +------------------+                   /-------------------------\                 +-----------------------+
  | HERITAGE_ASSETS  |-----( M )--------/ WITHIN_PROTECTED_AREA     \-----( N )----->| MAP_PROTECTED_AREAS   |
  +------------------+                  \                           /                +-----------------------+
            |                            \-------------------------/                             |
            |                                                                           ( <u>id</u>, name, geom )
            |                            /-------------------------\                 +-----------------------+
            +--------------( M )--------/        NEAR_RIVER         \-----( N )----->|      MAP_RIVERS       |
            |                           \                           /                +-----------------------+
            |                            \-------------------------/                             |
            |                                                                           ( <u>id</u>, name, geom )
            |                            /-------------------------\                 +-----------------------+
            +--------------( M )--------/    ACCESSIBLE_BY_ROAD     \-----( N )----->|       MAP_ROADS       |
                                        \                           /                +-----------------------+
                                         \-------------------------/                             |
                                                                                        ( <u>id</u>, name, geom )
```

---

## 4. Connection & Cardinality Matrix Table

| Source Entity `[Rectangle]` | Relationship `<Diamond>` | Target Entity `[Rectangle]` | Cardinality | Link Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| `HERITAGE_ASSETS` | `{ HAS_MEDIA }` | `HERITAGE_ASSET_MEDIA` | `1 : 0..N` | `heritage_asset_media.asset_id = heritage_assets.id` (ON DELETE CASCADE) |
| `HERITAGE_ASSETS` | `{ LOCATED_IN_DISTRICT }` | `MAP_DISTRICTS` | `N : 1` | Spatial containment (`ST_Contains`) or `heritage_assets.district = map_districts.name` |
| `HERITAGE_ASSETS` | `{ LOCATED_IN_REGION }` | `MAP_REGIONS` | `N : 1` | Spatial containment (`ST_Contains`) or `heritage_assets.region = map_regions.name` |
| `HERITAGE_ASSETS` | `{ WITHIN_PROTECTED_AREA }` | `MAP_PROTECTED_AREAS` | `M : N` | PostGIS spatial intersection (`ST_Intersects(heritage_assets.geom, map_protected_areas.geom)`) |
| `HERITAGE_ASSETS` | `{ NEAR_RIVER }` | `MAP_RIVERS` | `M : N` | PostGIS spatial distance check (`ST_DWithin(heritage_assets.geom, map_rivers.geom, distance)`) |
| `HERITAGE_ASSETS` | `{ ACCESSIBLE_BY_ROAD }` | `MAP_ROADS` | `M : N` | PostGIS spatial distance check (`ST_DWithin(heritage_assets.geom, map_roads.geom, distance)`) |
| `MAP_REGIONS` | `{ CONTAINS_DISTRICT }` | `MAP_DISTRICTS` | `1 : 0..N` | PostGIS spatial containment (`ST_Contains(map_regions.geom, map_districts.geom)`) |
