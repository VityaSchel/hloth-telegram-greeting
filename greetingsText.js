import { parse } from 'node-html-parser'
import { stripHtml } from 'string-strip-html'
import dedent from 'dedent'
import { DateTime } from 'luxon'

export default user => {
  function convertHTMLToEntities(element) {
    let entities = []
    for(let child of element.childNodes) {
      if(child.constructor.name === 'HTMLElement') {
        const difference = start => {
          const htmlBeforeStart = greetings.outerHTML.substring(0, start+1)
          return htmlBeforeStart.length - stripHtml(htmlBeforeStart).result.length
        }

        entities.push({
          _: {
            'b': 'messageEntityBold',
            'i': 'messageEntityItalic',
            's': 'messageEntityStrike',
            'a': 'messageEntityTextUrl',
            'u': 'messageEntityUnderline'
          }[child.rawTagName],
          offset: child.range[0] - difference(child.range[0]),
          length: child.innerText.length,
          ...(child.rawTagName === 'a' && { url: child.getAttribute('href') })
        })
        if(child.childNodes) entities.push(...convertHTMLToEntities(child))
      }
    }
    return entities
  }
  function time() {
    const time = DateTime.now().setZone('Europe/Moscow').toSeconds() - DateTime.now().setZone('Europe/Moscow').startOf('day').toSeconds()
    if(time < 60*60*5) return 0
    else if(time < 60*60*12) return 1
    else if(time < 60*60*19) return 2
    else return 3
  }

  const greetings = parse(dedent`
    <b>${['Здравствуйте', 'Доброе утро', 'Добрый день', 'Добрый вечер'][time()]}, ${user.first_name}!</b>

    Благодарю Вас за проявленный интернес к моей кандидатуре. В данный момент я не могу ответить Вам, поэтому если Ваш \
    вопрос касается сотрудничества со мной и разработки IT-продуктов, пожалуйста, сразу уточните все необходимые детали:

    Например, если Вы хотите обсудить разработку или верстку веб-сайтов и веб-приложений, уточните наличие макета и \
    ссылку на него.
    Если Вы планируете обслуживать приложения на бекенде, я был бы признателен за уточнение наличия у Вас
    собственного хостинга/VPS.

    <b><u>Небольшой FAQ с частозадаваемыми вопросами:</u></b>

    💼  <b>Вы работаете по предоплате?</b>
    — Обычно я работаю без предоплаты по принципу ТЗ и бриф – Работа – Правки и утверждение – Оплата и скидываю код, \
    помогаю с вопросами по установке, но если проект занимает слишком много времени, я обычно разделяю его в \
    несколько этапов или беру частичную предоплату.

    💳  <b>Сколько это будет стоить?</b>
    — Я работаю 5-7 часов в день, моя часовая ставка это 666 рублей, но мне комфортнее устанавливать цену за выполнение
    всей работы.
    • Боты: от 1000 рублей
    • Вёрстка: от 5000 рублей
    • Лендинг: от 10 000 рублей
    • Сайты: от 15 000 рублей,
    Готов обсудить с Вами постоянное сотрудничество и работу в команде с выполнением задач. Оплату принимаю на счёт
    Российского банка, возможен перевод по СБП или по договору, статуса самозанятого и ИП нет.

    Кстати, исходный код этого авто‑ответчика ⁠⁠<a href='https://github.com/VityaSchel/hloth-telegram-greeting'>выложен⁠⁠</a> \
    на моем GitHub. Если Вы еще не заглянули туда, почему бы Вам не ознакомиться с ним и другими моими проектами? 😉
  `)

  return {
    greetingsText: greetings.innerText,
    textEntities: convertHTMLToEntities(greetings)
  }
}
