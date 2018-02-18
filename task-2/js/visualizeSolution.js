(function (root) {
    const WATER = root.SHRI_ISLANDS.WATER;
    const ISLAND = root.SHRI_ISLANDS.ISLAND;
    const VISITED = 2;

    const DELAY = 150;

    /**
     * Бонусное задание.
     * Необходимо взять реализацию функции solution и доработать,
     * добавив функционал, который позволит пошагово визуализировать работу данного алгоритма.
     * Сигнатуру функции можно выбрать наиболее удобную для вашей визуализации
     *
     * @param {number[][]} map карта островов представленная двумерной матрицей чисел
     */
    function visualizeSolution(map) {

        // если до этого был запущен solution.js, обнуляем счётчик
        resetCounter();

        const matrix = map.map(function (element) {
            return element.slice();
        });

        const maxX = matrix.length;
        const maxY = matrix[0].length;

        let x = 0;
        let y = 0;

        // множитель для таймера
        let factor = 1;

        while (x < maxX) {
            while (y < maxY) {
                const cell = getCell(x, y);
                let previousColor;
                visit(x, y, factor,
                    () => {
                        previousColor = getBorderColor(cell);
                        changeBorderColor(cell, "#F00");
                    }, () => {
                        changeBorderColor(cell, previousColor);
                    });
                factor++;
                if (matrix[x][y] === ISLAND) {
                    const randomColor = "#" + Math.random().toString(16).slice(2, 8);
                    window.setTimeout(() => updateCounter(), factor * DELAY);
                    floodFill(matrix, x, y, factor, randomColor);
                }
                y++;
            }
            y = 0;
            x++;
        }
    }

    /**
     *  Рекурсивная функция, реализующая алгоритм заливки
     *
     * @param {number[][]}matrix карта островов
     * @param {number]x текущий ряд
     * @param {number}y текущая колонка
     * @param {number}factor множитель для таймера
     * @param {string}color цвет заливки
     */
    function floodFill(matrix, x, y, factor, color) {
        if (x < 0 || y < 0 || x >= matrix.length || y >= matrix[0].length) return;
        if (matrix[x][y] === WATER || matrix[x][y] > 1) return;
        factor++;
        const cell = getCell(x, y);
        visit(x, y, factor, () => {
            changeBackgroundColor(cell, color);
            changeBorderColor(cell, "#000");
        }, () => {
            changeBorderColor(cell, color);
        });
        matrix[x][y] = VISITED;
        floodFill(matrix, x + 1, y, factor, color);
        floodFill(matrix, x - 1, y, factor, color);
        floodFill(matrix, x, y + 1, factor, color);
        floodFill(matrix, x, y - 1, factor, color);
    }

    /**
     * Вернуть ячейку по заданным координатам
     *
     * @param {number}x строка
     * @param {number}y колона
     * @returns {Element} выбранная ячейка
     */
    function getCell(x, y) {
        const row = document.getElementsByClassName("map__row")[x];
        return row.getElementsByClassName("map__cell")[y];
    }

    /**
     * Поменять цвет фона
     *
     * @param {Element}cell ячейка из матрицы
     * @param {string}backgroundColor устанавливаемый цвет фона
     */
    function changeBackgroundColor(cell, backgroundColor) {
        cell.style.background = backgroundColor;
    }

    /**
     * Поменять цвет границы
     *
     * @param {Element}cell ячейка из матрицы
     * @param borderColor устанавливаемый цвет границы
     */
    function changeBorderColor(cell, borderColor) {
        cell.style.borderColor = borderColor;
    }

    /**
     * Получить цвет границы ячейки
     *
     * @param {Element}cell ячейка из матрицы
     * @returns {string} цвет ячейки или цвет "по умолчанию"
     */
    function getBorderColor(cell) {
        return cell.style.borderColor || "#EEE";
    }

    /**
     * Посетить ячейку из матрицы
     *
     * @param {number}x стока матрицы
     * @param {number}y колонка матрицы
     * @param {number}factor множитель для таймера
     * @param {function}preFunc функция, которая будет выполняться до
     * @param {function}postFunc функция, которая будет выполняться после
     */
    function visit(x, y, factor, preFunc, postFunc) {
        window.setTimeout(() => {
            preFunc();
        }, factor * DELAY);
        window.setTimeout(() => {
            postFunc();
        }, (factor + 1) * DELAY);
    }

    /**
     * Увеличить счётчик на 1
     */
    function updateCounter() {
        const counterElement = document.getElementsByClassName("map__res")[0];
        const count = Number(counterElement.innerText.substring(7));
        counterElement.innerText = "Count: " + (count + 1);
    }

    /**
     * Обнулить счётчик
     */
    function resetCounter() {
        const counterElement = document.getElementsByClassName("map__res")[0];
        counterElement.innerText = "Count: 0";
    }

    root.SHRI_ISLANDS.visualizeSolution = visualizeSolution;
})(this);
