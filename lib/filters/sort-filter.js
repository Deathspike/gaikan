/**
 * The sort filter.
 *
 * @param value The value.
 * @param reverse Indicates whether the sorting is to be reversed.
 * @param orderBy The key for an array of objects to sort on.
 * @returns Indicates whether the value was empty.
 */
module.exports = function (value, reverse, orderBy) {
	// Check if reverse is not a boolean.
	if (typeof reverse !== 'boolean') {
		// Set the key for an array of objects to sort on.
		orderBy = reverse;
		// Set the status indicating whether the sorting is to be reversed.
		reverse = false;
	}
	// Check if the value is valid.
	if (value) {
		// Check if the value is an array.
		if (value.constructor === Array) {
			// Check if the value should be sorted.
			if (value.length > 1) {
				// Check if the key has been provided.
				if (orderBy) {
					// Sort the array.
					value.sort(function (a, b) {
						// Retrieve the orderBy for a.
						var x = a[orderBy];
						// Retrieve the orderBy for b.
						var y = b[orderBy];
						// Return the sort order.
						return x < y ? -1 : (x > y ? 1 : 0);
					});
				}
				// Otherwise this is a regular sort.
				else {
					// Sort the array.
					value.sort();
				}
				// Check if the sorting should be reversed.
				if (reverse) {
					// Reverse the array.
					value.reverse();
				}
			}
		}
		// Otherwise check if the value is an object.
		else if (value.constructor === Object) {
			// Initialize the working array.
			var working = [];
			// Iterate through each value.
			for (var key in value) {
				// Check if the key is a property of the statements object.
				if (value.hasOwnProperty(key)) {
					// Push the value.
					working.push(key);
				}
			}
			// Check if there are properties to sort.
			if (working.length > 1) {
				// Initialize the result.
				var result = {};
				// Sort the working array.
				working.sort();
				// Check if the sorting should be reversed.
				if (reverse) {
					// Reverse the array.
					working.reverse();
				}
				// Iterate through each item in the array.
				for (var key = 0; key < working.length; key += 1) {
					// Add the key and value to the result object.
					result[working[key]] = value[working[key]];
				}
				// Return the result.
				return result;
			}
		}
	}
	// Return the value.
	return value;
};