'use strict';

const days = [`ПН`, `ВТ`, `СР`, `ЧТ`, `ПТ`, `СБ`, `ВС`];

const dateRegex = new RegExp(`^((${days.join(`|`)}) )?(\\d{2}):(\\d{2})\\+(\\d+)$`);

function indexByDay(day) {
    for (let i = 0; i < days.length; i++) {
        if (days[i] === day) {
            return i;
        }
    }
    return -1;
}

function dayByIndex(index) {
    return days[index];
}

function getAppropriateMoment(gangSchedule, timeForRobbery, bankWorkingHours) {
    const bankTz = getTimeZone(bankWorkingHours.from);
    const bankInterval = getMinutesInterval(bankWorkingHours, bankTz);
    const gangBusyIntervals = Object.keys(gangSchedule)
        .map(robber =>
            gangSchedule[robber].map(fromToEntry => getMinutesInterval(fromToEntry, bankTz))
        );
    const gangFreeIntervals = gangBusyIntervals.map(intervals =>
        getFreeIntervals(intervals, bankInterval[0], indexByDay("СР") * 24 * 60 + bankInterval[1])
    );
    gangFreeIntervals.map(intervals =>
        intervals.sort(([from1, to1], [from2, to2]) => from1 === from2 ? to2 - to1 : from2 - from1)
    );
    let timeOfRobbery = getNextTime(0, gangFreeIntervals, bankInterval, timeForRobbery);
    let prev = '';
    let status = null;
    return {
        exists: () => timeOfRobbery !== null,
        format: function (template) {
            if (timeOfRobbery === null) {
                return prev;
            }
            let [hours, minutes, day] = timeInfoByMinutes(timeOfRobbery);
            template = template.replace(/%HH/g, hours < 10 ? "0" + hours : hours);
            template = template.replace(/%MM/g, minutes < 10? "0" + minutes : minutes);
            prev = template.replace(/%DD/g, day)
            return prev;
        },
        tryLater: function () {
            if (timeOfRobbery === null) {
                return false;
            }
            status = getNextTime(timeOfRobbery + 30, gangFreeIntervals, bankInterval, timeForRobbery);
            if (status !== null) {
                timeOfRobbery = status;
            }
            return status !== null;
        }
    };
}

function getTimeZone(date) {
    const match = date.match(dateRegex)
    return Number.parseInt(match[5]);
}

function getMinutesInterval(fromToEntry, bankTZ) {
    return [
        getMinutesByTimeInfo(bankTZ, ...getTimeInfoByDate(fromToEntry.from)),
        getMinutesByTimeInfo(bankTZ, ...getTimeInfoByDate(fromToEntry.to))
    ];
}

function getTimeInfoByDate(date) {
    const match = dateRegex.exec(date);
    const res = match.slice(3, 6).map(str => Number.parseInt(str[0] === "0" ? str[1] : str));
    if (match[2] !== undefined) {
        res.push(match[2]);
    }
    return res;
}

function getMinutesByTimeInfo(bankTz, hours, minutes, tz, day) {
    const byHours = hours * 60;
    const byMinutes = minutes;
    const byTz = (bankTz - tz) * 60;
    const byDay = day !== undefined ? indexByDay(day) * 24 * 60 : 0;
    return byDay + byHours + byMinutes + byTz;
}

function getFreeIntervals(busyIntervals, bankTotalOpen, bankTotalClose) {
    const freeIntervals = [];
    let prev = bankTotalOpen, lastIndex = 0;
    for (let [from, to] of busyIntervals) {
        if (from <= prev) {
            prev = to;
            continue;
        }
        freeIntervals.push([prev, Math.min(from, bankTotalClose)]);
        prev = to;
        lastIndex++;
        if (from >= bankTotalClose) {
            break;
        }
    }
    if (lastIndex === busyIntervals.length && prev < bankTotalClose) {
        freeIntervals.push([prev, bankTotalClose]);
    }
    return freeIntervals;
}

function getDayByMinutes(minutes) {
    return dayByIndex(Math.floor(minutes / (24 * 60)))
}

function timeInfoByMinutes(timeOfRobbery) {
    const day = getDayByMinutes(timeOfRobbery);
    timeOfRobbery %= 24 * 60;
    const hours = Math.floor(timeOfRobbery / 60);
    const minutes = timeOfRobbery % 60;
    return [hours, minutes, day];
}

function getNextTime(time, gangFreeIntervals, [bankFrom, bankTo], timeForRobbery) {
    if (time == null || gangFreeIntervals.some(intervals => intervals.length === 0)) {
        return null;
    }
    let cur = gangFreeIntervals.map(freeIntervals => freeIntervals[freeIntervals.length - 1]);
    while (true) {
        if (!cur.some(([_, to]) => to <= time)) {
            const maxFrom = Math.max(time, ...cur.map(([from, _]) => from));
            const minTo = Math.min(...cur.map(([_, to]) => to));
            let bestFrom = null, bestTo = null;
            const maxFromDay = indexByDay(getDayByMinutes(maxFrom)), minToDay = indexByDay(getDayByMinutes(minTo));
            if (maxFromDay === minToDay) {
                bestFrom = Math.max(bankFrom, maxFrom % (24 * 60));
                bestTo = Math.min(bankTo, minTo % (24 * 60));
            } else {
                bestFrom = Math.max(bankFrom, maxFrom % (24 * 60));
                if (bankTo - bestFrom >= timeForRobbery) {
                    return maxFromDay * 24 * 60 + bestFrom;
                }
                let nextDay = maxFromDay + 1;
                while (nextDay !== minToDay) {
                    if (bankTo - bankFrom >= timeForRobbery) {
                        return nextDay * 24 * 60 + bankFrom;
                    }
                    nextDay++;
                }
                bestTo = Math.min(bankTo, minTo % (24 * 60));
                if (bestTo - bankFrom >= timeForRobbery) {
                    return bankFrom + nextDay * 24 * 60;
                }
            }

            if (bestTo - bestFrom >= timeForRobbery) {
                return maxFrom;
            }
        }
        while (true) {
            const nextToPop = gangFreeIntervals
                .map(freeIntervals => freeIntervals[freeIntervals.length - 2])
                .reduce((cur, acc) => {
                    if (cur === undefined) {
                        return acc;
                    }
                    if (acc === undefined ||
                        cur[0] < acc[0] ||
                        cur[0] === acc[0] && cur[1] < acc[1]) {
                        return cur;
                    }
                    return acc;
                });
            if (nextToPop === undefined) {
                return null;
            }
            let index = 0;
            for (const freeInterval of gangFreeIntervals) {
                const last = freeInterval[freeInterval.length - 2];
                if (last !== undefined && last[0] === nextToPop[0] && last[1] === nextToPop[1]) {
                    freeInterval.pop();
                    cur[index] = nextToPop;
                    break;
                }
                index++;
            }
            const minTo = Math.min(...cur.map(([_, to]) => to));
            if (!cur.some(([from, _]) => from >= minTo)) {
                break;
            }
        }
    }
}

module.exports = {
    getAppropriateMoment
};
