export const GITHUB_API = 'https://api.github.com/graphql';

export async function getGitHubProfile(username: string, env?: any): Promise<any> {
	const url = `https://api.github.com/users/${encodeURIComponent(username)}`;

	const headers: Record<string, string> = {
		Accept: 'application/vnd.github.v3+json',
		'User-Agent': 'Cloudflare-Worker',
		...(env?.GITHUB_TOKEN ? { Authorization: `Bearer ${env.GITHUB_TOKEN}` } : {}),
	};

	const res = await fetch(url, { headers });

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`GitHub API error ${res.status}: ${text}`);
	}

	return res.json();
}

export async function fetchContributionGraph(username: string, token?: string, env?: any): Promise<any> {
	const url = GITHUB_API;
	const auth = token ?? env?.GITHUB_TOKEN;

	const query = `
    query ($username: String!) {
        user(login: $username) {
        contributionsCollection {
            contributionCalendar {
            totalContributions
            weeks {
                contributionDays {
                color
                contributionCount
                date
                }
            }
            }
        }
        }
    }
    `;

	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			'User-Agent': 'Cloudflare-Worker',
			...(auth ? { Authorization: `Bearer ${auth}` } : {}),
		},
		body: JSON.stringify({ query, variables: { username } }),
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`GitHub API HTTP error ${res.status}: ${text}`);
	}

	const json: any = await res.json();

	if (json.errors && json.errors.length > 0) {
		throw new Error(`GitHub GraphQL error: ${JSON.stringify(json.errors)}`);
	}

	const calendar = json?.data?.user?.contributionsCollection?.contributionCalendar;
	if (!calendar) {
		throw new Error(`Contribution calendar not found for user: ${username}`);
	}

	return calendar;
}
