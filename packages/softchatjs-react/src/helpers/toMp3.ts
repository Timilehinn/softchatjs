// import { FFmpeg } from '@ffmpeg/ffmpeg'
// import { fetchFile } from '@ffmpeg/util'

// export async function convertWebmToMp3(webmBlob: Blob) {
//   try {
//     console.log(1)
//     const ffmpeg = new FFmpeg()
//     ffmpeg.load();
//     console.log(2)
//     // Define input and output names
//     const inputName = 'input.webm';
//     const outputName = 'output.mp3';

//     // Write the blob to the virtual filesystem
//     ffmpeg.writeFile(inputName, await fetchFile(webmBlob));
//     console.log(3)
//     // Run the conversion command
//     await ffmpeg.exec(['-i', inputName, outputName]);
//     console.log(4)
//     // Read the output file
//     const data = await ffmpeg.readFile(outputName);
//     console.log(5)
//     // Create a Blob URL for the converted audio
//     return URL.createObjectURL(new Blob([data.buffer], { type: 'audio/mp3' }));
//   } catch (error) {
//     console.error('Error converting WebM to MP3:', error);
//   }
// }
