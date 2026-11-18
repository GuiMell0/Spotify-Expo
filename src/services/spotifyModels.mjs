const idPattern = /^[A-Za-z0-9]{22}$/;
const text = value => typeof value === 'string' && value.trim() ? value.trim() : null;
export const isSpotifyId = value => typeof value === 'string' && idPattern.test(value);
const count = value => Number.isInteger(value) && value >= 0 ? value : null;
const list = value => Array.isArray(value) ? value : [];

function base(raw, type, fallback) {
  if (!raw || !isSpotifyId(raw.id) || raw.type && raw.type !== type) return null;
  return {
    id: raw.id, type, title: text(raw.name) ?? fallback,
    uri: 'spotify:' + type + ':' + raw.id,
    spotifyUrl: 'https://open.spotify.com/' + type + '/' + raw.id,
    href: type === 'track' ? '/player?trackId=' + raw.id : '/' + type + '/' + raw.id,
    image: imageSource(raw.images),
  };
}

export function imageSource(images) {
  for (const image of list(images)) {
    try {
      const url = new URL(image?.url);
      if (url.protocol === 'https:' && !url.username && !url.password) return { uri: url.toString() };
    } catch { /* A imagem ausente é representada por null. */ }
  }
  return null;
}

export function mapArtist(raw) {
  const value = base(raw, 'artist', 'Artista sem nome');
  return value ? {
    ...value, round: true, subtitle: 'Artista',
    genres: list(raw.genres).map(text).filter(Boolean),
    followers: count(raw.followers?.total),
  } : null;
}

function artistCredits(values) {
  return list(values).map(raw => {
    const artist = mapArtist(raw);
    if (artist) return artist;
    const title = text(raw?.name);
    return title ? { id: null, type: 'artist', title, href: null, uri: null, spotifyUrl: null, image: null } : null;
  }).filter(Boolean);
}

export function mapAlbum(raw) {
  const value = base(raw, 'album', 'Álbum sem nome');
  if (!value) return null;
  const artists = artistCredits(raw.artists);
  return {
    ...value, artists, artist: artists.map(item => item.title).join(', ') || 'Artista não informado',
    artistId: artists.find(item => item.id)?.id ?? null,
    subtitle: artists.map(item => item.title).join(', ') || 'Álbum',
    albumType: ['album', 'single', 'compilation'].includes(raw.album_type) ? raw.album_type : null,
    releaseDate: text(raw.release_date), releaseDatePrecision: text(raw.release_date_precision),
    totalTracks: count(raw.total_tracks),
  };
}

export function mapTrack(raw, album = null) {
  if (raw?.is_local) return null;
  const value = base(raw, 'track', 'Faixa sem nome');
  if (!value) return null;
  const artists = artistCredits(raw.artists);
  const parent = mapAlbum(raw.album) ?? album;
  const durationMs = count(raw.duration_ms);
  const artist = artists.map(item => item.title).join(', ') || 'Artista não informado';
  return {
    ...value, artists, artist, subtitle: artist,
    album: parent, image: parent?.image ?? null,
    durationMs,
    duration: durationMs === null ? null : Math.floor(durationMs / 60000) + ':' + String(Math.floor(durationMs / 1000) % 60).padStart(2, '0'),
    discNumber: count(raw.disc_number), trackNumber: count(raw.track_number),
    explicit: typeof raw.explicit === 'boolean' ? raw.explicit : null,
    isPlayable: typeof raw.is_playable === 'boolean' ? raw.is_playable : null,
    restriction: text(raw.restrictions?.reason),
  };
}

export function mapPlaylist(raw) {
  const value = base(raw, 'playlist', 'Playlist sem nome');
  if (!value) return null;
  const owner = { id: text(raw.owner?.id), name: text(raw.owner?.display_name) ?? text(raw.owner?.id) };
  const content = Object.hasOwn(raw, 'items') ? raw.items : raw.tracks;
  return {
    ...value, subtitle: owner.name ? 'Playlist • ' + owner.name : 'Playlist',
    owner, description: text(raw.description),
    totalItems: count(content?.total),
    collaborative: typeof raw.collaborative === 'boolean' ? raw.collaborative : null,
    public: typeof raw.public === 'boolean' ? raw.public : null,
    snapshotId: text(raw.snapshot_id),
  };
}

export function mapPlaylistTrack(entry) {
  if (!entry || entry.is_local) return null;
  const raw = Object.hasOwn(entry, 'item') ? entry.item : entry.track;
  return mapTrack(raw);
}
