import express from "express";
import { createCanvas, loadImage, registerFont } from "canvas";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(process.cwd(), "public")));

const IMAGE = "https://files.soonex.biz.id/d57ffe876a03.jpg";
const FONT_PATH = path.join(process.cwd(), "fonts", "PixelOperator.ttf");

registerFont(FONT_PATH, {
  family: "PixelOperator"
});

const POS = {
  x: 160,
  y: 438,
  rotate: 0.028
};

const COLOR = {
  name: "#45d8d8",
  nameStroke: "#08131d",
  text: "#ffffff",
  textStroke: "#000000"
};

let bgCache = null;

async function getBackground() {
  if (bgCache) return bgCache;

  const res = await fetch(IMAGE, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil background image");
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  bgCache = await loadImage(buffer);

  return bgCache;
}

function getLayout(text) {
  const len = text.length;

  if (len <= 70) {
    return {
      nameSize: 29,
      textSize: 33,
      width: 610,
      lineHeight: 38,
      textY: 46
    };
  }

  if (len <= 120) {
    return {
      nameSize: 28,
      textSize: 31,
      width: 640,
      lineHeight: 36,
      textY: 43
    };
  }

  if (len <= 170) {
    return {
      nameSize: 27,
      textSize: 29,
      width: 670,
      lineHeight: 34,
      textY: 40
    };
  }

  if (len <= 230) {
    return {
      nameSize: 26,
      textSize: 27,
      width: 700,
      lineHeight: 32,
      textY: 36
    };
  }

  return {
    nameSize: 24,
    textSize: 25,
    width: 730,
    lineHeight: 30,
    textY: 32
  };
}

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  for (const word of words) {
    const test = line + word + " ";

    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line.trim());
      line = word + " ";
    } else {
      line = test;
    }
  }

  if (line) lines.push(line.trim());

  return lines;
}

function drawDialog(ctx, name, text) {
  const layout = getLayout(text);

  let textSize = layout.textSize;
  let lineHeight = layout.lineHeight;
  let width = layout.width;
  let textY = layout.textY;

  ctx.textBaseline = "top";
  ctx.font = `${textSize}px "PixelOperator"`;

  let lines = wrapLines(ctx, text, width);

  while (lines.length > 4 && textSize > 20) {
    textSize--;
    lineHeight--;
    width += 12;
    textY -= 2;

    ctx.font = `${textSize}px "PixelOperator"`;
    lines = wrapLines(ctx, text, width);
  }

  ctx.save();

  ctx.translate(POS.x, POS.y);
  ctx.rotate(POS.rotate);

  ctx.font = `${layout.nameSize}px "PixelOperator"`;
  ctx.lineWidth = 3;
  ctx.strokeStyle = COLOR.nameStroke;
  ctx.fillStyle = COLOR.name;

  ctx.strokeText(name, 0, 0);
  ctx.fillText(name, 0, 0);

  ctx.font = `${textSize}px "PixelOperator"`;
  ctx.lineWidth = 4;
  ctx.strokeStyle = COLOR.textStroke;
  ctx.fillStyle = COLOR.text;

  let y = textY;

  for (const line of lines) {
    ctx.strokeText(line, 0, y);
    ctx.fillText(line, 0, y);
    y += lineHeight;
  }

  ctx.restore();
}

async function renderImage({ name, text }) {
  const NAME = name || "defan";
  const TEXT =
    text ||
    "Jangan terlalu fokus mikirin error hari ini, King. Codingan serumit apa pun pasti nemu jalan keluarnya, asal teliti dan konsisten. Kalau capek, istirahat bentar, tapi jangan sampai berhenti.";

  const bg = await getBackground();

  const canvas = createCanvas(bg.width, bg.height);
  const ctx = canvas.getContext("2d");

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(bg, 0, 0);

  drawDialog(ctx, NAME, TEXT);

  return canvas.toBuffer("image/png");
}

app.get("/api/generate", async (req, res) => {
  try {
    const image = await renderImage({
      name: req.query.name,
      text: req.query.text
    });

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-store");

    return res.send(image);
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error instanceof Error ? error.message : "Internal Server Error"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Pixel Dialogue server running on port ${PORT}`);
});
