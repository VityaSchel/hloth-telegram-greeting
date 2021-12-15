import readlineSync from 'readline-sync'

export default async function authorize() {
  let user
  if(process.argv[2] === '--logout') await global.api.call('auth.logOut')
  else user = await getUser()

  if (user) return user
  else {
    const phone = process.env.PHONE
    const { phone_code_hash } = await sendCode(phone)
    const code = readlineSync.question('Код для авторизации: ')

    try {
      const signInResult = await signIn({
        code,
        phone,
        phone_code_hash,
      })

      if (signInResult._ === 'auth.authorizationSignUpRequired') throw 'Аккаунт не найден'
    } catch (error) {
      switch (error.error_message) {
        case 'SESSION_PASSWORD_NEEDED':
          while(true) {
            try {
              await twoFA()
            } catch(e) {
              if(e.error_message === 'PASSWORD_HASH_INVALID') throw 'Неправильный пароль 2FA'
              else throw error
            }
            break
          }
          return await getUser()

        case 'PHONE_CODE_INVALID':
          console.log('Неправильный код! Попробуйте еще раз')
          return await authorize()

        default:
          throw error
      }
    }
  }
}

async function twoFA() {
  const { srp_id, current_algo, srp_B } = await getPassword()
  const { g, p, salt1, salt2 } = current_algo

  const { A, M1 } = await global.api.crypto.getSRPParams({
    g,
    p,
    salt1,
    salt2,
    gB: srp_B,
    password: process.env.TWO_FA_PASSWORD,
  })

  await checkPassword({ srp_id, A, M1 })
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
