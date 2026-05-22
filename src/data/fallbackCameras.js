const fallbackCameras = [
  {
    id: 'object',
    sourceType: 'vdo',
    src: '',
    active: false,
    fallbackText: 'The surface is silent.',
    visualMode: 'slow-zoom',
    cropMode: 'cover',
  },
  {
    id: 'space',
    sourceType: 'video',
    src: '',
    active: false,
    muted: true,
    loop: true,
    fallbackText: 'The recording is absent.',
    visualMode: 'normal',
    cropMode: 'cover',
  },
  {
    id: 'trace',
    sourceType: 'embed',
    src: '',
    active: false,
    fallbackText: 'The distant image is unavailable.',
    visualMode: 'ghosted',
    cropMode: 'cover',
  },
];

export default fallbackCameras;
