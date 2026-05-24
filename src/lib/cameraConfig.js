export const EXPECTED_PANEL_IDS = ['object', 'space', 'trace'];
export const SOURCE_TYPES = ['vdo', 'video', 'embed'];
export const VISUAL_MODES = ['normal', 'cropped', 'blurred', 'ghosted', 'high-contrast', 'dimmed', 'slow-zoom'];
export const CROP_MODES = ['cover', 'contain', 'stretch'];
export const PLACEHOLDER_TOKEN = 'REPLACE_';

export const DEFAULT_SOURCE = {
  sourceType: 'vdo',
  src: '',
  active: false,
  muted: true,
  loop: true,
  fallbackText: 'The surface is silent.',
  visualMode: 'normal',
  cropMode: 'cover',
};

export function cloneConfig(config) {
  return JSON.parse(JSON.stringify(config));
}

export function isObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

export function isKnownSourceType(sourceType) {
  return SOURCE_TYPES.includes(sourceType);
}

export function hasConfiguredSrc(panel) {
  return Boolean(typeof panel.src === 'string' && panel.src.trim());
}

export function hasPlaceholderSrc(panel) {
  return Boolean(typeof panel.src === 'string' && panel.src.includes(PLACEHOLDER_TOKEN));
}

export function isYouTubeEmbed(src) {
  if (typeof src !== 'string' || !src.trim()) {
    return false;
  }

  try {
    const url = new URL(src);
    const hostname = url.hostname.replace(/^www\./, '');
    return (
      (hostname === 'youtube.com' || hostname.endsWith('.youtube.com') || hostname === 'youtube-nocookie.com') &&
      url.pathname.startsWith('/embed/')
    );
  } catch {
    return /(?:^|\/\/)(?:[\w-]+\.)?(?:youtube\.com|youtube-nocookie\.com)\/embed\//i.test(src);
  }
}

export function buildVdoViewerSrc(src) {
  if (typeof src !== 'string' || !src.trim()) {
    return src;
  }

  const requiredParams = ['cleanoutput', 'autostart', 'play', 'muted'];
  const [withoutHash, hash = ''] = src.split('#');
  const [base, query = ''] = withoutHash.split('?');
  const existingParams = new Set(
    query
      .split('&')
      .filter(Boolean)
      .map((part) => part.split('=')[0].toLowerCase())
  );
  const missingParams = requiredParams.filter((param) => !existingParams.has(param));

  if (missingParams.length === 0) {
    return src;
  }

  const nextQuery = [query, ...missingParams].filter(Boolean).join('&');
  return `${base}?${nextQuery}${hash ? `#${hash}` : ''}`;
}

export function canRenderSource(panel) {
  return Boolean(
    panel.active === true &&
      isKnownSourceType(panel.sourceType) &&
      hasConfiguredSrc(panel) &&
      !hasPlaceholderSrc(panel)
  );
}

export function sourceLabel(source, index) {
  return source.sourceId || source.sourceLabel || source.name || source.id || `source-${index + 1}`;
}

export function panelStatus(panel) {
  if (panel.active !== true) return 'inactive';
  if (!isKnownSourceType(panel.sourceType)) return 'unknown type';
  if (!hasConfiguredSrc(panel)) return 'missing src';
  if (hasPlaceholderSrc(panel)) return 'placeholder';
  return 'selected';
}

function selectRandomActiveSource(sources) {
  const activeSources = sources
    .map((source, index) => ({ source, index }))
    .filter(({ source }) => source.active === true);

  if (activeSources.length === 0) {
    return { source: null, index: -1 };
  }

  return activeSources[Math.floor(Math.random() * activeSources.length)];
}

export function normalizePanel(panel) {
  const base = {
    ...DEFAULT_SOURCE,
    ...panel,
    id: panel.id,
  };
  delete base.sources;

  if (!Array.isArray(panel.sources)) {
    return {
      ...base,
      selectedFromPool: false,
      selectedSourceIndex: null,
      selectedSourceLabel: sourceLabel(panel, 0),
      sourcePoolSize: 1,
    };
  }

  const { source, index } = selectRandomActiveSource(panel.sources);
  if (!source) {
    return {
      ...base,
      active: false,
      src: '',
      selectedFromPool: true,
      selectedSourceIndex: null,
      selectedSourceLabel: 'none',
      sourcePoolSize: panel.sources.length,
    };
  }

  return {
    ...base,
    ...source,
    id: panel.id,
    selectedFromPool: true,
    selectedSourceIndex: index,
    selectedSourceLabel: sourceLabel(source, index),
    sourcePoolSize: panel.sources.length,
  };
}

export function normalizeCameraConfig(cameras) {
  return cameras.map(normalizePanel);
}

