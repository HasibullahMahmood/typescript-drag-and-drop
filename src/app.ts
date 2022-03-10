interface Validatable {
	value: string | number;
	required?: boolean; // optional
	minLength?: number;
	maxLength?: number;
	min?: number; // optional
	max?: number;
}

const validate = (config: Validatable) => {
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

const AutoBind = (_: any, _2: string, descriptor: PropertyDescriptor) => {
	const originalMethod = descriptor.value;
	return {
		configurable: true,
		enumerable: false,
		get() {
			return originalMethod.bind(this);
		},
	};
};

class ProjectInput {
	templateEl: HTMLTemplateElement;
	hostEl: HTMLDivElement;
	formEl: HTMLFormElement;
	titleEl: HTMLInputElement;
	descriptionEl: HTMLInputElement;
	peopleEl: HTMLInputElement;

	constructor() {
		this.templateEl = document.getElementById('project-input')! as HTMLTemplateElement;
		this.hostEl = document.getElementById('app')! as HTMLDivElement;
		this.formEl = document.importNode(this.templateEl.content, true).firstElementChild as HTMLFormElement;
		this.formEl.id = 'user-input';

		this.titleEl = this.formEl.querySelector('#title') as HTMLInputElement;
		this.descriptionEl = this.formEl.querySelector('#description') as HTMLInputElement;
		this.peopleEl = this.formEl.querySelector('#people') as HTMLInputElement;

		this.configure();
		this.attach();
	}

	private getInputs(): [string, string, number] | void {
		const title = this.titleEl.value;
		const desc = this.descriptionEl.value;
		const people = this.peopleEl.value;

		if (
			!validate({ value: title, required: true }) ||
			!validate({ value: desc, required: true, minLength: 5 }) ||
			!validate({ value: people, required: true, min: 1, max: 5 })
		) {
			alert('Invalid input, please try again!');
			return;
		} else {
			return [title, desc, +people];
		}
	}

	private clearInputs() {
		this.titleEl.value = '';
		this.descriptionEl.value = '';
		this.peopleEl.value = '';
	}

	@AutoBind
	private submitHandler(event: Event) {
		event.preventDefault();
		const inputs = this.getInputs();

		if (Array.isArray(inputs)) {
			const [title, desc, people] = inputs;
			console.log(title, desc, people);
			this.clearInputs();
		}
	}

	private configure() {
		this.formEl.addEventListener('submit', this.submitHandler);
	}
	private attach() {
		this.hostEl.insertAdjacentElement('afterbegin', this.formEl);
	}
}

const prjInput = new ProjectInput();
