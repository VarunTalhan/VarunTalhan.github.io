const fileInput = document.querySelector("#file");
const output = document.querySelector(".output");
const synth = new Tone.Synth().toDestination();

/*Maps the size of a file to a pitch*/
function getPitch (file_size, in_min, in_max, out_min, out_max){
    return(out_min + ((file_size - in_min) / (in_max - in_min)) * (out_max - out_min));
};

//File extensions, separated between text and binary
const extensionText = ["txt", "js", "json", "csv", "html"]
const extensionBinary = ["jpg", "png", "gif", "pdf"]

/*Gets the density of a file depending on the type of file it is
Whether the file is text, binary, or something else*/
async function getDensity(file, extension){
    if(extensionText.includes(extension)){
    const text = await file.text();
    const lines = text.split("\n");
    const totalLength = lines.reduce((acc, line) => acc + line.length, 0);
    return totalLength / lines.length; //This provide the average length
    }
    else if(extensionBinary.includes(extension)){
    const fileNameLength = file.name.length;
    return file.size / fileNameLength; //This provides a fallback density for files that aren't text
    } 
    return file.size;
};

function getTimbre(){
    const getInstrument = {
        extensionText: new Tone.Synth().toDestination(),
        extensionBinary: new Tone.FMSynth().toDestination()
    };
};

//Consts for the tempo
//Input density range 
    const inDensityMin = 10
    const inDensityMax = 500
//Output desnity range (bpm)
    const outDensityMin = 60
    const outDensityMax = 200
//Maps file's density to a tempo(bpm)
function getTempo(density){
    // Clamp density to ensure it's within the input range
    const clampedDensity = (Math.min(Math.max(density, inDensityMin), inDensityMax));
    const normalised = (clampedDensity - inDensityMin)/(inDensityMax - inDensityMin);
    return(outDensityMin + normalised* (outDensityMax - outDensityMin));
};

fileInput.addEventListener("change", async() => {
    await Tone.start();
    output.innerText = "";

    //Accesses first file selected by the user
    const file = fileInput.files[0];
    //Stores file size in fileSize
    const fileSize = file.size;
    //Splits the name by the last part and converts it to lowercase
    const extension = file.name.split(".").pop().toLowerCase();

    //Input pitch range 
    const inPitchMin = 1;
    const inPitchMax = 1000000;
    //Output pitch range (MIDI)
    const outPitchMin = 40;
    const outPitchMax = 80;
    //Clamp MIDI value to ensure it stays within the output range
    let midi = getPitch(fileSize, inPitchMin, inPitchMax, outPitchMin, outPitchMax);
    midi = (Math.min(Math.max(midi, outPitchMin), outPitchMax));

    //Converts MIDI number to musical notes
    const pitch = Tone.Frequency(midi, "midi").toNote();
    //Calculates the density from a file 
    const density = await getDensity(file, extension);
    //Uses density value to calculate tempo
    const tempo = getTempo(density);

    Tone.Transport.bpm.value = tempo;

    // Check if a previous loop exists
    // If so, stop the transport and dispose of the previous loop
    if(window.loop){
        Tone.Transport.stop();
        window.loop.dispose();
        window.loop = null;
    };

    //Schedules synth to play one note
    Tone.Transport.scheduleOnce(time =>{
        synth.triggerAttackRelease(pitch, "8n", time);
    }, "0");
    

    //Starts Tone.js’s internal clock so scheduled events will play


    Tone.Transport.start();
    
    output.innerText += `file name:\n${file.name}, size: \n${fileSize}, type: \n${file.type}`;
});
