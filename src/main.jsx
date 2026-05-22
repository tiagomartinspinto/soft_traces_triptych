import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import exhibition from './data/exhibition.json';
import fallbackCameras from './data/fallbackCameras';
import './styles.css';

const INACTIVITY_DELAY = 2600;
const PLACEHOLDER_TOKEN = 'REPLACE_';
const EXPECTED_PANEL_IDS = ['object', 'space', 'trace'];
const SOURCE_TYPES = new Set(['vdo', 'video', 'embed']);

const DEFAULT_SOURCE = {
  sourceType: 'vdo',
  src: '',
  active: false,
  muted: true,
  loop: true,
  fallbackText: 'The surface is silent.',
  visualMode: 'normal',
  cropMode: 'cover',
};

function isObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function isKnownSourceType(sourceType) {
  return SOURCE_TYPES.has(sourceType);
}

function hasSourceShape(source) {
  return isObject(source) && isKnownSourceType(source.sourceType);
}

function isValidCameraConfig(value) {
  if (!Array.isArray(value) || value.length !== EXPECTED_PANEL_IDS.length) {
    return false;
  }

  return EXPECTED_PANEL_IDS.every((id, index) => {
    const panel = value[index];
    if (!isObject(panel) || panel.id !== id) return false;
    if (Array.isArray(panel.sources)) {
      return panel.sources.every(hasSourceShape);
    }
    return hasSourceShape(panel);
  });
}

async function loadCameraConfig() {
  const response = await fetch(`${import.meta.env.BASE_URL}config/cameras.json`, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`Camera config request failed: ${response.status}`);
  }

  const cameras = await response.json();
  if (!isValidCameraConfig(cameras)) {
    throw new Error('Camera config must contain object, space, and trace panels in order.');
  }

  return cameras;
}

