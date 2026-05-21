import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import exhibition from './data/exhibition.json';
import fallbackCameras from './data/fallbackCameras';
import './styles.css';

const INACTIVITY_DELAY = 2600;
const PLACEHOLDER_TOKEN = 'REPLACE_';
const EXPECTED_CAMERA_IDS = ['object', 'space', 'trace'];

function isValidCameraConfig(value) {
  if (!Array.isArray(value) || value.length !== EXPECTED_CAMERA_IDS.length) {
    return false;
  }

  return EXPECTED_CAMERA_IDS.every((id, index) => value[index]?.id === id);
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

function getPanelClass(camera) {
  return [
    'triptych-panel',
    `panel-${camera.id}`,
    `mode-${camera.visualMode || 'normal'}`,
    `crop-${camera.cropMode || 'cover'}`,
    camera.id === 'space' ? 'is-dominant' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

function canShowFeed(camera) {
  return Boolean(
    camera.active &&
      hasConfiguredUrl(camera) &&
      !hasPlaceholderUrl(camera)
  );
}

function hasConfiguredUrl(camera) {
  return Boolean(camera.vdoNinjaViewUrl?.trim());
}

function hasPlaceholderUrl(camera) {
  return Boolean(camera.vdoNinjaViewUrl?.includes(PLACEHOLDER_TOKEN));
}

function Panel({ camera, fragment, panelLabel, labelsEnabled, fragmentsEnabled, isOnline }) {
  const showLabel = labelsEnabled && camera.labelVisible;
  const showFeed = isOnline && canShowFeed(camera);
  const fallbackText = isOnline ? camera.fallbackText : camera.offlineText;

  return (
    <section className={getPanelClass(camera)} aria-label={`${camera.role}: ${camera.title}`}>
      <div className="feed-layer" aria-hidden={!showFeed}>
        {showFeed ? (
          <iframe
            className="vdo-frame"
            title={`${camera.title} live feed`}
            src={camera.vdoNinjaViewUrl}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            referrerPolicy="no-referrer"
          />
        ) : null}
      </div>

      {!showFeed ? (
        <div className="fallback-state">
          <span>{camera.subtitle}</span>
          <strong>{fallbackText}</strong>
        </div>
      ) : null}

      <div className="panel-shade" />

      {showLabel ? (
        <div className="panel-label">
          <span>{camera.subtitle}</span>
          <strong>{panelLabel || camera.role}</strong>
          <small>{camera.locationLabel}</small>
        </div>
      ) : null}

      {fragmentsEnabled && fragment ? (
        <p className="text-fragment">{fragment}</p>
      ) : null}
    </section>
  );
}

function DebugOverlay({
  cameras,
  configError,
  configSource,
  labelsEnabled,
  fragmentsEnabled,
  installMode,
  browserFullscreen,
  isOnline,
}) {
  const placeholderCameras = cameras.filter(hasPlaceholderUrl);

  return (
    <aside className="debug-overlay" aria-label="Configuration overlay">
      <h2>Configuration</h2>
      <dl>
        <div>
          <dt>Panels</dt>
          <dd>{cameras.length}</dd>
        </div>
        <div>
          <dt>Labels</dt>
          <dd>{labelsEnabled ? 'visible' : 'hidden'}</dd>
        </div>
        <div>
          <dt>Text</dt>
          <dd>{fragmentsEnabled ? 'visible' : 'hidden'}</dd>
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
        <div>
          <dt>Camera config</dt>
          <dd>{configSource === 'runtime' ? 'runtime config' : 'internal fallback'}</dd>
        </div>
      </dl>
      <p>{exhibition.setupNote}</p>
      {configError ? (
        <p className="debug-warning">{configError}</p>
      ) : null}
      {placeholderCameras.length > 0 ? (
        <p className="debug-warning">
          Placeholder feed URL still configured for: {placeholderCameras.map((camera) => camera.id).join(', ')}.
        </p>
      ) : null}
      <ul>
        {cameras.map((camera) => (
          <li key={camera.id}>
            <span>{camera.id}</span>
            <strong>{canShowFeed(camera) ? camera.visualMode : 'fallback'}</strong>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function App() {
  const [cameras, setCameras] = useState(fallbackCameras);
  const [configSource, setConfigSource] = useState('internal-fallback');
  const [configError, setConfigError] = useState('');
  const [labelsEnabled, setLabelsEnabled] = useState(true);
  const [fragmentsEnabled, setFragmentsEnabled] = useState(true);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [installMode, setInstallMode] = useState(true);
  const [overlayEnabled, setOverlayEnabled] = useState(true);
  const [cursorHidden, setCursorHidden] = useState(false);
  const [browserFullscreen, setBrowserFullscreen] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  const fragmentsByPanel = useMemo(() => {
    return exhibition.textFragments.reduce((map, fragment) => {
      map[fragment.panel] = fragment.text;
      return map;
    }, {});
  }, []);

  useEffect(() => {
    let isMounted = true;

    loadCameraConfig()
      .then((runtimeCameras) => {
        if (!isMounted) return;
        setCameras(runtimeCameras);
        setConfigSource('runtime');
        setConfigError('');
      })
      .catch((error) => {
        if (!isMounted) return;
        setCameras(fallbackCameras);
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
      if (key === 'l') setLabelsEnabled((value) => !value);
      if (key === 't') setFragmentsEnabled((value) => !value);
      if (key === 'd') setDebugEnabled((value) => !value);
      if (key === 'o') setOverlayEnabled((value) => !value);
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
      <div className="triptych" aria-label={exhibition.title}>
        {cameras.map((camera) => (
          <Panel
            key={camera.id}
            camera={camera}
            fragment={fragmentsByPanel[camera.id]}
            panelLabel={exhibition.triptychLabels[camera.id]}
            labelsEnabled={labelsEnabled}
            fragmentsEnabled={fragmentsEnabled}
            isOnline={isOnline}
          />
        ))}
      </div>

      {overlayEnabled ? (
        <header className="work-overlay">
          <div>
            <p>{exhibition.subtitle}</p>
            <h1>{exhibition.title}</h1>
          </div>
          <p className="privacy-note">{exhibition.privacyNote}</p>
        </header>
      ) : null}

      {debugEnabled ? (
        <DebugOverlay
          cameras={cameras}
          configError={configError}
          configSource={configSource}
          labelsEnabled={labelsEnabled}
          fragmentsEnabled={fragmentsEnabled}
          installMode={installMode}
          browserFullscreen={browserFullscreen}
          isOnline={isOnline}
        />
      ) : null}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
