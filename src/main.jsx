import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import cameras from './data/cameras.json';
import exhibition from './data/exhibition.json';
import './styles.css';

const INACTIVITY_DELAY = 2600;

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
  return Boolean(camera.active && camera.vdoNinjaViewUrl);
}

function Panel({ camera, fragment, panelLabel, labelsEnabled, fragmentsEnabled }) {
  const showLabel = labelsEnabled && camera.labelVisible;
  const showFeed = canShowFeed(camera);

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
          <strong>{camera.fallbackText}</strong>
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

function DebugOverlay({ labelsEnabled, fragmentsEnabled, installMode }) {
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
      </dl>
      <p>{exhibition.setupNote}</p>
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
  const [labelsEnabled, setLabelsEnabled] = useState(true);
  const [fragmentsEnabled, setFragmentsEnabled] = useState(true);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [installMode, setInstallMode] = useState(true);
  const [overlayEnabled, setOverlayEnabled] = useState(true);
  const [cursorHidden, setCursorHidden] = useState(false);

  const fragmentsByPanel = useMemo(() => {
    return exhibition.textFragments.reduce((map, fragment) => {
      map[fragment.panel] = fragment.text;
      return map;
    }, {});
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      const key = event.key.toLowerCase();
      if (key === 'f') setInstallMode((value) => !value);
      if (key === 'l') setLabelsEnabled((value) => !value);
      if (key === 't') setFragmentsEnabled((value) => !value);
      if (key === 'd') setDebugEnabled((value) => !value);
      if (key === 'o') setOverlayEnabled((value) => !value);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
          labelsEnabled={labelsEnabled}
          fragmentsEnabled={fragmentsEnabled}
          installMode={installMode}
        />
      ) : null}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
