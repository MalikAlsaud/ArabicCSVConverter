let processedCsvData = null;

// Elements
const fileInput = document.getElementById('file-input');
const fileLabel = document.getElementById('file-label');
const outputDisplay = document.getElementById('output');
const downloadBtn = document.getElementById('download-btn');
const statusDisplay = document.getElementById('status');
const themeToggle = document.getElementById('theme-toggle');

const arabicInput = document.getElementById('arabic-input');
const reshapeBtn = document.getElementById('reshape-btn');
const reshapedOutput = document.getElementById('reshaped-output');
const outputWrapper = document.getElementById('output-wrapper');

// Tab Switching Navigation
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        this.classList.add('active');
        const targetTab = this.dataset.tab;
        document.getElementById(targetTab).classList.add('active');
    });
});

// Theme toggle
let isDarkMode = true;
themeToggle.addEventListener('click', function() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('light-mode');
    themeToggle.textContent = isDarkMode ? '🌙' : '☀️';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
});

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    isDarkMode = false;
    document.body.classList.add('light-mode');
    themeToggle.textContent = '☀️';
}

// Wait for both Python functions to be ready
async function waitForPython() {
    const maxAttempts = 50;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
        if (typeof window.processCSVFromPython === 'function' && typeof window.reshapeArabicText === 'function') {
            // إخفاء رسالة الانتظار وتفعيل الأزرار
            statusDisplay.style.display = 'none';
            fileLabel.classList.remove('disabled');
            fileInput.disabled = false;
            reshapeBtn.disabled = false;
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    statusDisplay.innerText = "❌ خطأ: فشل تحميل محرك Python. يرجى تحديث الصفحة.";
    return false;
}

waitForPython();

// CSV Processing Logic
fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'csv') {
        fileLabel.textContent = '❌ يرجى اختيار ملف CSV فقط';
        fileLabel.classList.add('error');
        fileInput.value = '';
        setTimeout(() => {
            fileLabel.classList.remove('error');
            fileLabel.textContent = '📁 اختر ملف CSV';
        }, 3000);
        return;
    }

    fileLabel.textContent = `📄 ${file.name}`;
    const reader = new FileReader();

    reader.onload = function(e) {
        const rawCsvContent = e.target.result;
        if (typeof window.processCSVFromPython === 'function') {
            try {
                processedCsvData = window.processCSVFromPython(rawCsvContent);
                const preview = processedCsvData.length > 500 
                    ? processedCsvData.substring(0, 500) + "..."
                    : processedCsvData;
                outputDisplay.innerText = preview;
                downloadBtn.disabled = false;
            } catch (error) {
                console.error("CSV Processing Error:", error);
            }
        }
    };
    reader.readAsText(file);
});

downloadBtn.addEventListener('click', function() {
    if (!processedCsvData) return;
    try {
        const blob = new Blob([processedCsvData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ar_updated.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
        console.error("Download Error:", error);
    }
});

// Word Reshaping Logic
reshapeBtn.addEventListener('click', function() {
    const inputText = arabicInput.value.trim();
    
    if (!inputText) {
        outputWrapper.style.display = 'block';
        reshapedOutput.innerHTML = '<span style="color: #ff4444;">⚠️ يرجى إدخال النص العربي أولاً</span>';
        return;
    }

    if (typeof window.reshapeArabicText === 'function') {
        try {
            const result = window.reshapeArabicText(inputText).trim();
            outputWrapper.style.display = 'block';
            reshapedOutput.textContent = result;
        } catch (error) {
            outputWrapper.style.display = 'block';
            reshapedOutput.innerHTML = `<span style="color: #ff4444;">❌ خطأ: ${error.message}</span>`;
        }
    }
});

arabicInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        reshapeBtn.click();
    }
});