import pricingRaw from './pricing.json';

// ── Category names ──
export const categories = [
  'iPhone Pro','iPhone Pro Max','iPhone Air','iPhone 17','iPhone Budget',
  'Audio Apple','Mac Notebook','Mac Desktop','iPad','Apple Watch',
  'Acc Apple','Audio 3P','Protección 3P','Fundas 3P','Carga 3P',
  'Almacenamiento 3P','Otros 3P'
];

export const iphoneVariants = ['Pro','Pro Max','Air','Standard','Budget'];

// ── Units ──
export const units2024 = [1200,580,0,1300,5,5400,510,90,780,500,3500,120,350,280,200,40,180];
export const units2025 = [1362,485,0,1484,40,6079,623,112,895,585,3986,228,398,350,253,64,285];
export const units2026 = [409,650,120,651,1100,5960,1450,130,1000,720,4200,300,650,500,400,80,350];

// ── Revenue (millions CLP, net sin IVA) ──
export const rev2024 = [1107,660,0,568,2,689,613,80,429,147,210,15,10,8,7,3,5];
export const rev2025 = [1195,545,0,708,25,767,764,94,481,165,239,22,13,11,8,3,7];
export const rev2026 = [429,776,96,437,490,924,1080,114,504,193,282,29,21,17,13,7,9];

// ── Icons & Colors ──
export const icons = ['📱','📱','📱','📱','📱','🎧','💻','🖥️','📱','⌚','🔌','🔊','🛡️','👜','🔋','💾','📦'];
export const colors = [
  '#4f8cf7','#9b7af7','#f0b840','#38d4e8','#3dd68c','#e870b0','#4f8cf7','#5a9cf7',
  '#f0b840','#3dd68c','#7a8599','#e87070','#c490f7','#7ac4f7','#70c8a0','#d4a040','#a0a8b8'
];
export const featured = [true,true,true,true,true,true,true,true,true,true,true,false,false,false,false,false,false];

// ── Price Bands ──
export const priceBands = [
  { band:'< $420K', u26:7050, r26:1025, pct:41.6, products:'16e, AirPods, HomePod, Watch SE, iPad A16, AirTag, Acc' },
  { band:'$420K–$840K', u26:5480, r26:1975, pct:32.4, products:'17e, iPh 17, iPh Air, Neo, MBA M4, iPad Air, Watch S11' },
  { band:'$840K–$1.3M', u26:2800, r26:2252, pct:16.5, products:'iPh Pro, PM 256GB, MBA M5, iPad Pro 11", iMac' },
  { band:'$1.3M–$2.1M', u26:1350, r26:1378, pct:8, products:'PM 512GB+, MBP 14"/16", iPad Pro 13"' },
  { band:'> $2.1M', u26:250, r26:381, pct:1.5, products:'MBP M5 Max, Mac Studio, Mac Pro, PM 2TB' },
];

// ── Granular price labels ──
export const priceLabels = ['< $30K','$30K–$50K','$50K–$100K','$100K–$200K','$200K–$400K','$400K–$600K','$600K–$800K','$800K–$1M','$1M–$1.5M','$1.5M–$2M','$2M–$3M','> $3M'];

// Price band distributions per band
export const bandDist = {
  band1: [53,43,201,207,867,292,827,1214,1460,251,98,23],
  band2: [47,23,341,662,333,750,271,1594,1221,366,294,60],
  band3: [23,82,181,801,542,1223,830,176,2019,381,466,195],
  band4: [3382,1431,2291,1414,2996,565,1208,1243,1176,142,40,6],
  band5: [1843,558,3514,3780,1021,1532,374,1656,1002,219,124,17],
};

// ── Cuotas ──
export const cuotaLabels = ['Sin cuotas','3 cuotas','6 cuotas','12 cuotas','24 cuotas','36+ cuotas'];
export const cuotaDist = [
  [50,12,5,5,28,0],[46,16,7,7,24,0],[46,22,12,9,11,0],[41,19,14,14,12,0],
  [27,13,14,18,28,0],[31,11,11,16,31,0],[25,8,11,17,37,2],[24,9,8,18,38,3],
  [18,7,7,13,37,18],[33,8,9,10,35,5],[36,8,4,6,45,1],[27,8,13,11,41,0]
];
export const cuotaBand1 = [1453,539,506,872,1967,198];
export const cuotaBand2 = [1699,643,571,873,1869,307];
export const cuotaBand3 = [1946,720,676,1018,2294,223];

// ── Elasticity ──
export const elasticity = [
  { variable:'MacBook Neo adopción', pessimistic:'430u (3x rate)', pessDelta:-171, optimistic:'1,100u (8x + promo)', optDelta:139 },
  { variable:'iPh PM:Pro ratio', pessimistic:'✅ Ajustado', pessDelta:0, optimistic:'650:380 (1.7:1)', optDelta:0, applied:true },
  { variable:'Promo Santander s/Neo', pessimistic:'70% usa promo', pessDelta:-68, optimistic:'30% usa promo', optDelta:-20 },
  { variable:'iPhone Air tracción', pessimistic:'Solo 60u', pessDelta:-48, optimistic:'200u', optDelta:64 },
  { variable:'CVR Mobile mejora', pessimistic:'CVR 1.11%', pessDelta:-151, optimistic:'CVR 1.8%', optDelta:185 },
];

// ── Market Comparison ──
export const marketComparison = [
  { product:'AirPods Pro 3', pvpMO:279990, cyberPlan:249990, marketLow:249990, marketStore:'Lider BCI', status:'match', note:'Iguala mínimo mercado' },
  { product:'AirPods 4 ANC', pvpMO:199990, cyberPlan:180990, marketLow:189990, marketStore:'MercadoLibre', status:'ok', note:'Cyber < mercado' },
  { product:'AirPods 4', pvpMO:139990, cyberPlan:126990, marketLow:119990, marketStore:'Lider BCI', status:'warn', note:'Verificar BCI card-only' },
  { product:'AirPods Max', pvpMO:599990, cyberPlan:558990, marketLow:549990, marketStore:'Travel Tienda', status:'warn', note:'Considerar bajar a $549K' },
  { product:'iPhone 17 256GB', pvpMO:999990, cyberPlan:899990, marketLow:929990, marketStore:'Falabella', status:'ok', note:'Cyber < mercado' },
  { product:'iPhone 17 PM 256GB', pvpMO:1549990, cyberPlan:1426990, marketLow:1449990, marketStore:'Falabella', status:'ok', note:'Cyber < mercado' },
  { product:'MacBook Neo', pvpMO:649990, cyberPlan:598990, marketLow:599990, marketStore:'Falabella', status:'match', note:'Iguala mercado' },
  { product:'HomePod mini', pvpMO:84990, cyberPlan:78290, marketLow:74990, marketStore:'Lider', status:'warn', note:'Considerar bajar a $74K' },
];

// ── Pricing (229 SKUs) ──
export const pricing = pricingRaw;

// ── Computed helpers ──
export const totalUnits = (arr) => arr.reduce((a,b) => a+b, 0);
export const totalRev = (arr) => arr.reduce((a,b) => a+b, 0);

export const appleCategories = categories.slice(0, 11);
export const thirdPartyCategories = categories.slice(11);
