/**
 * 🚀 SCRIPT TẠO APP ICONS CHO PWA VÀ CAPACITOR
 * 
 * Chạy: node scripts/generate-icons.js
 * 
 * Cần cài: npm install sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Các kích thước icon cần thiết
const ICON_SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512];

// Đường dẫn
const SOURCE_LOGO = path.join(__dirname, '../public/logo.png');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');
const ANDROID_RES_DIR = path.join(__dirname, '../android/app/src/main/res');
const IOS_ASSETS_DIR = path.join(__dirname, '../ios/App/App/Assets.xcassets/AppIcon.appiconset');

// Android drawable sizes
const ANDROID_SIZES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

// iOS icon sizes
const IOS_SIZES = [
  { size: 20, scales: [1, 2, 3] },
  { size: 29, scales: [1, 2, 3] },
  { size: 40, scales: [1, 2, 3] },
  { size: 60, scales: [2, 3] },
  { size: 76, scales: [1, 2] },
  { size: 83.5, scales: [2] },
  { size: 1024, scales: [1] },
];

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created: ${dir}`);
  }
}

async function generatePWAIcons() {
  console.log('\n🎨 Generating PWA icons...\n');
  
  await ensureDir(OUTPUT_DIR);
  
  for (const size of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
    
    await sharp(SOURCE_LOGO)
      .resize(size, size, { fit: 'contain', background: { r: 26, g: 26, b: 46, alpha: 1 } })
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Created: icon-${size}x${size}.png`);
  }
  
  // Tạo maskable icons (có padding cho Android)
  const maskableSize = 512;
  const innerSize = Math.floor(maskableSize * 0.6); // 60% cho safe zone
  
  await sharp(SOURCE_LOGO)
    .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: Math.floor((maskableSize - innerSize) / 2),
      bottom: Math.ceil((maskableSize - innerSize) / 2),
      left: Math.floor((maskableSize - innerSize) / 2),
      right: Math.ceil((maskableSize - innerSize) / 2),
      background: { r: 26, g: 26, b: 46, alpha: 1 }
    })
    .png()
    .toFile(path.join(OUTPUT_DIR, 'icon-maskable-512x512.png'));
  
  console.log(`✅ Created: icon-maskable-512x512.png`);
}

async function generateAndroidIcons() {
  console.log('\n🤖 Generating Android icons...\n');
  
  if (!fs.existsSync(ANDROID_RES_DIR)) {
    console.log('⚠️  Android project not found. Run: npx cap add android');
    return;
  }
  
  for (const [folder, size] of Object.entries(ANDROID_SIZES)) {
    const folderPath = path.join(ANDROID_RES_DIR, folder);
    await ensureDir(folderPath);
    
    // Launcher icon
    await sharp(SOURCE_LOGO)
      .resize(size, size, { fit: 'contain', background: { r: 26, g: 26, b: 46, alpha: 1 } })
      .png()
      .toFile(path.join(folderPath, 'ic_launcher.png'));
    
    // Foreground (for adaptive icons)
    const foregroundSize = Math.floor(size * 1.5);
    const innerSize = Math.floor(foregroundSize * 0.6);
    
    await sharp(SOURCE_LOGO)
      .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({
        top: Math.floor((foregroundSize - innerSize) / 2),
        bottom: Math.ceil((foregroundSize - innerSize) / 2),
        left: Math.floor((foregroundSize - innerSize) / 2),
        right: Math.ceil((foregroundSize - innerSize) / 2),
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(folderPath, 'ic_launcher_foreground.png'));
    
    console.log(`✅ ${folder}: ic_launcher.png, ic_launcher_foreground.png`);
  }
}

async function generateIOSIcons() {
  console.log('\n🍎 Generating iOS icons...\n');
  
  if (!fs.existsSync(IOS_ASSETS_DIR)) {
    console.log('⚠️  iOS project not found. Run: npx cap add ios');
    return;
  }
  
  const contents = {
    images: [],
    info: { version: 1, author: 'Sorokid' }
  };
  
  for (const { size, scales } of IOS_SIZES) {
    for (const scale of scales) {
      const actualSize = Math.floor(size * scale);
      const filename = `icon-${size}x${size}@${scale}x.png`;
      
      await sharp(SOURCE_LOGO)
        .resize(actualSize, actualSize, { fit: 'contain', background: { r: 26, g: 26, b: 46, alpha: 1 } })
        .png()
        .toFile(path.join(IOS_ASSETS_DIR, filename));
      
      contents.images.push({
        filename,
        idiom: size === 1024 ? 'ios-marketing' : 'universal',
        scale: `${scale}x`,
        size: `${size}x${size}`
      });
      
      console.log(`✅ ${filename}`);
    }
  }
  
  // Write Contents.json
  fs.writeFileSync(
    path.join(IOS_ASSETS_DIR, 'Contents.json'),
    JSON.stringify(contents, null, 2)
  );
  console.log('✅ Contents.json');
}

async function generateSplashScreen() {
  console.log('\n💦 Generating splash screens...\n');
  
  const splashSizes = [
    { width: 1242, height: 2688, name: 'splash-1242x2688.png' },
    { width: 1125, height: 2436, name: 'splash-1125x2436.png' },
    { width: 828, height: 1792, name: 'splash-828x1792.png' },
    { width: 1080, height: 1920, name: 'splash-1080x1920.png' },
    { width: 750, height: 1334, name: 'splash-750x1334.png' },
  ];
  
  const screenshotsDir = path.join(__dirname, '../public/screenshots');
  await ensureDir(screenshotsDir);
  
  for (const { width, height, name } of splashSizes) {
    const logoSize = Math.min(width, height) * 0.3;
    
    // Create background
    const background = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 26, g: 26, b: 46, alpha: 1 }
      }
    }).png().toBuffer();
    
    // Resize logo
    const logo = await sharp(SOURCE_LOGO)
      .resize(Math.floor(logoSize), Math.floor(logoSize), { fit: 'contain' })
      .png()
      .toBuffer();
    
    // Composite
    await sharp(background)
      .composite([{
        input: logo,
        gravity: 'center'
      }])
      .png()
      .toFile(path.join(screenshotsDir, name));
    
    console.log(`✅ ${name}`);
  }
}

async function main() {
  console.log('🎯 SOROKID ICON GENERATOR\n');
  console.log('='.repeat(50));
  
  if (!fs.existsSync(SOURCE_LOGO)) {
    console.error(`❌ Source logo not found: ${SOURCE_LOGO}`);
    console.error('Please ensure public/logo.png exists');
    process.exit(1);
  }
  
  try {
    await generatePWAIcons();
    await generateAndroidIcons();
    await generateIOSIcons();
    await generateSplashScreen();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 All icons generated successfully!\n');
    console.log('Next steps:');
    console.log('1. Review icons in public/icons/');
    console.log('2. Run: npm run build');
    console.log('3. Run: npx cap sync');
    console.log('4. Open: npx cap open android  OR  npx cap open ios');
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

main();
