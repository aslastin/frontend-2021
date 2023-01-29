'use strict';

const fetch = require('node-fetch');

const API_KEY = require('./key.json');

function condMapper(cond) {
  if (cond === "clear" || cond === "partly-cloudy") {
    return "sunny";
  }
  if (cond === "cloudy" || cond === "overcast") {
    return "cloudy"
  }
  return undefined;
}

async function fetchAndMap(geoId) {
  const url = `https://api.weather.yandex.ru/v2/forecast?geoid=${geoId}&hours=false&limit=7`;
  const response = await fetch(url, {headers: {"X-Yandex-API-Key": API_KEY["key"]}});
  const json = await response.json();
  const forecasts = json["forecasts"];
  const conditions = forecasts.map(cur => cur["parts"]["day_short"]["condition"]);
  return conditions.map(condMapper);
}

/**
 * @typedef {object} TripItem Город, который является частью маршрута.
 * @property {number} geoid Идентификатор города
 * @property {number} day Порядковое число дня маршрута
 */

class TripBuilder {

  constructor(geoids) {
    this.geoIds = geoids;
    this.route = [];
    this.maxDays = Number.POSITIVE_INFINITY;
  }

  _push(times, value) {
    for (let i = 0; i < times; i++) {
      this.route.push(value);
    }
  }

  /**
   * Метод, добавляющий условие наличия в маршруте
   * указанного количества солнечных дней
   * Согласно API Яндекс.Погоды, к солнечным дням
   * можно приравнять следующие значения `condition`:
   * * `clear`;
   * * `partly-cloudy`.
   * @param {number} daysCount количество дней
   * @returns {object} Объект планировщика маршрута
   */
  sunny(daysCount) {
    this._push(daysCount, "sunny");
    return this;
  }

  /**
   * Метод, добавляющий условие наличия в маршруте
   * указанного количества пасмурных дней
   * Согласно API Яндекс.Погоды, к солнечным дням
   * можно приравнять следующие значения `condition`:
   * * `cloudy`;
   * * `overcast`.
   * @param {number} daysCount количество дней
   * @returns {object} Объект планировщика маршрута
   */
  cloudy(daysCount) {
    this._push(daysCount, "cloudy");
    return this;
  }

  /**
   * Метод, добавляющий условие максимального количества дней.
   * @param {number} daysCount количество дней
   * @returns {object} Объект планировщика маршрута
   */
  max(daysCount) {
    this.maxDays = daysCount;
    return this;
  }

  _findPath(curDay, curPath, prevGeoId, weekInfo, cntByGeoId) {
    if (curDay - 1 === this.route.length) {
      return curPath;
    }

    const okGeoIds = this.geoIds
      .filter(geoid => {
        const cnt = cntByGeoId[geoid];
        return cnt < this.maxDays && (cnt === 0 || prevGeoId === geoid);
      })
      .filter(geoid => this.route[curDay - 1] === weekInfo[geoid][curDay - 1]);

    for (const okGeoId of okGeoIds) {
      cntByGeoId[okGeoId]++;
      curPath.push({"geoid": okGeoId, "day": curDay});
      const res = this._findPath(curDay + 1, curPath, okGeoId, weekInfo, cntByGeoId);
      if (res !== undefined) return res;
      curPath.pop();
      cntByGeoId[okGeoId]--;
    }
  }

  /**
   * Метод, возвращающий Promise с планируемым маршрутом.
   * @returns {Promise<TripItem[]>} Список городов маршрута
   */
  async build() {
    const weekForecasts = await Promise.all(this.geoIds.map(fetchAndMap));

    const weekInfo = {};
    weekForecasts.forEach((val, i) => weekInfo[this.geoIds[i]] = val);

    const cntByGeoId = {};
    this.geoIds.forEach(geoid => cntByGeoId[geoid] = 0);

    const res = this._findPath(1, [], -1, weekInfo, cntByGeoId);
    if (res === undefined) {
      throw new Error("Не могу построить маршрут!")
    }
    return res;
  }
}


/**
 * Фабрика для получения планировщика маршрута.
 * Принимает на вход список идентификаторов городов, а
 * возвращает планировщик маршрута по данным городам.
 *
 * @param {number[]} geoids Список идентификаторов городов
 * @returns {TripBuilder} Объект планировщика маршрута
 * @see https://yandex.ru/dev/xml/doc/dg/reference/regions-docpage/
 */
function planTrip(geoids) {
  return new TripBuilder(geoids);
}

module.exports = {
  planTrip
};
