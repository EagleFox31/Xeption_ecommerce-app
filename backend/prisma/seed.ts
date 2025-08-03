import { PrismaClient } from '@prisma/client';
import {
  UserRole,
  ProductTierEnum,
  InventoryReasonEnum,
  RfqStatusEnum
} from '.prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean database in development only
  if (process.env.NODE_ENV === 'development') {
    await cleanDatabase();
  }

  // Create base data
  const regions = await createRegions();
  const cities = await createCities(regions);
  const communes = await createCommunes(cities);
  
  // Create categories and brands
  const categories       = await createCategories();
  const categoriesBySlug = categories; 
  const brands = await createBrands();
  
  // Link categories and brands
  await linkCategoriesAndBrands(categories, brands);
  
  // Create product series
  const series = await createProductSeries(categories, brands);
  
  // Create products
  const products = await createProducts(categoriesBySlug, brands, series);
  
  // Create variant attributes and values
  const attributes = await createVariantAttributes();
  const values = await createVariantValues(attributes);
  
  // Create product variants
  await createProductVariants(products, attributes, values);
  
  // Create users with different roles
  const users = await createUsers();
  
  // Create addresses for users
  await createAddresses(users, regions, cities, communes);
  
  // Create carts
  await createCarts(users, products);
  
  // Create business data
  await createRfqs(users, categories);
  await createTradeIns(users);
  await createRepairJobs(users);
  await createBackOrders(users);
  
  // Create marketing data
  await createMarketingBanners(categories);
  
  console.log('✅ Database seeding completed successfully');
}

async function cleanDatabase() {
  console.log('🧹 Cleaning database...');
  
  // Order matters due to foreign key constraints
  await prisma.productVariantValue.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.promotion.deleteMany({});
  await prisma.productSpecification.deleteMany({});
  await prisma.productFeature.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productDescription.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.backOrderNotification.deleteMany({});
  await prisma.backOrder.deleteMany({});
  await prisma.inventoryLog.deleteMany({});
  await prisma.tradeInPhoto.deleteMany({});
  await prisma.tradeIn.deleteMany({});
  await prisma.technicianAvailability.deleteMany({});
  await prisma.repairJob.deleteMany({});
  await prisma.rfqItem.deleteMany({});
  await prisma.rfq.deleteMany({});
  await prisma.budgetAdvisory.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.productSeries.deleteMany({});
  await prisma.categoryBrand.deleteMany({});
  await prisma.categorySkuPrefix.deleteMany({});
  await prisma.variantValue.deleteMany({});
  await prisma.variantAttribute.deleteMany({});
  await prisma.marketingBanner.deleteMany({});
  await prisma.delivery.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.commune.deleteMany({});
  await prisma.city.deleteMany({});
  await prisma.region.deleteMany({});
  await prisma.setting.deleteMany({});
  await prisma.skuCounter.deleteMany({});
  
  console.log('🧹 Database cleaned');
}

async function createRegions() {
  console.log('🗺️ Creating regions...');
  
  const regions = [
    { name: 'Adamaoua' },
    { name: 'Centre' },
    { name: 'Est' },
    { name: 'Extreme-Nord' },
    { name: 'Littoral' },
    { name: 'Nord' },
    { name: 'Nord-Ouest' },
    { name: 'Ouest' },
    { name: 'Sud' },
    { name: 'Sud-Ouest' }
  ];
  
  const createdRegions: Record<string, any> = {};
  
  for (const region of regions) {
    const created = await prisma.region.upsert({
      where: { name: region.name },
      update: {},
      create: region
    });
    createdRegions[region.name] = created;
  }
  
  console.log(`✅ Created ${Object.keys(createdRegions).length} regions`);
  return createdRegions;
}

async function createCities(regions: Record<string, any>) {
  console.log('🏙️ Creating cities...');
  
  const cities = [
    { name: 'Yaoundé', regionId: regions['Centre'].id },
    { name: 'Douala', regionId: regions['Littoral'].id },
    { name: 'Bafoussam', regionId: regions['Ouest'].id },
    { name: 'Bamenda', regionId: regions['Nord-Ouest'].id },
    { name: 'Garoua', regionId: regions['Nord'].id },
    { name: 'Maroua', regionId: regions['Extreme-Nord'].id },
    { name: 'Ngaoundéré', regionId: regions['Adamaoua'].id },
    { name: 'Bertoua', regionId: regions['Est'].id },
    { name: 'Buea', regionId: regions['Sud-Ouest'].id },
    { name: 'Ebolowa', regionId: regions['Sud'].id }
  ];
  
  const createdCities: Record<string, any> = {};
  
  for (const city of cities) {
    const created = await prisma.city.upsert({
      where: { 
        id: -1  // This won't match, forcing create
      },
      update: {},
      create: city
    });
    createdCities[city.name] = created;
  }
  
  console.log(`✅ Created ${Object.keys(createdCities).length} cities`);
  return createdCities;
}

async function createCommunes(cities: Record<string, any>) {
  console.log('🏘️ Creating communes...');
  
  const communes = [
    { name: 'Yaoundé 1', cityId: cities['Yaoundé'].id },
    { name: 'Yaoundé 2', cityId: cities['Yaoundé'].id },
    { name: 'Yaoundé 3', cityId: cities['Yaoundé'].id },
    { name: 'Yaoundé 4', cityId: cities['Yaoundé'].id },
    { name: 'Yaoundé 5', cityId: cities['Yaoundé'].id },
    { name: 'Douala 1', cityId: cities['Douala'].id },
    { name: 'Douala 2', cityId: cities['Douala'].id },
    { name: 'Douala 3', cityId: cities['Douala'].id },
    { name: 'Douala 4', cityId: cities['Douala'].id },
    { name: 'Douala 5', cityId: cities['Douala'].id }
  ];
  
  const createdCommunes: Record<string, any> = {};
  
  for (const commune of communes) {
    const created = await prisma.commune.upsert({
      where: { 
        id: -1  // This won't match, forcing create
      },
      update: {},
      create: commune
    });
    createdCommunes[commune.name] = created;
  }
  
  console.log(`✅ Created ${Object.keys(createdCommunes).length} communes`);
  return createdCommunes;
}

async function createCategories() {
  console.log('📁 Creating categories...');

  /* ---------- 1️⃣  Catégories racines ---------- */
const roots = [
  { key: 'smart',  name: 'Smartphones & Tablettes', slug: 'smartphones-tablettes', skuPrefix: 'SMA'  }, // id 1
  { key: 'ordi',   name: 'Ordinateurs',             slug: 'ordinateurs',           skuPrefix: 'ORD'  }, // id 2
  { key: 'mobile', name: 'Accessoires Mobiles',     slug: 'accessoires-mobiles',   skuPrefix: 'ACC'  }, // id 3
  { key: 'audio',  name: 'Audio & Son',             slug: 'audio-son',             skuPrefix: 'AUD'  }, // id 4
  { key: 'power',  name: 'Power & Énergie',         slug: 'power-energie',         skuPrefix: 'POW'  }, // id 5
  { key: 'gaming', name: 'Gaming & Consoles',       slug: 'gaming-consoles',       skuPrefix: 'GAM'  }, // id 6
  { key: 'pc',     name: 'Composants PC',           slug: 'composants-pc',         skuPrefix: 'COM'  }, // id 7
  { key: 'home',   name: 'Maison Connectée',        slug: 'maison-connectee',      skuPrefix: 'MAI'  }, // id 8
  { key: 'wifi',   name: 'Réseau & WiFi',           slug: 'reseau-wifi',           skuPrefix: 'RSE'  }, // id 9
  { key: 'print',  name: 'Impression & Scanners',   slug: 'impression-scanners',   skuPrefix: 'IMP'  }, // id 10
  { key: 'soft',   name: 'Logiciels & Licences',    slug: 'logiciels-licences',    skuPrefix: 'LOG'  }  // id 11
];


  /* ---------- 2️⃣  Sous-catégories ---------- */
const subs = [
  { key: 'laptops',    parent: 'ordi',   name: 'Laptops',                       slug: 'laptops',               skuPrefix: 'LAP'  }, // id 12
  { key: 'pc-bureau',  parent: 'ordi',   name: 'PC de Bureau',                  slug: 'pc-bureau',             skuPrefix: 'PCD'  }, // id 13

  { key: 'coques',     parent: 'mobile', name: 'Coques & Protection',           slug: 'coques-protection',     skuPrefix: 'COQ'  }, // id 14
  { key: 'cables',     parent: 'mobile', name: 'Chargeurs & Câbles',            slug: 'chargeurs-cables',      skuPrefix: 'CHA'  }, // id 15
  { key: 'stockage',   parent: 'mobile', name: 'Stockage Mobile (SD/USB)',      slug: 'stockage-mobile',       skuPrefix: 'STO'  }, // id 16

  { key: 'headphones', parent: 'audio',  name: 'Écouteurs & Casques',           slug: 'ecouteurs-casques',     skuPrefix: 'COU'  }, // id 17
  { key: 'speakers',   parent: 'audio',  name: 'Enceintes Bluetooth',           slug: 'enceintes-bluetooth',   skuPrefix: 'ENC'  }, // id 18

  { key: 'powerbanks', parent: 'power',  name: 'Power Banks',                   slug: 'power-banks',           skuPrefix: 'POW1' }, // id 19
  { key: 'ups',        parent: 'power',  name: 'Onduleurs & Multiprises',       slug: 'onduleurs-multiprises', skuPrefix: 'OND'  }, // id 20

  { key: 'gaming-acc', parent: 'gaming', name: 'Accessoires Gaming',            slug: 'accessoires-gaming',    skuPrefix: 'ACC2' }, // id 21

  { key: 'cpu',        parent: 'pc',     name: 'Composants • Processeurs',      slug: 'cpu',                   skuPrefix: 'COM3' }, // id 22
  { key: 'gpu',        parent: 'pc',     name: 'Composants • Cartes Graphiques',slug: 'gpu',                   skuPrefix: 'COM4' }, // id 23

  { key: 'domotique',  parent: 'home',   name: 'Domotique & Sécurité',          slug: 'domotique-securite',    skuPrefix: 'DOM'  }  // id 24
];


  const created: Record<string, any> = {};
  const bySlug: Record<string, any> = {};
  const prefixData: { categoryId: bigint; prefix: string }[] = [];

  /* ---------- 3️⃣  Insertion des racines ---------- */
  for (const cat of roots) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug, skuPrefix: cat.skuPrefix }
    });
    created[cat.key] = c;
    created[cat.slug]  = c;
    prefixData.push({ categoryId: c.id, prefix: cat.skuPrefix });
  }

  /* ---------- 4️⃣  Insertion des sous-catégories ---------- */
  for (const sub of subs) {
    const c = await prisma.category.upsert({
      where: { slug: sub.slug },
      update: {},
      create: {
        name: sub.name,
        slug: sub.slug,
        parentId: created[sub.parent].id,
        skuPrefix: sub.skuPrefix
      }
    });
    created[sub.key] = c;
    created[sub.slug]  = c;

    prefixData.push({ categoryId: c.id, prefix: sub.skuPrefix });
  }

  console.log('✅ Categories created');

  /* ---------- 5️⃣  SKU prefixes & counters ---------- */
  await createSkuPrefixes(prefixData);

  return created;
}


