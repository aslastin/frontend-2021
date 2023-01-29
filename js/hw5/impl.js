'use strict';

function compareFriends(friend1, friend2) {
    if (friend1.name > friend2.name) return 1;
    if (friend1.name < friend2.name) return -1;
    return 0;
}

function* makeIterator(friends, filter, maxLevel) {
    const friendMap = new Map();
    friends.forEach(friend => friendMap.set(friend.name, friend));

    const was = new Set();
    let curQueue = friends.filter(friend => friend.best === true);
    curQueue.forEach(friend => was.add(friend.name));

    let curLevel = 1;

    while (curQueue.length !== 0 && curLevel <= maxLevel) {
        let nextQueue = [];
        curQueue.sort(compareFriends);
        for (const friend of curQueue) {
            friend.friends.forEach(friend => {
                if (was.has(friend)) return;
                was.add(friend);
                nextQueue.push(friendMap.get(friend));
            });
            if (!filter.check(friend)) continue;
            yield friend;
        }
        curLevel++;
        curQueue = nextQueue;
    }

    return null;
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    this.iterator = makeIterator(friends, filter, Number.POSITIVE_INFINITY);
}

Iterator.prototype.initCurrentValueDone = function () {
    let next = this.iterator.next();
    this.currentDone = next.done;
    this.currentValue = next.value;
}

Iterator.prototype.done = function() {
    if (this.currentDone === undefined) {
        this.initCurrentValueDone();
    }
    return this.currentDone;
}

Iterator.prototype.next = function () {
    if (this.currentDone === true) {
        return this.currentValue;
    }
    if (this.currentValue === undefined) {
        this.initCurrentValueDone();
    }
    const res = this.currentValue;
    this.initCurrentValueDone();
    return res;
}

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    this.iterator = makeIterator(friends, filter, maxLevel);
}
LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {}
Filter.prototype = {
    check: person => true
}
Filter.prototype.constructor = Filter

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {}
MaleFilter.prototype = Object.create(Filter.prototype)
MaleFilter.prototype.check = person => person.gender === 'male';
MaleFilter.prototype.constructor = MaleFilter

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {}
FemaleFilter.prototype = Object.create(Filter.prototype)
FemaleFilter.prototype.check = person => person.gender === 'female';
FemaleFilter.prototype.constructor = FemaleFilter

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
