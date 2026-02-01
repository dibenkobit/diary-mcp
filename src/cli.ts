import { Command } from 'commander';
import { startServer } from '@/mcp/server';
import { login, logout } from '@/services/auth';
import { APP_DESCRIPTION, APP_NAME, APP_VERSION } from '@/shared/constants';

const program = new Command();

program.name(APP_NAME).version(APP_VERSION).description(APP_DESCRIPTION);

const auth = program.command('auth').description('Manage authentication');

auth.command('login')
    .description('Authenticate with the cloud service')
    .action(async () => {
        await login();
    });

auth.command('logout')
    .description('Remove stored credentials')
    .action(async () => {
        await logout();
    });

program
    .command('serve', { isDefault: true })
    .description('Start the MCP server')
    .option('--cloud', 'Enable cloud sync')
    .action(async (options: { cloud?: boolean }) => {
        await startServer(options.cloud ?? false);
    });

program.parse();
