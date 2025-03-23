// This test file tests environment variable validation
// We need to mock modules before importing anything
import { testLogger } from './setup';

describe('Environment Variables Validation', () => {
	// Store original process.env and jest.mock
	const originalEnv = process.env;
	const originalJestMock = jest.mock;
	
	beforeEach(() => {
		// Reset modules before each test
		jest.resetModules();
		
		// Restore original process.env
		process.env = { ...originalEnv };
		
		// Clear all mocks
		jest.clearAllMocks();
	});
	
	afterEach(() => {
		// Restore original process.env
		process.env = originalEnv;
	});
	
	it('should validate required environment variables', () => {
		// Override process.env for this test
		process.env = {
			...process.env,
			GOOGLE_APPLICATION_CREDENTIALS: '/path/to/credentials.json',
			CM360_PROFILE_ID: '12345',
			NODE_ENV: 'development'
		};
		
		// Mock the require function for credentials
		jest.doMock('/path/to/credentials.json', () => ({
			client_email: 'test@example.com',
			private_key: 'test-private-key'
		}), { virtual: true });
		
		// Mock JWT
		jest.doMock('google-auth-library', () => ({
			JWT: jest.fn().mockImplementation(() => ({
				request: jest.fn()
			}))
		}));
		
		// This should not throw an error
		expect(() => {
			jest.isolateModules(() => {
				require('../src/cm360');
			});
		}).not.toThrow();
		
		// Verify no errors were logged
		expect(testLogger.logs.error).toHaveLength(0);
	});
	
	it('should accept valid NODE_ENV values', () => {
		// Test 'development'
		process.env = {
			...process.env,
			GOOGLE_APPLICATION_CREDENTIALS: '/path/to/credentials.json',
			CM360_PROFILE_ID: '12345',
			NODE_ENV: 'development'
		};
		
		// Mock the require function for credentials
		jest.doMock('/path/to/credentials.json', () => ({
			client_email: 'test@example.com',
			private_key: 'test-private-key'
		}), { virtual: true });
		
		// Mock JWT
		jest.doMock('google-auth-library', () => ({
			JWT: jest.fn().mockImplementation(() => ({
				request: jest.fn()
			}))
		}));
		
		expect(() => {
			jest.isolateModules(() => {
				require('../src/cm360');
			});
		}).not.toThrow();
		
		// Verify no errors were logged
		expect(testLogger.logs.error).toHaveLength(0);
		
		// Test 'production'
		process.env.NODE_ENV = 'production';
		
		expect(() => {
			jest.isolateModules(() => {
				require('../src/cm360');
			});
		}).not.toThrow();
		
		// Verify no errors were logged
		expect(testLogger.logs.error).toHaveLength(0);
	});
});