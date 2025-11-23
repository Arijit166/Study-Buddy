import { cookies } from 'next/headers'

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const userSession = cookieStore.get('user_session')

    if (!userSession) {
      return null
    }

    const sessionData = JSON.parse(userSession.value)
    return {
      userId: sessionData.userId,
      email: sessionData.email,
      name: sessionData.name,
      avatar: sessionData.avatar,
    }
  } catch (error) {
    console.error('Get user error:', error)
    return null
  }
}