function addTypeError(errors, path, field, expected) {
  errors.push(`${path}.${field} must be ${expected}.`);
}

function validateOptionalString(value, errors, path, field) {
  if (value !== undefined && typeof value !== 'string') {
    addTypeError(errors, path, field, 'a string');
  }
}

function validateOptionalBoolean(value, errors, path, field) {
  if (value !== undefined && typeof value !== 'boolean') {
    addTypeError(errors, path, field, 'true or false');
  }
}

function validateSource(source, path, errors, warnings) {
  if (!isObject(source)) {
    errors.push(`${path} must be an object.`);
    return;
  }

  if (!isKnownSourceType(source.sourceType)) {
    errors.push(`${path}.sourceType must be one of: ${SOURCE_TYPES.join(', ')}.`);
  }

  validateOptionalString(source.sourceId, errors, path, 'sourceId');
  validateOptionalString(source.sourceLabel, errors, path, 'sourceLabel');
  validateOptionalString(source.name, errors, path, 'name');
  validateOptionalString(source.src, errors, path, 'src');
  validateOptionalBoolean(source.active, errors, path, 'active');
  validateOptionalBoolean(source.muted, errors, path, 'muted');
  validateOptionalBoolean(source.loop, errors, path, 'loop');
  validateOptionalString(source.fallbackText, errors, path, 'fallbackText');

  if (source.visualMode !== undefined && !VISUAL_MODES.includes(source.visualMode)) {
    errors.push(`${path}.visualMode must be one of: ${VISUAL_MODES.join(', ')}.`);
  }

  if (source.cropMode !== undefined && !CROP_MODES.includes(source.cropMode)) {
    errors.push(`${path}.cropMode must be one of: ${CROP_MODES.join(', ')}.`);
  }

  if (typeof source.src === 'string' && source.src.includes(PLACEHOLDER_TOKEN)) {
    warnings.push(`${path}.src still contains ${PLACEHOLDER_TOKEN}.`);
  }

  if (source.sourceType === 'embed') {
    warnings.push(
      `${path} is a publicly available webcam/live camera embed. Confirm it does not show private spaces or identifiable people.`
    );
  }
}

function validatePanel(panel, index, errors, warnings) {
  const expectedId = EXPECTED_PANEL_IDS[index];
  const path = `panel[${index}]`;

  if (!isObject(panel)) {
    errors.push(`${path} must be an object.`);
    return;
  }

  if (panel.id !== expectedId) {
    errors.push(`${path}.id must be "${expectedId}".`);
  }

  validateOptionalString(panel.fallbackText, errors, path, 'fallbackText');

  if (panel.visualMode !== undefined && !VISUAL_MODES.includes(panel.visualMode)) {
    errors.push(`${path}.visualMode must be one of: ${VISUAL_MODES.join(', ')}.`);
  }

  if (panel.cropMode !== undefined && !CROP_MODES.includes(panel.cropMode)) {
    errors.push(`${path}.cropMode must be one of: ${CROP_MODES.join(', ')}.`);
  }

  if (panel.sources !== undefined) {
    if (!Array.isArray(panel.sources)) {
      errors.push(`${path}.sources must be an array when present.`);
      return;
    }

    if (panel.sources.length === 0) {
      warnings.push(`${path}.sources is empty; the panel will show its fallback state.`);
    }

    panel.sources.forEach((source, sourceIndex) => {
      validateSource(source, `${path}.sources[${sourceIndex}]`, errors, warnings);
    });
    return;
  }

  validateSource(panel, path, errors, warnings);
}

export function validateCameraConfigDetailed(value) {
  const errors = [];
  const warnings = [];

  if (!Array.isArray(value)) {
    return {
      valid: false,
      errors: ['Camera config must be an array.'],
      warnings,
    };
  }

  if (value.length !== EXPECTED_PANEL_IDS.length) {
    errors.push(`Camera config must contain exactly ${EXPECTED_PANEL_IDS.length} panels.`);
  }

  EXPECTED_PANEL_IDS.forEach((_, index) => {
    validatePanel(value[index], index, errors, warnings);
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function isValidCameraConfig(value) {
  return validateCameraConfigDetailed(value).valid;
}

export function makeDefaultPanel(id) {
  return {
    id,
    ...DEFAULT_SOURCE,
    fallbackText:
      id === 'space'
        ? 'The recording is absent.'
        : id === 'trace'
          ? 'The distant image is unavailable.'
          : DEFAULT_SOURCE.fallbackText,
    visualMode: id === 'object' ? 'slow-zoom' : id === 'trace' ? 'ghosted' : 'normal',
    cropMode: 'cover',
  };
}

export function makeDefaultConfig() {
  return EXPECTED_PANEL_IDS.map(makeDefaultPanel);
}
