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

	private submitHandler(event: Event) {
		event.preventDefault();
		console.log(this.titleEl.value);
	}

	private configure() {
		this.formEl.addEventListener('submit', this.submitHandler.bind(this));
	}
	private attach() {
		this.hostEl.insertAdjacentElement('afterbegin', this.formEl);
	}
}

const prjInput = new ProjectInput();
