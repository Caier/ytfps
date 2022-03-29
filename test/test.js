const ytfps = require('../out/index');
const fs = require('fs');
const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;

const privatePlaylist = 'PLXJzeXpFb-pA-qXwgH2JdpYIx8lg8y4FW';
const top500Playlist = 'PLAbeRqyTx1rIGWY13HgPyh0VF0LdoTQFp';
const myTestList = 'PLXJzeXpFb-pDFQSy6EK7JEFRM1b8I1TTW';

const prophecyTestList = 'OLAK5uy_mPFpBY7OwJ9mFvKxWKzSDJUXNKY9YXjOA';

const properResult = JSON.parse(fs.readFileSync('test/misc/properOutput.json'));
const prophecyProperResult = JSON.parse(fs.readFileSync('test/misc/prophecyOutput.json'));

describe("ytfps", function() {
    this.timeout(30000);
    this.slow(99999999);

    it('should return proper results', async () => {
        let playlist = await ytfps(myTestList);
        for(let prop in properResult)
            expect(playlist[prop]).to.deep.eq(properResult[prop]);
    });

    it('should scrap >200 videos', async () => {
        expect((await ytfps(top500Playlist)).videos.length).to.be.gt(200);
    });

    it('should throw private playlist error', async () => {
        await expect(ytfps(privatePlaylist)).to.be.rejectedWith('This playlist is private');
    });

    it('should be able to read nsp list', async () => {
        let playlist = await ytfps(prophecyTestList);
        for(let prop in prophecyProperResult)
            expect(playlist[prop]).to.deep.eq(prophecyProperResult[prop]);
    });
});
