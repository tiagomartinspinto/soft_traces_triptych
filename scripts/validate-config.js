import { readFile } from 'node:fs/promises';
import { PLACEHOLDER_TOKEN, validateCameraConfigDetailed } from '../src/lib/cameraConfig.js';

const configUrl = new URL('../public/config/cameras.json', import.meta.url);
const rawConfig = await readFile(configUrl, 'utf8');
const errors = [];
const warnings = [];
let config;

try {
  config = JSON.parse(rawConfig);
} catch (error) {
  console.error('Camera config validation failed: public/config/cameras.json is not valid JSON.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

const structuralValidation = validateCameraConfigDetailed(config);
errors.push(...structuralValidation.errors);
warnings.push(...structuralValidation.warnings);

function isVdoNinjaSrc(src) {
  return /(^|\/\/)([^/]+\.)?vdo\.ninja(\/|\?|$)/i.test(src);
}

function hasForbiddenVdoQuery(src) {
  try {
    const url = new URL(src);
    const params = url.searchParams;
    if (params.has('pw') || params.has('password') || params.has('push')) return true;

    const view = params.get('view');
    return Boolean(view && !view.includes(PLACEHOLDER_TOKEN));
  } catch {
    return /[?&](pw|password|push)=/i.test(src) || /[?&]view=(?![^&]*REPLACE_)[^&]+/i.test(src);
  }
}

function visitSources(panel, panelIndex, visitor) {
  if (!panel || typeof panel !== 'object') return;

  if (Array.isArray(panel.sources)) {
    panel.sources.forEach((source, sourceIndex) => {
      visitor(source, `panel[${panelIndex}].sources[${sourceIndex}]`);
    });
    return;
  }

  visitor(panel, `panel[${panelIndex}]`);
}

if (Array.isArray(config)) {
  config.forEach((panel, panelIndex) => {
    visitSources(panel, panelIndex, (source, sourcePath) => {
      const src = typeof source?.src === 'string' ? source.src.trim() : '';

      if (source?.active === true) {
        errors.push(`${sourcePath} must remain inactive in committed public config.`);
      }

      if (src && !src.includes(PLACEHOLDER_TOKEN)) {
        errors.push(`${sourcePath}.src must be empty or contain ${PLACEHOLDER_TOKEN} in committed public config.`);
      }

      if (src.includes(PLACEHOLDER_TOKEN) && source?.active === true) {
        errors.push(`${sourcePath} contains a placeholder source but is active.`);
      }

      if (isVdoNinjaSrc(src) && hasForbiddenVdoQuery(src)) {
        errors.push(`${sourcePath}.src contains real-looking VDO.Ninja source details.`);
      }
    });
  });
}

if (warnings.length > 0) {
  console.warn('Camera config warnings:');
  warnings.forEach((warning) => console.warn(`- ${warning}`));
}

if (errors.length > 0) {
  console.error('Camera config validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Camera config validation passed.');
