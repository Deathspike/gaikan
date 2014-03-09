// Enable restricted mode.
'use strict';

/**
 * The empty set.
 *
 * @param value The value.
 * @returns Indicates if the value was empty.
 */
module.exports = function (value) {
	// Check if the value is invalid or is an empty array.
	if (!value) {
		// Return true.
		return true;
	}
	// Iterate through each property.
	for (var key in value) {
		// Check if this property is owned by the value.
		if (value.hasOwnProperty(key)) {
			// Return false.
			return false;
		}
	}
	// Return true.
	return true;
};