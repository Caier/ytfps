import { YTPlaylist } from './interfaces';
export = fetchFromPlaylist;
/**
 * Scraps youtube playlist metadata and all its videos
 * @param url URL or ID of the playlist you want to scrap
 */
declare function fetchFromPlaylist(url: string): Promise<YTPlaylist>;
//# sourceMappingURL=index.d.ts.map