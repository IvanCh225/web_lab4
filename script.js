const searchBtn = document.getElementById("searchBtn");
const countryCodeInput = document.getElementById("countryCode");
const resultBlock = document.getElementById("result");
const errorBlock = document.getElementById("error");
const loadingBlock = document.getElementById("loading");

function showLoading() {
    loadingBlock.classList.remove("hidden");
}

function hideLoading() {
    loadingBlock.classList.add("hidden");
}

function showError(message) {
    errorBlock.textContent = message;
    errorBlock.classList.remove("hidden");
}

function hideError() {
    errorBlock.textContent = "";
    errorBlock.classList.add("hidden");
}

function showResult(data) {
    resultBlock.innerHTML = `
        <h2>${data.name}</h2>
        <p><strong>ISO-2 код:</strong> ${data.iso2}</p>
        <p><strong>Столиця:</strong> ${data.capital}</p>
        <p><strong>Регіон:</strong> ${data.region}</p>
        <p><strong>Рівень доходу:</strong> ${data.income}</p>
        <p><strong>Тип кредитування:</strong> ${data.lending}</p>
        <p><strong>Широта:</strong> ${data.latitude}</p>
        <p><strong>Довгота:</strong> ${data.longitude}</p>
    `;
    resultBlock.classList.remove("hidden");
}

function hideResult() {
    resultBlock.innerHTML = "";
    resultBlock.classList.add("hidden");
}

async function fetchWithRetry(url, retries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Сталася помилка.");
            }

            return await response.json();
        } catch (error) {
            if (attempt === retries) {
                throw error;
            }

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

async function handleSearch() {
    const code = countryCodeInput.value.trim().toUpperCase();

    hideError();
    hideResult();

    if (code.length !== 2) {
        showError("Введіть коректний ISO-2 код із 2 символів.");
        return;
    }

    showLoading();

    try {
        const data = await fetchWithRetry(`/api?code=${encodeURIComponent(code)}`, 3, 1000);
        showResult(data);
    } catch (error) {
        showError(error.message || "Не вдалося отримати дані.");
    } finally {
        hideLoading();
    }
}

searchBtn.addEventListener("click", handleSearch);

countryCodeInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        handleSearch();
    }
});