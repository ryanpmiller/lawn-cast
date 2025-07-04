module.exports = {
	root: true,
	env: {
		browser: true,
		es2021: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:react-hooks/recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier',
	],
	parser: '@typescript-eslint/parser',
	plugins: ['react', 'react-hooks', '@typescript-eslint'],
	settings: {
		react: {
			version: 'detect',
		},
	},
	rules: {
		// Custom rules can be added here
	},
};
