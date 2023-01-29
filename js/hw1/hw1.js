'use strict';

// Checking functions
const isString = str => str instanceof String || typeof str === "string";
const isNumber = n => n instanceof Number || typeof n === "number";
const isInteger = n => isNumber(n) && Number.isInteger(n);

/**
 * Складывает два целых числа
 * @param {Number} a Первое целое
 * @param {Number} b Второе целое
 * @throws {TypeError} Когда в аргументы переданы не числа
 * @returns {Number} Сумма аргументов
 */
function abProblem(a, b) {
    if (isInteger(a) && isInteger(b)) {
        return a + b;
    }
    throw new TypeError("All args must be integers");
}

/**
 * Определяет век по году
 * @param {Number} year Год, целое положительное число
 * @throws {TypeError} Когда в качестве года передано не число
 * @throws {RangeError} Когда год – отрицательное значение
 * @returns {Number} Век, полученный из года
 */
function centuryByYearProblem(year) {
    if (!isInteger(year)) {
        throw new TypeError("Year must be an integer");
    }
    if (year <= 0) {
        throw new RangeError("Year must be > 0");
    }
    return Math.ceil(year / 100);
}

/**
 * Переводит цвет из формата HEX в формат RGB
 * @param {String} hexColor Цвет в формате HEX, например, '#FFFFFF'
 * @throws {TypeError} Когда цвет передан не строкой
 * @throws {RangeError} Когда значения цвета выходят за пределы допустимых
 * @returns {String} Цвет в формате RGB, например, '(255, 255, 255)'
 */
function colorsProblem(hexColor) {
    if (!isString(hexColor)) {
        throw new TypeError("hexColor must be string");
    }
    if (!/^#[0-9A-Fa-f]{6}$/.test(hexColor)) {
        throw new RangeError("Incorrect hexColor - must satisfy such regex: /^#[0-9A-Fa-f]{6}$/");
    }
    let colors = [1, 3, 5].map(i => Number.parseInt(hexColor.substr(i, 2), 16));
    return "(" + colors.join(", ") + ")";
}

/**
 * Находит n-ое число Фибоначчи
 * @param {Number} n Положение числа в ряде Фибоначчи
 * @throws {TypeError} Когда в качестве положения в ряде передано не число
 * @throws {RangeError} Когда положение в ряде не является целым положительным числом
 * @returns {Number} Число Фибоначчи, находящееся на n-ой позиции
 */
function fibonacciProblem(n) {
    if (!isInteger(n)) {
        throw new TypeError("n must be an integer");
    }
    if (n <= 0) {
        throw new RangeError("n must be > 0");
    }
    return fastFibonacci(n);
}

function fastFibonacci(n, first=1, second=first) {
    return n === 1 ? first : fastFibonacci(n - 1, second, first + second);
}

/**
 * Транспонирует матрицу
 * @param {(Any[])[]} m Матрица размерности MxN
 * @throws {TypeError} Когда в функцию передаётся не двумерный массив
 * @returns {(Any[])[]} Транспонированная матрица размера NxM
 */
function matrixProblem(m) {
    if (!Array.isArray(m) || m.some(row => !Array.isArray(row) || row.length !== m[0].length)) {
        throw new TypeError("m not a matrix");
    }
    const tm = Array.from(Array(m[0].length), () => new Array(m.length));
    m.forEach((v, i) => v.forEach((el, j) => tm[j][i] = el));
    return tm;
}

/**
 * Переводит число в другую систему счисления
 * @param {Number} n Число для перевода в другую систему счисления
 * @param {Number} targetNs Система счисления, в которую нужно перевести (Число от 2 до 36)
 * @throws {TypeError} Когда переданы аргументы некорректного типа
 * @throws {RangeError} Когда система счисления выходит за пределы значений [2, 36]
 * @returns {String} Число n в системе счисления targetNs
 */
function numberSystemProblem(n, targetNs) {
    if (!isNumber(n)) {
        throw new TypeError("n must be a number");
    }
    if (!isInteger(targetNs)) {
        throw new TypeError("targetNs must be an integer");
    }
    if (targetNs < 2 || targetNs > 36) {
        throw new RangeError("targetNs must be in [2, 36]");
    }
    return n.toString(targetNs);
}

/**
 * Проверяет соответствие телефонного номера формату
 * @param {String} phoneNumber Номер телефона в формате '8–800–xxx–xx–xx'
 * @throws {TypeError} Когда в качестве аргумента передаётся не строка
 * @returns {Boolean} Если соответствует формату, то true, а иначе false
 */
function phoneProblem(phoneNumber) {
    if (!isString(phoneNumber)) {
        throw new TypeError("phoneNumber must be string");
    }
    return /^8-800-[0-9]{3}-[0-9]{2}-[0-9]{2}$/.test(phoneNumber);
}

/**
 * Определяет количество улыбающихся смайликов в строке
 * @param {String} text Строка в которой производится поиск
 * @throws {TypeError} Когда в качестве аргумента передаётся не строка
 * @returns {Number} Количество улыбающихся смайликов в строке
 */
function smilesProblem(text) {
    if (!isString(text)) {
        throw new TypeError("text must be string");
    }
    return (text.match(/((\(-:)|(:-\)))/g)||[]).length;
}

/**
 * Определяет победителя в игре "Крестики-нолики"
 * Тестами гарантируются корректные аргументы.
 * @param {(('x' | 'o')[])[]} field Игровое поле 3x3 завершённой игры
 * @returns {'x' | 'o' | 'draw'} Результат игры
 */
function ticTacToeProblem(field) {
    const res = {'x': 0, 'o': 0};
    for (let i = 0; i < field.length; i++) {
        for (let j = 0; j < field.length; j++) {
            for (let i_ = -1; i_ <= 1; i_++) {
                for (let j_ = -1; j_ <= 1; j_++) {
                    if (i_ === j_ && i_ === 0) continue;
                    res[field[i][j]] +=
                        ticTacToeGetCnt(field, field[i][j], i + i_, j + j_, i_, j_) === 3;
                }
            }
        }
    }
    if (res['x'] === 0) {
        return res['o'] === 0 ? 'draw' : 'o';
    } else {
        return res['o'] === 0 ? 'x' : 'draw';
    }
}

function ticTacToeGetCnt(field, cur, i, j, i_, j_) {
    let cnt = 1;
    while (i >= 0 && i < field.length && j >= 0 && j < field[i].length && field[i][j] === cur) {
        i += i_;
        j += j_;
        ++cnt;
    }
    return cnt;
}

module.exports = {
    abProblem,
    centuryByYearProblem,
    colorsProblem,
    fibonacciProblem,
    matrixProblem,
    numberSystemProblem,
    phoneProblem,
    smilesProblem,
    ticTacToeProblem
};
