'use client';

import * as Tone from 'tone';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faFileCsv} from '@fortawesome/free-solid-svg-icons';
import Papa from 'papaparse';
import { useRouter } from 'next/navigation';
import {useRef, useContext, useEffect} from 'react';
import {ContentContext} from "@/app/context/ContentContext";
import {FilesContext} from "@/app/context/FilesContext";


function DisplayFiles() {
  const router = useRouter();
  const loop = useRef(null);
  const { setContentData } = useContext(ContentContext);
  const { files } = useContext(FilesContext);

  console.log(files);
  const synth = useRef(null);

  useEffect(() => {
    synth.current = new Tone.Synth({
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.3,
        release: 0.2,
      },
      portamento: 0.01,
    }).toDestination()
  })

  function handleLeftClick(file) {
    // Speaks the file metadata
    speechSynthesis.cancel();
    const script = new SpeechSynthesisUtterance(
      'The file: ' +
        file.name +
        ' is a ' +
        file.type +
        'file and ' +
        file.size / 100 +
        ' kilobytes.'
    );
    script.rate = 0.7;
    speechSynthesis.speak(script);
  }

  function handleHoverTTS(density) {
    // Not in use
    // Speaks the file density
    speechSynthesis.cancel();
    const script = new SpeechSynthesisUtterance('Density is ' + density + ' Hz.');
    script.rate = 0.7;
    speechSynthesis.speak(script);
  }

  // can adjust the threshold based on values
  function detectAnomalies(rows, threshold = 0.1) {
    return rows.map((row, index) => {
      const t = row['t'];
      const y = parseFloat(row['y']);
      let isAnomaly = false;
      let message = ''; // anomaly message variable

      if (isNaN(y)) {
        isAnomaly = true;
        message = 'Missing data at this point.';
      } else if (index > 0) {
        // delta thresholding anomaly check
        const prev = parseFloat(rows[index - 1].y);
        const delta = y - prev;
        if (Math.abs(delta) > threshold) {
          isAnomaly = true;
          message =
            delta > 0
              ? 'This data point shows a sharp increase from the previous.'
              : 'This data point shows a sudden drop from the previous.';
        } else {
          message = delta > 0 ? 'This point shows an upward trend.' : 'This point shows a decline.';
        }
      } else {
        message = 'This is the first data point';
      }

      return {t, y, isAnomaly, message};
    });
  }

  function dataDensity(data) {
    if (data.length < 2) return 0;

    const start = data[0].t;
    const end = data[data.length - 1].t;
    const durationSeconds = end - start;

    return data.length / durationSeconds;
  }

  function mapSize(size) {
    const inMin = 1;
    const inMax = 50000;
    const outMin = 40;
    const outMax = 80;

    return outMin + ((size - inMin) / (inMax - inMin)) * (outMax - outMin);
  }

  function loopHover(midi, tempo) {
    winddown();

    loop.current = new Tone.Loop((time) => {
      const note = Tone.Frequency(midi, 'midi').toNote();
      synth.current.triggerAttackRelease(note, '4n', time);
    }, '4n').start('8n');

    Tone.getTransport().bpm.value = tempo;
    Tone.getTransport().start();
  }

  function winddown() {
    if (loop.current) {
      loop.current.stop();
      loop.current.dispose();
      loop.current = null;
    }
  }

  function readFile(file, click) {
    // Uses Papa parser to read the csv data and redirect to the next page
    switch (file.type) {
      case 'text/csv':
        Papa.parse(file.content, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: function (results) {
            if (click) {
              // finds anomalies and then navigates to content page
              const content = detectAnomalies(results.data);
              winddown();
              console.log(content);
              setContentData(content); // before calling router.push
              router.push(`/content?filename=${encodeURIComponent(file.name)}`);
            } else {
              const tempo = dataDensity(results.data);
              const pitch = mapSize(file.size);
              //handleHoverTTS(pitch);
              loopHover(pitch, tempo);
            }
          },
          error: function (err) {
            console.error('Parsing error:', err.message);
          },
        });
    }
  }

  const uploads = files.map((file, idx) => {
    // Maps each file to a card.
    return (
      <div
        key={idx}
        className={
          'flex items-center justify-center gap-2 transition-all border-2 border-[#6196FFFF] hover:border-[#155DFC00] hover:text-xl rounded-2xl shadow-[#276EFB7F] shadow-2xl duration-300 mt-10 h-30 hover:h-35 bg-blue-600 hover:bg-blue-500 text-white font-bold p-3 hover:p-4'
        }
        onContextMenu={(e) => {
          e.preventDefault();
          handleLeftClick(file);
        }}
        onClick={async () => {
          await Tone.start();
          readFile(file, true);
        }}
        onMouseEnter={async () => {
          await Tone.start();
          readFile(file, false);
        }}
        onMouseLeave={async () => {
          winddown();
        }}>
        {file.name}
        <FontAwesomeIcon icon={faFileCsv} />
      </div>
    );
  });

  return <div className={'flex items-center justify-center gap-4'}>{uploads}</div>;
}

export default DisplayFiles;
