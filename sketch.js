/* eslint-disable no-undef, no-unused-vars */

// DECLARATION OF VARIABLES
let oscType;
let modFrequency;
let pwmTxt;

let ampA, ampD, ampS, ampR;
let filtA, filtD, filtS, filtR;
let yAmpSlider, yAmpBox;
let xAmpSlider;

//image preload
let bot, keys, snare, cymbal, raca, uKeys, uSnare, uCymbal, uRaca;
function preload() {
  bot = loadImage("media/ROBOT.png");
  keys = loadImage("media/Big PIANO.png");
  snare = loadImage("media/snare.png");
  cymbal = loadImage("media/Cymbal.png");
  raca = loadImage("media/maraca.png");
  uKeys = loadImage("media/SMOL PIANO.png");
  uSnare = loadImage("media/smol snare.png");
  uCymbal = loadImage("media/smol Cymbal.png");
  uRaca = loadImage("media/Smol maraca.png");
}

//Create sampler Instruments
const snareSound = new Tone.Player("media/snare.wav").toDestination();
const cymbalSound = new Tone.Player("media/cymbal.wav").toDestination();
const racaSound = new Tone.Player("media/maraca.wav").toDestination();

// CREATE OSC
let osc = new Tone.OmniOscillator("c4", "sine").start();

// CREATE AMP ENV
let ampEnv = new Tone.AmplitudeEnvelope({
  attack: 0.1,
  decay: 0.2,
  sustain: 1.0,
  release: 0.8
});

// CREATE FILTER
let filter = new Tone.Filter({
  Q: 1,
  rolloff: -12,
  type: "lowpass"
});

// CREATE FILTER ENV
let filterEnv = new Tone.FrequencyEnvelope({
  attack: 0.6,
  baseFrequency: 50,
  decay: 0.2,
  exponent: 2,
  octaves: 4.4,
  release: 2,
  sustain: 0.5
});

//ROUTING OF SIGNALS
filter.toDestination();
ampEnv.connect(filter);
osc.connect(ampEnv);

filterEnv.connect(filter.frequency);

//MIDI
// Enable WEBMIDI.js and trigger the onEnabled() function when ready
WebMidi.enable()
  .then(onEnabled)
  .catch((err) => alert(err));

// Function triggered when WEBMIDI.js is ready
function onEnabled() {
  // Display available MIDI input devices
  if (WebMidi.inputs.length < 1) {
    document.body.innerHTML += "No device detected.";
  } else {
    WebMidi.inputs.forEach((device, index) => {
      document.body.innerHTML += `${index}: ${device.name} <br>`;
    });
  }

  const mySynth = WebMidi.inputs[0];

  mySynth.channels[1].addListener("noteon", (e) => {
    console.log(e.note);
    osc.frequency.value = note.frequency;
    ampEnv.triggerAttack();
    filterEnv.triggerAttack();
  });

  mySynth.channels[1].addListener("noteoff", (e) => {
    ampEnv.triggerRelease();
    filterEnv.triggerRelease();
  });
}

// AUDIO KEYS
const keyboard = new AudioKeys();

// KEY PRESS
keyboard.down(function (note) {
  osc.frequency.value = note.frequency;
  ampEnv.triggerAttack();
  filterEnv.triggerAttack();
});

// KEY RELEASE
keyboard.up(function (note) {
  ampEnv.triggerRelease();
  filterEnv.triggerRelease();
});

function setup() {
  createCanvas(1000, 1000);

  // OSC SELECT BOX
  oscType = createSelect();
  oscType.position(15, 155);
  oscType.option("sine");
  oscType.option("square");
  oscType.option("triangle");
  oscType.option("sawtooth");
  oscType.selected("sawtooth");
  oscType.option("pwm");

  //PWM SLIDER
  pwmText = createSpan(`MOD`);
  pwmText.position(100, 80);
  pwmText.style("font-family", "helvetica");
  pwmText.hide();

  // PWM SLIDER HIDING
  oscType.changed(() => {
    osc.type = oscType.value();

    if (oscType.value() === "pwm") {
      modFrequency.show();
      pwmText.show();
      console.log(pwmTxt);
    } else {
      mod.hide();
      pwmText.hide();
    }
  });

  // MOD
  modFrequency = createSlider(0, 5, 0.5, 0);
  modFrequency.position(15, 185);
  modFrequency.hide();
  modFrequency.style("width", "75px");

  // AMP ENV

  ampA = createSlider(0.001, 3, 0.01, 0);
  ampA.style("width", "80px");

  ampD = createSlider(0.001, 3, 0.01, 0);
  ampD.style("width", "80px");

  ampS = createSlider(0, 1, 1, 0);
  ampS.style("width", "80px");

  ampR = createSlider(0.001, 3, 0.01, 0);
  ampR.style("width", "80px");

  filtA = createSlider(0.001, 3, 0.01, 0);
  filtA.style("width", "80px");

  filtD = createSlider(0.001, 3, 0.01, 0);
  filtD.style("width", "80px");

  filtS = createSlider(0, 1, 1, 0);
  filtS.style("width", "80px");

  filtR = createSlider(0.001, 3, 0.01, 0);
  filtR.style("width", "80px");
}

