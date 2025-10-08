function getPitch(sizeKB) {
  return sizeKB > 100 ? "C3" : "C6";
}

function getDuration(density) {
  return density > 0.6 ? "8n" : "4n";
}

function getSynth(type) {
  return type === "numeric"
    ? new Tone.AMSynth().toDestination()
    : new Tone.FMSynth().toDestination();
}

// Play the sound based on simulated file
function playFileOpenSound(file) {
  const pitch = getPitch(file.sizeKB);
  const duration = getDuration(file.density);
  const synth = getSynth(file.type);

  Tone.start().then(() => {
    synth.triggerAttackRelease(pitch, duration);
    console.log(`Played ${pitch} for ${duration} using ${file.type}`);
  });
}

document.getElementById("file-input").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const sizeKB = Math.round(file.size / 1024);

  const density = sizeKB > 100 ? 0.8 : 0.4;

  const fileName = file.name.toLowerCase();
  let type = "unknown";
  if (fileName.endsWith(".txt")) {
    type = "text";
  } else if (fileName.endsWith(".csv") || fileName.endsWith(".json")) {
    type = "numeric";
  }

  const File = {
    sizeKB: sizeKB,
    density: density,
    type: type,
  };

  playFileOpenSound(File);

  document.getElementById(
    "file-info"
  ).textContent = `File: ${file.name} | Size: ${sizeKB} KB | Density: ${density} | Type: ${type}`;
});
