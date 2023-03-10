# 0b11 друзей Аркадия

## Основное задание

Три компаньона Аркадия – «Danny», «Rusty» и «Linus» – частенько проворачивают тёмные делишки под покровом ночи: пишут на PHP, едят после шести и изредка грабят банки.

Сегодня они подумали, что настало время завязать с тёмными делами. Поэтому решили пойти на последнее ограбление, а после изучить JavaScript и стать законопослушными фронтедерами.

Сейчас уже понедельник, а в четверг в последний банк поставят новую сигнализацию. И у них есть только три дня (понедельник, вторник и среда), чтобы выбрать подходящее время. Во-первых, это должно быть в рабочие часы банка – так легче проникнуть в него.
Во-вторых, все трое должны быть свободны.
И в-третьих, должно быть достаточно времени, чтобы провернуть дело.

Компаньоны быстро составили расписание – когда и кто занят
(заметьте, что грабители находятся в разных часовых поясах):

```javascript
{
    "Danny": [
        { "from": "ПН 12:00+5", "to": "ПН 17:00+5" },
        { "from": "ВТ 13:00+5", "to": "ВТ 16:00+5" }
    ],
    "Rusty": [
        { "from": "ПН 11:30+5", "to": "ПН 16:30+5" },
        { "from": "ВТ 13:00+5", "to": "ВТ 16:00+5" }
    ],
    "Linus": [
        { "from": "ПН 09:00+3", "to": "ПН 14:00+3" },
        { "from": "ПН 21:00+3", "to": "ВТ 09:30+3" },
        { "from": "СР 09:30+3", "to": "СР 15:00+3" }
    ]
}
```

![](images/statement-image.png)

И нашли в интернете часы работы банка:

```javascript
{ "from": "10:00+5", "to": "18:00+5" }
```

Но выбрать время для ограбления с ходу не получилось, поэтому предлагаем вам написать код с методом (`getAppropriateMoment`), который на вход принимает расписание (`schedule`), необходимое для ограбления время (`time`) в минутах и время работы банка (`workingHours`), вычисляет подходящее время и на выходе предоставляет объект для работы с ним:
- `.exists()` – отвечает на вопрос найдено ли время вообще
- `.format(template)` – выводит время ограбления в часовом поясе банка и согласно переданному шаблону, который может включать в себя часы __HH__, минуты __MM__ и день недели __DD__. Например, _«Начинаем в %HH:%MM (%DD)»_. Если время не найдено, метод возвращает пустую строку.

### Дополнительные условия и ограничения

- Все время задачи ограничено неделей c ПН 00:00 до ВС 23:59 в часовом поясе банка
- Время ограбления должно попадать в промежуток c ПН 00:00 до СР 23:59 в часовом поясе банка
- Банк работает всю неделю
    - Но работает в рамках только одного дня (не может открыться в один день, а закрыться в другой)
    - И может открыться в 00:00, а закрыться аж в 23:59
- Временная зона задана в часах. Всегда целое число и может быть только положительным – «+5»
- Даты приходят всегда правильно, можно опустить обработку неправильных дат и интервалов
- Гарантируется одинаковость часового пояса в одном контексте: в рамках расписания одного члена банды, в рамках часов работы банка
- Закончить ограбление необходимо тоже до конца рабочего дня банка

Мы выложили пример того как можно работать с вашим кодом под условием задачи, а заготовку для того чтобы реализовать свой код вы можете найти [здесь](https://pastebin.com/D8dX1jjA).

## Дополнительное задание

Реализовать метод `.tryLater()`, который находит следующее подходящее время через полчаса от предыдущего. Если найти не получается, то время остается прежнее. Метод возращает `true`, если получилось найти и `false`, если нет.

Пример работы этого метода вы может отыскать всё в том же примере внизу.
Будет по-настоящему здорово, если вы его осилите! (P.S. я его осилил)

_Грабить банки – нехорошо, не повторяйте этого дома!_

## Пример

```javascript
'use strict';

const robbery = require('./robbery');
    
const gangSchedule = {
    Danny: [{ from: 'ПН 12:00+5', to: 'ПН 17:00+5' }, { from: 'ВТ 13:00+5', to: 'ВТ 16:00+5' }],
    Rusty: [{ from: 'ПН 11:30+5', to: 'ПН 16:30+5' }, { from: 'ВТ 13:00+5', to: 'ВТ 16:00+5' }],
    Linus: [
    { from: 'ПН 09:00+3', to: 'ПН 14:00+3' },
    { from: 'ПН 21:00+3', to: 'ВТ 09:30+3' },
    { from: 'СР 09:30+3', to: 'СР 15:00+3' }
    ]
};
    
const bankWorkingHours = {
    from: '10:00+5',
    to: '18:00+5'
};
    
// Время не существует
const longMoment = robbery.getAppropriateMoment(gangSchedule, 121, bankWorkingHours);
    
// Выведется `false` и `""`
console.info(longMoment.exists());
console.info(longMoment.format('Метим на %DD, старт в %HH:%MM!'));
    
// Время существует
const moment = robbery.getAppropriateMoment(gangSchedule, 90, bankWorkingHours);
    
// Выведется `true` и `"Метим на ВТ, старт в 11:30!"`
console.info(moment.exists());
console.info(moment.format('Метим на %DD, старт в %HH:%MM!'));
    
// Дополнительное задание
// Вернет `true`
moment.tryLater();
// `"ВТ 16:00"`
console.info(moment.format('%DD %HH:%MM'));

// Вернет `true`
moment.tryLater();
// `"ВТ 16:30"`
console.info(moment.format('%DD %HH:%MM'));

// Вернет `true`
moment.tryLater();
// `"СР 10:00"`
console.info(moment.format('%DD %HH:%MM'));

// Вернет `false`
moment.tryLater();
// `"СР 10:00"`
console.info(moment.format('%DD %HH:%MM'));
```
