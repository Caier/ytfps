const ytfps = require('../out/index');

/**
 * https://www.youtube.com/playlist?list=PLDIoUOhQQPlXzhp-83rECoLaV6BwFtNC4
 * Used this playlist for this test ^^^ 
 * 
 * Expected output is in output.txt
 */

ytfps('PLDIoUOhQQPlXzhp-83rECoLaV6BwFtNC4').then(playlist => {
    console.log(playlist)
})
