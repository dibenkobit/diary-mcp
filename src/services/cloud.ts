import { MEMO_API_URL } from '../shared/constants';
import type { Memo } from '../shared/types';
import { getToken } from './auth';

export async function syncToCloud(memo: Memo): Promise<boolean> {
    const token = await getToken();

    if (!token) {
        console.error('Cloud sync: not authenticated. Run: bunx solaris auth login');
        return false;
    }

    try {
        const response = await fetch(MEMO_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                id: memo.id,
                timestamp: memo.timestamp,
                content: memo.content
            })
        });

        if (!response.ok) {
            console.error(`Cloud sync failed: ${response.status}`);
            return false;
        }

        return true;
    } catch (error) {
        console.error(`Cloud sync error: ${error}`);
        return false;
    }
}
