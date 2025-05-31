import { authService } from '../api/auth/auth.service.js'
import { asyncLocalStorage } from '../services/als.service.js'

export async function setupAsyncLocalStorage(req, res, next) {
	const storage = {}
	asyncLocalStorage.run(storage, () => {
		if (!req.cookies?.accessToken) return next()
		const loggedinUser = authService.validateToken(req.cookies.accessToken)

		if (loggedinUser) {
			const alsStore = asyncLocalStorage.getStore()
			alsStore.loggedinUser = loggedinUser
		}
		next()
	})
}
