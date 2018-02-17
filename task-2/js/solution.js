(function (root) {
    var WATER = root.SHRI_ISLANDS.WATER;
    var ISLAND = root.SHRI_ISLANDS.ISLAND;

    /**
     * Функция находит кол-во островов на карте
     * ВАЖНО! Сигнатуру функции изменять нельзя!
     *
     * @param {number[][]} map карта островов представленная двумерной матрицей чисел
     * @returns {number} кол-во островов
     */
    function solution(map) {
        const matrix = map.map(function (element) {
            return element.slice();
        });

        const maxX = matrix.length;
        const maxY = matrix[0].length;

        let x = 0;
        let y = 0;

        // Так как 0 и 1 заняты, будем считать с 10 и потом отнимем
        let code = 10;
        const INITIAL_CODE = code;

        while (x < maxX) {
            while (y < maxY) {
                if (matrix[x][y] === ISLAND) {
                    code = floodFill(matrix, x, y, code);
                }
                y++;
            }
            y = 0;
            x++;
        }

        console.log(matrix)
        return code - INITIAL_CODE;
    }

    function floodFill(matrix, x, y, code) {
        if (x < 0 || y < 0 || x >= matrix.length || y >= matrix[0].length) return;
        if (matrix[x][y] === WATER || matrix[x][y] > 1) return;
        matrix[x][y] = code;
        floodFill(matrix, x + 1, y, code);
        floodFill(matrix, x - 1, y, code);
        floodFill(matrix, x, y + 1, code);
        floodFill(matrix, x, y - 1, code);
        return ++code;
    }

    root.SHRI_ISLANDS.solution = solution;
})(this);
