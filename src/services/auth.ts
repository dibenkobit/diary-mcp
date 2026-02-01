import { mkdirSync, existsSync } from "fs";
import { AUTH_URL, TOKEN_URL, SOLARIS_DIR, TOKEN_PATH } from "../shared/constants";

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

interface StoredToken {
  access_token: string;
  created_at: number;
}

export async function login(): Promise<void> {
  // 1. Request device code from server
  const deviceResponse = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!deviceResponse.ok) {
    throw new Error(`Failed to request device code: ${deviceResponse.status}`);
  }

  const deviceData = (await deviceResponse.json()) as DeviceCodeResponse;
  const { device_code, user_code, verification_uri, interval } = deviceData;

  // 2. Show user the code and open browser
  console.log("\nTo authenticate, visit:");
  console.log(`  ${verification_uri}`);
  console.log(`\nEnter code: ${user_code}\n`);

  // Try to open browser (cross-platform)
  try {
    const openCommand =
      process.platform === "darwin"
        ? "open"
        : process.platform === "win32"
          ? "start"
          : "xdg-open";
    Bun.spawn([openCommand, verification_uri]);
  } catch {
    // Browser open failed, user can manually visit
  }

  console.log("Waiting for authentication...");

  // 3. Poll for token
  const token = await pollForToken(device_code, interval);

  // 4. Ensure directory exists
  if (!existsSync(SOLARIS_DIR)) {
    mkdirSync(SOLARIS_DIR, { recursive: true });
  }

  // 5. Save token
  const storedToken: StoredToken = {
    access_token: token,
    created_at: Date.now(),
  };
  await Bun.write(TOKEN_PATH, JSON.stringify(storedToken, null, 2));

  console.log("\nAuthenticated successfully!");
}

async function pollForToken(
  deviceCode: string,
  interval: number
): Promise<string> {
  const pollInterval = (interval || 5) * 1000; // Default 5 seconds

  while (true) {
    await sleep(pollInterval);

    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        device_code: deviceCode,
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as TokenResponse;
      return data.access_token;
    }

    const error = (await response.json()) as { error: string };

    if (error.error === "authorization_pending") {
      // Keep polling
      continue;
    } else if (error.error === "slow_down") {
      // Increase interval
      await sleep(5000);
      continue;
    } else if (error.error === "expired_token") {
      throw new Error("Device code expired. Please try again.");
    } else if (error.error === "access_denied") {
      throw new Error("Access denied by user.");
    } else {
      throw new Error(`Authentication failed: ${error.error}`);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
    const { unlinkSync } = await import("fs");
    unlinkSync(TOKEN_PATH);
    console.log("Logged out successfully.");
  } catch {
    console.log("No active session.");
  }
}
