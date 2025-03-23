import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file first
dotenv.config();

// Log the environment variables after loading .env
console.log('Environment variables in setup.ts:');
console.log(`- GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS || 'not set'}`);
console.log(`- CM360_PROFILE_ID: ${process.env.CM360_PROFILE_ID || 'not set'}`);
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);

// Only set mock environment variables if they're not already set
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
	process.env.GOOGLE_APPLICATION_CREDENTIALS = '/path/to/credentials.json';
	console.log('Set default GOOGLE_APPLICATION_CREDENTIALS');
}

if (!process.env.CM360_PROFILE_ID) {
	process.env.CM360_PROFILE_ID = '12345';
	console.log('Set default CM360_PROFILE_ID');
}

// Always set NODE_ENV to 'development' for tests
// This is necessary because Jest sets NODE_ENV to 'test' by default
process.env.NODE_ENV = 'development';

// Mock the require function for credentials - use string literals
jest.mock('/path/to/credentials.json', () => ({
	client_email: 'test@example.com',
	private_key: 'test-private-key'
}), { virtual: true });

// Mock dotenv
jest.mock('dotenv', () => ({
	config: jest.fn()
}));

// Create a mock request function that can be accessed by tests
export const mockJwtRequest = jest.fn();

// Mock JWT
jest.mock('google-auth-library', () => ({
	JWT: jest.fn().mockImplementation(() => ({
		request: mockJwtRequest
	}))
}));

// Custom logger to handle MCP's use of console.error for regular logging
class TestLogger {
	logs: Record<string, string[]> = {
		log: [],
		info: [],
		warn: [],
		error: [],
		debug: []
	};

	log(...args: any[]): void {
		this.logs.log.push(args.map(arg => String(arg)).join(' '));
	}

	info(...args: any[]): void {
		this.logs.info.push(args.map(arg => String(arg)).join(' '));
	}

	warn(...args: any[]): void {
		this.logs.warn.push(args.map(arg => String(arg)).join(' '));
	}

	error(...args: any[]): void {
		// Only capture actual errors, not MCP regular logging
		const message = args.map(arg => String(arg)).join(' ');
		if (message.includes('Error') || message.includes('error') || message.includes('failed')) {
			this.logs.error.push(message);
		}
	}

	debug(...args: any[]): void {
		this.logs.debug.push(args.map(arg => String(arg)).join(' '));
	}

	// Helper method to check if a specific error was logged
	hasErrorLogged(errorPattern: string | RegExp): boolean {
		return this.logs.error.some(log => {
			if (errorPattern instanceof RegExp) {
				return errorPattern.test(log);
			}
			return log.includes(errorPattern);
		});
	}

	// Clear all logs
	clear(): void {
		Object.keys(this.logs).forEach(key => {
			this.logs[key as keyof typeof this.logs] = [];
		});
	}
}

// Create a global logger instance
export const testLogger = new TestLogger();

// Store original console methods
export const originalConsole = {
	log: console.log,
	info: console.info,
	warn: console.warn,
	error: console.error,
	debug: console.debug
};

// Replace console methods with our custom logger
beforeEach(() => {
	console.log = jest.fn(testLogger.log.bind(testLogger));
	console.info = jest.fn(testLogger.info.bind(testLogger));
	console.warn = jest.fn(testLogger.warn.bind(testLogger));
	console.error = jest.fn(testLogger.error.bind(testLogger));
	console.debug = jest.fn(testLogger.debug.bind(testLogger));
	
	// Clear logs before each test
	testLogger.clear();
});

// Restore original console methods after tests
afterEach(() => {
	console.log = originalConsole.log;
	console.info = originalConsole.info;
	console.warn = originalConsole.warn;
	console.error = originalConsole.error;
	console.debug = originalConsole.debug;
});