import './.env'
import MTProto, { Peer } from '@mtproto/core'
import type { Message } from '@mtproto/core'
import authorize from './auth'
import generateGreetings from './greetings'
import { isFirstMessage } from './utils'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url)) + '/'

const api = new MTProto({
  api_id: Number(process.env.APP_ID),
  api_hash: process.env.APP_HASH as string,

  storageOptions: { path: __dirname + '../tempdata.json' }
})

global.api = api

const user = await authorize()
console.log(`Пользователь ${user.user.first_name} авторизирован, бот начинает работу`)

api.updates.on('updateShortMessage', async updateInfo => updateInfo.out === false && checkLatestDialogs())
api.updates.on('updates', ({ updates }) => updates
  .filter((update: { [key: string]: any }) => update['_'] === 'updateNewMessage')
  .filter(({ message }: { message: Message }) => !message.out)
  .filter(({ message }: { message: Message }) => message.peer_id['_'] === 'peerUser')
  .length > 0 && checkLatestDialogs()
)

async function checkLatestDialogs() {
  const latestDialogs = await api.call('messages.getDialogs', {
    exclude_pinned: true,
    limit: 5,
    offset_peer: { _: 'inputPeerEmpty' }
  })
  const unansweredDialogs = latestDialogs['dialogs'].filter(({ unread_count, peer: { _ } }) => unread_count > 0 && _ === 'peerUser')
  unansweredDialogs.forEach(async dialog => {
    const user = latestDialogs['users'].find(({ id }) => id === dialog.peer.user_id)
    const firstMessage = await isFirstMessage(user, dialog.top_message)
    if(firstMessage) greet(user, dialog.top_message)
  })
}

function greet(user: Peer, replyToID: number) {
  console.log(`Приветствую ${user.first_name} ${user.last_name ?? '[no last_name]'} (@${user.username ?? '[no username]'}, ${user.id})`)

  const { greetingsText, textEntities } = generateGreetings(user)
  api.call('messages.sendMessage', {
    peer: {
      _: 'inputPeerUser',
      user_id: user.id,
      access_hash: user.access_hash,
      no_webpage: true
    },
    reply_to_msg_id: replyToID,
    message: greetingsText,
    entities: textEntities,
    random_id: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
  }).catch(console.error)
}
