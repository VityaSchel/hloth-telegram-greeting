import { parse } from 'node-html-parser'
import { stripHtml } from 'string-strip-html'
import dedent from 'dedent'
import { DateTime } from 'luxon'

const entitiesMapping = {
  'b': 'messageEntityBold',
  'i': 'messageEntityItalic',
  's': 'messageEntityStrike',
  'a': 'messageEntityTextUrl',
  'u': 'messageEntityUnderline'
}

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
          _: entitiesMapping[child.rawTagName],
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
    const date = DateTime.now().setZone('Europe/Moscow')
    const time = date.toSeconds() - date.startOf('day').toSeconds()
    if(time < 60*60*5) return 0
    else if(time < 60*60*12) return 1
    else if(time < 60*60*19) return 2
    else return 3
  }

  /* eslint-disable no-irregular-whitespace */
  const greetings = parse(dedent`
    <b>${['Здравствуйте', 'Доброе утро', 'Добрый день', 'Добрый вечер'][time()]}, ${user.first_name}!</b>

    Благодарю Вас за проявленный интернес к моей кандидатуре. В данный момент я не могу ответить Вам, поэтому если Ваш \
    вопрос касается сотрудничества со мной и разработки IT-продуктов, пожалуйста, сразу уточните все необходимые детали:

    Например, если Вы хотите обсудить разработку или верстку веб-сайтов и веб-приложений, уточните наличие макета и \
    ссылку на него.
    Если Вы планируете обслуживать приложения на бекенде, я был бы признателен за уточнение наличия у Вас
    собственного хостинга/VPS.

    Мой основной стек: NodeJS, MongoDB, React, React-native, Redux + плагины к нему. На Python не пишу с 2020 года. \
    Опыта работы официально и коммерческого нет, CV также ещё нет, В данный момент я НЕ рассматриваю приглашения на \
    работу, работу в большой команде над долгосрочным проектом и менторство. Мое <a href='http://bit.ly/web-fl'>портфолио</a> \
    и <a href='https://github.com/VityaSchel'>GitHub</a>.

    <b><u>Небольшой FAQ с частозадаваемыми вопросами:</u></b>

    &P  <b>Вы работаете по предоплате?</b>
    — Да, начиная с 2022 года я работаю только по предоплате. 

    &M  <b>Сколько это будет стоить?</b>
    — Я работаю 3-5 часов в день с понедельника по пятницу, моя часовая ставка это <b>8.5 евро</b>, но обычно я устанавливаю \
    фиксированную цену на проект без учета правок.
    • Боты: от 50 €
    • Вёрстка: от 100 €
    • Лендинг: от 200 €
    • Сайты и приложения: от 300 €
    
    &C  <b>Способы оплаты</b>
    Я принимаю оплату на счет своего банка Тинькофф. <b>В связи с нестабильным курсом рубля, сейчас я принимаю оплату \
    только в евро и чешской кроне.</b> Если у Вас возникли трудности с переводом по SWIFT, то я могу предложить альтернативный \
    вариант перевода через СБП по курсу покупки евро в Тинькофф банке (актуальный курс: напишите @eurocurbot [число]).
    Пожалуйста, переводите оплату только когда я онлайн, чтобы я мог сразу конвертировать деньги в евро, иначе вам придется \
    оплатить разницу курса. Оплата по СБП производится в течение 5 минут с курсом, отправленным через @eurocurbot. Также я \
    принимаю оплату по договору. Статуса самозанятого, ИП и юрлица у меня нет.

    Кстати, исходный код этого авто‑ответчика <a href='https://github.com/VityaSchel/hloth-telegram-greeting'>выложен</a> \
    на моем GitHub. Если Вы еще не заглянули туда, почему бы Вам не ознакомиться с ним и другими моими проектами? 😉
  `)

  return {
    greetingsText: greetings.innerText
      .replaceAll('&P', '💼')
      .replaceAll('&M', '💵')
      .replaceAll('&C', '💳'),
    textEntities: convertHTMLToEntities(greetings)
  }
}

// &P = 💼
// &M = 💵
// &C = 💳