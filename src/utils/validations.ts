namespace App {
	interface Validatable {
		value: string | number;
		required?: boolean; // optional
		minLength?: number;
		maxLength?: number;
		min?: number; // optional
		max?: number;
	}

	export const validate = (config: Validatable) => {
		const { value, required, minLength, maxLength, min, max } = config;
		let isValid = true;
		if (required) {
			isValid = isValid && value.toString().trim().length !== 0;
		}

		if (minLength && typeof minLength === 'number') {
			isValid = isValid && value.toString().trim().length >= minLength;
		}

		if (maxLength && typeof maxLength === 'number') {
			isValid = isValid && value.toString().trim().length <= maxLength;
		}

		if (min && typeof min === 'number') {
			isValid = isValid && value >= min;
		}

		if (max && typeof max === 'number') {
			isValid = isValid && value <= max;
		}
		return isValid;
	};
}
