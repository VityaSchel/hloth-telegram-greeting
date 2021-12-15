import 'dotenv/config'
import MTProto from '@mtproto/core'
import authorize from './auth.js'

global.api = new MTProto({
  api_id: Number(process.env.APP_ID),
  api_hash: process.env.APP_HASH,

  storageOptions: {
    path: './tempdata.json'
  }
})

const user = await authorize()
console.log(`Пользователь ${user.user.first_name} авторизирован, бот начинает работу`)

global.api.updates.on('updateShortMessage', async updateInfo => {
  if(updateInfo.out === true) return
  const latestDialogs = await global.api.call('messages.getDialogs', {
    exclude_pinned: true,
    limit: 5,
    offset_peer: { _: 'inputPeerEmpty' }
  })
  const unansweredDialogs = latestDialogs.dialogs.filter(({ unread_count, peer: { _ } }) => unread_count > 0 && _ === 'peerUser')
  unansweredDialogs.forEach(async dialog => {
    const user = latestDialogs.users.find(({ id }) => id === dialog.peer.user_id)
    const firstMessage = await isFirstMessage(user, dialog.top_message)
    if(firstMessage) greet(user)
  })
})

async function isFirstMessage(user, messageID) {
  const history = await global.api.call('messages.getHistory', {
    peer: {
      _: 'inputPeerUser',
      user_id: user.id,
      access_hash: user.access_hash
    },
    limit: 1,
    max_id: messageID
  })
  return history.count === 1
}

function greet(user) {
  console.log(`Приветствую ${user.first_name}`)
}
