'use strict';

/**
 * Телефонная книга
 */
const phoneBook = new Map();

/**
 * Вызывайте эту функцию, если есть синтаксическая ошибка в запросе
 * @param {number} lineIndex – индекс строки с ошибкой
 * @param {number} charIndex – индекс символа, с которого запрос стал ошибочным
 */
function syntaxError(lineIndex, charIndex) {
    throw new Error(`SyntaxError: Unexpected token at ${lineIndex + 1}:${charIndex + 1}`);
}

function containsQuery(contact, phones, mails, query) {
    if (contact.includes(query)) {
        return true;
    }
    if (/\d/.test(query)) {
        for (const phone of phones) {
            if (phone.includes(query)) {
                return true;
            }
        }
    }
    for (const mail of mails) {
        if (mail.includes(query)) {
            return true;
        }
    }
    return false;
}

function createContact(contact) {
    if (!phoneBook.has(contact)) {
        phoneBook.set(contact, [new Set(), new Set()]);
    }
}

function deleteContact(contact) {
    phoneBook.delete(contact);
}

function toContact(contact, phones, mails, f) {
    if (!phoneBook.has(contact)) {
        return;
    }
    let [curPhones, curMails] = phoneBook.get(contact);
    phones.forEach(phone => f(curPhones, phone));
    mails.forEach(mail => f(curMails, mail));
}

function addToContact(contact, phones, mails) {
    toContact(contact, phones, mails, (curSet, cur) => curSet.add(cur));
}

function deleteFromContact(contact, phones, mails) {
    toContact(contact, phones, mails, (curSet, cur) => curSet.delete(cur));
}

function cacheMap(contact, phones, mails) {
    const cache = new Map();
    return show => {
        if (!cache.has(show)) {
            let res;
            if (show === `имя `) {
                res = contact;;
            } else if (show === `почты `) {
                res = Array.from(mails).join(`,`);
            } else if (show === `телефоны `) {
                res = Array.from(phones)
                    .map(phone => phone.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, `+7 ($1) $2-$3-$4`))
                    .join(`,`)
            } else {
                throw new Error(`Incorrect input for showByQuery`);
            }
            cache.set(show, res);
        }
        return cache.get(show);
    }
}

function showByQuery(toShow, query) {
    if (query === ``) {
        return [];
    }
    const res = [];
    for (let [contact, [phones, mails]] of phoneBook) {
        if (containsQuery(contact, phones, mails, query)) {
            res.push(
                toShow.map(cacheMap(contact, phones, mails)).join(`;`)
            );
        }
    }
    return res;
}

function deleteContactsByQuery(query) {
    if (query === ``) {
        return [];
    }
    for (let [contact, [phones, mails]] of phoneBook) {
        if (containsQuery(contact, phones, mails, query)) {
            phoneBook.delete(contact);
        }
    }
}

const SHOW_WORDS = [`телефоны `, `имя `, `почты `];

/**
 * Выполнение запроса на языке pbQL
 * @param {string} query
 * @returns {string[]} - строки с результатами запроса
 */
function run(query) {
    let res = [];

    const splittedQuery = query.split(`;`);
    let wasLast = false;
    const lastIndex = splittedQuery.length - 1;
    if (splittedQuery[lastIndex] === ``) {
        wasLast = true;
        splittedQuery.pop();
    }

    splittedQuery.forEach((q, i) => {
        let shift = 0;

        function exactlyNext(next) {
            if (q.startsWith(next, shift)) {
                shift += next.length;
            } else {
                syntaxError(i, shift);
            }
        }

        function checkNext(next) {
            if (q.startsWith(next, shift)) {
                shift += next.length;
                return true;
            }
            return false;
        }

        function getSuffix() {
            return q.slice(shift);
        }

        function getNextToken() {
            const wsIndex = q.indexOf(` `, shift);
            if (wsIndex === -1) {
                syntaxError(i, shift);
            }
            const next = q.slice(shift, wsIndex);
            shift += next.length + 1;
            return next;
        }

        function getNextPhone() {
            const wsIndex = q.indexOf(` `, shift);
            let phone;
            if (wsIndex === -1 || !/^\d{10}$/.test((phone = q.slice(shift, wsIndex)))) {
                syntaxError(i, shift);
            }
            shift += phone.length + 1;
            return phone;
        }

        function readPhonesMails() {
            let cnt = 0;
            const phones = [], mails = [];
            while (true) {
                if (cnt !== 0) {
                    checkNext(`и `)
                }
                if (checkNext(`телефон `)) {
                    phones.push(getNextPhone());
                } else if (checkNext(`почту `)) {
                    mails.push(getNextToken());
                } else {
                    break;
                }
                ++cnt;
            }
            if (cnt === 0) {
                syntaxError(i, shift);
            }
            return [phones, mails];
        }

        function readToShow() {
            let cnt = 0;
            const toShow = [];
            while (true) {
                if (cnt !== 0) {
                    checkNext(`и `);
                }
                let was = false;
                for (const w of SHOW_WORDS) {
                    if (checkNext(w)) {
                        toShow.push(w);
                        was = true;
                        break;
                    }
                }
                if (!was) {
                    break;
                }
                ++cnt;
            }
            if (cnt === 0) {
                syntaxError(i, shift);
            }
            return toShow;
        }

        if (checkNext(`Создай `)) {
            exactlyNext(`контакт `);
            createContact(getSuffix());
        } else if (checkNext(`Удали `)) {
            if (checkNext(`контакт `)) {
                deleteContact(getSuffix());
            } else if (checkNext(`контакты, `)) {
                exactlyNext(`где `)
                exactlyNext(`есть `);
                deleteContactsByQuery(getSuffix());
            } else {
                let [phones, mails] = readPhonesMails();
                exactlyNext(`для `);
                exactlyNext(`контакта `);
                deleteFromContact(getSuffix(), phones, mails);
            }
        } else if (checkNext(`Добавь `)) {
            let [phones, mails] = readPhonesMails();
            exactlyNext(`для `);
            exactlyNext(`контакта `);
            addToContact(getSuffix(), phones, mails);
        } else if (checkNext(`Покажи `)) {
            const toShow = readToShow();
            exactlyNext(`для `);
            exactlyNext(`контактов, `);
            exactlyNext(`где `);
            exactlyNext(`есть `);
            res = res.concat(showByQuery(toShow, getSuffix()));
        } else {
            syntaxError(i, 0);
        }
    });

    if (!wasLast) {
        syntaxError(lastIndex, splittedQuery[lastIndex].length);
    }

    return res;
}

module.exports = {phoneBook, run};
