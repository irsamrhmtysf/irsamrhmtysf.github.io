import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0';

const status = document.getElementById('status');
const btnStart = document.getElementById('btnStart');
const btnStop = document.getElementById('btnStop');
const btnUpload = document.getElementById('btnUpload');
const resultContainer = document.getElementById('resultContainer');

const resSurah = document.getElementById('resSurah');
const resArabic = document.getElementById('resArabic');
const resTranslation = document.getElementById('resTranslation');

let transcriber = null;
let mediaRecorder;
let audioChunks = [];

// Initialize browser AI model on load
async function loadModel() {
    status.textContent = "Loading browser AI model (Whisper tiny)... Please wait.";
    try {
        // Using a lightweight model optimized for browser runtime
        transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.ar');
        status.textContent = "AI Model ready! You can record or upload audio.";
    } catch (e) {
        status.textContent = "Error loading AI model: " + e.message;
    }
}
loadModel();

// Handle Recording
btnStart.onclick = async () => {
    if (!transcriber) return alert("AI model is still loading, please wait.");
    audioChunks = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        await processAudio(audioBlob);
    };
    mediaRecorder.start();
    btnStart.disabled = true;
    btnStop.disabled = false;
    btnStop.className = "bg-red-600 text-white text-xs py-1.5 px-3 rounded w-full";
    status.textContent = "Listening to sholat recitation...";
    resultContainer.classList.add('hidden');
};

btnStop.onclick = () => {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(t => t.stop());
    btnStop.disabled = true;
    btnStop.className = "bg-gray-300 text-white text-xs py-1.5 px-3 rounded w-full cursor-not-allowed";
    btnStart.disabled = false;
};

// Handle File Upload
btnUpload.onclick = async () => {
    if (!transcriber) return alert("AI model is still loading, please wait.");
    const file = document.getElementById('audioFile').files[0];
    if (!file) return alert("Please select an MP3 file first.");
    await processAudio(file);
};

// Core Processing Function (Runs completely in browser)
async function processAudio(audioSource) {
    status.textContent = "Transcribing audio using browser AI...";
    resultContainer.classList.add('hidden');

    try {
        // Convert blob/file to a format the browser pipeline can read
        const url = URL.createObjectURL(audioSource);
        
        // Run Whisper AI locally in browser
        const output = await transcriber(url, {
            language: 'arabic',
            task: 'transcribe',
        });

        const arabicText = output.text ? output.text.trim() : "";
        if (!arabicText) {
            status.textContent = "Could not detect clear speech. Try again.";
            return;
        }

        status.textContent = "Matching transcribed text with Quran database...";

        // Query authentic Quran Cloud API
        const searchRes = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(arabicText)}/en.asad`);
        const searchData = await searchRes.json();

        if (searchData.code === 200 && searchData.data && searchData.data.matches.length > 0) {
            const match = searchData.data.matches[0];
            const surahName = match.surah.englishName;
            const ayahNum = match.numberInSurah;
            const ayahArabic = match.text;

            // Fetch Indonesian translation
            const transRes = await fetch(`https://api.alquran.cloud/v1/ayah/${match.number}/id.indonesian`);
            const transData = await transRes.json();
            const translationId = transData.code === 200 ? transData.data.text : "Translation not found.";

            status.textContent = "Ayah identified successfully!";
            resultContainer.classList.remove('hidden');
            resSurah.textContent = `${surahName} - Ayah ${ayahNum}`;
            resArabic.textContent = ayahArabic;
            resTranslation.textContent = `"${translationId}"`;
        } else {
            status.textContent = `Transcribed: "${arabicText}" (No direct Quran verse match found. Try a clearer recitation segment.)`;
        }

    } catch (err) {
        status.textContent = "Processing error: " + err.message;
        console.error(err);
    }
}