async function createSkuPrefixes(
  prefixData: { categoryId: bigint; prefix: string }[]
) {
  console.log('🏷️ Creating SKU prefixes...');

  /* 💾  Valeurs initiales provenant de ton INSERT ------------------- */
  const initialSeq: Record<string, number> = {
    ACC: 0,
    AUD: 0,
    CPU: 0,
    GAM: 0,
    GPU: 0,
    IOT: 0,
    LAP: 0,
    NET: 0,      // (= RSE si tu gardes ce préfixe pour Réseau)
    PCD: 0,
    PRNT: 0,
    PWR: 0,      // (= POWER / POW1 ? garde le même texte partout)
    SMART: 31,
    SPKR: 0,
    STO: 0,
    SW: 0,
    UPS: 0
  };

  for (const data of prefixData) {
    /* 1️⃣  table category_sku_prefix ------------------------------- */
    await prisma.categorySkuPrefix.upsert({
      where: { categoryId: data.categoryId },
      update: { prefix: data.prefix },
      create: data
    });

    /* 2️⃣  table sku_counters  –> utilise le mapping ci-dessus ----- */
    await prisma.skuCounter.upsert({
      where: { prefix: data.prefix },
      update: { lastSeq: initialSeq[data.prefix] ?? 0 },
      create: {
        prefix: data.prefix,
        lastSeq: initialSeq[data.prefix] ?? 0
      }
    });
  }

  console.log('✅ SKU prefixes & counters created/updated');
}

async function createBrands() {
  console.log('🏭 Creating brands...');
  
  const brands = [
    { name: 'Apple',          slug: 'apple' },
    { name: 'Samsung',        slug: 'samsung' },
    { name: 'Xiaomi',         slug: 'xiaomi' },
    { name: 'Huawei',         slug: 'huawei' },
    { name: 'Oppo',           slug: 'oppo' },
    { name: 'Vivo',           slug: 'vivo' },
    { name: 'OnePlus',        slug: 'oneplus' },
    { name: 'Realme',         slug: 'realme' },
    { name: 'Tecno',          slug: 'tecno' },
    { name: 'Infinix',        slug: 'infinix' },
    { name: 'Dell',           slug: 'dell' },
    { name: 'HP',             slug: 'hp' },
    { name: 'Lenovo',         slug: 'lenovo' },
    { name: 'Asus',           slug: 'asus' },
    { name: 'Acer',           slug: 'acer' },
    { name: 'MSI',            slug: 'msi' },
    { name: 'Microsoft',      slug: 'microsoft' },
    { name: 'Razer',          slug: 'razer' },
    { name: 'Anker',          slug: 'anker' },
    { name: 'Belkin',         slug: 'belkin' },
    { name: 'Spigen',         slug: 'spigen' },
    { name: 'UAG',            slug: 'uag' },
    { name: 'Baseus',         slug: 'baseus' },
    { name: 'Sony',           slug: 'sony' },
    { name: 'JBL',            slug: 'jbl' },
    { name: 'Bose',           slug: 'bose' },
    { name: 'Sennheiser',     slug: 'sennheiser' },
    { name: 'Audio-Technica', slug: 'audio-technica' },
    { name: 'RAVPower',       slug: 'ravpower' },
    { name: 'Nintendo',       slug: 'nintendo' },
    { name: 'Logitech',       slug: 'logitech' },
    { name: 'Intel',          slug: 'intel' },
    { name: 'AMD',            slug: 'amd' },
    { name: 'NVIDIA',         slug: 'nvidia' },
    { name: 'Corsair',        slug: 'corsair' },
    { name: 'Kingston',       slug: 'kingston' },
    { name: 'Philips Hue',    slug: 'philips-hue' },
    { name: 'Google Nest',    slug: 'google-nest' },
    { name: 'Amazon Echo',    slug: 'amazon-echo' },
    { name: 'TP-Link',        slug: 'tp-link' },   // déjà présent : garde ou vire le doublon
    { name: 'Netgear',        slug: 'netgear' },
    { name: 'Ubiquiti',       slug: 'ubiquiti' },
    { name: 'Linksys',        slug: 'linksys' },
    { name: 'Canon',          slug: 'canon' },
    { name: 'Epson',          slug: 'epson' },
    { name: 'Brother',        slug: 'brother' },
    { name: 'Xerox',          slug: 'xerox' },
    { name: 'Adobe',          slug: 'adobe' },
    { name: 'Autodesk',       slug: 'autodesk' },
    { name: 'JetBrains',      slug: 'jetbrains' },
    { name: 'Corel',          slug: 'corel' }
  ];

  
  const createdBrands: Record<string, any> = {};
  
  for (const brand of brands) {
    const created = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand
    });
    createdBrands[brand.slug] = created;
  }
  
  console.log(`✅ Created ${Object.keys(createdBrands).length} brands`);
  return createdBrands;
}

async function linkCategoriesAndBrands(
  categories: Record<string, any>,
  brands: Record<string, any>
) {
  console.log('🔗 Linking categories and brands...');
  
  /* ------------------------------------------------------------------ */
/* 🔗  PAIRS catégorie ↔︎ marque  — reprend exactement ton INSERT      */
/* ------------------------------------------------------------------ */
const categoryBrandLinks = [
  /* 1 – Smartphones & Tablettes ----------------------------------- */
  { categoryId: categories.smart.id,    brandId: brands.apple.id },
  { categoryId: categories.smart.id,    brandId: brands.samsung.id },
  { categoryId: categories.smart.id,    brandId: brands.xiaomi.id },
  { categoryId: categories.smart.id,    brandId: brands.huawei.id },
  { categoryId: categories.smart.id,    brandId: brands.oppo.id },
  { categoryId: categories.smart.id,    brandId: brands.vivo.id },
  { categoryId: categories.smart.id,    brandId: brands.oneplus.id },
  { categoryId: categories.smart.id,    brandId: brands.realme.id },
  { categoryId: categories.smart.id,    brandId: brands.tecno.id },
  { categoryId: categories.smart.id,    brandId: brands.infinix.id },

  /* 2 – Ordinateurs ----------------------------------------------- */
  { categoryId: categories.ordi.id,     brandId: brands.apple.id },
  { categoryId: categories.ordi.id,     brandId: brands.huawei.id },
  { categoryId: categories.ordi.id,     brandId: brands.dell.id },
  { categoryId: categories.ordi.id,     brandId: brands.hp.id },
  { categoryId: categories.ordi.id,     brandId: brands.lenovo.id },
  { categoryId: categories.ordi.id,     brandId: brands.asus.id },
  { categoryId: categories.ordi.id,     brandId: brands.acer.id },
  { categoryId: categories.ordi.id,     brandId: brands.msi.id },
  { categoryId: categories.ordi.id,     brandId: brands.microsoft.id },
  { categoryId: categories.ordi.id,     brandId: brands.razer.id },
  // ⚠️ brandId 59 n’existe pas dans ta liste → à créer ou à retirer.

  /* 3 – Accessoires mobiles --------------------------------------- */
  { categoryId: categories.mobile.id,   brandId: brands.anker.id },
  { categoryId: categories.mobile.id,   brandId: brands.belkin.id },
  { categoryId: categories.mobile.id,   brandId: brands.spigen.id },
  { categoryId: categories.mobile.id,   brandId: brands.uag.id },
  { categoryId: categories.mobile.id,   brandId: brands.baseus.id },

  /* 4 – Audio & Son ------------------------------------------------ */
  { categoryId: categories.audio.id,    brandId: brands.sony.id },
  { categoryId: categories.audio.id,    brandId: brands.jbl.id },
  { categoryId: categories.audio.id,    brandId: brands.bose.id },
  { categoryId: categories.audio.id,    brandId: brands.sennheiser.id },
  { categoryId: categories.audio.id,    brandId: brands['audio-technica'].id },

  /* 5 – Power & Énergie ------------------------------------------- */
  { categoryId: categories.power.id,    brandId: brands.samsung.id },
  { categoryId: categories.power.id,    brandId: brands.xiaomi.id },
  { categoryId: categories.power.id,    brandId: brands.anker.id },
  { categoryId: categories.power.id,    brandId: brands.baseus.id },
  { categoryId: categories.power.id,    brandId: brands.ravpower.id },

  /* 6 – Gaming & Consoles ----------------------------------------- */
  { categoryId: categories.gaming.id,   brandId: brands.microsoft.id }, // Xbox
  { categoryId: categories.gaming.id,   brandId: brands.razer.id },
  { categoryId: categories.gaming.id,   brandId: brands.sony.id },      // PlayStation
  { categoryId: categories.gaming.id,   brandId: brands.nintendo.id },
  { categoryId: categories.gaming.id,   brandId: brands.logitech.id },

  /* 7 – Composants PC --------------------------------------------- */
  { categoryId: categories.pc.id,       brandId: brands.intel.id },
  { categoryId: categories.pc.id,       brandId: brands.amd.id },
  { categoryId: categories.pc.id,       brandId: brands.nvidia.id },
  { categoryId: categories.pc.id,       brandId: brands.corsair.id },
  { categoryId: categories.pc.id,       brandId: brands.kingston.id },

  /* 8 – Maison connectée ----------------------------------------- */
  { categoryId: categories.home.id,     brandId: brands.xiaomi.id },
  { categoryId: categories.home.id,     brandId: brands['philips-hue'].id },
  { categoryId: categories.home.id,     brandId: brands['google-nest'].id },
  { categoryId: categories.home.id,     brandId: brands['amazon-echo'].id },
  { categoryId: categories.home.id,     brandId: brands['tp-link'].id },

  /* 9 – Réseau & Wi-Fi ------------------------------------------- */
  { categoryId: categories.wifi.id,     brandId: brands.asus.id },
  { categoryId: categories.wifi.id,     brandId: brands['tp-link'].id },
  { categoryId: categories.wifi.id,     brandId: brands.netgear.id },
  { categoryId: categories.wifi.id,     brandId: brands.ubiquiti.id },
  { categoryId: categories.wifi.id,     brandId: brands.linksys.id },

  /* 10 – Impression & Scanners ----------------------------------- */
  { categoryId: categories.print.id,    brandId: brands.hp.id },
  { categoryId: categories.print.id,    brandId: brands.canon.id },
  { categoryId: categories.print.id,    brandId: brands.epson.id },
  { categoryId: categories.print.id,    brandId: brands.brother.id },
  { categoryId: categories.print.id,    brandId: brands.xerox.id },

  /* 11 – Logiciels & Licences ------------------------------------ */
  { categoryId: categories.soft.id,     brandId: brands.microsoft.id },
  { categoryId: categories.soft.id,     brandId: brands.adobe.id },
  { categoryId: categories.soft.id,     brandId: brands.autodesk.id },
  { categoryId: categories.soft.id,     brandId: brands.jetbrains.id },
  { categoryId: categories.soft.id,     brandId: brands.corel.id }
];

  
  for (const link of categoryBrandLinks) {
    await prisma.categoryBrand.upsert({
      where: {
        categoryId_brandId: {
          categoryId: link.categoryId,
          brandId: link.brandId
        }
      },
      update: {},
      create: link
    });
  }
  
  console.log(`✅ Linked ${categoryBrandLinks.length} category-brand pairs`);
}

