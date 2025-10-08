import "./index.css";
import * as Tone from "tone";
import { useRef, useState } from "react";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

function App() {
  const synth = useRef(null);
  const loop = useRef(null);

  const [playing, setPlaying] = useState(false);

  const SIZE = 1000; // Adjust this to test for different sizes (In Bytes)

  const [files, setFiles] = useState([]);
  const [fileContent, setFileContent] = useState([]);
  const [fileType, setFileType] = useState("");

  function handleSound(pitch, timbre, i) {
    // Sound is done using a loop the idea is that a constant sound plays so that
    // you can quickly view many files and infer differences without relying on duration
    // May move the loop to the toggleFunction
    if (playing) {
      console.log(timbre, fileType);
      if (loop.current) {
        loop.current.stop();
        loop.current.dispose();
      }

      Tone.getTransport().cancel();

      if (synth.current) {
        synth.current.dispose();
      }

      switch (timbre) {
        case "synth":
          synth.current = new Tone.Synth().toDestination();
          break;
        case "metal":
          synth.current = new Tone.MetalSynth().toDestination();
      }

      loop.current = new Tone.Loop((time) => {
        synth.current.triggerAttackRelease(pitch + i, "8n", time);
      }, "4n").start("8n");

      Tone.getTransport().bpm.value = 300; // Controls tempo, will create a method to adjust based on some characteristic
      Tone.getTransport().start();
    }
  }

  function handleFileChange(e) {
    setFiles((prev) => [...prev, e.target.files[0]]);
  }

  function checkFileType(file, fileReader) {
    console.log(file.type);
    switch (file.type) {
      case "image/jpeg":
        setFileType("img");
        fileReader.readAsDataURL(file);
        return "metal";
      case "text/plain":
        setFileType("txt");
        fileReader.readAsText(file);
        return "synth";
    }
  }

  function checkSize(file) {
    if (file.size > SIZE) {
      return "G";
    } else {
      return "F";
    }
  }

  async function handleFileRead(i) {
    // Await AudioContext resume immediately on user click:
    await Tone.start();

    const file = files[i];
    if (!file) {
      setFileContent(["No such file"]);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setFileContent(content.split(/\r\n|\r|\n/));
    };

    const pitch = checkSize(file).toUpperCase();
    const timbre = checkFileType(file, reader);

    setPlaying(true);

    handleSound(pitch, timbre, 5);
  }

  function toggleSound() {
    // Enables/Disables sound
    setPlaying((prev) => !prev);
    Tone.getTransport().stop();
  }

  function handleTTS(idx) {
    // Speaks the file name
    speechSynthesis.cancel();
    const fileName = new SpeechSynthesisUtterance(files[idx].name);
    speechSynthesis.speak(fileName);
  }

  const sounds = files.map((file, index) => {
    return (
      <div key={index} className={"ml-9"}>
        <Button
          onContextMenu={(e) => {
            e.preventDefault();
            handleTTS(index);
          }}
          onClick={() => handleFileRead(index)}
          variant="contained"
        >
          {"Sound " + (index + 1)}
        </Button>
      </div>
    );
  });

  return (
    <>
      <div className="flex justify-center mt-20">
        <span className={"font-semibold text-lg"}>
          {"You have " + files.length + " files uploaded."}
        </span>
      </div>

      <div className="flex items-center justify-center w-full mt-20 mb-20 gap-4">
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
        >
          Upload files
          <input type="file" onChange={handleFileChange} className={"hidden"} />
        </Button>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          onClick={() => {
            toggleSound();
          }}
          color={playing ? "success" : "error"}
        >
          Toggle Sound
        </Button>
      </div>

      <div className={"flex justify-center items-center w-full"}>{sounds}</div>

      {fileType === "txt" ? (
        <div className="overflow-y-auto max-h-96 font-mono bg-gray-100 border p-2">
          {fileContent.map((line, i) =>
            line === "" ? (
              <br />
            ) : (
              <div key={i} className={"hover:bg-blue-900"}>
                {line}
              </div>
            )
          )}
        </div>
      ) : (
        <img
          style={{ width: "100%" }}
          src={fileContent}
          alt={"uploaded image"}
        />
      )}
    </>
  );
}

export default App;
