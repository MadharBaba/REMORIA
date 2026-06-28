// ============================================================
// MEMORY VAULT GENERATOR — creator.js
// Handles: dynamic question/memory blocks, image previews,
// validation, vault ID generation, localStorage save (Day 1).
// Firebase save will replace localStorage logic on Day 2.

import { saveVault } from "./firebase.js";

// ============================================================
const questionsContainer = document.getElementById("questionsContainer");
const memoriesContainer = document.getElementById("memoriesContainer");
const questionTemplate = document.getElementById("questionTemplate");
const memoryTemplate = document.getElementById("memoryTemplate");

const addQuestionBtn = document.getElementById("addQuestionBtn");
const addMemoryBtn = document.getElementById("addMemoryBtn");
const generateBtn = document.getElementById("generateBtn");

const formError = document.getElementById("formError");
const generatedLinkBox = document.getElementById("generatedLinkBox");
const generatedLinkInput = document.getElementById("generatedLink");
const previewLink = document.getElementById("previewLink");
const copyLinkBtn = document.getElementById("copyLinkBtn");

function addQuestionBlock() {
    const clone = questionTemplate.content.cloneNode(true);
    const block = clone.querySelector(".question-block");

    block.querySelector(".removeBtn").addEventListener("click", () => {
        block.remove();
    });

    questionsContainer.appendChild(block);
}

function addMemoryBlock() {
    const clone = memoryTemplate.content.cloneNode(true);
    const block = clone.querySelector(".memory-block");

    const fileInput = block.querySelector(".memoryImage");
    const previewImg = block.querySelector(".memoryPreview");

    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewImg.classList.remove("hidden");
        };
        reader.readAsDataURL(file);
    });

    block.querySelector(".removeBtn").addEventListener("click", () => {
        block.remove();
    });

    memoriesContainer.appendChild(block);
}

addQuestionBtn.addEventListener("click", addQuestionBlock);
addMemoryBtn.addEventListener("click", addMemoryBlock);

addQuestionBlock();
addMemoryBlock();

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function generateVaultId() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let id = "vault_";
    for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

function validateForm() {
    const name = document.getElementById("personName").value.trim();
    const message = document.getElementById("finalMessage").value.trim();
    const questionBlocks = document.querySelectorAll(".question-block");
    const memoryBlocks = document.querySelectorAll(".memory-block");

    if (!name) return "Please enter the birthday person's name.";
    if (!message) return "Please write a final birthday message.";
    if (questionBlocks.length < 1) return "Add at least 1 quiz question.";
    if (memoryBlocks.length < 1) return "Add at least 1 memory.";

    for (const block of questionBlocks) {
        const q = block.querySelector(".questionText").value.trim();
        const a = block.querySelector(".questionAnswer").value.trim();
        if (!q || !a) return "Fill in all question fields and answers.";
    }

    for (const block of memoryBlocks) {
        const caption = block.querySelector(".memoryCaption").value.trim();
        if (!caption) return "Add a caption for every memory.";
    }

    return null;
}

async function collectVaultData() {
    const name = document.getElementById("personName").value.trim();
    const message = document.getElementById("finalMessage").value.trim();

    const questions = [];
    document.querySelectorAll(".question-block").forEach((block) => {
        questions.push({
            question: block.querySelector(".questionText").value.trim(),
            answer: block.querySelector(".questionAnswer").value.trim(),
        });
    });

    const memories = [];
    const memoryBlocks = document.querySelectorAll(".memory-block");
    for (const block of memoryBlocks) {
        const fileInput = block.querySelector(".memoryImage");
        const caption = block.querySelector(".memoryCaption").value.trim();
        const imageData = await fileToBase64(fileInput.files[0]);
        memories.push({ image: imageData, caption });
    }

    const musicInput = document.getElementById("bgMusicUpload");
    const musicData = await fileToBase64(musicInput.files[0]);

    return {
        name,
        questions,
        memories,
        finalMessage: message,
        music: musicData,
        createdAt: new Date().toISOString(),
    };
}

generateBtn.addEventListener("click", async () => {
    const error = validateForm();

    if (error) {
        formError.textContent = error;
        formError.classList.remove("hidden");
        return;
    }

    formError.classList.add("hidden");
    generateBtn.disabled = true;
    generateBtn.textContent = "Generating...";

    try {
        const vaultData = await collectVaultData();
        const vaultId = generateVaultId();


        const shareUrl = `${window.location.origin}/portal.html?vault=${vaultId}`;
        await saveVault(vaultId, vaultData);
        const shareUrl = `https://remoria-bay.vercel.app/portal.html?vault=${vaultId}`;
        generatedLinkInput.value = shareUrl;
        previewLink.href = shareUrl;
        generatedLinkBox.classList.remove("hidden");
    } catch (err) {
        formError.textContent = "Something went wrong generating the vault. Try again.";
        formError.classList.remove("hidden");
        console.error(err);
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = "Generate Vault";
    }
});

copyLinkBtn.addEventListener("click", () => {
    generatedLinkInput.select();
    navigator.clipboard.writeText(generatedLinkInput.value).then(() => {
        copyLinkBtn.textContent = "Copied!";
        setTimeout(() => (copyLinkBtn.textContent = "Copy"), 1500);
    });
});
