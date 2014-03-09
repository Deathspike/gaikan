module.exports = typeof window === 'undefined' ?
	require('./server') :
	require('./browser');