function sourceLabel(source, index) {
  return source.sourceId || source.sourceLabel || source.name || source.id || `source-${index + 1}`;
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

function normalizePanel(panel) {
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

function normalizeCameraConfig(cameras) {
  return cameras.map(normalizePanel);
}

function hasConfiguredSrc(panel) {
  return Boolean(panel.src?.trim());
}

function hasPlaceholderSrc(panel) {
  return Boolean(panel.src?.includes(PLACEHOLDER_TOKEN));
}

function canRenderSource(panel) {
  return Boolean(
    panel.active === true &&
      isKnownSourceType(panel.sourceType) &&
      hasConfiguredSrc(panel) &&
      !hasPlaceholderSrc(panel)
  );
}

function panelStatus(panel) {
  if (panel.active !== true) return 'inactive';
  if (!isKnownSourceType(panel.sourceType)) return 'unknown type';
  if (!hasConfiguredSrc(panel)) return 'missing src';
  if (hasPlaceholderSrc(panel)) return 'placeholder';
  return 'selected';
}

function getPanelClass(panel) {
  return [
    'triptych-panel',
    `panel-${panel.id}`,
    `mode-${panel.visualMode || 'normal'}`,
    `crop-${panel.cropMode || 'cover'}`,
    panel.id === 'space' ? 'is-dominant' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

function Source({ panel, onMediaError }) {
  if (panel.sourceType === 'video') {
    return (
      <video
        className="media-frame video-frame"
        src={panel.src}
        autoPlay
        muted={panel.muted !== false}
        loop={panel.loop !== false}
        playsInline
        onError={onMediaError}
      />
    );
  }

  return (
    <iframe
      className={`media-frame iframe-frame ${panel.sourceType}-frame`}
      title={`${panel.id} ${panel.sourceType} source`}
      src={panel.src}
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      referrerPolicy="no-referrer"
    />
  );
}

function Panel({ panel }) {
  const [mediaFailed, setMediaFailed] = useState(false);

  useEffect(() => {
    setMediaFailed(false);
  }, [panel.src, panel.sourceType]);

  const showSource = canRenderSource(panel) && !mediaFailed;

  return (
    <section className={getPanelClass(panel)} aria-label={`Triptych panel ${panel.id}`}>
      <div className="feed-layer" aria-hidden={!showSource}>
        {showSource ? <Source panel={panel} onMediaError={() => setMediaFailed(true)} /> : null}
      </div>

      {!showSource ? (
        <div className="fallback-state">
          <span>{panel.fallbackText || DEFAULT_SOURCE.fallbackText}</span>
        </div>
      ) : null}

      <div className="panel-shade" />
    </section>
  );
}

function sourceSummary(panel) {
  const poolDetail =
    panel.selectedFromPool && panel.selectedSourceIndex !== null
      ? `pool ${panel.selectedSourceIndex + 1}/${panel.sourcePoolSize}`
      : panel.selectedFromPool
        ? `pool none/${panel.sourcePoolSize}`
        : 'single';

  return `${panel.sourceType || 'none'} / ${poolDetail} / ${panelStatus(panel)}`;
}

function DebugOverlay({ panels, configError, configSource, installMode, browserFullscreen, isOnline }) {
  return (
    <aside className="debug-overlay" aria-label="Configuration overlay">
      <h2>Debug</h2>
      <dl>
        <div>
          <dt>Panels</dt>
          <dd>{panels.length}</dd>
        </div>
        <div>
          <dt>Config</dt>
          <dd>{configSource === 'runtime' ? 'runtime config' : 'internal fallback'}</dd>
        </div>
        <div>
          <dt>Install mode</dt>
          <dd>{installMode ? 'on' : 'off'}</dd>
        </div>
        <div>
          <dt>Browser fullscreen</dt>
          <dd>{browserFullscreen ? 'on' : 'off'}</dd>
        </div>
        <div>
          <dt>Network</dt>
          <dd>{isOnline ? 'online' : 'offline'}</dd>
        </div>
      </dl>

      {configError ? <p className="debug-warning">{configError}</p> : null}

      <ul>
        {panels.map((panel) => (
          <li key={panel.id}>
            <span>{panel.id}</span>
            <strong>{sourceSummary(panel)}</strong>
            <small>{panel.selectedSourceLabel}</small>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function App() {
  const [panels, setPanels] = useState(() => normalizeCameraConfig(fallbackCameras));
  const [configSource, setConfigSource] = useState('internal-fallback');
  const [configError, setConfigError] = useState('');
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [installMode, setInstallMode] = useState(true);
  const [cursorHidden, setCursorHidden] = useState(false);
  const [browserFullscreen, setBrowserFullscreen] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    let isMounted = true;

    loadCameraConfig()
      .then((runtimeCameras) => {
        if (!isMounted) return;
        setPanels(normalizeCameraConfig(runtimeCameras));
        setConfigSource('runtime');
        setConfigError('');
      })
      .catch((error) => {
        if (!isMounted) return;
        setPanels(normalizeCameraConfig(fallbackCameras));
        setConfigSource('internal-fallback');
        setConfigError(error instanceof Error ? error.message : 'Camera config could not be loaded.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    async function toggleFullscreenStyle() {
      const isFullscreen = Boolean(document.fullscreenElement);
      const canRequestFullscreen = Boolean(document.documentElement.requestFullscreen);
      const canExitFullscreen = Boolean(document.exitFullscreen);

      if (!isFullscreen && canRequestFullscreen) {
        setInstallMode(true);
        try {
          await document.documentElement.requestFullscreen();
        } catch {
          setInstallMode((value) => !value);
        }
        return;
      }

      if (isFullscreen && canExitFullscreen) {
        try {
          await document.exitFullscreen();
        } catch {
          // Keep the visual install mode controllable even when browser fullscreen refuses to exit.
        } finally {
          setInstallMode(false);
        }
        return;
      }

      setInstallMode((value) => !value);
    }

    function handleKeyDown(event) {
      const key = event.key.toLowerCase();
      if (key === 'f') toggleFullscreenStyle();
      if (key === 'd') setDebugEnabled((value) => !value);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    function syncFullscreenState() {
      setBrowserFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener('fullscreenchange', syncFullscreenState);
    syncFullscreenState();

    return () => document.removeEventListener('fullscreenchange', syncFullscreenState);
  }, []);

  useEffect(() => {
    function markOnline() {
      setIsOnline(true);
    }

    function markOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', markOnline);
    window.addEventListener('offline', markOffline);

    return () => {
      window.removeEventListener('online', markOnline);
      window.removeEventListener('offline', markOffline);
    };
  }, []);

  useEffect(() => {
    let timerId;

    function showCursorTemporarily() {
      setCursorHidden(false);
      window.clearTimeout(timerId);
      if (installMode) {
        timerId = window.setTimeout(() => setCursorHidden(true), INACTIVITY_DELAY);
      }
    }

    showCursorTemporarily();
    window.addEventListener('mousemove', showCursorTemporarily);
    window.addEventListener('touchstart', showCursorTemporarily);

    return () => {
      window.clearTimeout(timerId);
      window.removeEventListener('mousemove', showCursorTemporarily);
      window.removeEventListener('touchstart', showCursorTemporarily);
    };
  }, [installMode]);

  return (
    <main className={`installation ${installMode ? 'install-mode' : ''} ${cursorHidden ? 'hide-cursor' : ''}`}>
      <div className="triptych" aria-label="Soft Traces triptych">
        {panels.map((panel) => (
          <Panel key={panel.id} panel={panel} />
        ))}
      </div>

      <p className="work-sentence">{exhibition.sentence}</p>

      {debugEnabled ? (
        <DebugOverlay
          panels={panels}
          configError={configError}
          configSource={configSource}
          installMode={installMode}
          browserFullscreen={browserFullscreen}
          isOnline={isOnline}
        />
      ) : null}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
