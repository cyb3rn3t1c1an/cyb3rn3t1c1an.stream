// хранение списка доступных нам первых букв
const letters = [];

// заполение списка доступными первыми буквами
for (let cityFirstLetter in citiesMap) {
    if (citiesMap.hasOwnProperty(cityFirstLetter)) {
        letters.push(cityFirstLetter);
    }
}

let currentTurn = Math.floor(Math.random() * (3 - 1)) + 1;

let currentCity;
let currentLastLetter;

const usedCities = [];

ymaps.ready(init);
let myMap;

function init() {
    myMap = new ymaps.Map("map", {
        center: [53.902496, 27.561481], //минск
        zoom: DEFAULT_ZOOM
    });
    ymaps.regions.load('BY', {
        lang: 'ru',
        quality: 2
    }).then(function (res) {
        var regions = res.geoObjects;
        myMap.geoObjects.add(regions);
    }, function () {
        alert('Ошибка установки региона');
    });

    if (currentTurn === COMPUTER) {
        computerTurn();
    }

    document.getElementById("cityName").addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            humanTurn();
        }
    });
}

function showCity(city, iconPreset) {
    const myGeocoder = ymaps.geocode(city);
    return myGeocoder.then(
        function (res) {
            const geoObject = res.geoObjects.get(0);
            if (geoObject === null) return;
            geoObject.options.set("preset", iconPreset);
            myMap.geoObjects.add(geoObject);
            myMap.setBounds(geoObject.geometry.getBounds(), {
                checkZoomRange: true, callback: function () {
                    if (myMap.getZoom() > DEFAULT_ZOOM) myMap.setZoom(DEFAULT_ZOOM);
                }
            });
        },
        function (err) {
            console.log('Не удалось найти гео-объект');
        }
    );
}

function humanTurn(city) {
    const cityName = city || document.getElementById("cityName").value.toLowerCase();
    document.getElementById("cityName").value = '';
    const firstLetter = cityName.charAt(0);
    if (currentCity) {
        if (cityName.charAt(0) !== currentLastLetter) {
            addToLog("Слово не начинается на нужную букву");
            return;
        }
    }
    if (usedCities[cityName]) {
        addToLog("Такой город уже был");
        return;
    }
    if (citiesMap[firstLetter]) {
        const cityArray = citiesMap[firstLetter];
        for (let index in cityArray) {
            if (cityArray[index] === cityName) {
                showCity(cityName, HUMAN_ICON).then(() => {
                    postTurn(cityArray, cityName, index, HUMAN, COMPUTER, "Человек выбрал город", HUMAN_COLOR);
                    computerTurn();
                });
                return;
            }
        }
    }
    addToLog("Не знаю такого города");
}

function humanSpeechTurn() {
    disableInputs();
    recognition.start();
    addToLog("Произнесите город");
}

function computerTurn() {
    let letter;
    if (currentCity) {
        letter = currentLastLetter;
    } else {
        letter = randomLetter();
    }
    document.getElementById("ui").style.visibility = "hidden";
    addToLog("Ход компьютера");
    const result = randomCity(letter);
    if (!result) {
        gameResult();
        return;
    }
    showCity(result.city, COMPUTER_ICON).then(() => {
        postTurn(citiesMap[letter], result.city, result.index, COMPUTER, HUMAN, "Компьютер выбрал город", COMPUTER_COLOR);
        addToLog("Ход человека");
    });
    document.getElementById("ui").style.visibility = "visible";
}

function postTurn(cities, cityName, index, currentPlayer, nextPlayer, turnMessage, color) {
    usedCities[cityName] = currentPlayer;
    cities.splice(index, 1);
    addToLog(turnMessage + " " + cityName, color);
    currentCity = cityName;
    currentLastLetter = calculateLastLetter(cityName);
    currentTurn = nextPlayer;
}

function randomLetter() {
    return letters[(Math.floor(Math.random() * letters.length))];
}

function randomCity(firstLetter) {
    if (citiesMap[firstLetter]) {
        const index = (Math.floor(Math.random() * citiesMap[firstLetter].length));
        const city = citiesMap[firstLetter][index];
        return {index, city};
    }
}

function calculateLastLetter(currentCity) {
    currentLastLetter = currentCity.slice(-1);
    if (currentLastLetter === 'ь' || currentLastLetter === 'ъ' || currentLastLetter === 'ы' || currentLastLetter === 'ц') {
        return calculateLastLetter(currentCity.slice(0, -1));
    }
    return currentLastLetter;
}

function addToLog(message, color) {
    const messageElement = document.createElement("div");
    const logElement = document.getElementById("log");
    if (color) messageElement.style.color = color;
    messageElement.innerText = message;
    logElement.appendChild(messageElement);
}

function gameResult() {
    document.getElementById("ui").style.visibility = "hidden";
    currentTurn === HUMAN ? addToLog("Человек проиграл") : addToLog("Компьютер проиграл");
    gameStats();
}

function gameStats() {
    const humanUsedCities = [];
    const computerUsedCities = [];
    for (let usedCity in usedCities) {
        if (usedCities.hasOwnProperty(usedCity)) {
            if (usedCities[usedCity] === HUMAN) {
                humanUsedCities.push(usedCity);
            } else {
                computerUsedCities.push(usedCity);
            }
        }
    }
    addToLog("Человек использовал города: " + humanUsedCities.join(", "), HUMAN_COLOR);
    addToLog("Компьютер использовал города: " + computerUsedCities.join(", "), COMPUTER_COLOR);
}

function enableInputs() {
    const inputs = document.getElementsByTagName("input");
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].removeAttribute("disabled");
    }
}

function disableInputs() {
    const inputs = document.getElementsByTagName("input");
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].setAttribute("disabled", "true");
    }
}

const grammar = '#JSGF V1.0; grammar cities; public <city> = ' + cities.join(' | ') + ' ;';

const SpeechRecognition = webkitSpeechRecognition || SpeechRecognition;
const SpeechGrammarList = webkitSpeechGrammarList || SpeechGrammarList;

const recognition = new SpeechRecognition();
const speechRecognitionList = new SpeechGrammarList();

// TODO: разобраться почему не влияет на результат
speechRecognitionList.addFromString(grammar, 1);

recognition.grammars = speechRecognitionList;
recognition.lang = 'ru-RU';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

recognition.onresult = function (event) {
    const last = event.results.length - 1;
    const city = event.results[last][0].transcript.toLowerCase();
    console.log(city);
    humanTurn(city);
};

recognition.onspeechend = function () {
    enableInputs();
    recognition.stop();
};

recognition.onnomatch = function (event) {
    enableInputs();
    addToLog("Не могу распознать город")
};

recognition.onerror = function (event) {
    enableInputs();
    addToLog("Ошибка распознавания " + event.error);
};