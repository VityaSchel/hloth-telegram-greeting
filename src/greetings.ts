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

function convertHTMLToEntities(root, element = root) {
  let entities = []
  for(let child of element.childNodes) {
    if(child.constructor.name === 'HTMLElement') {
      const difference = start => {
        const htmlBeforeStart = root.outerHTML.substring(0, start+1)
        return htmlBeforeStart.length - stripHtml(htmlBeforeStart).result.length
      }

      entities.push({
        _: entitiesMapping[child.rawTagName],
        offset: child.range[0] - difference(child.range[0]),
        length: child.innerText.length,
        ...(child.rawTagName === 'a' && { url: child.getAttribute('href') })
      })
      if(child.childNodes) entities.push(...convertHTMLToEntities(root, child))
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

export default user => {
  /* eslint-disable no-irregular-whitespace */
  const greetings = parse(dedent`
    <b>${['Здравствуйте', 'Доброе утро', 'Добрый день', 'Добрый вечер'][time()]}, ${user.first_name}!</b>

    Благодарю Вас за проявленный интернес к моей кандидатуре. В данный момент я не могу ответить Вам, поэтому если Ваш \
    вопрос касается сотрудничества со мной и разработки IT-продуктов, пожалуйста, сразу уточните все необходимые детали:

    Например, если Вы хотите обсудить разработку или верстку веб-сайтов и веб-приложений, уточните наличие макета и \
    ссылку на него.
    Если Вы планируете обслуживать приложения на бекенде, я был бы признателен за уточнение наличия у Вас
    собственного хостинга/VPS.

    Мой основной стек: TypeScript, MongoDB, Next.js, React, React-Native (expo). На Python не пишу с 2020 года. \
    Опыт работы вы можете посмотреть на моем сайте, В данный момент я НЕ рассматриваю приглашения на \
    работу, работу в большой команде над долгосрочным проектом и менторство. Мое <a href='https://hloth.dev/portfolio'>портфолио</a> \
    и <a href='https://github.com/VityaSchel'>GitHub</a>.

    <b><u>Небольшой FAQ с частозадаваемыми вопросами:</u></b>

    &!P  <b>Вы работаете по предоплате?</b>
    — Да, начиная с 2022 года я работаю только по предоплате. 

    &!M  <b>Сколько это будет стоить?</b>
    — Я работаю 2-5 часов в день с понедельника по пятницу, моя часовая ставка это <b>15 евро</b>, но иногда я договариваюсь о \
    фиксированной цене на проект без учета правок (готов составить таблицу по часам по ТЗ).
    • Боты: от 50 €
    • Вёрстка: от 100 €
    • Сайты и приложения: от 300 €

    &!C  <b>Способы оплаты</b>
    Я принимаю оплату на счет своего банка Тинькофф. <b>В связи с нестабильным курсом рубля, сейчас я принимаю оплату \
    только в евро и чешской кроне.</b> Если у Вас возникли трудности с переводом по SWIFT, то я могу предложить альтернативный \
    вариант перевода через СБП на номер +7 9019 404-69-8 по курсу покупки евро в Тинькофф банке (актуальный курс: напишите @eurocurbot [число]).
    Если у вас есть счет в евро в Тинькофф, вы можете перевести их напрямую. У меня есть статус самозанятого. \
    Также готов работать по договору ГПХ и подписать NDA.
    
    С осени 2022 года также принимаю оплату в Tether USDT в сетях Etherium (ERC20) и Tron (TRC20) и в любой криптовалюте на Binance.

    Кстати, исходный код этого авто‑ответчика <a href='https://github.com/VityaSchel/hloth-telegram-greeting'>выложен</a> \
    на моем GitHub. Если Вы еще не заглянули туда, почему бы Вам не ознакомиться с ним и другими моими проектами? 😉
  `)

  return {
    greetingsText: greetings.innerText
      .replaceAll('&!P', '💼')
      .replaceAll('&!M', '💵')
      .replaceAll('&!C', '💳'),
    textEntities: convertHTMLToEntities(greetings)
  }
}

// &!P = 💼
// &!M = 💵
// &!C = 💳