async function createProductSeries(
  categories: Record<string, any>,
  brands: Record<string, any>
) {
  console.log('📚 Creating product series...');
  
const seriesData = [
  /* -----  Apple  ----- */
  { name: 'Apple iPhone 13',       slug: 'apple-iphone-13',       categoryId: categories.smart.id, brandId: brands.apple.id },
  { name: 'Apple iPhone 14',       slug: 'apple-iphone-14',       categoryId: categories.smart.id, brandId: brands.apple.id },
  { name: 'Apple iPhone SE (2022)',slug: 'apple-iphone-se-2022',  categoryId: categories.smart.id, brandId: brands.apple.id },
  { name: 'Apple iPhone 15 Pro',   slug: 'apple-iphone-15-pro',   categoryId: categories.smart.id, brandId: brands.apple.id },

  /* -----  Samsung  ----- */
  { name: 'Samsung Galaxy S21 FE', slug: 'samsung-galaxy-s21-fe', categoryId: categories.smart.id, brandId: brands.samsung.id },
  { name: 'Samsung Galaxy S22',    slug: 'samsung-galaxy-s22',    categoryId: categories.smart.id, brandId: brands.samsung.id },
  { name: 'Samsung Galaxy A52',    slug: 'samsung-galaxy-a52',    categoryId: categories.smart.id, brandId: brands.samsung.id },

  /* -----  Xiaomi  ----- */
  { name: 'Xiaomi Redmi Note 11',  slug: 'xiaomi-redmi-note-11',  categoryId: categories.smart.id, brandId: brands.xiaomi.id },
  { name: 'Xiaomi Redmi 10',       slug: 'xiaomi-redmi-10',       categoryId: categories.smart.id, brandId: brands.xiaomi.id },
  { name: 'Poco X4 Pro',           slug: 'poco-x4-pro',           categoryId: categories.smart.id, brandId: brands.xiaomi.id },

  /* -----  Huawei  ----- */
  { name: 'Huawei P40',            slug: 'huawei-p40',            categoryId: categories.smart.id, brandId: brands.huawei.id },
  { name: 'Huawei P50',            slug: 'huawei-p50',            categoryId: categories.smart.id, brandId: brands.huawei.id },
  { name: 'Huawei Mate 40',        slug: 'huawei-mate-40',        categoryId: categories.smart.id, brandId: brands.huawei.id },

  /* -----  Oppo  ----- */
  { name: 'Oppo Reno7',            slug: 'oppo-reno7',            categoryId: categories.smart.id, brandId: brands.oppo.id },
  { name: 'Oppo Find X5',          slug: 'oppo-find-x5',          categoryId: categories.smart.id, brandId: brands.oppo.id },
  { name: 'Oppo A96',              slug: 'oppo-a96',              categoryId: categories.smart.id, brandId: brands.oppo.id },

  /* -----  Vivo  ----- */
  { name: 'Vivo V21',              slug: 'vivo-v21',              categoryId: categories.smart.id, brandId: brands.vivo.id },
  { name: 'Vivo V23',              slug: 'vivo-v23',              categoryId: categories.smart.id, brandId: brands.vivo.id },
  { name: 'Vivo Y33s',             slug: 'vivo-y33s',             categoryId: categories.smart.id, brandId: brands.vivo.id },

  /* -----  OnePlus  ----- */
  { name: 'OnePlus 9',             slug: 'oneplus-9',             categoryId: categories.smart.id, brandId: brands.oneplus.id },
  { name: 'OnePlus 10',            slug: 'oneplus-10',            categoryId: categories.smart.id, brandId: brands.oneplus.id },
  { name: 'OnePlus Nord 2',        slug: 'oneplus-nord-2',        categoryId: categories.smart.id, brandId: brands.oneplus.id },

  /* -----  Realme  ----- */
  { name: 'Realme 9',              slug: 'realme-9',              categoryId: categories.smart.id, brandId: brands.realme.id },
  { name: 'Realme C35',            slug: 'realme-c35',            categoryId: categories.smart.id, brandId: brands.realme.id },
  { name: 'Realme GT',             slug: 'realme-gt',             categoryId: categories.smart.id, brandId: brands.realme.id },

  /* -----  Tecno  ----- */
  { name: 'Tecno Spark 8',         slug: 'tecno-spark-8',         categoryId: categories.smart.id, brandId: brands.tecno.id },
  { name: 'Tecno Camon 19',        slug: 'tecno-camon-19',        categoryId: categories.smart.id, brandId: brands.tecno.id },
  { name: 'Tecno Phantom X',       slug: 'tecno-phantom-x',       categoryId: categories.smart.id, brandId: brands.tecno.id },

  /* -----  Infinix  ----- */
  { name: 'Infinix Note 12',       slug: 'infinix-note-12',       categoryId: categories.smart.id, brandId: brands.infinix.id },
  { name: 'Infinix Hot 12',        slug: 'infinix-hot-12',        categoryId: categories.smart.id, brandId: brands.infinix.id },
  { name: 'Infinix Zero 5G',       slug: 'infinix-zero-5g',       categoryId: categories.smart.id, brandId: brands.infinix.id }
];

  
  const createdSeries: Record<string, any> = {};
  
  for (const series of seriesData) {
    const created = await prisma.productSeries.upsert({
      where: { slug: series.slug },
      update: {},
      create: series
    });
    createdSeries[series.slug] = created;
  }
  
  console.log(`✅ Created ${Object.keys(createdSeries).length} product series`);
  return createdSeries;
}

/* -------------------------------------------------------------------------- */
/*                             CREATE  PRODUCTS                               */
/* -------------------------------------------------------------------------- */

