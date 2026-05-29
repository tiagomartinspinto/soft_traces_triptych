import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import exhibition from './data/exhibition.json';
import fallbackCameras from './data/fallbackCameras';
import {
  CROP_MODES,
  DEFAULT_SOURCE,
  EXPECTED_PANEL_IDS,
  SOURCE_TYPES,
  VISUAL_MODES,
  buildVdoViewerSrc,
  canRenderSource,
  cloneConfig,
  hasPlaceholderSrc,
  isValidCameraConfig,
  isYouTubeEmbed,
  normalizeCameraConfig,
  panelStatus,
  validateCameraConfigDetailed,
} from './lib/cameraConfig';
import './styles.css';

const INACTIVITY_DELAY = 2600;
const API_CONFIG_PATH = '/api/config/cameras';
const BASE_URL = import.meta.env.BASE_URL || '/';
const LOCAL_SETUP_HOSTS = new Set(['localhost', '127.0.0.1']);

function joinBasePath(path = '') {
  const base = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
  return path ? `${base}${path}` : base;
}

function getRouteFromLocation() {
  const queryRoute = new URLSearchParams(window.location.search).get('route');
  if (queryRoute === '/editor' || queryRoute === 'editor') return 'editor';

  const currentPath = window.location.pathname.replace(/\/+$/, '');
  const editorPath = joinBasePath('editor').replace(/\/+$/, '');
  return currentPath === editorPath ? 'editor' : 'artwork';
}

function isLocalSetupHost() {
  return LOCAL_SETUP_HOSTS.has(window.location.hostname);
}

function makeArtworkUrl(configUpdated) {
  const artworkUrl = new URL(joinBasePath(), window.location.origin);
  if (configUpdated) {
    artworkUrl.searchParams.set('configUpdated', String(configUpdated));
  }
  return artworkUrl.toString();
}

function LocalOnlyEditorNotice() {
  return (
    <main className="local-only-editor" aria-label="Local editor unavailable">
      <p>Local source editor is available only during local setup.</p>
    </main>
  );
}

