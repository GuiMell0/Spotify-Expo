export const ASSETS = {
  profile: { uri: 'https://media.newyorker.com/photos/63e3b4c471b96b7ea72c8e9c/master/w_800%2Cc_limit/Petrusich-Hayley-Williams-Final.jpg' },
  daily: { uri: 'https://image-cdn-fa.spotifycdn.com/image/ab67706c0000da847f02edfa813e224718b82183' },
  heart: { uri: 'https://i.scdn.co/image/ab67616d0000b2735cab62839794c2cc3d6a135b' },
  misadventures: { uri: 'https://i.scdn.co/image/ab67616d0000b273feef5b9537d7b52555a42f17' },
  collide: { uri: 'https://i.scdn.co/image/ab67616d0000b273918bf6a348413fcee872437d' },
  albumRed: { uri: 'https://i.scdn.co/image/ab67616d0000b27346943aca98a3cf38fee2689e' },
  albumBlue: { uri: 'https://misc.scdn.co/your-episodes/SE-640.png' },
  albumNeon: { uri: 'https://misc.scdn.co/liked-songs/liked-songs-640.png' },
  albumDark: { uri: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da8495534159114ea6222b98b370' },
  artist: { uri: 'https://i.scdn.co/image/ab6761610000e5eb6f8f8d13be17bf486219edc7' },
  artistCircle: { uri: 'https://i.scdn.co/image/ab6761610000e5eb6f8f8d13be17bf486219edc7' },
  playerCover: { uri: 'https://i.scdn.co/image/ab67616d0000b273feef5b9537d7b52555a42f17' },
};    

export const quickItems = [
  { id: '1', title: 'daily', image: ASSETS.daily, target: 'Playlist' },
  { id: '2', title: 'my heart', image: ASSETS.heart, target: 'Playlist' },
  { id: '3', title: 'Pierce The Veil', image: ASSETS.misadventures, target: 'Artist' },
  { id: '4', title: 'As suas músicas mais ouvidas', image: ASSETS.albumRed, target: 'Playlist' },
  { id: '5', title: 'No Repeat', image: ASSETS.albumNeon, target: 'Playlist' },
  { id: '6', title: 'all songs', image: ASSETS.albumDark, target: 'Album' },
];

export const homeAlbums = [
  { id: '1', title: "Carla's Song", subtitle: 'Harry Styles, Paramore e mais', image: ASSETS.playerCover, target: 'Playlist' },
  { id: '2', title: 'Misadventures', subtitle: 'Pierce The Veil', image: ASSETS.misadventures, target: 'Album' },
  { id: '3', title: 'This Is Paramore', subtitle: 'Os maiores sucessos', image: ASSETS.albumRed, target: 'Playlist' },
  { id: '4', title: 'Rock Mix', subtitle: 'Slipknot, System of a Down e mais', image: ASSETS.albumDark, target: 'Playlist' },
];

export const libraryItems = [
  { id: '1', title: 'daily', subtitle: 'Playlist • anna', image: ASSETS.daily, target: 'Playlist' },
  { id: '2', title: 'my heart', subtitle: 'Playlist • anna', image: ASSETS.heart, target: 'Playlist' },
  { id: '3', title: 'all songs', subtitle: 'Playlist • anna', image: ASSETS.albumDark, target: 'Playlist' },
  { id: '4', title: 'Misadventures', subtitle: 'Álbum • Pierce The Veil', image: ASSETS.misadventures, target: 'Album' },
  { id: '5', title: 'Pierce The Veil', subtitle: 'Artista', image: ASSETS.artistCircle, target: 'Artist', round: true },
  { id: '6', title: 'No Repeat', subtitle: 'Playlist • Spotify', image: ASSETS.albumNeon, target: 'Playlist' },
];

export const tracks = [
  { id: '1', title: 'Dive In', artist: 'Pierce The Veil', duration: '4:52' },
  { id: '2', title: 'Texas Is Forever', artist: 'Pierce The Veil', duration: '3:39' },
  { id: '3', title: 'The Divine Zero', artist: 'Pierce The Veil', duration: '4:00' },
  { id: '4', title: 'Floral & Fading', artist: 'Pierce The Veil', duration: '3:29' },
  { id: '5', title: 'Phantom Power And Ludicrous Speed', artist: 'Pierce The Veil', duration: '3:50' },
];