async function createProducts(
  categories: Record<string, any>,
  brands: Record<string, any>,
  series: Record<string, any>
) {
  console.log('📱 Creating products...');

  /** 
   * 1.  Tableau “déclaratif” : tu recopie ici TOUTES tes lignes SQL.
   * 2.  Chaque objet = 1 produit.  
   * 3.  On regarde slug de catégorie / marque / série pour récupérer l’id.
   */
  const productsData: Array<{
    sku: string;
    name: string;
    slug: string;
    categorySlug: string;   // ex: 'smartphones-tablettes'
    brandSlug: string;      // ex: 'apple'
    seriesSlug?: string;    // ex: 'iphone' (ou undefined)
    priceXaf: number;
    stockQty: number;
    weightKg: number;
    dimensionsMm: { l: number; w: number; h: number };
    specs: object;
    description: string;
    tier?: 'entry' | 'standard' | 'premium' | 'pro';   // optionnel – par défaut "standard"
    promoPct?: number;        // optionnel
    hasVariants?: boolean;    // optionnel
  }> = [
    /* ---------------------- ⬇️  COPIE-COLLE ICI  ⬇️ ----------------------- */
    {
      sku: 'SMART-0001',
      name: 'Apple iPhone 13 – 128Go',
      slug: 'apple-iphone-13-128gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'apple',
      seriesSlug: 'iphone',
      priceXaf: 450000,
      stockQty: 30,
      weightKg: 0.174,
      dimensionsMm: { l: 146.7, w: 71.5, h: 7.65 },
      specs: { ram: '4GB', storage: '128GB' },
      description: `Transforme ton quotidien avec l'iPhone 13 – le smartphone conçu pour repousser tes limites.
     - **Un design iconique**, alliage de verre et d'aluminium, subtilement réinventé pour un toucher premium.
     - **Super Retina XDR 6,1″**, pour des images d'une clarté époustouflante, des noirs parfaits et une luminosité qui domine le soleil.
     - **Double capteur photo 12 Mpx** : ultra-grande ouverture, mode Nuit automatique, Deep Fusion et HDR intelligent boostent chaque cliché.
     - **Mode Cinématique** : filme comme un pro, change de point de focus en un clin d'œil et sublime tes souvenirs.
     - **Puce A15 Bionic** : une prouesse de puissance et d'efficacité énergétique, idéale pour le gaming en réalité augmentée et le multitâche intensif.
     - **Autonomie exceptionnelle** : jusqu'à 19 heures de lecture vidéo et recharge rapide MagSafe pour te maintenir au top sans compromis.
     - **5G ultra-rapide** : reste toujours connecté, partage en un éclair, visio-conférences fluides et streaming sans latence.
     - **Sécurité renforcée** : Face ID, chiffrement intégré et iOS, le système mobile le plus sécurisé au monde.
     - **Résistance IP68** : affronte éclaboussures, poussière et immersion sans peur.

     Fais l'expérience d'une technologie qui bouscule les standards : passe à l'iPhone 13 et adopte l'avenir dès aujourd'hui.`,
      promoPct: 0,
      tier: ProductTierEnum.standard
    },
    {
      sku: 'SMART-0002',
      name: 'Apple iPhone 15 Pro – 128Go',
      slug: 'apple-iphone-15-pro-128gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'apple',
      seriesSlug: 'iphone',
      priceXaf: 850000,
      stockQty: 20,
      weightKg: 0.187,
      dimensionsMm: { l: 147.6, w: 71.6, h: 7.8 },
      specs: { ram: '8GB', storage: '128GB' },
      description: `
    🔩 Design en titane grade 5 : léger comme une feuille mais solide comme la dalle d'un ndoss 🤖.
📺 Écran Super Retina XDR OLED 6,1″, 120 Hz ProMotion : c'est doux à l'œil comme un film Netflix en full HD 😍.
🚀 Puce A17 Pro avec CPU et GPU 6 cœurs + Neural Engine 16 cœurs : tu peux même monter des clips 4K easy, ça chauffe pas 🔥.
⚡ 8 Go RAM LPDDR5 + 128 Go NVMe : réactivité niveau turbo 🏎️.
📸 Photo pro avec capteurs 48 MP + 12 MP + 12 MP (téléobjectif 3× + LiDAR) : la night photo c'est comme midi 😎.
🔋 Batterie 3274 mAh, recharge 25 W USB-C, MagSafe & Qi 2 : le phone boit le jus vite fait 🧃.
🌐 Connectivité : 5G, Wi-Fi 6E, USB-C 10 Gb/s = fast life 💨.
🔘 Action Button customisable, Face ID, et chiffrage béton iOS 🛡️.
💧 IP68 = pas peur de la pluie du 237 🌧️.
    `,
      promoPct: 0,
      tier: ProductTierEnum.pro
    },
    {
      sku: 'SMART-0003',
      name: 'Apple iPhone 14 – 128Go',
      slug: 'apple-iphone-14-128gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'apple',
      seriesSlug: 'iphone',
      priceXaf: 550000,
      stockQty: 25,
      weightKg: 0.172,
      dimensionsMm: { l: 146.7, w: 71.5, h: 7.8 },
      specs: { ram: '6GB', storage: '128GB' },
      description: `
    🚀 Puce A15 Bionic : ça fly même en plein gaming ou multi-app 🙌.
📸 Double cam 12 MP boostée par Photonic Engine : chaque photo c'est comme un shooting à Bonanjo 📷.
🆘 Crash Detection + SOS Satellite : t'es jamais seul, même dans la cambrousse 💡.
💡 Écran Super Retina XDR 6,1″ : visible même sous le soleil de Douala 🌞.
🔋 Autonomie béton (20h vidéo) : ton phone dort après toi 😴.
🔒 IP68 + verre-aluminium : solide et stylé comme un benskineur en costard 👔.
    `,
      promoPct: 0,
      tier: ProductTierEnum.premium
    },
    {
      sku: 'SMART-0004',
      name: 'Apple iPhone SE (2022) – 64Go',
      slug: 'apple-iphone-se-2022-64gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'apple',
      seriesSlug: 'iphone',
      priceXaf: 300000,
      stockQty: 40,
      weightKg: 0.148,
      dimensionsMm: { l: 138.4, w: 67.3, h: 7.3 },
      specs: { ram: '4GB', storage: '64GB' },
      description: `
    🔥 Puce A15 Bionic dans un petit format : c'est un phone petit mais costaud 💪.
📶 5G intégrée : upload et Netflix comme si t'étais sur fibre 🎞️.
🧤 Touch ID + design classique = sécurité simple et efficace 🔐.
📷 Smart HDR 4, Deep Fusion, Photographic Styles : tes photos sont clean même la nuit 🌙.
🔋 Autonomie améliorée : il t'abandonne pas au quartier ✊.
🌊 IP67 : t'inquiète même si ça mouille 💧.
    `,
      promoPct: 0,
      tier: ProductTierEnum.standard
    },
    {
      sku: 'SMART-0005',
      name: 'Samsung Galaxy S21 FE – 128Go',
      slug: 'samsung-galaxy-s21-fe-128gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'samsung',
      seriesSlug: 'Galaxy S',
      priceXaf: 280000,
      stockQty: 50,
      weightKg: 0.172,
      dimensionsMm: { l: 155.1, w: 75.1, h: 7.9 },
      specs: { ram: '6GB', storage: '128GB' },
      description: `
    🔥 Le S21 FE c'est le blend parfait entre perf' de ouf et budget tactique.
📷 Triple capteur 12 MP + 12 MP + 8 MP : que ce soit ta remme au tchap, un match ou le nyanga du jour, chaque image est clean 📸.
🖥️ Écran AMOLED 6,4″ 120 Hz fluide comme l'eau glacée 🧊, idéal pour le scroll et les stories.
💦 Résistant à l'eau (IP68), et bien sûr, connecté à la 5G pour upload et Netflix en éclair ⚡.
🛠️ One UI = personnalisation sans stress, fluide et carré 💡.
🎯 Parfait pour les mbom qui veulent du lourd sans tuer leur budget !
    `,
      promoPct: 7,
      tier: ProductTierEnum.premium
    },
    {
      sku: 'SMART-0006',
      name: 'Samsung Galaxy S22 – 128Go',
      slug: 'samsung-galaxy-s22-128gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'samsung',
      seriesSlug: 'Galaxy S',
      priceXaf: 350000,
      stockQty: 40,
      weightKg: 0.167,
      dimensionsMm: { l: 146, w: 70.6, h: 7.6 },
      specs: { ram: '8GB', storage: '128GB' },
      description: `
    📱 Le S22 c'est un mbom clean, stylé et super smart.
🖼️ Écran AMOLED 120 Hz adaptatif : clair même sous le soleil du marché 😎.
📷 Caméra 50 MP + ultra grand-angle + téléobjectif 3× : chaque angle de shoot est masterisé comme un clip de Tenor 🎬.
🎮 Paré pour le gaming, multitâche, ou tout ce que tu lui balances 💣.
🔋 Charge rapide, IA pour la batterie, et résistance niveau boss : le S22 te suit sans faiblir 💪🏾.
🌐 Et bien sûr, 5G ready : ça download plus vite que la musique au bar 🍻.
    `,
      promoPct: 0,
      tier: ProductTierEnum.premium
    },
    {
      sku: 'SMART-0007',
      name: 'Samsung Galaxy A52 – 128Go',
      slug: 'samsung-galaxy-a52-128gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'samsung',
      seriesSlug: 'Galaxy A',
      priceXaf: 150000,
      stockQty: 60,
      weightKg: 0.189,
      dimensionsMm: { l: 159.9, w: 75.1, h: 8.4 },
      specs: { ram: '4GB', storage: '128GB' },
      description: `
    💰 Niveau prix, c'est sweet. Niveau perf, c'est solide.
📷 Capteur 64 MP avec stabilisation optique (OIS) : même si ta main tremble comme un tchapé surpris, la photo reste nette 📸.
🖥️ Écran Super AMOLED 6,5″ 90 Hz = fluidité deluxe pour scroll, jeux et vidéo 🎥.
💧 Certification IP67 : résiste à la poussière et aux flaques des trottoirs du mboa.
🔋 Batterie 4 500 mAh avec bonne autonomie pour t'accompagner toute la journée.
🎯 Le choix malin pour les mbom qui veulent un bon phone sans flamber 🔥.
    `,
      promoPct: 7,
      tier: ProductTierEnum.standard
    },
    {
      sku: 'SMART-0008',
      name: 'Xiaomi Redmi Note 11 – 64Go',
      slug: 'xiaomi-redmi-note-11-64gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'xiaomi',
      seriesSlug: 'redmi',
      priceXaf: 120000,
      stockQty: 80,
      weightKg: 0.179,
      dimensionsMm: { l: 159.9, w: 73.9, h: 8.1 },
      specs: { ram: '4GB', storage: '64GB' },
      description: `
    🎯 Le Redmi Note 11 c'est le phone du peuple avec le style d'un haut de gamme.
🖥️ Écran AMOLED 6,43″ FHD+ : visuel doux, contrastes profonds, parfait pour série, snap, ou TikTok sans gêne 👀.
📷 Caméra 50 MP ultra clean, combinée à un triple module : tes clichés vont buzz comme si t'étais un influenceur du quartier 📸💥.
🔋 Batterie 5000 mAh, charge rapide 33 W : il se charge pendant que tu te brosses les dents et t'accompagne jusqu'au dodo 😴.
📱 MIUI 13 : fluide, intuitif, avec options de sécurité renforcées pour protéger tes vibes 💡🔐.
💸 C'est le choix du mbom éveillé qui veut gérer fort sans casser son porte-monnaie.
    `,
      promoPct: 8,
      tier: ProductTierEnum.standard
    },
    {
      sku: 'SMART-0009',
      name: 'Xiaomi Redmi 10 – 64Go',
      slug: 'xiaomi-redmi-10-64gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'xiaomi',
      seriesSlug: 'redmi',
      priceXaf: 90000,
      stockQty: 70,
      weightKg: 0.181,
      dimensionsMm: { l: 162.3, w: 75.1, h: 8.9 },
      specs: { ram: '4GB', storage: '64GB' },
      description: `
    🎯 Le Redmi Note 11 c'est le phone du peuple avec le style d'un haut de gamme.
🖥️ Écran AMOLED 6,43″ FHD+ : visuel doux, contrastes profonds, parfait pour série, snap, ou TikTok sans gêne 👀.
📷 Caméra 50 MP ultra clean, combinée à un triple module : tes clichés vont buzz comme si t'étais un influenceur du quartier 📸💥.
🔋 Batterie 5000 mAh, charge rapide 33 W : il se charge pendant que tu te brosses les dents et t'accompagne jusqu'au dodo 😴.
📱 MIUI 13 : fluide, intuitif, avec options de sécurité renforcées pour protéger tes vibes 💡🔐.
💸 C'est le choix du mbom éveillé qui veut gérer fort sans casser son porte-monnaie.
    `,
      promoPct: 6,
      tier: ProductTierEnum.entry
    },
    {
      sku: 'SMART-0010',
      name: 'Poco X4 Pro – 128Go',
      slug: 'poco-x4-pro-128gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'xiaomi',
      seriesSlug: 'poco',
      priceXaf: 180000,
      stockQty: 45,
      weightKg: 0.205,
      dimensionsMm: { l: 164.2, w: 76.1, h: 8.1 },
      specs: { ram: '6GB', storage: '128GB' },
      description: `
   ⚡ Là c'est du sérieux. Le Poco X4 Pro, c'est pour les mbom qui veulent du gaming, streaming et des vibes tech avancées.
🖥️ Écran AMOLED 6,67″ 120 Hz : hyper fluide, hyper lumineux, zéro lag 🎮🎥.
🔋 Charge turbo 67 W : de 0 à 100% en 41 minutes chrono ⏱️.
📸 Caméra 108 MP, avec modules pour ultra-grand-angle et macro : t'es un photographe sans même le savoir 📸✨.
🎮 Snapdragon 695 5G + 6 Go RAM = multitâche, gaming, app, tout est géré comme un chef 🧠🔥.
💎 Design fin, look premium – un phone qui impose le respect dès qu'il sort du sac 😎
    `,
      promoPct: 6,
      tier: ProductTierEnum.standard
    },
    {
      sku: 'SMART-0011',
      name: 'Huawei P40 – 128Go',
      slug: 'huawei-p40-128gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'huawei',
      seriesSlug: 'p',
      priceXaf: 300000,
      stockQty: 20,
      weightKg: 0.175,
      dimensionsMm: { l: 148.9, w: 71.1, h: 8.5 },
      specs: { ram: '8GB', storage: '128GB' },
      description: `
    📸 Ce phone est un vrai caméra phone de compèt grâce au taf avec Leica.
💡 Triple capteur 50 MP + 16 MP + 8 MP, avec zoom optique 3× : les photos sont propres même en mode night 🌙📷.
🖥️ Écran OLED 6,1″ : contraste, couleurs, tout est sharp 🧊.
🚀 Puce Kirin 990 5G : rapide et fluide comme une voiture F1 🏎️.
📱 HarmonyOS fluide, sécurisé, et sans bloatware – t'as le contrôle total.
💦 IP68 : le phone peut plonger sans te dire au revoir 👋💧.
👉 Si tu veux un phone classe, photo pro et unique, le P40 est ton gars sûr.
    `,
      promoPct: 0,
      tier: ProductTierEnum.premium
    },
    {
      sku: 'SMART-0012',
      name: 'Huawei P50 – 256Go',
      slug: 'huawei-p50-256gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'huawei',
      seriesSlug: 'p',
      priceXaf: 350000,
      stockQty: 15,
      weightKg: 0.181,
      dimensionsMm: { l: 156.5, w: 73.8, h: 7.9 },
      specs: { ram: '8GB', storage: '256GB' },
      description: `
    🎥 XD Fusion HDR Engine : les vidéos et photos sortent claires même si tu shoot dans une cave 🕶️.
📸 Double cam avec Snap 888, précision folle et rendu net – pro-level content maker 🎬📷.
🖥️ Écran OLED 6,5″ 120 Hz : fluide, immersif, idéal pour gaming et binging 🎮🍿.
🔋 Autonomie bien dosée, charge rapide 66 W : tu branches, tu respires, c'est déjà chargé ⚡.
💾 256 Go de stockage, 8 Go de RAM : il gère tout ce que tu lui balances 💼.
💎 Parfait pour les reps qui veulent un phone élite, classe et technique.
    `,
      promoPct: 0,
      tier: ProductTierEnum.premium
    },
    {
      sku: 'SMART-0013',
      name: 'Huawei Mate 40 – 128Go',
      slug: 'huawei-mate-40-128gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'huawei',
      seriesSlug: 'Mate',
      priceXaf: 360000,
      stockQty: 10,
      weightKg: 0.188,
      dimensionsMm: { l: 158.6, w: 72.5, h: 8.8 },
      specs: { ram: '8GB', storage: '128GB' },
      description: `
    🎶 Audio Dolby Atmos : t'écoutes les sons comme si t'étais en studio 🔊🎧.
📸 Quad Cam avec zoom hybride 10× : tu vois même les détails au loin comme si t'étais dans un hélico 🚁.
🚀 Puce Kirin 9000 = performance de malade, tu peux tout faire en même temps 🧠🔥.
🔋 Charge sans-fil rapide 50 W, IP68, et design premium = c'est le phone qui impose dans toutes les réunions 🧳.
📱 Android AOSP : clean, rapide et sans distractions inutiles.
🧠 Si tu veux un phone classe, puissant, et pro, le Mate 40 est ton allier fidèle.
    `,
      promoPct: 0,
      tier: ProductTierEnum.premium
    },
    {
      sku: 'SMART-0014',
      name: 'Oppo Reno7 – 128Go',
      slug: 'oppo-reno7-128gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'oppo',
      seriesSlug: 'Reno',
      priceXaf: 200000,
      stockQty: 30,
      weightKg: 0.182,
      dimensionsMm: { l: 160.1, w: 73.2, h: 7.5 },
      specs: { ram: '8GB', storage: '128GB' },
      description: `
    📸 Tu veux que ton selfie choque ? Le Reno7 est un tueur de portrait !
💡 Caméra 32 MP frontale avec Portrait Expert 2.0 = effet bokeh ciné même au quartier 🎥💋.
🖥️ Écran AMOLED 6,4″ 90 Hz, doux et fluide pour scroll comme une star Insta ✨📱.
🔋 Charge rapide 65 W : de 0 à 100 % pendant que tu prends ton café ☕⚡.
💎 Design compact, 7,5 mm d'épaisseur, look premium qui shine dans n'importe quelle ambiance 🌟.
🎯 Pour les mbom et resses qui aiment le nyanga et les bonnes specs.
    `,
      promoPct: 0,
      tier: ProductTierEnum.standard
    },
    {
      sku: 'SMART-0015',
      name: 'Oppo Find X5 – 256Go',
      slug: 'oppo-find-x5-256gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'oppo',
      seriesSlug: undefined,
      priceXaf: 420000,
      stockQty: 18,
      weightKg: 0.198,
      dimensionsMm: { l: 160.3, w: 73.9, h: 8.3 },
      specs: { ram: '8GB', storage: '256GB' },
      description: `
    📷 MariSilicon X ISP : photos de nuit sans bruit, nettes comme la vérité d'un ndoss 😎🌌.
📸 Triple capteur 50 MP, rendu pro direct, même pour les vidéos en basse lumière.
🖥️ Écran LTPO AMOLED 120 Hz : adaptable, fluide, élégant 🔁💠.
🔊 Audio Hi-Res, parfait pour les fans de son lourd 🎧.
🔋 Charge sans-fil AirVOOC 30 W : zéro stress, zéro fil 🌀.
💾 256 Go + 8 Go RAM = productivité niveau Big Boss 🧠💼.
🔥 Le Find X5, c'est l'Oppo haut de gamme qui donne les vibes iPhone, à un tarif plus doux.
    `,
      promoPct: 0,
      tier: ProductTierEnum.premium
    },
    {
      sku: 'SMART-0016',
      name: 'Oppo A96 – 128Go',
      slug: 'oppo-a96-128gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'oppo',
      seriesSlug: undefined,
      priceXaf: 170000,
      stockQty: 35,
      weightKg: 0.195,
      dimensionsMm: { l: 163.8, w: 75.5, h: 7.7 },
      specs: { ram: '8GB', storage: '128GB' },
      description: `
    🔋 Batterie 5000 mAh : le mbom ne charge plus à midi, il tient jusqu'au dodo 💤🔋.
🚀 Processeur Snapdragon 680 : multitâche propre, pas de lag même avec WhatsApp, Insta, TikTok ouverts 🎭.
📸 Cam 50 MP, avec bokeh stylé et couleurs éclatantes.
💎 Design texturé anti-traces, avec finition haut de gamme, pour rester frais même en sueur 💦.
🎯 C'est le phone carré pour ceux qui veulent longévité + classe + performance à petit prix.
    `,
      promoPct: 0,
      tier: ProductTierEnum.entry
    },
    {
      sku: 'SMART-0017',
      name: 'Vivo V21 – 128Go',
      slug: 'vivo-v21-128gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'vivo',
      seriesSlug: undefined,
      priceXaf: 180000,
      stockQty: 25,
      weightKg: 0.176,
      dimensionsMm: { l: 160.4, w: 74.2, h: 7.3 },
      specs: { ram: '8GB', storage: '128GB' },
      description: `
    🤳 Selfie cam OIS 44 MP : le seul phone qui stabilise tes selfies comme si tu filmais avec un trépied 🎥.
🌙 Photos claires même en pleine nuit, avec lumière douce et rendu naturel.
🖥️ Écran AMOLED 90 Hz super slim et hyper fluide : parfait pour stories, gaming ou YouTube chill 😍.
⚡ Charge rapide 33 W : t'es back en action pendant que tu prends ton petit dej 🥐☕.
💎 Design slim 7,3 mm, ultra-léger mais solide.
💼 Pour les influenceurs, vloggers ou resses toujours fresh 📸👩🏾‍🎤.
    `,
      promoPct: 0,
      tier: ProductTierEnum.standard
    },
    {
      sku: 'SMART-0018',
      name: 'Vivo V23 – 128Go',
      slug: 'vivo-v23-128gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'vivo',
      seriesSlug: undefined,
      priceXaf: 220000,
      stockQty: 20,
      weightKg: 0.187,
      dimensionsMm: { l: 158.7, w: 73.9, h: 7.4 },
      specs: { ram: '8GB', storage: '128GB' },
      description: `
    🎨 Design caméléon : change de couleur avec la lumière – nyanga garanti ! 🌞🔁🌈
🤳 Double selfie cam 50 MP + 8 MP : effet pro même sans filtre, vidéo stable même en marchant 📷🎯.
🖥️ AMOLED 6,44″ 90 Hz : fluide, vif, et doux à l'œil.
🚀 5G ready, 8 Go RAM et perf solide pour tout usage multitâche 🔥.
💼 Parfait pour les créateurs de contenu, les resses ultra stylées et les mbom toujours devant la cam 📹💃🏽.
    `,
      promoPct: 0,
      tier: ProductTierEnum.standard
    },
    {
      sku: 'SMART-0019',
      name: 'Vivo Y33s – 128Go',
      slug: 'vivo-y33s-128gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'vivo',
      seriesSlug: undefined,
      priceXaf: 140000,
      stockQty: 30,
      weightKg: 0.186,
      dimensionsMm: { l: 164.4, w: 76.3, h: 8 },
      specs: { ram: '4GB', storage: '128GB' },
      description: `
    🔋 Batterie 5000 mAh : tu oublies même où est ton chargeur 😅🔌.
📷 Triple cam 50 MP + 2 + 2 MP : net, clair, et détaillé à souhait.
🤳 Caméra selfie 16 MP, idéale pour les visios et snaps lumineux.
⚙️ Fluide pour les apps quotidiennes, rapide sur les réseaux, parfait pour les daily hustlers 🧠📱.
🎯 Rapport qualité/prix imbattable pour un phone complet, fiable et solide.
    `,
      promoPct: 0,
      tier: ProductTierEnum.entry
    },
    {
      sku: 'SMART-0020',
      name: 'OnePlus 9 – 128Go',
      slug: 'oneplus-9-128gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'oneplus',
      seriesSlug: undefined,
      priceXaf: 380000,
      stockQty: 15,
      weightKg: 0.192,
      dimensionsMm: { l: 160, w: 74.2, h: 8.7 },
      specs: { ram: '8GB', storage: '128GB' },
      description: `
    📷 T'as dit pro camera ? Ce mbom a été co-développé avec Hasselblad 😮📸.
🖥️ Écran Fluid AMOLED 120 Hz : vision nette, fluidité comme un freestyle bien calé 🎙️.
⚡ Charge Warp 65 W : zéro panne, zéro galère.
💾 8 Go de RAM, Snapdragon 888, ça gère tout, même Apex ou montage vidéos 💪🏾🎮.
💼 OxygenOS = interface fluide, sans bug, sans tracas.
    `,
      promoPct: 0,
      tier: ProductTierEnum.premium
    },
    {
      sku: 'SMART-0021',
      name: 'OnePlus 10 – 128Go',
      slug: 'oneplus-10-128gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'oneplus',
      seriesSlug: undefined,
      priceXaf: 450000,
      stockQty: 12,
      weightKg: 0.197,
      dimensionsMm: { l: 163, w: 74.1, h: 8.6 },
      specs: { ram: '8GB', storage: '128GB' },
      description: `
    📱 Un flagship qui parle fort : Snapdragon 8 Gen 1, c'est de la puissance brute.
🖥️ Écran LTPO AMOLED 120 Hz adaptatif = un plaisir pour les yeux 🎨.
📸 Caméra Hasselblad 48 + 50 MP : rendu digne d'un vidéaste 📹.
⚡ Charge 80 W : 100 % en 32 minutes, pendant que tu bois ton café ☕.
💎 Design boss, perfs solides, multitâche sans forcer 🧠.
    `,
      promoPct: 0,
      tier: ProductTierEnum.premium
    },
    {
      sku: 'SMART-0022',
      name: 'OnePlus Nord 2 – 128Go',
      slug: 'oneplus-nord-2-128gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'oneplus',
      seriesSlug: undefined,
      priceXaf: 200000,
      stockQty: 40,
      weightKg: 0.189,
      dimensionsMm: { l: 159.1, w: 73.2, h: 7.7 },
      specs: { ram: '8GB', storage: '128GB' },
      description: `
    🔥 Le Nord 2 c'est le milieu de gamme avec des nerfs de haut de gamme.
🧠 Puce Dimensity 1200-AI, fluide même en mode hard multitâche.
📸 Capteur 50 MP Sony IMX766, ça sort les clichés de gala 📷.
⚡ Charge 65 W, OxygenOS 12 = autonomie et rapidité 💨.
    `,
      promoPct: 0,
      tier: ProductTierEnum.standard
    },
    {
      sku: 'SMART-0023',
      name: 'Realme 9 – 128Go',
      slug: 'realme-9-128gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'realme',
      seriesSlug: undefined,
      priceXaf: 120000,
      stockQty: 35,
      weightKg: 0.178,
      dimensionsMm: { l: 160.2, w: 73.3, h: 8.5 },
      specs: { ram: '6GB', storage: '128GB' },
      description: `
    📷 Caméra 108 MP pour des images sharp comme la vérité 🧼📸.
🖥️ Écran AMOLED 6,4″ 90 Hz : couleurs vives, fluidité garantie.
🔋 Batterie 5 000 mAh, charge Dart 33 W – énergie sans fin 🔋⚡.
💎 Design néon fresh, style futuriste pour les jeunes wild 😎.
    `,
      promoPct: 0,
      tier: ProductTierEnum.standard
    },
    {
      sku: 'SMART-0024',
      name: 'Realme C35 – 64Go',
      slug: 'realme-c35-64gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'realme',
      seriesSlug: undefined,
      priceXaf: 90000,
      stockQty: 50,
      weightKg: 0.187,
      dimensionsMm: { l: 164.5, w: 75.6, h: 8.1 },
      specs: { ram: '4GB', storage: '64GB' },
      description: `
    🔋 Batterie 5 000 mAh pour tenir 2 jours easy.
📷 Triple capteur 50 MP, des clichés propres sans filtre.
🖥️ Écran 6,6″ FHD+, visuel large et lumineux.
💰 Petit prix, gros rendement : le mbom futé va jump dessus.
    `,
      promoPct: 0,
      tier: ProductTierEnum.entry
    },
    {
      sku: 'SMART-0025',
      name: 'Realme GT – 128Go',
      slug: 'realme-gt-128gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'realme',
      seriesSlug: undefined,
      priceXaf: 250000,
      stockQty: 20,
      weightKg: 0.186,
      dimensionsMm: { l: 158.5, w: 73.3, h: 8.4 },
      specs: { ram: '8GB', storage: '128GB' },
      description: `
    🎮 Un vrai phone gaming avec Snapdragon 888 dans le moteur.
🖥️ AMOLED 120 Hz = zéro lag pour les pros du scroll ou du fight.
⚡ Charge 65 W : de 0 à 100 % en 33 min.
💥 Design compact, rapide et stylé.
    `,
      promoPct: 4,
      tier: ProductTierEnum.standard
    },
    {
      sku: 'SMART-0026',
      name: 'Tecno Spark 8 – 64Go',
      slug: 'tecno-spark-8-64gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'tecno',
      seriesSlug: undefined,
      priceXaf: 80000,
      stockQty: 60,
      weightKg: 0.186,
      dimensionsMm: { l: 169.6, w: 76.1, h: 8.2 },
      specs: { ram: '4GB', storage: '64GB' },
      description: `
    🖥️ Écran 90 Hz fluide, visuel propre pour un petit budget.
🔋 Batterie 5 000 mAh, longévité béton 💪🏾.
📸 Quad cam 16 MP avec mode portrait solide.
🎮 MIUI for Tecno : expérience smooth.


    `,
      promoPct: 0,
      tier: ProductTierEnum.entry
    },
    {
      sku: 'SMART-0027',
      name: 'Tecno Camon 19 – 128Go',
      slug: 'tecno-camon-19-128gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'tecno',
      seriesSlug: undefined,
      priceXaf: 110000,
      stockQty: 45,
      weightKg: 0.183,
      dimensionsMm: { l: 164.5, w: 75.6, h: 8.1 },
      specs: { ram: '6GB', storage: '128GB' },
      description: `
    📸 Zoom 50 MP puissant, mode Super Moon 🌕.
🖥️ Écran FHD+ 6,8″, large comme ton ambition.
⚡ Charge rapide 33 W, design léger 181 g : nyanga garanti 💃.
    `,
      promoPct: 0,
      tier: ProductTierEnum.standard
    },
    {
      sku: 'SMART-0028',
      name: 'Tecno Phantom X – 256Go',
      slug: 'tecno-phantom-x-256gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'tecno',
      seriesSlug: undefined,
      priceXaf: 220000,
      stockQty: 10,
      weightKg: 0.200,
      dimensionsMm: { l: 165.5, w: 75.3, h: 8.9 },
      specs: { ram: '8GB', storage: '256GB' },
      description: `
    📷 Triple cam IDD avec Sony IMX766 + OIS + zoom 5× : rendu cinéma 🎬.
🖥️ Écran AMOLED incurvé 6,7″, visuel premium.
🔋 Batterie longue durée, look de boss.
⚡ Un vrai flagship à prix saucé pour le mboa 🇨🇲.


    `,
      promoPct: 0,
      tier: ProductTierEnum.premium
    },
    {
      sku: 'SMART-0029',
      name: 'Infinix Note 12 – 64Go',
      slug: 'infinix-note-12-64gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'infinix',
      seriesSlug: undefined,
      priceXaf: 100000,
      stockQty: 55,
      weightKg: 0.185,
      dimensionsMm: { l: 164.2, w: 75.3, h: 8 },
      specs: { ram: '4GB', storage: '64GB' },
      description: `
    🖥️ Écran AMOLED 6,7″ : lumineux et clean.
📷 Cam triple 50 MP : net même en mode spontané 📸.
⚡ Charge rapide 33 W, design fin 6,9 mm 🧠.
💡 Reconnaissance faciale – entre dans ton phone comme un VIP.
    `,
      promoPct: 0,
      tier: ProductTierEnum.standard
    },
    {
      sku: 'SMART-0030',
      name: 'Infinix Hot 12 – 64Go',
      slug: 'infinix-hot-12-64gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'infinix',
      seriesSlug: undefined,
      priceXaf: 85000,
      stockQty: 65,
      weightKg: 0.186,
      dimensionsMm: { l: 165.9, w: 76.9, h: 8.8 },
      specs: { ram: '4GB', storage: '64GB' },
      description: `
    🧠 Puce MediaTek G88 : fluide, rapide, sans blocage.
🖥️ Écran 6,82″ 90 Hz – maxi screen pour mini prix.
📷 Triple caméra 50 MP, mode gaming inclus 🎮.
🔋 Batterie 5 000 mAh – il te suit sans baisser la tête.
    `,
      promoPct: 0,
      tier: ProductTierEnum.entry
    },
    {
      sku: 'SMART-0031',
      name: 'Infinix Zero 5G – 128Go',
      slug: 'infinix-zero-5g-128gb',
      categorySlug: 'smartphones-tablettes',
      brandSlug: 'infinix',
      seriesSlug: undefined,
      priceXaf: 170000,
      stockQty: 20,
      weightKg: 0.198,
      dimensionsMm: { l: 168.1, w: 76.9, h: 8.6 },
      specs: { ram: '8GB', storage: '128GB' },
      description: `
    📶 Puce Dimensity 900 avec 5G : tu files comme Mbappé 🏃‍♂️💨.
🖥️ Écran AMOLED 6,78″, visuel premium 💎.
🔊 Double stéréo, OIS, charge rapide 33 W – all inclusive 🔥.
💸 Un flagship killer sauce quartier 👑.


    `,
      promoPct: 0,
      tier: ProductTierEnum.standard
    },
    {
      sku: 'ORDIN-0001',
      name: 'Apple MacBook Air M1 (2020)',
      slug: 'apple-macbook-air-m1-2020',
      categorySlug: 'ordinateurs',
      brandSlug: 'apple',
      seriesSlug: undefined,
      priceXaf: 600000,
      stockQty: 20,
      weightKg: 1.290,
      dimensionsMm: { l: 304, w: 212, h: 16 },
      specs: { ram: '8GB', storage: '256GB' },
      description: `
### Apple MacBook Air M1 (2020)

**Avantages**
- Silencieux : châssis fanless, zéro bruit en amphi ou au maquis.
- Autonomie exceptionnelle : jusqu'à 18 h de lecture vidéo.
- Performances solides : puce M1 8 cœurs CPU & 7 GPU.

**Inconvénients**
- Connectique limitée : seulement 2 ports Thunderbolt/USB-C.
- Support externe restreint : un seul écran 6K max.

**Recommandé pour**
Prise de notes, navigation web, traitement de texte, programmation légère.

**À éviter pour**
Jeux gourmands et montage vidéo intensif.
`,
      promoPct: 0,
      tier: ProductTierEnum.standard
    },
    {
      sku: 'ORDIN-0002',
      name: 'Dell XPS 13 (9345)',
      slug: 'dell-xps-13-9345',
      categorySlug: 'ordinateurs',
      brandSlug: 'dell',
      seriesSlug: undefined,
      priceXaf: 650000,
      stockQty: 15,
      weightKg: 1.200,
      dimensionsMm: { l: 304, w: 197, h: 14 },
      specs: { ram: '16GB', storage: '512GB' },
      description: `
### Dell XPS 13 (9345)

**Avantages**
- Design compact & premium.
- Écran InfinityEdge 13,4″ très lumineux.
- Autonomie record : > 20 h (Snapdragon X Elite).

**Inconvénients**
- Connectique limitée : 2 ports USB-C uniquement.
- Gamut DCI-P3 incomplet pour le graphisme pro.

**Recommandé pour**
Étudiants nomades : bureautique, navigation web, visioconférences.

**À éviter pour**
Travaux graphiques nécessitant une large gamme de couleurs.
`,
      promoPct: 0,
      tier: ProductTierEnum.standard
    },
    {
      sku: 'ORDIN-0003',
      name: 'HP Spectre x360',
      slug: 'hp-spectre-x360',
      categorySlug: 'ordinateurs',
      brandSlug: 'hp',
      seriesSlug: undefined,
      priceXaf: 800000,
      stockQty: 10,
      weightKg: 1.280,
      dimensionsMm: { l: 304, w: 215, h: 13 },
      specs: { ram: '16GB', storage: '512GB' },
      description: `
### HP Spectre x360

**Avantages**
- Design élégant avec châssis métal brossé.
- **Écran tactile 13,5″ 3K+** : ultra-lumineux et précis.
- **Charnière 360°** : Tablette ou laptop en un clin d'œil.
- Stylet inclus pour prise de notes et dessin sur Windows Ink.

**Inconvénients**
- **Prix élevé** : premium sans compromis.
- Autonomie variable selon usage (10–12 h en Office, moins en vidéo).

**Recommandé pour**
Créatifs nomades : présentations, prise de notes manuscrites, dessin et retouche légère.

**À éviter pour**
Jeux gourmands et traitements lourds nécessitant GPU dédié.
`,
      promoPct: 0,
      tier: ProductTierEnum.premium
    },
    {
      sku: 'ORDIN-0004',
      name: 'Lenovo ThinkPad X1 Carbon',
      slug: 'lenovo-thinkpad-x1-carbon',
      categorySlug: 'ordinateurs',
      brandSlug: 'lenovo',
      seriesSlug: undefined,
      priceXaf: 900000,
      stockQty: 12,
      weightKg: 1.090,
      dimensionsMm: { l: 323, w: 217, h: 14 },
      specs: { ram: '16GB', storage: '512GB' },
      description: `
### Lenovo ThinkPad X1 Carbon

**Avantages**
- Clavier légendaire **ThinkPad** : frappe confortable et silencieuse.
- **Ultra-léger** (1,09 kg) et robuste (certifié MIL-STD 810G).
- Performances stables grâce au processeur Intel Core i7 de génération récente.

**Inconvénients**
- Design sobre qui peut sembler austère.
- **Prix élevé** : investissement premium pour les pros.

**Recommandé pour**
Professionnels exigeants : déplacements fréquents et usage bureautique intensif.

**À éviter pour**
Jeux vidéo et montage vidéo 4K intensif.
`,
      promoPct: 0,
      tier: ProductTierEnum.premium
    },
    {
      sku: 'ORDIN-0005',
      name: 'ASUS ROG Zephyrus G14',
      slug: 'asus-rog-zephyrus-g14',
      categorySlug: 'ordinateurs',
      brandSlug: 'asus',
      seriesSlug: undefined,
      priceXaf: 1200000,
      stockQty: 10,
      weightKg: 1.600,
      dimensionsMm: { l: 324, w: 222, h: 17 },
      specs: { cpu: 'AMD Ryzen 9', gpu: 'NVIDIA RTX 3060', ram: '16GB', storage: '1TB SSD' },
      description: `
### ASUS ROG Zephyrus G14

**Avantages**
- Performances élevées avec **AMD Ryzen 9** et **NVIDIA RTX 3060**.
- Écran **14″ 120 Hz** ultra fluide pour le gaming.
- Design compact et léger (1,6 kg), facile à transporter.
- Clavier RGB rétroéclairé et châssis solide.

**Inconvénients**
- **Prix élevé**, réservé aux budgets gaming sérieux.
- Tendance à chauffer sous forte charge.

**Recommandé pour**
Jeux AAA, streaming et création de contenu.

**À éviter pour**
Usage bureautique simple (overkill).
`,
      promoPct: 0,
      tier: ProductTierEnum.pro
    },
    {
      sku: 'ORDIN-0006',
      name: 'MSI GF63 Thin',
      slug: 'msi-gf63-thin',
      categorySlug: 'ordinateurs',
      brandSlug: 'msi',
      seriesSlug: undefined,
      priceXaf: 400000,
      stockQty: 15,
      weightKg: 1.800,
      dimensionsMm: { l: 357, w: 248, h: 21 },
      specs: { cpu: 'Intel Core i5', gpu: 'NVIDIA GTX 1650', ram: '8GB', storage: '512GB SSD' },
      description: `
### MSI GF63 Thin

**Avantages**
- Excellent rapport perf'/prix avec **i5 + GTX 1650**.
- Design fin et portable (1,8 kg).
- Écran **15,6″ 144 Hz** pour un gaming compétitif.

**Inconvénients**
- **Autonomie limitée** (4–5 h en usage mixte).
- Qualité de construction moyenne.

**Recommandé pour**
Étudiants gamers et compétiteurs.

**À éviter pour**
Travaux pros gourmands en ressources.
`,
      promoPct: 0,
      tier: ProductTierEnum.standard
    },
    {
      sku: 'ORDIN-0007',
      name: 'Acer Aspire 5',
      slug: 'acer-aspire-5',
      categorySlug: 'ordinateurs',
      brandSlug: 'acer',
      seriesSlug: undefined,
      priceXaf: 200000,
      stockQty: 20,
      weightKg: 1.800,
      dimensionsMm: { l: 363, w: 247, h: 18 },
      specs: { ram: '8GB', storage: '512GB SSD' },
      description: `
### Acer Aspire 5

**Avantages**
- Prix abordable, idéal pour étudiants et bureautique.
- Performances suffisantes pour traitement de texte et navigation Web.
- Connectique variée : USB-A, USB-C, HDMI et lecteur SD.

**Inconvénients**
- Design basique, finition grand public.
- Écran de qualité moyenne (HD seulement sur certains modèles).

**Recommandé pour**
Traitement de texte, navigation Web, visioconférences.

**À éviter pour**
Jeux gourmands et montage vidéo intensif.
`,
      promoPct: 0,
      tier: ProductTierEnum.entry
    },
    {
      sku: 'ORDIN-0008',
      name: 'HP Envy x360 14',
      slug: 'hp-envy-x360-14',
      categorySlug: 'ordinateurs',
      brandSlug: 'hp',
      seriesSlug: undefined,
      priceXaf: 850000,
      stockQty: 10,
      weightKg: 1.300,
      dimensionsMm: { l: 312, w: 219, h: 16 },
      specs: { ram: '16GB', storage: '512GB SSD' },
      description: `
###  HP Envy x360 14

**Avantages**
- Châssis aluminium solide et élégant.
- Silencieux et convertible 2-en-1 grâce à la charnière 360°.
- Écran OLED 14″ : contraste élevé et couleurs vibrantes.
- Connectique complète : USB-C/Thunderbolt, HDMI, microSD.

**Inconvénients**
- Autonomie moyenne (8–10 h selon usage).
- Clavier au feeling irrégulier, moins adapté à la frappe intensive.

**Recommandé pour**
Professionnels recherchant un appareil polyvalent et élégant.

**À éviter pour**
Jeux gourmands et tâches graphiques intensives.
`,
      promoPct: 0,
      tier: ProductTierEnum.premium
    }
  ];

  /* ----------  Boucle d’insertion / upsert  ---------- */
  const created: Record<string, any> = {};

  for (const p of productsData) {
    const createdProduct = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        sku: p.sku,
        name: p.name,
        slug: p.slug,
        categoryId: categories[p.categorySlug].id,
        brandId: brands[p.brandSlug].id,
        seriesId: p.seriesSlug ? series[p.seriesSlug]?.id : undefined,
        priceXaf: p.priceXaf,
        stockQty: p.stockQty,
        weightKg: p.weightKg,
        dimensionsMm: p.dimensionsMm,
        specs: p.specs,
        description: p.description,
        tier: p.tier ?? ProductTierEnum.standard,
        promoPct: p.promoPct ?? 0,
        promoPriceXaf:
          p.promoPct && p.promoPct > 0
            ? Math.round(p.priceXaf * (1 - p.promoPct / 100))
            : undefined,
        hasVariants: p.hasVariants ?? false
      }
    });

    created[p.slug] = createdProduct;
  }

  console.log(`✅  Products created: ${Object.keys(created).length}`);

  // logs stock init
  await createInventoryLogs(Object.values(created));

  return created;
}