function draw() {
  background("black");

  //images
  image(uKeys, 150, 10);
  image(uSnare, 525, 5);
  image(uCymbal, 650, -15);
  image(uRaca, 825, 10);

  image(bot, 350, 400);
  // image(keys, 250, 600);
  if (keyIsDown(66)) {
    image(snare, 440, 650);
  } else if (keyIsDown(78)) {
    image(cymbal, 200, 550);
  } else if (keyIsDown(77)) {
    image(raca, 300, 525);
  } else {
    image(keys, 250, 600);
  }

  let keyMap = createA(
    "https://github.com/kylestetz/AudioKeys",
    "(Click Here for Key Map)",
    "_blank"
  );
  keyMap.position(165, 280);
  fill("orange");
  rect(160, 255, 175, 30);

  // MOD CONNECT IF PWM
  if (oscType.value() === "pwm") {
    osc.modulationFrequency.value = modFrequency.value();
  }

  // SLIDERS TO VALUES
  ampEnv.attack = ampA.value();
  ampEnv.decay = ampD.value();
  ampEnv.sustain = ampS.value();
  ampEnv.release = ampR.value();

  filterEnv.attack = filtA.value();
  filterEnv.decay = filtD.value();
  filterEnv.sustain = filtS.value();
  filterEnv.release = filtR.value();

  // OSCILATOR BOX
  fill("blue");
  rect(10, 100, 150, 150);
  fill("orange");
  rect(10, 100, 150, 30);
  fill(0);
  text("Oscillator", 30, 125);

  text("Type", 20, 150);

  // ENV BOX
  yAmpBox = 0;
  fill("blue");
  rect(175, 100 + yAmpBox, 150, 150);
  fill("orange");
  rect(175, 100 + yAmpBox, 150, 30);
  fill(0);
  text("Amp Envelope", 200, 125 + yAmpBox);

  //ENV SLIDERS AND TEXT
  yAmpSlider = yAmpBox + 145;
  xAmpSlider = 14 + 175;
  ampA.position(xAmpSlider, yAmpSlider);
  ampD.position(xAmpSlider, yAmpSlider + 25);
  ampS.position(xAmpSlider, yAmpSlider + 50);
  ampR.position(xAmpSlider, yAmpSlider + 75);
  text(round(ampA.value(), 2), xAmpSlider + 100, yAmpSlider + 15);
  text(round(ampD.value(), 2), xAmpSlider + 100, yAmpSlider + 15 + 25);
  text(round(ampS.value(), 2), xAmpSlider + 100, yAmpSlider + 15 + 50);
  text(round(ampR.value(), 2), xAmpSlider + 100, yAmpSlider + 15 + 75);

  // FILTER BOX
  let xFilterOffset = 325;
  fill("blue");
  rect(10 + xFilterOffset, 100 + yAmpBox, 150, 150);
  fill("orange");
  rect(10 + xFilterOffset, 100 + yAmpBox, 150, 30);
  fill(0);
  text("Freq Envelope", 30 + xFilterOffset, 125 + yAmpBox);

  // FILTER SLIDERS
  filtA.position(14 + xFilterOffset, yAmpSlider);
  filtD.position(14 + xFilterOffset, yAmpSlider + 25);
  filtS.position(14 + xFilterOffset, yAmpSlider + 50);
  filtR.position(14 + xFilterOffset, yAmpSlider + 75);

  // FILTER SLIDER TEXT
  let xFiltLabelOffest = 450;
  text(round(filtA.value(), 2), xFiltLabelOffest, yAmpSlider + 15);
  text(round(filtD.value(), 2), xFiltLabelOffest, yAmpSlider + 15 + 25);
  text(round(filtS.value(), 2), xFiltLabelOffest, yAmpSlider + 15 + 50);
  text(round(filtR.value(), 2), xFiltLabelOffest, yAmpSlider + 15 + 75);

  //percussion text
  fill(255);
  text("SNARE (B)", 540, 125);
  text("CYMBAL (N)", 680, 165);
  text("MARACA (M)", 850, 160);
}

//Non-AudioKeys triggers
function keyPressed() {
  console.log(key);

  if (key === "b") {
    snareSound.start();
  }
  if (key === "n") {
    cymbalSound.start();
  }
  if (key === "m") {
    racaSound.start();
  }
}
