const html = document.documentElement;
const themeBtn = document.getElementById("themeBtn");

const form = document.getElementById("generateForm");
const nameInput = document.getElementById("name");
const textInput = document.getElementById("text");

const generateBtn = document.getElementById("generateBtn");
const resultImg = document.getElementById("resultImg");
const emptyResult = document.getElementById("emptyResult");
const downloadBtn = document.getElementById("downloadBtn");

themeBtn.addEventListener("click", () => {
  const current = html.getAttribute("data-bs-theme");
  const next = current === "dark" ? "light" : "dark";

  html.setAttribute("data-bs-theme", next);
  themeBtn.textContent = next === "dark" ? "Light" : "Dark";
});

form.addEventListener("submit", async event => {
  event.preventDefault();

  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";

  try {
    const params = new URLSearchParams({
      name: nameInput.value || "defan",
      text:
        textInput.value ||
        "Jangan terlalu fokus mikirin error hari ini, King. Codingan serumit apa pun pasti nemu jalan keluarnya, asal teliti dan konsisten."
    });

    const response = await fetch(`/api/generate?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Gagal generate gambar");
    }

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);

    resultImg.src = imageUrl;
    resultImg.classList.remove("d-none");
    emptyResult.classList.add("d-none");

    downloadBtn.href = imageUrl;
    downloadBtn.classList.remove("disabled");
  } catch (error) {
    alert(error.message);
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate";
  }
});