/* -------------------------------------------------------------------------- */
/*                           INVENTORY  LOGS HELPER                           */
/* -------------------------------------------------------------------------- */

async function createInventoryLogs(products: any[]) {
  const logs = products.map((prod) => ({
    productId: prod.id,
    qtyChange: prod.stockQty,
    reason: InventoryReasonEnum.purchase
  }));
  await prisma.inventoryLog.createMany({ data: logs });
  console.log(`📊  Inventory logs created: ${logs.length}`);
}

async function createVariantAttributes() {
  console.log('🏷️ Creating variant attributes...');
  
  const attributes = [
    { name: 'Color', slug: 'color', valueType: 'string' },
    { name: 'Size', slug: 'size', valueType: 'string' },
    { name: 'Storage', slug: 'storage', valueType: 'number' },
    { name: 'RAM', slug: 'ram', valueType: 'number' },
    { name: 'Material', slug: 'material', valueType: 'string' }
  ];
  
  const createdAttributes: Record<string, any> = {};
  
  for (const attr of attributes) {
    const created = await prisma.variantAttribute.upsert({
      where: { slug: attr.slug },
      update: {},
      create: attr
    });
    createdAttributes[attr.slug] = created;
  }
  
  console.log(`✅ Created ${Object.keys(createdAttributes).length} variant attributes`);
  return createdAttributes;
}

