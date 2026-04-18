import fs from "fs";
import { Buffer } from "node:buffer";
import fetch from "node-fetch";
import FormData from "form-data";
import { execSync } from "child_process";

const TELEGRAM_TOKEN = "PUT_TELEGRAM_BOT";
const CHAT_ID = "PUT_CHAT_ID";

// 🧠 قصة بسيطة (لاحقاً نطوّرها AI)
const story = "شاب دخل مدينة مهجورة وبدأ يسمع أصوات غريبة في الليل...";

// 🔊 صوت ElevenLabs (مكانه لاحقاً)
async function makeVoice() {
  const res = await fetch("https://translate.google.com/translate_tts?ie=UTF-8&q=" + encodeURIComponent(story) + "&tl=ar&client=tw-ob");
  const buf = await res.arrayBuffer();
  fs.writeFileSync("voice.mp3", Buffer.from(buf));
}

// 🖼️ صور
async function makeImages() {
  for (let i = 0; i < 3; i++) {
    const res = await fetch("https://picsum.photos/720/1280");
    const buf = await res.arrayBuffer();
    fs.writeFileSync(`img${i}.jpg`, Buffer.from(buf));
  }
}

// 🎬 فيديو
function buildVideo() {
  execSync(`
    ffmpeg -y \
    -loop 1 -i img0.jpg -loop 1 -i img1.jpg -loop 1 -i img2.jpg \
    -i voice.mp3 \
    -filter_complex "[0:v][1:v][2:v]concat=n=3:v=1:a=0,format=yuv420p[v]" \
    -map "[v]" -map 3:a \
    -t 60 video.mp4
  `);
}

// 📤 إرسال Telegram
async function sendTelegram() {
  const form = new FormData();
  form.append("chat_id", CHAT_ID);
  form.append("video", fs.createReadStream("video.mp4"));

  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendVideo`, {
    method: "POST",
    body: form
  });
}

// 🚀 تشغيل كامل
await makeVoice();
await makeImages();
buildVideo();
await sendTelegram();

console.log("✅ تم إنشاء الفيديو");
