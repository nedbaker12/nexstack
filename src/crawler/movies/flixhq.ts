"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const utils_1 = require("../utils");
class VidCloud {
    serverName = 'VidCloud';
    host = 'https://dokicloud.one';
    host2 = 'https://rabbitstream.net';
    extract = async (videoUrl, isAlternative = false) => {
        const videoResult = {
            sources: [],
            subtiles: [],
        };
        try {
            const id = videoUrl.href.split('/').pop()?.split('?')[0];
            const options = {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Referer': videoUrl.href,
                },
            };


            const { data } = await axios_1.default.get(`${isAlternative ? this.host2 : this.host}/ajax/embed-4/getSources?id=${id}`, options);
            // console.log(data.sources)
            let sources = null;
            if (!(0, utils_1.isJson)(data.sources)) {
                const stops = await (await axios_1.default.get('https://raw.githubusercontent.com/enimax-anime/key/e4/key.txt')).data;
                // console.log(stops)
                // console.log('preset')
                // console.log(data)
                // console.log("preset")
                const nextgen = data.sources
                // sources = JSON.parse(crypto_js_1.default.AES.decrypt(data.sources, key).toString(crypto_js_1.default.enc.Utf8));
                function extractAndConcatenateString(nextgen, stops) {
                  // Helper function to extract substrings based on the given stops
                function extractSubstring(startIndex, endIndex) {
                    return nextgen.slice(startIndex, endIndex);
                  }

                let decryptedKey = '';
                let newOriginalString = nextgen; // Create a copy of the original string

                  // Extract substrings from the stops and concatenate them
                stops.forEach((stop) => {
                    const [startIndex, endIndex] = stop;
                    decryptedKey += extractSubstring(startIndex, endIndex);

                    // Replace the extracted substring with an equal length of spaces in the new original string
                    const spaces = ' '.repeat(endIndex - startIndex);
                    newOriginalString = newOriginalString.slice(0, startIndex) + spaces + newOriginalString.slice(endIndex);
                    });

                  newOriginalString = newOriginalString.replace(/\s/g, '');
                  return {
                    decryptedKey,
                    newOriginalString,
                  };
                }

                // Call the function and get the result
                const { decryptedKey, newOriginalString } = extractAndConcatenateString(nextgen, stops);

                // console.log(`Concatenated extracted key (decryption key): ${decryptedKey}\n`);
                // console.log(`New encrypted string (original without extracted parts): ${newOriginalString}\n`);

                // const sources = JSON.parse(CryptoJS.AES.decrypt(newOriginalString, decryptedKey).toString(CryptoJS.enc.Utf8));
                sources = JSON.parse(crypto_js_1.default.AES.decrypt(newOriginalString, decryptedKey).toString(crypto_js_1.default.enc.Utf8));

                // console.log(`Decrypted string: `, sources);
            }
            for (const source of sources) {
                const { data } = await axios_1.default.get(source.file, options);
                const videoUrls = data.split('\n').filter((line) => line.includes('.m3u8'));
                const videoQualities = data.split('\n').filter((line) => line.includes('RESOLUTION='));
                videoQualities.map((item, i) => {
                    const quality = item.split(',')[2].split('x')[1];
                    const url = videoUrls[i];
                    videoResult.sources.push({
                        url: url,
                        quality: quality,
                        isM3U8: url.includes('.m3u8'),
                    });
                });
            }
            videoResult.subtiles = data.tracks.map((track) => {
                return {
                    file: track.file,
                    lable: track.label ?? 'Default',
                };
            });
            return videoResult;
        }
        catch (err) {
            throw new Error(err.message);
        }
    };
}
exports.default = VidCloud;
//# sourceMappingURL=vidcloud.js.map
