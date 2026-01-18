/**
 * 🗺️ Adventure Translation Helper
 * 
 * Translates adventure zones and stages from config without database queries.
 * 
 * ARCHITECTURE:
 * - Vietnamese is the DEFAULT language in config files (no translation needed)
 * - Other languages use translation keys from dictionary files
 * - To add a new language: just add translations to dictionaries/{lang}.json
 * - NO CODE CHANGES needed when adding new languages!
 * 
 * HOW TO ADD A NEW LANGUAGE:
 * 1. Create dictionaries/{lang}.json (e.g., ja.json, ko.json)
 * 2. Copy the "adventureScreen.zones" and "adventureScreen.stages" sections from en.json
 * 3. Translate the values to your language
 * 4. Done! The app will automatically use the new translations
 */

/**
 * Translate a zone object from adventure config
 * @param {Object} zone - Zone object from config
 * @param {Function} t - Translation function from useI18n
 * @param {string} locale - Current locale ('vi', 'en', 'ja', etc.)
 * @returns {Object} - Translated zone object
 */
export function translateZone(zone, t, locale) {
  // Vietnamese is the default language in config, no translation needed
  if (locale === 'vi') {
    return zone;
  }
  
  // Try to get translation for this zone using zoneId as key
  const zoneKey = `adventureScreen.zones.${zone.zoneId}`;
  const translatedName = t(`${zoneKey}.name`);
  
  // If no translation found (returns the key itself), use original Vietnamese
  if (translatedName === `${zoneKey}.name`) {
    return zone;
  }
  
  return {
    ...zone,
    name: translatedName,
    subtitle: t(`${zoneKey}.subtitle`) || zone.subtitle,
    description: t(`${zoneKey}.description`) || zone.description,
    story: zone.story ? {
      intro: t(`${zoneKey}.storyIntro`) || zone.story.intro,
      complete: t(`${zoneKey}.storyComplete`) || zone.story.complete
    } : zone.story
  };
}

/**
 * Translate zones array
 * @param {Array} zones - Array of zone objects
 * @param {Function} t - Translation function
 * @param {string} locale - Current locale
 * @returns {Array} - Translated zones array
 */
export function translateZones(zones, t, locale) {
  if (locale === 'vi') {
    return zones;
  }
  return zones.map(zone => translateZone(zone, t, locale));
}

/**
 * Translate a stage object
 * Stage names and descriptions use stageId as translation key
 * 
 * @param {Object} stage - Stage object from config
 * @param {Function} t - Translation function
 * @param {string} locale - Current locale
 * @returns {Object} - Translated stage object
 */
export function translateStage(stage, t, locale) {
  // Vietnamese is default, no translation needed
  if (locale === 'vi') {
    return stage;
  }
  
  // Try to get translation using stageId as key
  const stageKey = `adventureScreen.stages.stage_${stage.stageId}`;
  const translatedName = t(`${stageKey}.name`);
  
  // If specific stage translation exists, use it
  if (translatedName !== `${stageKey}.name`) {
    return {
      ...stage,
      name: translatedName,
      description: t(`${stageKey}.description`) || stage.description
    };
  }
  
  // For boss stages, generate translated description from mode/difficulty
  if (stage.type === 'boss') {
    let translatedDesc = stage.description;
    
    if (stage.practiceInfo) {
      const modeName = t(`adventureScreen.modes.${stage.practiceInfo.mode}`) || stage.practiceInfo.modeName;
      const diffName = t(`adventureScreen.difficulties.${stage.practiceInfo.difficulty}`) || stage.practiceInfo.difficultyName;
      translatedDesc = t('adventureScreen.practiceDesc', { 
        mode: modeName, 
        difficulty: diffName, 
        correct: stage.practiceInfo.minCorrect 
      });
      // Fallback if template not found
      if (translatedDesc === 'adventureScreen.practiceDesc') {
        translatedDesc = `Practice ${modeName} • ${diffName} • ${stage.practiceInfo.minCorrect} correct`;
      }
    }
    
    if (stage.competeInfo) {
      const modeName = t(`adventureScreen.modes.${stage.competeInfo.mode}`) || stage.competeInfo.modeName;
      translatedDesc = t('adventureScreen.competeDesc', {
        mode: modeName,
        correct: stage.competeInfo.minCorrect,
        total: stage.competeInfo.questions || 10
      });
      // Fallback if template not found
      if (translatedDesc === 'adventureScreen.competeDesc') {
        translatedDesc = `Compete ${modeName} • ${stage.competeInfo.minCorrect}/${stage.competeInfo.questions || 10} correct`;
      }
    }
    
    return {
      ...stage,
      description: translatedDesc
    };
  }
  
  // Return original if no translation found
  return stage;
}

/**
 * Translate stages array
 * @param {Array} stages - Array of stage objects
 * @param {Function} t - Translation function
 * @param {string} locale - Current locale
 * @returns {Array} - Translated stages array
 */
export function translateStages(stages, t, locale) {
  if (locale === 'vi') {
    return stages;
  }
  return stages.map(stage => translateStage(stage, t, locale));
}

/**
 * Get translated mode name
 * @param {string} mode - Mode key (addition, subtraction, etc.)
 * @param {Function} t - Translation function
 * @param {string} locale - Current locale
 * @returns {string} - Translated mode name
 */
export function getModeName(mode, t, locale) {
  // Try to get from translation
  const key = `adventureScreen.modes.${mode}`;
  const translated = t(key);
  
  // If found, return translated
  if (translated !== key) {
    return translated;
  }
  
  // Fallback to English names
  const fallbackNames = {
    create: 'Create Number',
    addition: 'Addition',
    subtraction: 'Subtraction',
    addSubMixed: 'Add & Sub',
    multiplication: 'Multiplication',
    division: 'Division',
    mulDiv: 'Mul & Div',
    mixed: 'All Operations'
  };
  return fallbackNames[mode] || mode;
}

/**
 * Get translated difficulty name
 * @param {number} difficulty - Difficulty level (1-5)
 * @param {Function} t - Translation function
 * @param {string} locale - Current locale
 * @returns {string} - Translated difficulty name
 */
export function getDifficultyName(difficulty, t, locale) {
  // Try to get from translation
  const key = `adventureScreen.difficulties.${difficulty}`;
  const translated = t(key);
  
  // If found, return translated
  if (translated !== key) {
    return translated;
  }
  
  // Fallback to English names
  const fallbackNames = {
    1: 'Beginner',
    2: 'Apprentice', 
    3: 'Journeyman',
    4: 'Expert',
    5: 'Master'
  };
  return fallbackNames[difficulty] || `Level ${difficulty}`;
}