async function createVariantValues(attributes: Record<string, any>) {
  console.log('📝 Creating variant values...');
  
  const values = [
    // Colors
    { attributeId: attributes.color.id, value: 'Black', normalizedValue: 'black', position: 1 },
    { attributeId: attributes.color.id, value: 'White', normalizedValue: 'white', position: 2 },
    { attributeId: attributes.color.id, value: 'Blue', normalizedValue: 'blue', position: 3 },
    { attributeId: attributes.color.id, value: 'Red', normalizedValue: 'red', position: 4 },
    { attributeId: attributes.color.id, value: 'Space Gray', normalizedValue: 'space-gray', position: 5 },
    { attributeId: attributes.color.id, value: 'Silver', normalizedValue: 'silver', position: 6 },
    
    // Storage
    { attributeId: attributes.storage.id, value: '128GB', normalizedValue: '128', position: 1 },
    { attributeId: attributes.storage.id, value: '256GB', normalizedValue: '256', position: 2 },
    { attributeId: attributes.storage.id, value: '512GB', normalizedValue: '512', position: 3 },
    { attributeId: attributes.storage.id, value: '1TB', normalizedValue: '1024', position: 4 },
    
    // RAM
    { attributeId: attributes.ram.id, value: '8GB', normalizedValue: '8', position: 1 },
    { attributeId: attributes.ram.id, value: '16GB', normalizedValue: '16', position: 2 },
    { attributeId: attributes.ram.id, value: '32GB', normalizedValue: '32', position: 3 },
    
    // Size
    { attributeId: attributes.size.id, value: 'Small', normalizedValue: 'S', position: 1 },
    { attributeId: attributes.size.id, value: 'Medium', normalizedValue: 'M', position: 2 },
    { attributeId: attributes.size.id, value: 'Large', normalizedValue: 'L', position: 3 }
  ];
  
  const createdValues = await prisma.variantValue.createMany({
    data: values,
    skipDuplicates: true
  });
  
  // Get all values to return
  const allValues = await prisma.variantValue.findMany({
    include: {
      attribute: true
    }
  });
  
  // Index by attribute and normalized value for easy lookup
  const indexedValues: Record<string, Record<string, any>> = {};
  
  for (const value of allValues) {
    const attrSlug = value.attribute.slug;
    const normValue = value.normalizedValue || value.value;
    
    if (!indexedValues[attrSlug]) {
      indexedValues[attrSlug] = {};
    }
    
    indexedValues[attrSlug][normValue] = value;
  }
  
  console.log(`✅ Created variant values`);
  return indexedValues;
}

