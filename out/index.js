"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const axios_1 = __importDefault(require("axios"));
const rqOpts = {
    headers: {
        'User-Agent': 'hellobiczes',
        'x-youtube-client-name': 1,
        'x-youtube-client-version': '2.20200731.02.01'
    }
};
const baseURL = 'https://youtube.com';
/**
 * Scraps youtube playlist metadata and all its videos
 * @param url URL or ID of the playlist you want to scrap
 */
async function fetchFromPlaylist(url) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
    let test = /[?&]list=([^#\&\?]+)|^([a-zA-Z0-9-_]+)$/.exec(url);
    if (!test)
        throw Error('Invalid playlist URL or ID');
    let playlistID = test[1] || test[2];
    let videos = [];
    let ytInitialData;
    try {
        let body = (await axios_1.default.get('https://youtube.com/playlist?list=' + encodeURI(playlistID), rqOpts)).data;
        ytInitialData = JSON.parse(((_a = /window\["ytInitialData"\] =.*?({.*?});/s.exec(body)) === null || _a === void 0 ? void 0 : _a[1]) || '{}');
    }
    catch (_z) {
        throw Error('Could not fetch/parse playlist');
    }
    if (ytInitialData.alerts)
        throw Error('This playlist is private');
    if (!((_o = (_m = (_l = (_k = (_j = (_h = (_g = (_f = (_e = (_d = (_c = (_b = ytInitialData === null || ytInitialData === void 0 ? void 0 : ytInitialData.contents) === null || _b === void 0 ? void 0 : _b.twoColumnBrowseResultsRenderer) === null || _c === void 0 ? void 0 : _c.tabs) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.tabRenderer) === null || _f === void 0 ? void 0 : _f.content) === null || _g === void 0 ? void 0 : _g.sectionListRenderer) === null || _h === void 0 ? void 0 : _h.contents) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.itemSectionRenderer) === null || _l === void 0 ? void 0 : _l.contents) === null || _m === void 0 ? void 0 : _m[0]) === null || _o === void 0 ? void 0 : _o.playlistVideoListRenderer))
        throw Error('Cannot find valid playlist JSON data. Is the playlist ID correct?');
    let listData = ytInitialData.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer;
    let d = ytInitialData;
    let contToken = ((_u = (_t = (_s = (_r = (_q = (_p = listData === null || listData === void 0 ? void 0 : listData.contents) === null || _p === void 0 ? void 0 : _p.slice(-1)) === null || _q === void 0 ? void 0 : _q[0]) === null || _r === void 0 ? void 0 : _r.continuationItemRenderer) === null || _s === void 0 ? void 0 : _s.continuationEndpoint) === null || _t === void 0 ? void 0 : _t.continuationCommand) === null || _u === void 0 ? void 0 : _u.token) || '';
    if (listData.contents)
        videos.push(...parseVideosFromJson(listData.contents));
    if (contToken)
        videos.push(...(await getAllVideos(contToken)));
    try {
        let mf = d.microformat.microformatDataRenderer;
        let si0 = d.sidebar.playlistSidebarRenderer.items[0].playlistSidebarPrimaryInfoRenderer;
        let si1 = d.sidebar.playlistSidebarRenderer.items[1].playlistSidebarSecondaryInfoRenderer.videoOwner.videoOwnerRenderer;
        return {
            title: mf.title,
            url: baseURL + '/playlist?list=' + listData.playlistId,
            id: listData.playlistId,
            video_count: +((_w = (_v = si0.stats[0].runs[0]) === null || _v === void 0 ? void 0 : _v.text) === null || _w === void 0 ? void 0 : _w.replace(/[^0-9]/g, '')),
            view_count: +((_y = (_x = si0.stats[1]) === null || _x === void 0 ? void 0 : _x.simpleText) === null || _y === void 0 ? void 0 : _y.replace(/[^0-9]/g, '')) || 0,
            description: mf.description,
            isUnlisted: mf.unlisted,
            thumbnail_url: mf.thumbnail.thumbnails.pop().url.replace(/\?.*/, ''),
            author: {
                name: si1.title.runs[0].text,
                url: baseURL + si1.title.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url,
                avatar_url: si1.thumbnail.thumbnails.pop().url
            },
            videos: videos
        };
    }
    catch (e) {
        throw Error('Could not parse playlist metadata: ' + e.message);
    }
}
function parseVideosFromJson(videoDataArray) {
    try {
        let videos = [];
        for (let v of videoDataArray.map(v => v.playlistVideoRenderer))
            try {
                videos.push({
                    title: v.title.runs[0].text,
                    url: baseURL + '/watch?v=' + v.videoId,
                    id: v.videoId,
                    length: v.lengthText.simpleText,
                    milis_length: +v.lengthSeconds * 1000,
                    thumbnail_url: 'https://i.ytimg.com/vi/' + v.videoId + '/hqdefault.jpg',
                    author: {
                        name: v.shortBylineText.runs[0].text,
                        url: baseURL + v.shortBylineText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url
                    }
                });
            }
            catch (_a) {
                continue;
            }
        return videos;
    }
    catch (_b) {
        throw Error('Could not parse videos from videoData JSON');
    }
}
async function getAllVideos(ajax_url, videos = []) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    try {
        let ytAppendData = (await axios_1.default.get(baseURL + '/browse_ajax?continuation=' + ajax_url, rqOpts)).data;
        let contToken = (_k = (_j = (_h = (_g = (_f = (_e = (_d = (_c = (_b = (_a = ytAppendData[1].response) === null || _a === void 0 ? void 0 : _a.onResponseReceivedActions) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.appendContinuationItemsAction) === null || _d === void 0 ? void 0 : _d.continuationItems) === null || _e === void 0 ? void 0 : _e.slice(-1)) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.continuationItemRenderer) === null || _h === void 0 ? void 0 : _h.continuationEndpoint) === null || _j === void 0 ? void 0 : _j.continuationCommand) === null || _k === void 0 ? void 0 : _k.token;
        videos.push(...parseVideosFromJson(ytAppendData[1].response.onResponseReceivedActions[0].appendContinuationItemsAction.continuationItems));
        return contToken ? await getAllVideos(contToken, videos) : videos;
    }
    catch (_l) {
        throw Error('An error has occured while trying to fetch more videos');
    }
}
module.exports = fetchFromPlaylist;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9saWIvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLGtEQUErQztBQUsvQyxNQUFNLE1BQU0sR0FBdUI7SUFDL0IsT0FBTyxFQUFFO1FBQ0wsWUFBWSxFQUFFLGFBQWE7UUFDM0IsdUJBQXVCLEVBQUUsQ0FBQztRQUMxQiwwQkFBMEIsRUFBRSxrQkFBa0I7S0FDakQ7Q0FDSixDQUFBO0FBRUQsTUFBTSxPQUFPLEdBQUcscUJBQXFCLENBQUM7QUFFdEM7OztHQUdHO0FBQ0gsS0FBSyxVQUFVLGlCQUFpQixDQUFDLEdBQVc7O0lBQ3hDLElBQUksSUFBSSxHQUFHLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMvRCxJQUFHLENBQUMsSUFBSTtRQUNKLE1BQU0sS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUM7SUFDOUMsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwQyxJQUFJLE1BQU0sR0FBYyxFQUFFLENBQUM7SUFDM0IsSUFBSSxhQUFrQixDQUFDO0lBRXZCLElBQUk7UUFDQSxJQUFJLElBQUksR0FBRyxDQUFDLE1BQU0sZUFBRSxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFjLENBQUM7UUFDL0csYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBQSx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDBDQUFHLENBQUMsTUFBSyxJQUFJLENBQUMsQ0FBQztLQUNqRztJQUFDLFdBQU07UUFDSixNQUFNLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0tBQ2pEO0lBRUQsSUFBRyxhQUFhLENBQUMsTUFBTTtRQUNuQixNQUFNLEtBQUssQ0FBQywwQkFBMEIs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QUNMO1lBQUMsV0FBTTtnQkFDSixTQUFTO2FBQ1o7UUFDTCxPQUFPLE1BQU0sQ0FBQztLQUNqQjtJQUFDLFdBQU07UUFDSixNQUFNLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO0tBQzdEO0FBQ0wsQ0FBQztBQUVELEtBQUssVUFBVSxZQUFZLENBQUMsUUFBZ0IsRUFBRSxTQUFvQixFQUFFOztJQUNoRSxJQUFJO1FBQ0EsSUFBSSxZQUFZLEdBQUcsQ0FBQyxNQUFNLGVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLDRCQUE0QixHQUFHLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNsRyxJQUFJLFNBQVMsK0RBQVEsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsMENBQUUseUJBQXlCLDBDQUFHLENBQUMsMkNBQUcsNkJBQTZCLDBDQUFFLGlCQUFpQiwwQ0FBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLDJDQUFJLENBQUMsMkNBQUcsd0JBQXdCLDBDQUFFLG9CQUFvQiwwQ0FBRSxtQkFBbUIsMENBQUUsS0FBSyxDQUFDO1FBQzVOLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDLDZCQUE2QixDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztRQUMzSSxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxZQUFZLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7S0FDckU7SUFBQyxXQUFNO1FBQ0osTUFBTSxLQUFLLENBQUMsd0RBQXdELENBQUMsQ0FBQztLQUN6RTtBQUNMLENBQUM7QUF4R0QsaUJBQVMsaUJBQWlCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYXgsIHsgQXhpb3NSZXF1ZXN0Q29uZmlnIH0gZnJvbSAnYXhpb3MnO1xyXG5pbXBvcnQgeyBZVFBsYXlsaXN0LCBZVHZpZGVvIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcclxuXHJcbmV4cG9ydCA9IGZldGNoRnJvbVBsYXlsaXN0O1xyXG5cclxuY29uc3QgcnFPcHRzOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7XHJcbiAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgJ1VzZXItQWdlbnQnOiAnaGVsbG9iaWN6ZXMnLFxyXG4gICAgICAgICd4LXlvdXR1YmUtY2xpZW50LW5hbWUnOiAxLFxyXG4gICAgICAgICd4LXlvdXR1YmUtY2xpZW50LXZlcnNpb24nOiAnMi4yMDIwMDczMS4wMi4wMSdcclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgYmFzZVVSTCA9ICdodHRwczovL3lvdXR1YmUuY29tJztcclxuXHJcbi8qKlxyXG4gKiBTY3JhcHMgeW91dHViZSBwbGF5bGlzdCBtZXRhZGF0YSBhbmQgYWxsIGl0cyB2aWRlb3NcclxuICogQHBhcmFtIHVybCBVUkwgb3IgSUQgb2YgdGhlIHBsYXlsaXN0IHlvdSB3YW50IHRvIHNjcmFwXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBmZXRjaEZyb21QbGF5bGlzdCh1cmw6IHN0cmluZykgOiBQcm9taXNlPFlUUGxheWxpc3Q+IHtcclxuICAgIGxldCB0ZXN0ID0gL1s/Jl1saXN0PShbXiNcXCZcXD9dKyl8XihbYS16QS1aMC05LV9dKykkLy5leGVjKHVybCk7XHJcbiAgICBpZighdGVzdClcclxuICAgICAgICB0aHJvdyBFcnJvcignSW52YWxpZCBwbGF5bGlzdCBVUkwgb3IgSUQnKTtcclxuICAgIGxldCBwbGF5bGlzdElEID0gdGVzdFsxXSB8fCB0ZXN0WzJdO1xyXG4gICAgbGV0IHZpZGVvczogWVR2aWRlb1tdID0gW107XHJcbiAgICBsZXQgeXRJbml0aWFsRGF0YTogYW55O1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgICAgbGV0IGJvZHkgPSAoYXdhaXQgYXguZ2V0KCdodHRwczovL3lvdXR1YmUuY29tL3BsYXlsaXN0P2xpc3Q9JyArIGVuY29kZVVSSShwbGF5bGlzdElEKSwgcnFPcHRzKSkuZGF0YSBhcyBzdHJpbmc7XHJcbiAgICAgICAgeXRJbml0aWFsRGF0YSA9IEpTT04ucGFyc2UoL3dpbmRvd1xcW1wieXRJbml0aWFsRGF0YVwiXFxdID0uKj8oey4qP30pOy9zLmV4ZWMoYm9keSk/LlsxXSB8fCAne30nKTtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIHRocm93IEVycm9yKCdDb3VsZCBub3QgZmV0Y2gvcGFyc2UgcGxheWxpc3QnKTtcclxuICAgIH1cclxuXHJcbiAgICBpZih5dEluaXRpYWxEYXRhLmFsZXJ0cylcclxuICAgICAgICB0aHJvdyBFcnJvcignVGhpcyBwbGF5bGlzdCBpcyBwcml2YXRlJyk7XHJcbiAgICBpZigheXRJbml0aWFsRGF0YT8uY29udGVudHM/LnR3b0NvbHVtbkJyb3dzZVJlc3VsdHNSZW5kZXJlcj8udGFicz8uWzBdPy50YWJSZW5kZXJlcj8uY29udGVudD8uc2VjdGlvbkxpc3RSZW5kZXJlcj8uY29udGVudHM/LlswXT8uaXRlbVNlY3Rpb25SZW5kZXJlcj8uY29udGVudHM/LlswXT8ucGxheWxpc3RWaWRlb0xpc3RSZW5kZXJlcilcclxuICAgICAgICB0aHJvdyBFcnJvcignQ2Fubm90IGZpbmQgdmFsaWQgcGxheWxpc3QgSlNPTiBkYXRhLiBJcyB0aGUgcGxheWxpc3QgSUQgY29ycmVjdD8nKTtcclxuICAgIGxldCBsaXN0RGF0YSA9IHl0SW5pdGlhbERhdGEuY29udGVudHMudHdvQ29sdW1uQnJvd3NlUmVzdWx0c1JlbmRlcmVyLnRhYnNbMF0udGFiUmVuZGVyZXIuY29udGVudC5zZWN0aW9uTGlzdFJlbmRlcmVyLmNvbnRlbnRzWzBdLml0ZW1TZWN0aW9uUmVuZGVyZXIuY29udGVudHNbMF0ucGxheWxpc3RWaWRlb0xpc3RSZW5kZXJlcjtcclxuICAgIGxldCBkID0geXRJbml0aWFsRGF0YTtcclxuICAgIFxyXG4gICAgbGV0IGNvbnRUb2tlbjogc3RyaW5nID0gbGlzdERhdGE/LmNvbnRlbnRzPy5zbGljZSgtMSk/LlswXT8uY29udGludWF0aW9uSXRlbVJlbmRlcmVyPy5jb250aW51YXRpb25FbmRwb2ludD8uY29udGludWF0aW9uQ29tbWFuZD8udG9rZW4gfHwgJyc7XHJcbiAgICBpZihsaXN0RGF0YS5jb250ZW50cylcclxuICAgICAgICB2aWRlb3MucHVzaCguLi5wYXJzZVZpZGVvc0Zyb21Kc29uKGxpc3REYXRhLmNvbnRlbnRzKSk7XHJcbiAgICBpZihjb250VG9rZW4pXHJcbiAgICAgICAgdmlkZW9zLnB1c2goLi4uKGF3YWl0IGdldEFsbFZpZGVvcyhjb250VG9rZW4pKSk7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICBsZXQgbWYgPSBkLm1pY3JvZm9ybWF0Lm1pY3JvZm9ybWF0RGF0YVJlbmRlcmVyO1xyXG4gICAgICAgIGxldCBzaTAgPSBkLnNpZGViYXIucGxheWxpc3RTaWRlYmFyUmVuZGVyZXIuaXRlbXNbMF0ucGxheWxpc3RTaWRlYmFyUHJpbWFyeUluZm9SZW5kZXJlcjtcclxuICAgICAgICBsZXQgc2kxID0gZC5zaWRlYmFyLnBsYXlsaXN0U2lkZWJhclJlbmRlcmVyLml0ZW1zWzFdLnBsYXlsaXN0U2lkZWJhclNlY29uZGFyeUluZm9SZW5kZXJlci52aWRlb093bmVyLnZpZGVvT3duZXJSZW5kZXJlcjtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0aXRsZTogbWYudGl0bGUsXHJcbiAgICAgICAgICAgIHVybDogYmFzZVVSTCArICcvcGxheWxpc3Q/bGlzdD0nICsgbGlzdERhdGEucGxheWxpc3RJZCxcclxuICAgICAgICAgICAgaWQ6IGxpc3REYXRhLnBsYXlsaXN0SWQsXHJcbiAgICAgICAgICAgIHZpZGVvX2NvdW50OiArc2kwLnN0YXRzWzBdLnJ1bnNbMF0/LnRleHQ/LnJlcGxhY2UoL1teMC05XS9nLCAnJyksXHJcbiAgICAgICAgICAgIHZpZXdfY291bnQ6ICtzaTAuc3RhdHNbMV0/LnNpbXBsZVRleHQ/LnJlcGxhY2UoL1teMC05XS9nLCAnJykgfHwgMCxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IG1mLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICBpc1VubGlzdGVkOiBtZi51bmxpc3RlZCxcclxuICAgICAgICAgICAgdGh1bWJuYWlsX3VybDogbWYudGh1bWJuYWlsLnRodW1ibmFpbHMucG9wKCkudXJsLnJlcGxhY2UoL1xcPy4qLywgJycpLFxyXG4gICAgICAgICAgICBhdXRob3I6IHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IHNpMS50aXRsZS5ydW5zWzBdLnRleHQsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGJhc2VVUkwgKyBzaTEudGl0bGUucnVuc1swXS5uYXZpZ2F0aW9uRW5kcG9pbnQuY29tbWFuZE1ldGFkYXRhLndlYkNvbW1hbmRNZXRhZGF0YS51cmwsXHJcbiAgICAgICAgICAgICAgICBhdmF0YXJfdXJsOiBzaTEudGh1bWJuYWlsLnRodW1ibmFpbHMucG9wKCkudXJsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHZpZGVvczogdmlkZW9zXHJcbiAgICAgICAgfVxyXG4gICAgfSBjYXRjaChlKSB7XHJcbiAgICAgICAgdGhyb3cgRXJyb3IoJ0NvdWxkIG5vdCBwYXJzZSBwbGF5bGlzdCBtZXRhZGF0YTogJyArIGUubWVzc2FnZSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhcnNlVmlkZW9zRnJvbUpzb24odmlkZW9EYXRhQXJyYXk6IGFueVtdKSA6IFlUdmlkZW9bXSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGxldCB2aWRlb3M6IFlUdmlkZW9bXSA9IFtdO1xyXG4gICAgICAgIGZvcihsZXQgdiBvZiB2aWRlb0RhdGFBcnJheS5tYXAodiA9PiB2LnBsYXlsaXN0VmlkZW9SZW5kZXJlcikpXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB2aWRlb3MucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHYudGl0bGUucnVuc1swXS50ZXh0LFxyXG4gICAgICAgICAgICAgICAgICAgIHVybDogYmFzZVVSTCArICcvd2F0Y2g/dj0nICsgdi52aWRlb0lkLFxyXG4gICAgICAgICAgICAgICAgICAgIGlkOiB2LnZpZGVvSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiB2Lmxlbmd0aFRleHQuc2ltcGxlVGV4dCxcclxuICAgICAgICAgICAgICAgICAgICBtaWxpc19sZW5ndGg6ICt2Lmxlbmd0aFNlY29uZHMgKiAxMDAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHRodW1ibmFpbF91cmw6ICdodHRwczovL2kueXRpbWcuY29tL3ZpLycgKyB2LnZpZGVvSWQgKyAnL2hxZGVmYXVsdC5qcGcnLFxyXG4gICAgICAgICAgICAgICAgICAgIGF1dGhvcjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB2LnNob3J0QnlsaW5lVGV4dC5ydW5zWzBdLnRleHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogYmFzZVVSTCArIHYuc2hvcnRCeWxpbmVUZXh0LnJ1bnNbMF0ubmF2aWdhdGlvbkVuZHBvaW50LmNvbW1hbmRNZXRhZGF0YS53ZWJDb21tYW5kTWV0YWRhdGEudXJsXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9ICAgKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2aWRlb3M7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgICB0aHJvdyBFcnJvcignQ291bGQgbm90IHBhcnNlIHZpZGVvcyBmcm9tIHZpZGVvRGF0YSBKU09OJyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGdldEFsbFZpZGVvcyhhamF4X3VybDogc3RyaW5nLCB2aWRlb3M6IFlUdmlkZW9bXSA9IFtdKSA6IFByb21pc2U8WVR2aWRlb1tdPiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGxldCB5dEFwcGVuZERhdGEgPSAoYXdhaXQgYXguZ2V0KGJhc2VVUkwgKyAnL2Jyb3dzZV9hamF4P2NvbnRpbnVhdGlvbj0nICsgYWpheF91cmwsIHJxT3B0cykpLmRhdGE7XHJcbiAgICAgICAgbGV0IGNvbnRUb2tlbjogYW55ID0geXRBcHBlbmREYXRhWzFdLnJlc3BvbnNlPy5vblJlc3BvbnNlUmVjZWl2ZWRBY3Rpb25zPy5bMF0/LmFwcGVuZENvbnRpbnVhdGlvbkl0ZW1zQWN0aW9uPy5jb250aW51YXRpb25JdGVtcz8uc2xpY2UoLTEpPy5bMF0/LmNvbnRpbnVhdGlvbkl0ZW1SZW5kZXJlcj8uY29udGludWF0aW9uRW5kcG9pbnQ/LmNvbnRpbnVhdGlvbkNvbW1hbmQ/LnRva2VuO1xyXG4gICAgICAgIHZpZGVvcy5wdXNoKC4uLnBhcnNlVmlkZW9zRnJvbUpzb24oeXRBcHBlbmREYXRhWzFdLnJlc3BvbnNlLm9uUmVzcG9uc2VSZWNlaXZlZEFjdGlvbnNbMF0uYXBwZW5kQ29udGludWF0aW9uSXRlbXNBY3Rpb24uY29udGludWF0aW9uSXRlbXMpKTtcclxuICAgICAgICByZXR1cm4gY29udFRva2VuID8gYXdhaXQgZ2V0QWxsVmlkZW9zKGNvbnRUb2tlbiwgdmlkZW9zKSA6IHZpZGVvcztcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIHRocm93IEVycm9yKCdBbiBlcnJvciBoYXMgb2NjdXJlZCB3aGlsZSB0cnlpbmcgdG8gZmV0Y2ggbW9yZSB2aWRlb3MnKTtcclxuICAgIH1cclxufSJdfQ==