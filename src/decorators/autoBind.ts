export const AutoBind = (_: any, _2: string, descriptor: PropertyDescriptor) => {
	const originalMethod = descriptor.value;
	return {
		configurable: true,
		enumerable: false,
		get() {
			return originalMethod.bind(this);
		},
	};
};
