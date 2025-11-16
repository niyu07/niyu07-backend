import { Hono } from 'hono'
import { getGitHubProfile, fetchContributionGraph } from '../services/githubService'

export const githubRoutes = new Hono()

githubRoutes.get('/profile/:user', async (c) => {
    try {
        const username = c.req.param('user')
        const profile = await getGitHubProfile(username, c.env)
        return c.json(profile)
    } catch (err: any) {
        return c.json( { error: err.message ?? 'unknown' }, 500)
    }
})

githubRoutes.get('/contributions/:user', async (c) => {
    try {
        const username = c.req.param('user')
        const calendar = await fetchContributionGraph(username, undefined, c.env)
        return c.json(calendar)
    } catch (err: any) {
        return c.json({ error: err.message ?? `unknown`}, 500)
    }
})