async function createProductVariants(
  products: Record<string, any>,
  attributes: Record<string, any>,
  values: Record<string, Record<string, any>>
) {
  console.log('🔄 Creating product variants...');
  
  // Get iPhone 15 Pro product by slug
  const iphone15Pro = products['apple-iphone-15-pro-128gb'];
  
  if (iphone15Pro) {
    // iPhone 15 variants (different storage and colors)
    const iphoneColors = ['space-gray', 'silver', 'black'];
    const iphoneStorage = ['128', '256', '512'];
    
    for (const color of iphoneColors) {
      for (const storage of iphoneStorage) {
        const variant = await prisma.productVariant.create({
          data: {
            productId: iphone15Pro.id,
            variantKey: `${color}-${storage}gb`,
            attrs: {
              color: color,
              storage: `${storage}GB`
            },
            extraPriceXaf: storage === '128' ? 0 : (storage === '256' ? 100000 : 250000),
            stockQty: Math.floor(Math.random() * 10) + 1
          }
        });
        
        // Create variant values links
        await prisma.productVariantValue.createMany({
          data: [
            {
              variantId: variant.id,
              attributeId: attributes.color.id,
              valueId: values.color[color].id
            },
            {
              variantId: variant.id,
              attributeId: attributes.storage.id,
              valueId: values.storage[storage].id
            }
          ]
        });
      }
    }
  } else {
    console.log('⚠️ iPhone 15 Pro product not found, skipping variants');
  }
  
  // Get Samsung headphone product or any other product for headphones
  const samsungPhone = products['samsung-galaxy-s22-128gb'];
  
  if (samsungPhone) {
    // Headphone variants (different colors)
    const phoneColors = ['black', 'white'];
    
    for (const color of phoneColors) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: samsungPhone.id,
          variantKey: color,
          attrs: {
            color: color
          },
          extraPriceXaf: 0,
          stockQty: Math.floor(Math.random() * 15) + 5
        }
      });
      
      await prisma.productVariantValue.create({
        data: {
          variantId: variant.id,
          attributeId: attributes.color.id,
          valueId: values.color[color].id
        }
      });
    }
  } else {
    console.log('⚠️ Samsung Galaxy product not found, skipping variants');
  }
  
  console.log('✅ Product variants created');
}

