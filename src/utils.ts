export async function isFirstMessage(user, messageID) {
  const history = await global.api.call('messages.getHistory', {
    peer: {
      _: 'inputPeerUser',
      user_id: user.id,
      access_hash: user.access_hash
    },
    limit: 1,
    max_id: messageID
  })
  const isFirstMessage = history['count'] === 1
  return isFirstMessage
}

export async function getUser() {
  try {
    const user = await global.api.call('users.getFullUser', {
      id: {
        _: 'inputUserSelf',
      },
    })

    return user
  } catch (error) {
    return null
  }
}

export function sendCode(phone) {
  return global.api.call('auth.sendCode', {
    phone_number: phone,
    settings: {
      _: 'codeSettings',
    },
  })
}

export function signIn({ code, phone, phone_code_hash }) {
  return global.api.call('auth.signIn', {
    phone_code: code,
    phone_number: phone,
    phone_code_hash: phone_code_hash,
  })
}

export function signUp({ phone, phone_code_hash }) {
  return global.api.call('auth.signUp', {
    phone_number: phone,
    phone_code_hash: phone_code_hash,
    first_name: 'MTProto',
    last_name: 'Core',
  })
}

export function getPassword() {
  return global.api.call('account.getPassword')
}

export function checkPassword({ srp_id, A, M1 }) {
  return global.api.call('auth.checkPassword', {
    password: {
      _: 'inputCheckPasswordSRP',
      srp_id,
      A,
      M1,
    },
  })
}
