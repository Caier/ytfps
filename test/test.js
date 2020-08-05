const ytfps = require('../out/index');
const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;

const privatePlaylist = 'PLXJzeXpFb-pA-qXwgH2JdpYIx8lg8y4FW';
const top500Playlist = 'PLAbeRqyTx1rIGWY13HgPyh0VF0LdoTQFp';
const myTestList = 'PLXJzeXpFb-pDFQSy6EK7JEFRM1b8I1TTW';

const properResult = {
    title: 'testowa4ytfps',
    url: 'https://youtube.com/playlist?list=PLXJzeXpFb-pDFQSy6EK7JEFRM1b8I1TTW',
    id: myTestList,
    video_count: 1,
    description: 'this is a test',
    isUnlisted: true,
    thumbnail_url: 'https://i.ytimg.com/vi/2chfsFTNEXw/hqdefault.jpg',
    author: {
        name: 'アヌス',
        url: 'https://youtube.com/channel/UC2tC7wR16hJ5ddYpymiKdBQ',
        avatar_url: 'https://yt3.ggpht.com/a/AATXAJzo5HwQCdKBgZivys-2Kvbc2skKyPYKMaSyN_ci=s176-c-k-c0xffffffff-no-rj-mo'
    },
    videos: [
        {
            title: "alternative songs to take a break from whatever you're listening now (maybe it'll help u)/ playlist",
            url: 'https://youtube.com/watch?v=2chfsFTNEXw',
            id: '2chfsFTNEXw',
            length: '2:02:10',
            milis_length: 7330000,
            thumbnail_url: 'https://i.ytimg.com/vi/2chfsFTNEXw/hqdefault.jpg',
            author: {
                name: "hasoyi",
                url: "https://youtube.com/channel/UCw_5z6HhKttOmcWgVgZ8tcg"
            }
        }
    ]
}

describe("ytfps", function() {
    this.timeout(30000);
    this.slow(99999999);

    it('should return proper results', async () => {
        let playlist = await ytfps(myTestList);
        for(let prop in properResult)
            expect(playlist[prop]).to.deep.eq(properResult[prop]);
    });

    it('should scrap >100 videos', async () => {
        expect((await ytfps(top500Playlist)).videos.length).to.be.gt(100);
    });

    it('should throw private playlist error', async () => {
        await expect(ytfps(privatePlaylist)).to.be.rejectedWith('This playlist is private');
    });
});