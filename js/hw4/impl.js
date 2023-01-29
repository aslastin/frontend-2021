'use strict'

function pushValue(event, context, handler, mapEvents, value) {
    const allEvents = event.split(".");
    let curEvent = null, prevEvent = null;
    let i = 0;
    for (let event of allEvents) {
        curEvent = curEvent === null ? event : curEvent + "." + event;
        if (!mapEvents.has(curEvent)) {
            let obj = {
                "children": new Set(),
                "callbacks": [],
                "count": -1
            }
            mapEvents.set(curEvent, obj);
        }
        let curObj = mapEvents.get(curEvent);
        if (prevEvent !== null) {
            mapEvents.get(prevEvent).children.add(curEvent);
        }
        if (i === allEvents.length - 1) {
            curObj.callbacks.push(value);
            return;
        }
        prevEvent = curEvent
        i++;
    }
}

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    return {
        mapEvents: new Map(),
        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         */
        on: function (event, context, handler) {
            pushValue(event, context, handler, this.mapEvents, [context, handler, Number.POSITIVE_INFINITY, 1]);
            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         */
        off: function (event, context) {
            if (!this.mapEvents.has(event)) {
                return this;
            }
            let curObj = this.mapEvents.get(event);
            curObj.callbacks = curObj.callbacks.filter(([curContext, a, b, c]) => curContext !== context);
            for (let child of curObj.children) {
                this.off(child, context);
            }
            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @param isFirst
         */
        emit: function (event) {
            if (this.mapEvents.has(event)) {
                let curObj = this.mapEvents.get(event);
                curObj.count++;
                curObj.callbacks.forEach(([context, handler, times, frequency]) => {
                    if (times < (curObj.count + 1) || curObj.count % frequency !== 0) {
                        return;
                    }
                    handler.call(context);
                });
            }
            let index = event.lastIndexOf(".");
            if (index !== -1) {
                this.emit(event.slice(0, index));
            }
            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         */
        several: function (event, context, handler, times) {
            if (times > 0) {
                pushValue(event, context, handler, this.mapEvents, [context, handler, times, 1]);
            } else {
                this.on(event, context, handler);
            }
            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         */
        through: function (event, context, handler, frequency) {
            if (frequency > 0) {
                pushValue(event, context, handler, this.mapEvents, [context, handler, Number.POSITIVE_INFINITY, frequency]);
            } else {
                this.on(event, context, handler);
            }
            return this;
        }
    };
}

module.exports = {
    getEmitter
};