async function loadRuntimeCameraConfig() {
  const response = await fetch(`${BASE_URL}config/cameras.json`, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`Camera config request failed: ${response.status}`);
  }

  const cameras = await response.json();
  if (!isValidCameraConfig(cameras)) {
    throw new Error('Camera config must contain object, space, and trace panels in order.');
  }

  return cameras;
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
  const sourceSrc = panel.sourceType === 'vdo' ? buildVdoViewerSrc(panel.src) : panel.src;

  if (panel.sourceType === 'video') {
    return (
      <video
        className="media-frame video-frame"
        src={sourceSrc}
        autoPlay
        muted={panel.muted !== false}
        loop={panel.loop !== false}
        playsInline
        onError={onMediaError}
      />
    );
  }

  const isYouTubeSource = panel.sourceType === 'embed' && isYouTubeEmbed(sourceSrc);

  return (
    <iframe
      className={`media-frame iframe-frame ${panel.sourceType}-frame`}
      title={`${panel.id} ${panel.sourceType} source`}
      src={sourceSrc}
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      referrerPolicy={isYouTubeSource ? 'strict-origin-when-cross-origin' : 'no-referrer'}
      allowFullScreen={isYouTubeSource}
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

function ArtworkPage() {
  const canShowSourcesButton = isLocalSetupHost();
  const [panels, setPanels] = useState(() => normalizeCameraConfig(fallbackCameras));
  const [configSource, setConfigSource] = useState('internal-fallback');
  const [configError, setConfigError] = useState('');
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [installMode, setInstallMode] = useState(true);
  const [cursorHidden, setCursorHidden] = useState(false);
  const [browserFullscreen, setBrowserFullscreen] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [setupPromptVisible, setSetupPromptVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadRuntimeCameraConfig()
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
      if (key === 'd' && canShowSourcesButton) setDebugEnabled((value) => !value);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canShowSourcesButton]);

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

  useEffect(() => {
    if (!setupPromptVisible) return undefined;

    const timerId = window.setTimeout(() => setSetupPromptVisible(false), 7600);
    return () => window.clearTimeout(timerId);
  }, [setupPromptVisible]);

  function showSetupPrompt() {
    setSetupPromptVisible(true);
  }

  return (
    <main className={`installation ${installMode ? 'install-mode' : ''} ${cursorHidden ? 'hide-cursor' : ''}`}>
      <div className="triptych" aria-label="Soft Traces triptych">
        {panels.map((panel) => (
          <Panel key={panel.id} panel={panel} />
        ))}
      </div>

      <p className="work-sentence">{exhibition.sentence}</p>

      {canShowSourcesButton ? (
        <a
          className="sources-button"
          href={joinBasePath('editor')}
          target="_blank"
          rel="noreferrer"
          onClick={showSetupPrompt}
        >
          sources
        </a>
      ) : null}

      {canShowSourcesButton && setupPromptVisible ? (
        <div className="setup-prompt" role="status" aria-live="polite">
          <span>For local saving, run in Terminal:</span>
          <code>npm install</code>
          <code>npm run local</code>
        </div>
      ) : null}

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

function makePreviewPanel(panel) {
  const base = {
    ...DEFAULT_SOURCE,
    ...panel,
    id: panel.id,
  };
  delete base.sources;

  if (!Array.isArray(panel.sources)) {
    return base;
  }

  const renderable = panel.sources.find((source) => canRenderSource({ ...base, ...source }));
  const firstSource = renderable || panel.sources[0];

  if (!firstSource) {
    return {
      ...base,
      active: false,
      src: '',
    };
  }

  return {
    ...base,
    ...firstSource,
    id: panel.id,
  };
}

function PanelPreview({ panel }) {
  const previewPanel = useMemo(() => makePreviewPanel(panel), [panel]);
  const [mediaFailed, setMediaFailed] = useState(false);
  const showSource = canRenderSource(previewPanel) && !mediaFailed;

  useEffect(() => {
    setMediaFailed(false);
  }, [previewPanel.src, previewPanel.sourceType]);

  return (
    <div className={`editor-preview crop-${previewPanel.cropMode || 'cover'}`} aria-label={`${panel.id} preview`}>
      {showSource ? <Source panel={previewPanel} onMediaError={() => setMediaFailed(true)} /> : null}
      {!showSource ? (
        <div className="editor-preview-fallback">
          <span>{previewPanel.fallbackText || panel.fallbackText || DEFAULT_SOURCE.fallbackText}</span>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`editor-field ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function ToggleField({ label, checked, onChange }) {
  return (
    <label className="editor-check">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function SourceFields({ source, onChange, isPoolSource }) {
  return (
    <div className="source-fields">
      {isPoolSource ? (
        <Field label="source id">
          <input
            value={source.sourceId || ''}
            onChange={(event) => onChange('sourceId', event.target.value)}
            placeholder="optional-source-name"
          />
        </Field>
      ) : null}

      <Field label="type">
        <select value={source.sourceType || 'vdo'} onChange={(event) => onChange('sourceType', event.target.value)}>
          {SOURCE_TYPES.map((sourceType) => (
            <option key={sourceType} value={sourceType}>
              {sourceType}
            </option>
          ))}
        </select>
      </Field>

      <ToggleField label="active" checked={source.active === true} onChange={(value) => onChange('active', value)} />

      {source.sourceType === 'video' ? (
        <>
          <ToggleField
            label="muted"
            checked={source.muted !== false}
            onChange={(value) => onChange('muted', value)}
          />
          <ToggleField label="loop" checked={source.loop !== false} onChange={(value) => onChange('loop', value)} />
        </>
      ) : null}

      <Field label="src" className="field-wide">
        <textarea
          rows="3"
          value={source.src || ''}
          onChange={(event) => onChange('src', event.target.value)}
          placeholder={
            source.sourceType === 'video'
              ? `${joinBasePath('media/example-loop.mp4')}`
              : source.sourceType === 'embed'
                ? 'https://example-public-webcam-embed-url'
                : 'https://vdo.ninja/?view=STREAM_ID&cleanoutput'
          }
        />
      </Field>

      {hasPlaceholderSrc(source) ? <p className="editor-warning">This source still contains REPLACE_.</p> : null}
      {source.sourceType === 'embed' ? (
        <p className="editor-warning">
          Use only manually selected publicly available webcam/live camera feeds that do not show private spaces or
          identifiable people.
        </p>
      ) : null}
    </div>
  );
}

function PanelEditor({ panel, panelIndex, onPanelChange, onSourceChange, onModeChange, onAddSource, onRemoveSource }) {
  const usesPool = Array.isArray(panel.sources);

  return (
    <section className="editor-panel">
      <div className="editor-panel-heading">
        <div>
          <p className="editor-kicker">panel {panelIndex + 1}</p>
          <h2>{panel.id}</h2>
        </div>
        <Field label="mode">
          <select value={usesPool ? 'pool' : 'single'} onChange={(event) => onModeChange(panelIndex, event.target.value)}>
            <option value="single">single source</option>
            <option value="pool">source pool</option>
          </select>
        </Field>
      </div>

      <PanelPreview panel={panel} />

      <div className="panel-defaults">
        <Field label="fallback text" className="field-wide">
          <input
            value={panel.fallbackText || ''}
            onChange={(event) => onPanelChange(panelIndex, 'fallbackText', event.target.value)}
          />
        </Field>

        <Field label="visual mode">
          <select
            value={panel.visualMode || 'normal'}
            onChange={(event) => onPanelChange(panelIndex, 'visualMode', event.target.value)}
          >
            {VISUAL_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </Field>

        <Field label="crop">
          <select value={panel.cropMode || 'cover'} onChange={(event) => onPanelChange(panelIndex, 'cropMode', event.target.value)}>
            {CROP_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {!usesPool ? (
        <SourceFields
          source={panel}
          onChange={(field, value) => onPanelChange(panelIndex, field, value)}
          isPoolSource={false}
        />
      ) : (
        <div className="source-pool">
          <div className="pool-heading">
            <p>{panel.sources.length} sources</p>
            <button type="button" onClick={() => onAddSource(panelIndex)}>
              add source
            </button>
          </div>

          <p className="editor-warning">
            Artwork randomly selects one active source from this pool on page load. For testing, use single source or
            deactivate other pool sources.
          </p>

          {panel.sources.map((source, sourceIndex) => (
            <article className="pool-source" key={`${panel.id}-${sourceIndex}`}>
              <div className="pool-source-heading">
                <h3>{source.sourceId || `source ${sourceIndex + 1}`}</h3>
                <button type="button" onClick={() => onRemoveSource(panelIndex, sourceIndex)}>
                  remove
                </button>
              </div>
              <SourceFields
                source={source}
                onChange={(field, value) => onSourceChange(panelIndex, sourceIndex, field, value)}
                isPoolSource
              />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function EditorPage({ navigate }) {
  const [config, setConfig] = useState(() => cloneConfig(fallbackCameras));
  const [configSource, setConfigSource] = useState('internal fallback');
  const [apiAvailable, setApiAvailable] = useState(false);
  const [editorTheme, setEditorTheme] = useState('dark');
  const [notice, setNotice] = useState('Checking local save server.');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const fileInputRef = useRef(null);
  const validation = useMemo(() => validateCameraConfigDetailed(config), [config]);
  const editablePanels = Array.isArray(config) ? config : [];

  useEffect(() => {
    let isMounted = true;

    async function loadConfig() {
      setIsLoading(true);

      try {
        const apiResponse = await fetch(API_CONFIG_PATH, { cache: 'no-cache' });
        if (!apiResponse.ok) {
          throw new Error(`Local API unavailable: ${apiResponse.status}`);
        }
        const apiConfig = await apiResponse.json();
        const apiValidation = validateCameraConfigDetailed(apiConfig);
        if (!apiValidation.valid) {
          throw new Error(apiValidation.errors.join(' '));
        }
        if (!isMounted) return;
        setConfig(apiConfig);
        setConfigSource('local editor server');
        setApiAvailable(true);
        setNotice('Local save server connected. Saving writes to public/config/cameras.json.');
        return;
      } catch {
        if (!isMounted) return;
        setApiAvailable(false);
        setNotice('Local save server unavailable. Import and export still work; run npm run local to enable saving.');
      }

      try {
        const runtimeConfig = await loadRuntimeCameraConfig();
        if (!isMounted) return;
        setConfig(runtimeConfig);
        setConfigSource('runtime config');
      } catch (error) {
        if (!isMounted) return;
        setConfig(cloneConfig(fallbackCameras));
        setConfigSource('internal fallback');
        setNotice(
          `Local save server unavailable. Runtime config could not load, so the editor opened the internal fallback. ${
            error instanceof Error ? error.message : ''
          }`
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadConfig().finally(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  function updatePanel(panelIndex, updater) {
    setLastSavedAt(null);
    setConfig((currentConfig) =>
      currentConfig.map((panel, index) => {
        if (index !== panelIndex) return panel;
        return updater(cloneConfig(panel));
      })
    );
  }

  function handlePanelChange(panelIndex, field, value) {
    updatePanel(panelIndex, (panel) => ({
      ...panel,
      [field]: value,
    }));
  }

  function handleSourceChange(panelIndex, sourceIndex, field, value) {
    updatePanel(panelIndex, (panel) => ({
      ...panel,
      sources: panel.sources.map((source, index) => (index === sourceIndex ? { ...source, [field]: value } : source)),
    }));
  }

  function handleModeChange(panelIndex, mode) {
    updatePanel(panelIndex, (panel) => {
      if (mode === 'pool') {
        if (Array.isArray(panel.sources)) return panel;
        const { id, sources, ...directSource } = panel;
        return {
          id,
          fallbackText: panel.fallbackText || DEFAULT_SOURCE.fallbackText,
          visualMode: panel.visualMode || DEFAULT_SOURCE.visualMode,
          cropMode: panel.cropMode || DEFAULT_SOURCE.cropMode,
          sources: [
            {
              sourceId: `${id}-source-1`,
              ...directSource,
            },
          ],
        };
      }

      const firstSource = Array.isArray(panel.sources) ? panel.sources[0] : panel;
      const nextPanel = {
        ...DEFAULT_SOURCE,
        ...panel,
        ...firstSource,
        id: panel.id,
        fallbackText: firstSource?.fallbackText || panel.fallbackText || DEFAULT_SOURCE.fallbackText,
        visualMode: firstSource?.visualMode || panel.visualMode || DEFAULT_SOURCE.visualMode,
        cropMode: firstSource?.cropMode || panel.cropMode || DEFAULT_SOURCE.cropMode,
      };
      delete nextPanel.sources;
      delete nextPanel.sourceId;
      return nextPanel;
    });
  }

  function handleAddSource(panelIndex) {
    updatePanel(panelIndex, (panel) => ({
      ...panel,
      sources: [
        ...(panel.sources || []),
        {
          sourceId: `${panel.id}-source-${(panel.sources || []).length + 1}`,
          sourceType: 'vdo',
          src: '',
          active: false,
          fallbackText: panel.fallbackText || DEFAULT_SOURCE.fallbackText,
        },
      ],
    }));
  }

  function handleRemoveSource(panelIndex, sourceIndex) {
    updatePanel(panelIndex, (panel) => ({
      ...panel,
      sources: panel.sources.filter((_, index) => index !== sourceIndex),
    }));
  }

  async function handleSave() {
    if (!apiAvailable || !validation.valid) return;
    setIsSaving(true);
    setNotice('Saving local camera config.');

    try {
      const response = await fetch(API_CONFIG_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || 'Save failed.');
      }
      const savedAt = Date.now();
      setLastSavedAt(savedAt);
      setNotice('Saved to public/config/cameras.json. Refresh the artwork tab or open refreshed artwork.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Save failed.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleExport() {
    const blob = new Blob([`${JSON.stringify(config, null, 2)}\n`], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'cameras.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice('Exported cameras.json.');
  }

  async function handleImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsedConfig = JSON.parse(text);
      setConfig(parsedConfig);
      setLastSavedAt(null);
      const result = validateCameraConfigDetailed(parsedConfig);
      setNotice(result.valid ? 'Imported JSON.' : 'Imported JSON. Fix validation errors before saving.');
    } catch {
      setNotice('Import failed. Choose a valid cameras JSON file.');
    } finally {
      event.target.value = '';
    }
  }

  function openArtworkPreview() {
    window.open(makeArtworkUrl(), '_blank', 'noopener,noreferrer');
  }

  function openRefreshedArtwork() {
    window.open(makeArtworkUrl(lastSavedAt || Date.now()), '_blank', 'noopener,noreferrer');
  }

  return (
    <main className={`editor-page editor-${editorTheme}`}>
      <header className="editor-header">
        <div>
          <p className="editor-kicker">local source editor</p>
          <h1>Soft Traces sources</h1>
          <p>
            Edit the three panels for trusted local exhibition setup. Static hosting keeps import/export available with
            saving disabled.
          </p>
        </div>
        <div className="editor-actions">
          <button type="button" onClick={() => navigate('artwork')}>
            artwork
          </button>
          <button
            type="button"
            onClick={() => setEditorTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))}
          >
            {editorTheme === 'dark' ? 'light mode' : 'dark mode'}
          </button>
        </div>
      </header>

      <section className="editor-toolbar" aria-label="Editor controls">
        <div>
          <strong>{isLoading ? 'loading' : configSource}</strong>
          <span>{notice}</span>
        </div>
        <div className="editor-actions">
          <input ref={fileInputRef} className="hidden-file-input" type="file" accept="application/json" onChange={handleImport} />
          <button type="button" onClick={() => fileInputRef.current?.click()}>
            import JSON
          </button>
          <button type="button" onClick={handleExport}>
            export JSON
          </button>
          <button type="button" onClick={openArtworkPreview}>
            preview artwork
          </button>
          {lastSavedAt ? (
            <button type="button" onClick={openRefreshedArtwork}>
              open refreshed artwork
            </button>
          ) : null}
          <button type="button" onClick={handleSave} disabled={!apiAvailable || !validation.valid || isSaving}>
            {isSaving ? 'saving' : 'save local'}
          </button>
        </div>
      </section>

      <section className={`validation-box ${validation.valid ? 'is-valid' : 'has-errors'}`}>
        <div>
          <strong>{validation.valid ? 'Config is valid' : 'Config needs attention'}</strong>
          <span>Required order: {EXPECTED_PANEL_IDS.join(', ')}</span>
        </div>
        {validation.errors.length > 0 ? (
          <ul>
            {validation.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        ) : null}
        {validation.warnings.length > 0 ? (
          <ul>
            {validation.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <div className="editor-grid">
        {editablePanels.map((panel, panelIndex) => (
          <PanelEditor
            key={`${panel.id}-${panelIndex}`}
            panel={panel}
            panelIndex={panelIndex}
            onPanelChange={handlePanelChange}
            onSourceChange={handleSourceChange}
            onModeChange={handleModeChange}
            onAddSource={handleAddSource}
            onRemoveSource={handleRemoveSource}
          />
        ))}
      </div>
    </main>
  );
}

function App() {
  const [route, setRoute] = useState(getRouteFromLocation);

  useEffect(() => {
    function syncRoute() {
      setRoute(getRouteFromLocation());
    }

    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  function navigate(nextRoute) {
    const nextPath = nextRoute === 'editor' ? joinBasePath('editor') : joinBasePath();
    window.history.pushState({}, '', nextPath);
    setRoute(nextRoute);
  }

  if (route === 'editor') {
    return isLocalSetupHost() ? <EditorPage navigate={navigate} /> : <LocalOnlyEditorNotice />;
  }

  return <ArtworkPage />;
}

createRoot(document.getElementById('root')).render(<App />);
