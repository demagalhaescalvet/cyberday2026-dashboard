# Dashboard Data Extraction

Successfully extracted all data arrays from the minified dashboard (index.html) into clean JSON files.

## Files Created

### 1. revenue.json
**Source:** `cH` variable in minified JavaScript
- **Type:** Array of 17 numbers
- **Content:** Yearly revenue data by category (values in millions)
- **Size:** 113 bytes
- **Sample:** [429, 776, 96, 437, 490, 924, 1080, ...]

### 2. units.json
**Source:** `lH` variable in minified JavaScript
- **Type:** Array of 17 numbers
- **Content:** Unit counts by category (corresponds to revenue.json)
- **Size:** 127 bytes
- **Sample:** [409, 650, 120, 651, 1100, 5960, 1450, ...]

### 3. pricing-audit.json
**Source:** `OH` array in minified JavaScript
- **Type:** Array of 8 objects
- **Content:** Competitive pricing audit entries
- **Size:** 1,598 bytes
- **Fields per entry:** product, pvpMO, cyberPlan, marketLow, marketStore, status, note
- **Sample entry:**
  ```json
  {
    "product": "AirPods Pro 3",
    "pvpMO": 279990,
    "cyberPlan": 249990,
    "marketLow": 249990,
    "marketStore": "Lider BCI",
    "status": "match",
    "note": "Iguala mínimo mercado"
  }
  ```

### 4. sku-grid.json
**Source:** `GH` object in minified JavaScript
- **Type:** Object with 229 key-value pairs
- **Content:** SKU pricing entries mapping SKU codes to pricing details
- **Size:** 26,058 bytes
- **Fields per entry:** realSku, pvp, cyberPrice, dcto (discount)
- **Sample entries:**
  - `AP4`: {realSku: "MXP63AM/A", pvp: 139990, cyberPrice: 126990, dcto: 0.1}
  - `APMax-Azu`: {realSku: "MWW63AM/A", pvp: 599990, cyberPrice: 558990, dcto: 0.07}

### 5. product-mix.json
**Source:** `EH` object in minified JavaScript
- **Type:** Object containing categories array
- **Content:** Complete product mix with hierarchical structure
- **Size:** 50,170 bytes
- **Structure:** 
  - Root object with `categories` array containing 17 product categories
  - Each category has: name, icon, units, revenue, asp (average selling price), color, subcategories
  - Each subcategory contains a `skus` array with individual SKU details
  - Each SKU has: sku, name, units, price
- **Categories:** iPhone Pro, iPhone Pro Max, iPhone Air, iPhone 17 Standard, iPhone Budget, Audio (AirPods), Mac Notebook, Mac Desktop, iPad, Apple Watch, Accesorios y Otros, Audio Terceros, Protección (ZAGG/ItSkins), Fundas Terceros, Carga Terceros, Almacenamiento (SanDisk), Otros Terceros

## Extraction Details

### Process
1. Read 848KB minified index.html file
2. Located each data structure by variable name (cH, lH, OH, GH, EH)
3. Extracted raw JavaScript object/array notation using brace/bracket matching
4. Converted JS syntax to valid JSON:
   - Converted template literals (backticks) to quoted strings
   - Fixed unquoted object keys with proper quoting
   - Handled JS-style decimals (`.1` → `0.1`)
   - Converted JS booleans (`!0` → `false`, `!1` → `true`)
   - Preserved UTF-8 encoded special characters (emojis, accented text)

### Key Challenges Solved
- Minified/compressed JavaScript with no line breaks
- Template literal strings with embedded special characters and quotes
- Nested object/array structures requiring careful brace counting
- Unicode characters including emojis and Spanish accented text

## Data Relationships

- **revenue.json** and **units.json** parallel arrays correspond to the 17 categories in **product-mix.json**
- **sku-grid.json** provides pricing lookup table for all SKUs mentioned in product-mix subcategories
- **pricing-audit.json** contains competitive market intelligence for key products

All data is now properly formatted and ready for programmatic access!
