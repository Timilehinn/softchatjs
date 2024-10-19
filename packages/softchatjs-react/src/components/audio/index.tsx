import React, { useState, useRef, useEffect } from "react";
import { MdDelete } from "react-icons/md";
import "./audio-recorder.css";
import { ImStop } from "react-icons/im";
import Text from "../text/text";

function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false); // Track recording status
  const [audioURL, setAudioURL] = useState(''); // URL of the recorded audio
  const mediaRecorderRef:any = useRef(null); // MediaRecorder reference
  const [audioChunks, setAudioChunks] = useState<any>([]); // Audio chunks

  // Function to start recording
  const startRecording = async () => {
    setIsRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    // When data is available, push to audioChunks array
    mediaRecorder.ondataavailable = (event) => {
      setAudioChunks((prevChunks:any) => [...prevChunks, event.data]);
    };

    // When recording stops, create an audio Blob and generate the URL
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioURL(audioUrl);
      setAudioChunks([]); // Reset chunks
    };

    mediaRecorder.start();
  };

  // Function to stop recording
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  return (
    // <div
    //   style={{
    //     display: "flex",
    //     alignItems: "center",
    //     justifyContent: "flex-end",
    //   }}
    // >
    //   {audioURL && (
    //     <div style={{ paddingRight: "10px" }}>
    //       <audio src={audioURL} controls style={{ color: "#343434" }} />
    //     </div>
    //   )}
    //   {!audioURL && (
    //     <div
    //       style={{
    //         display: "flex",
    //         alignItems: "center",
    //         padding: "20px",
    //       }}
    //     >
    //       <MdDelete color="grey" size={24} />
    //       <Text text="0:00" />
    //       <div className="audio__recording"></div>
    //       <ImStop onClick={stopRecording} color="red" size={24} />
    //     </div>
    //   )}
    // </div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
      }}
    >
      <h2>Audio Recorder</h2>
      {isRecording ? (
        <button onClick={stopRecording}>Stop Recording</button>
      ) : (
        <button onClick={startRecording}>Start Recording</button>
      )}

      {/* Display recorded audio */}
      {audioURL && (
        <div>
          <h3>Playback</h3>
          <audio src={audioURL} controls />
          <a href={audioURL} download="recorded-audio.wav">
            Download Audio
          </a>
        </div>
      )}
    </div>
  );
}

export default AudioRecorder;
