import { authService } from './auth.service.js'
import { logger } from '../../services/logger.service.js'

export async function login(req, res) {
    const { username, password } = req.body
    try {
        const user = await authService.login(username, password)
        logger.debug('auth.controller - user + pasword matched for ' + user.username)
        const accessToken = authService.getAccessToken(user)

        logger.info('auth.controller - User login:', user)

        res.cookie('accessToken', accessToken, { sameSite: 'None', secure: true })
        res.json(user)
    } catch (err) {
        logger.error('auth.controller - Failed to Login ' + err)
        res.status(401).send({ err: 'Failed to Login' })
    }
}

export async function signup(req, res) {
    try {
        const signupData = req.body

        const account = await authService.signup(signupData)
        logger.debug(`auth.controller - New account created: ` + JSON.stringify(account))

        const user = await authService.login(signupData.username, signupData.password)
        logger.info('auth.controller - User login:', user)

        const accessToken = authService.getAccessToken(user)
        logger.debug('auth.controller - got accessToken for ' + signupData.username)
        res.cookie('accessToken', accessToken, { sameSite: 'None', secure: true })
        res.json(user)
    } catch (err) {
        logger.error('auth.controller - Failed to signup: ' + err)
        res.status(400).send({ err: 'Failed to signup' })
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie('accessToken')
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        res.status(400).send({ err: 'Failed to logout' })
    }
}