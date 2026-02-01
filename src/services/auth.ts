import { mkdir, unlink } from 'node:fs/promises';
import { AUTH_URL, SOLARIS_DIR, TOKEN_PATH, TOKEN_URL } from '@/shared/constants';
import type { DeviceCodeResponse, StoredToken, TokenResponse } from '@/shared/types';

export async function login(): Promise<void> {
    const deviceResponse = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });

    if (!deviceResponse.ok) {
        throw new Error(`Failed to request device code: ${deviceResponse.status}`);
    }

    const deviceData = (await deviceResponse.json()) as DeviceCodeResponse;
    const { device_code, user_code, verification_uri, interval } = deviceData;

    console.log('\nTo authenticate, visit:');
    console.log(`  ${verification_uri}`);
    console.log(`\nEnter code: ${user_code}\n`);

    try {
        const openCommand =
            process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
        Bun.spawn([openCommand, verification_uri]);
    } catch {
        // Browser open failed, user can manually visit
    }

    console.log('Waiting for authentication...');

    const token = await pollForToken(device_code, interval);

    await mkdir(SOLARIS_DIR, { recursive: true });

    const storedToken: StoredToken = {
        access_token: token,
        created_at: Date.now()
    };
    await Bun.write(TOKEN_PATH, JSON.stringify(storedToken, null, 2));

    console.log('\nAuthenticated successfully!');
}

async function pollForToken(deviceCode: string, interval: number): Promise<string> {
    const pollInterval = (interval || 5) * 1000;

    while (true) {
        await Bun.sleep(pollInterval);

        const response = await fetch(TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
                device_code: deviceCode
            })
        });

        if (response.ok) {
            const data = (await response.json()) as TokenResponse;
            return data.access_token;
        }

        const error = (await response.json()) as { error: string };

        switch (error.error) {
            case 'authorization_pending':
                continue;
            case 'slow_down':
                await Bun.sleep(5000);
                continue;
            case 'expired_token':
                throw new Error('Device code expired. Please try again.');
            case 'access_denied':
                throw new Error('Access denied by user.');
            default:
                throw new Error(`Authentication failed: ${error.error}`);
        }
    }
}

export async function getToken(): Promise<string | null> {
    try {
        const file = Bun.file(TOKEN_PATH);
        if (!(await file.exists())) {
            return null;
        }
        const data: StoredToken = await file.json();
        return data.access_token;
    } catch {
        return null;
    }
}

export async function logout(): Promise<void> {
    try {
        await unlink(TOKEN_PATH);
        console.log('Logged out successfully.');
    } catch {
        console.log('No active session.');
    }
}
