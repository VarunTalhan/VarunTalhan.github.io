import * as math from 'mathjs';
import {useEffect, useRef, useState} from 'react';
import {useLocation} from 'react-router-dom';
import * as Tone from 'tone';

function ContentPage() {
  const synth = useRef(
    new Tone.MonoSynth({
      oscillator: {type: 'sine'},
      portamento: 0.01,
    }).toDestination()
  );

  const median = useRef(null);
  const octaveChangePerDataUnit = useRef(null);

  const cancelPlayback = useRef(false);

  const location = useLocation();

  const [playing, setPlaying] = useState(false);

  const {data, filename, filetype} = location.state || {};

  const pressTimerRef = useRef(null);

  useEffect(() => {
    handleDataSoundConversion(data);
  }, [data]);

  if (!data) return <div>No data available.</div>;

  const columns = ['time', 'value'];

  function contentSound(content, anomaly) {
    // not in use
    const scaledX = clampedScaling(content, anomaly);
    console.log(scaledX);

    const note = Tone.Frequency(scaledX, 'midi').toNote();

    if (!playing) {
      synth.current.triggerRelease();
      synth.current.triggerAttack(note);
      setPlaying((prev) => !prev);
    } else {
      synth.current.setNote(note);
    }
  }

  function playback(cellValue, isFirst) {
    const dataValue = parseFloat(cellValue);
    if (isNaN(dataValue)) {
      synth.current.triggerRelease();
      console.error(cellValue);
      return true;
    }
    console.log(cellValue);
    const pitch = convertValueToPitch(dataValue);
    console.log(pitch);
    if (isFirst) {
      synth.current.triggerRelease();
      synth.current.triggerAttack(pitch);
    } else {
      synth.current.setNote(pitch);
    }
    return false;
  }

  function clampedScaling(x, anomaly) {
    // not in use
    console.log('anomaly = ' + anomaly);
    let outMin = 30;
    let outMax = 60;
    if (anomaly) {
      outMin = 60;
      outMax = 90;
    }

    const min = -1;
    const max = 1;
    const clampedX = Math.max(min, Math.min(max, x));

    return outMin + ((clampedX - min) / (max - min)) * (outMax - outMin);
  }

  async function sonifyData() {
    console.log('Clicked!');
    if (playing) return;

    setPlaying(true);
    let isFirst = true;
    cancelPlayback.current = false;

    for (const row of data) {
      if (cancelPlayback.current) {
        break;
      }
      isFirst = playback(row.y, isFirst);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    synth.current.triggerRelease();
    setPlaying(false);
  }

  function handleDataSoundConversion(rows) {
    const newData = rows
      .map((row) => row.y)
      .flat()
      .map((val) => parseFloat(val))
      .filter((val) => !isNaN(val));
    const newMedian = math.median(newData);
    const q1 = math.quantileSeq(newData, 0.25);
    const q3 = math.quantileSeq(newData, 0.75);
    const LSIQR = Math.abs(q1 - newMedian);
    const USIQR = Math.abs(q3 - newMedian);
    const epsilon = 0.00001;
    const calculatedOctaveChangePerDataUnit =
      Math.min(LSIQR, USIQR) > epsilon ? 1 / Math.min(LSIQR, USIQR) : 1; // fallback default sensitivity

    median.current = newMedian;
    octaveChangePerDataUnit.current = calculatedOctaveChangePerDataUnit;
  }

  function convertValueToPitch(dataValue) {
    const octave = 5 + octaveChangePerDataUnit.current * (dataValue - median.current); // median clamped at fifth octave
    const clampedOctave = Math.max(1, Math.min(9, octave));
    const c0Frequency = Tone.Frequency('C0').toFrequency();

    return c0Frequency * 2 ** clampedOctave; // going up one octave corresponds to doubling in frequency, so e.g. c5Frequency = c0Frequency*(2**5)
  }

  function handleCellHover(cellValue) {
    const dataValue = parseFloat(cellValue);
    if (isNaN(dataValue)) {
      synth.current.triggerRelease();
      return;
    }

    const pitch = convertValueToPitch(dataValue);

    if (!playing) {
      synth.current.triggerAttack(pitch);
    } else {
      synth.current.setNote(pitch);
    }
  }

  const speak = (message) => {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(message));
  };

  const handleDown = (message) => {
    synth.current.triggerRelease();
    pressTimerRef.current = setTimeout(() => speak(message), 600);
  };

  const clearTimer = () => {
    clearTimeout(pressTimerRef.current);
  };

  return (
    <>
      <div className={'flex-col justify-center items-center ml-[40%]'}>
        <div className={'mb-2'}>
          <span className={'font-bold text-xl'}>{filename}</span>
          {!playing ? (
            <button
              className={'bg-blue-600 shadow-[#276EFB7F] shadow-2xl rounded-lg p-8 m-8 w-25'}
              onClick={async () => {
                await Tone.start();
                await sonifyData();
              }}>
              Play
            </button>
          ) : (
            <button
              className={'bg-red-600 shadow-[#E7000B80] shadow-2xl rounded-lg p-8 m-8 w-25'}
              onClick={async () => {
                await Tone.start();
                synth.current.triggerRelease();
                cancelPlayback.current = true;
              }}>
              Stop
            </button>
          )}
        </div>

        <div className='overflow-hidden rounded-2xl mt-8'>
          <table className='table-auto border-separate border-spacing-0 text-sm'>
            <thead>
              <tr>
                {columns.map((col, i) => (
                  <th
                    key={col}
                    className={`px-4 py-2 text-white bg-[#303030] border border-gray-600
                    ${i === 0 ? 'rounded-tl-xl' : ''}
                    ${i === columns.length - 1 ? 'rounded-tr-xl' : ''}`}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody
              onMouseEnter={() => {
                synth.current.triggerRelease();
                cancelPlayback.current = true;
                setPlaying(false);
              }}
              onMouseLeave={() => {
                synth.current.triggerRelease();
                setPlaying(false);
              }}>
              {data.map((row, i) => (
                <tr key={i}>
                  <td className='items-center text-white border border-gray-600 bg-[#303030] px-3'>
                    {row.t}
                  </td>
                  <td
                    className={`items-center text-white border border-gray-600 bg-[#303030] hover:bg-gray-600 px-3 
                                                ${
                                                  row.isAnomaly
                                                    ? 'bg-red-600 hover:bg-red-400 font-bold text-white'
                                                    : ''
                                                }`}
                    onMouseEnter={async () => {
                      await Tone.start();
                      handleCellHover(row.y);
                    }}
                    onMouseDown={() => handleDown(row.message)}
                    onMouseUp={clearTimer}
                    onMouseLeave={clearTimer}
                    onTouchStart={() => handleDown(row.message)}
                    onTouchEnd={clearTimer}>
                    {row.y}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default ContentPage;