async function createUsers() {
  console.log('👤 Creating users...');
  
  // Hash function
  const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  };
  
  const defaultPassword = await hashPassword('Xeption@123');
  
  // Regular client
  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      passwordHash: defaultPassword,
      phone237: '+237691234567',
      fullName: 'Jean Dupont',
      role: UserRole.client,
      loyaltyPoints: 150,
      preferredLang: 'fr'
    }
  });
  
  // Business client
  const business = await prisma.user.upsert({
    where: { email: 'business@example.com' },
    update: {},
    create: {
      email: 'business@example.com',
      passwordHash: defaultPassword,
      phone237: '+237677889900',
      fullName: 'Pierre Kamdem',
      role: UserRole.client,  // Changed from business to client
      loyaltyPoints: 500,
      preferredLang: 'fr'
    }
  });
  
  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@xeption.com' },
    update: {},
    create: {
      email: 'admin@xeption.com',
      passwordHash: defaultPassword,
      phone237: '+237699887766',
      fullName: 'Admin Xeption',
      role: UserRole.admin,
      preferredLang: 'fr'
    }
  });
  
  // Staff
  const staff = await prisma.user.upsert({
    where: { email: 'staff@xeption.com' },
    update: {},
    create: {
      email: 'staff@xeption.com',
      passwordHash: defaultPassword,
      phone237: '+237655443322',
      fullName: 'Staff Member',
      role: UserRole.agent,  // Changed from staff to agent
      preferredLang: 'fr'
    }
  });
  
  // Technician
  const technician = await prisma.user.upsert({
    where: { email: 'tech@xeption.com' },
    update: {},
    create: {
      email: 'tech@xeption.com',
      passwordHash: defaultPassword,
      phone237: '+237611223344',
      fullName: 'Repair Technician',
      role: UserRole.agent,  // Changed from technician to agent
      preferredLang: 'fr'
    }
  });
  
  console.log('✅ Users created');
  
  return {
    client,
    business,
    admin,
    staff,
    technician
  };
}

async function createAddresses(
  users: Record<string, any>,
  regions: Record<string, any>,
  cities: Record<string, any>,
  communes: Record<string, any>
) {
  console.log('🏠 Creating addresses...');
  
  // Client address in Yaoundé
  await prisma.address.create({
    data: {
      userId: users.client.id,
      country: 'Cameroon',
      regionId: regions.Centre.id,
      cityId: cities.Yaoundé.id,
      communeId: communes['Yaoundé 3'].id,
      addressLine: 'Quartier Melen, Rue 7890',
      isDefault: true
    }
  });
  
  // Client second address in Douala
  await prisma.address.create({
    data: {
      userId: users.client.id,
      country: 'Cameroon',
      regionId: regions.Littoral.id,
      cityId: cities.Douala.id,
      communeId: communes['Douala 5'].id,
      addressLine: 'Quartier Akwa, Rue des Palmiers',
      isDefault: false
    }
  });
  
  // Business address
  await prisma.address.create({
    data: {
      userId: users.business.id,
      country: 'Cameroon',
      regionId: regions.Centre.id,
      cityId: cities.Yaoundé.id,
      communeId: communes['Yaoundé 1'].id,
      addressLine: 'Avenue Kennedy, Immeuble Tech Center, 3ème étage',
      isDefault: true
    }
  });
  
  console.log('✅ Addresses created');
}

async function createCarts(users: Record<string, any>, products: Record<string, any>) {
  console.log('🛒 Creating carts...');
  
  // Client cart
  const clientCart = await prisma.cart.upsert({
    where: { userId: users.client.id },
    update: {},
    create: {
      userId: users.client.id
    }
  });
  
  // Get iPhone product
  const iphone = products['apple-iphone-15-pro-128gb'];
  
  if (iphone) {
    // Find an iPhone variant if it exists
    const iphoneVariant = await prisma.productVariant.findFirst({
      where: {
        productId: iphone.id
      }
    });
    
    if (iphoneVariant) {
      await prisma.cartItem.create({
        data: {
          cartUserId: clientCart.userId,
          productId: iphone.id,
          variantId: iphoneVariant.id,
          qty: 1
        }
      });
    } else {
      // Add iPhone to cart without variant
      await prisma.cartItem.create({
        data: {
          cartUserId: clientCart.userId,
          productId: iphone.id,
          qty: 1
        }
      });
    }
  }
  
  // Get another product for the cart
  const xiaomiPhone = products['xiaomi-redmi-note-11-64gb'];
  
  if (xiaomiPhone) {
    await prisma.cartItem.create({
      data: {
        cartUserId: clientCart.userId,
        productId: xiaomiPhone.id,
        qty: 1
      }
    });
  }
  
  // Business cart
  const businessCart = await prisma.cart.upsert({
    where: { userId: users.business.id },
    update: {},
    create: {
      userId: users.business.id
    }
  });
  
  // Get laptop products for business cart
  const macbook = products['apple-macbook-air-m1-2020'];
  const dell = products['dell-xps-13-9345'];
  
  // Add laptops to business cart
  if (macbook) {
    await prisma.cartItem.create({
      data: {
        cartUserId: businessCart.userId,
        productId: macbook.id,
        qty: 2
      }
    });
  }
  
  if (dell) {
    await prisma.cartItem.create({
      data: {
        cartUserId: businessCart.userId,
        productId: dell.id,
        qty: 3
      }
    });
  }
  
  console.log('✅ Carts created');
}

async function createRfqs(users: Record<string, any>, categories: Record<string, any>) {
  console.log('📝 Creating RFQs...');
  
  // Create an RFQ for a business client
  const rfq = await prisma.rfq.create({
    data: {
      companyName: 'TechSolutions Cameroun',
      contactName: users.business.fullName,
      contactEmail: users.business.email,
      budgetMinXaf: 5000000,
      budgetMaxXaf: 8000000,
      status: 'new',
      isUrgent: true,
      comment: 'Nous avons besoin d\'équiper notre nouveau bureau à Yaoundé',
      deliveryDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      submittedAt: new Date(),
      createdBy: users.business.id
    }
  });
  
  // Add RFQ items
  await prisma.rfqItem.createMany({
    data: [
      {
        rfqId: rfq.id,
        categoryId: categories.laptops.id,
        qty: 10,
        specsNote: 'Processeur i7 ou équivalent, 16GB RAM minimum, 512GB SSD'
      },
      {
        rfqId: rfq.id,
        categoryId: categories['pc-bureau'].id,
        qty: 5,
        specsNote: 'Stations de travail performantes pour designers'
      },
      {
        rfqId: rfq.id,
        categoryId: categories.wifi.id,
        qty: 2,
        specsNote: 'Routeurs Wifi 6 pour bureau de 500m²'
      }
    ]
  });
  
  console.log('✅ RFQs created');
}

async function createTradeIns(users: Record<string, any>) {
  console.log('📱 Creating trade-ins...');
  
  // Create a trade-in request
  const tradeIn = await prisma.tradeIn.create({
    data: {
      userId: users.client.id,
      deviceType: 'smartphone',
      brand: 'Apple',
      model: 'iPhone 13',
      physicalCondition: 'good',
      batteryState: 'good',
      invoiceProvided: true,
      isUnlocked: true,
      quoteValueXaf: 350000,
      status: 'pending'
    }
  });
  
  // Add photos
  await prisma.tradeInPhoto.createMany({
    data: [
      {
        tradeInId: tradeIn.id,
        photoUrl: 'https://example.com/tradein/iphone13-front.jpg'
      },
      {
        tradeInId: tradeIn.id,
        photoUrl: 'https://example.com/tradein/iphone13-back.jpg'
      },
      {
        tradeInId: tradeIn.id,
        photoUrl: 'https://example.com/tradein/iphone13-side.jpg'
      }
    ]
  });
  
  console.log('✅ Trade-ins created');
}

async function createRepairJobs(users: Record<string, any>) {
  console.log('🔧 Creating repair jobs...');
  
  // Create a repair request
  await prisma.repairJob.create({
    data: {
      userId: users.client.id,
      deviceInfo: {
        type: 'laptop',
        brand: 'Dell',
        model: 'XPS 15',
        yearOfPurchase: 2022,
        serialNumber: 'XPS15-2022-123456'
      },
      problemDesc: 'L\'ordinateur surchauffe et s\'éteint après environ 30 minutes d\'utilisation',
      preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      status: 'scheduled'
    }
  });
  
  // Create technician availability
  const today = new Date();
  
  await prisma.technicianAvailability.createMany({
    data: [
      {
        technicianId: users.technician.id,
        availableDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
        availableHours: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
      },
      {
        technicianId: users.technician.id,
        availableDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
        availableHours: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
      },
      {
        technicianId: users.technician.id,
        availableDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
        availableHours: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
      }
    ]
  });
  
  console.log('✅ Repair jobs created');
}

async function createBackOrders(users: Record<string, any>) {
  console.log('📦 Creating back orders...');
  
  // Create a back order
  const backOrder = await prisma.backOrder.create({
    data: {
      userId: users.client.id,
      productRef: 'iPhone 15 Pro Max 1TB',
      desiredQty: 1,
      maxBudgetXaf: 1500000,
      status: 'open',
      agentNote: 'Le client préfère la couleur Titanium Naturel, mais accepterait le Noir'
    }
  });
  
  console.log('✅ Back orders created');
  
  // Create a budget advisory
  await prisma.budgetAdvisory.create({
    data: {
      userId: users.client.id,
      budgetXaf: 500000,
      usageContext: 'Je cherche un ordinateur portable pour mon enfant qui commence ses études universitaires en informatique',
      status: 'open'
    }
  });
  
  console.log('✅ Budget advisories created');
}

async function createMarketingBanners(categories: Record<string, any>) {
  console.log('🏞️ Creating marketing banners...');
  
  const today = new Date();
  
  await prisma.marketingBanner.createMany({
    data: [
      {
        title237: 'Nouveaux iPhone 15 disponibles',
        imageUrl: 'https://example.com/banners/iphone15-banner.jpg',
        ctaUrl: '/products/smartphones/iphone-15-pro-256gb',
        categoryId: categories.smart.id,
        priority: 10,
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5),
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 25),
        active: true
      },
      {
        title237: 'Offre spéciale MacBook Pro',
        imageUrl: 'https://example.com/banners/macbook-promo.jpg',
        ctaUrl: '/products/laptops/macbook-pro-16-m3-pro-512gb',
        categoryId: categories.laptops.id,
        priority: 5,
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 12),
        active: true
      },
      {
        title237: 'Service de réparation professionnel',
        imageUrl: 'https://example.com/banners/repair-service.jpg',
        ctaUrl: '/services/repair',
        priority: 3,
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        endDate: new Date(today.getFullYear(), today.getMonth() + 3, today.getDate()),
        active: true
      }
    ]
  });
  
  console.log('✅ Marketing banners created');
}

// Execute the seed function
main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Close Prisma client connection
    await prisma.$disconnect();
  });