export const ASSETS = {
  profile: { uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=85' },
  daily: { uri: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=700&q=85' },
  heart: { uri: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=700&q=85' },
  misadventures: { uri: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=900&q=85' },
  collide: { uri: 'https://images.unsplash.com/photo-1521337581100-8ca9a73a5f79?auto=format&fit=crop&w=700&q=85' },
  albumRed: { uri: 'https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?auto=format&fit=crop&w=700&q=85' },
  albumBlue: { uri: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=700&q=85' },
  albumNeon: { uri: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=700&q=85' },
  albumDark: { uri: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=700&q=85' },
  artist: { uri: 'https://images.unsplash.com/photo-1524650359799-842906ca1c06?auto=format&fit=crop&w=1200&q=85' },
  artistCircle: { uri: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=700&q=85' },
  playerCover: { uri: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1000&q=90' },
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
