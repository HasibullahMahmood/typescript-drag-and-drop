enum ProjectStatus {
	Active,
	Finished,
}

class Project {
	constructor(
		public id: string,
		public title: string,
		public description: string,
		public people: number,
		public status: ProjectStatus
	) {}
}

type Listener = (projects: Project[]) => void;

class ProjectsState {
	listeners: Listener[] = [];
	projects: Project[] = [];
	private static instance: ProjectsState;

	private constructor() {}

	static getInstance() {
		if (!this.instance) {
			this.instance = new ProjectsState();
		}
		return this.instance;
	}

	addListener(cb: Listener) {
		this.listeners.push(cb);
	}

	addProject(title: string, description: string, people: number) {
		const newProject = new Project(Math.random().toString(), title, description, people, ProjectStatus.Active);
		this.projects.push(newProject);
		for (const listener of this.listeners) {
			listener(this.projects.slice());
		}
	}
}

const projectsState = ProjectsState.getInstance();

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

class ProjectList {
	templateEl: HTMLTemplateElement;
	sectionEl: HTMLElement;
	hostEl: HTMLDivElement;
	assignedProjects: Project[] = [];

	constructor(private type: 'active' | 'finished') {
		this.templateEl = document.getElementById('project-list') as HTMLTemplateElement;
		this.hostEl = document.getElementById('app') as HTMLDivElement;
		const importedNode = document.importNode(this.templateEl.content, true);
		this.sectionEl = importedNode.firstElementChild as HTMLElement;

		this.sectionEl.id = `${type}-projects`;
		projectsState.addListener((projects: Project[]) => {
			this.assignedProjects = projects;
			this.renderProjects();
		});
		this.attach();
		this.renderContent();
	}

	private attach() {
		this.hostEl.insertAdjacentElement('beforeend', this.sectionEl);
	}

	private renderContent() {
		const listId = `${this.type}-project-list`;
		this.sectionEl.querySelector('ul')!.id = listId;

		this.sectionEl.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS LIST`;
	}

	private renderProjects() {
		const ulEl = document.getElementById(`${this.type}-project-list`) as HTMLUListElement;
		const activeProjects = this.assignedProjects.filter((i: Project) => {
			if (this.type === 'active') {
				return i.status === ProjectStatus.Active;
			}
			return i.status === ProjectStatus.Finished;
		});

		ulEl.innerHTML = '';
		for (const project of activeProjects) {
			const li = document.createElement('li');
			li.textContent = project.title;
			ulEl.appendChild(li);
		}
	}
}

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
			projectsState.addProject(title, desc, people);
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

const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');
