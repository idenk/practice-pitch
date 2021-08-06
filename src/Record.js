import React, { useState } from "react";
import { PitchDetector } from "pitchy";

let recoding = null;

function Record() {
  const [audio, setAudio] = useState(null);

  async function getMicrophone() {
    console.log("start!");
    // 미디어 입력 장치 사용 권한 요청
    const audio = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    setAudio(audio);

    const audioContext = new window.AudioContext();
    const analyserNode = audioContext.createAnalyser();

    //* pitchy
    let sourceNode = audioContext.createMediaStreamSource(audio);
    sourceNode.connect(analyserNode);
    const detector = PitchDetector.forFloat32Array(analyserNode.fftSize);
    const input = new Float32Array(detector.inputLength);
    updatePitch(analyserNode, detector, input, audioContext.sampleRate);
  }

  function stopMicrophone() {
    if (audio) {
      console.log("stop!");
      audio.getTracks().forEach((track) => track.stop());
      setAudio(null);
    }
    clearTimeout(recoding);
  }

  function toggleMicrophone() {
    if (audio) {
      stopMicrophone();
    } else {
      getMicrophone();

      //* 15초 뒤에 자동 종료
      // setTimeout(() => {
      //   this.stopMicrophone();
      // }, 15000);
    }
  }

  function updatePitch(analyserNode, detector, input, sampleRate) {
    analyserNode.getFloatTimeDomainData(input);
    const [pitch, clarity] = detector.findPitch(input, sampleRate);

    const pitchFrequency = Math.round(pitch * 10) / 10;
    const clarityPercent = Math.round(clarity * 100);

    if (clarityPercent >= 80) {
      // 80% 정확도인 피치만 출력
      document.getElementById("pitch").textContent = `${pitchFrequency}Hz`;
      document.getElementById("clarity").textContent = `${clarityPercent}%`;
      console.log(pitchFrequency + " Hz", clarityPercent + " %");
    }

    recoding = setTimeout(() => updatePitch(analyserNode, detector, input, sampleRate), 100);
  }

  return (
    <div>
      <div className="controls">
        <button onClick={toggleMicrophone}>{audio ? "Stop microphone" : "Get microphone input"}</button>
      </div>
      <div>피치 </div>
      <span id="pitch"></span>
      <div>정확도 </div>
      <span id="clarity"></span>
    </div>
  );
}

export default Record;
