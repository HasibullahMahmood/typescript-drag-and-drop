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

type Listener<T> = (items: T[]) => void;
abstract class State<T> {
	protected listeners: Listener<T>[] = [];
	addListener(cb: Listener<T>) {
		this.listeners.push(cb);
	}
}

class ProjectsState extends State<Project> {
	private static instance: ProjectsState;
	private projects: Project[] = [];

	private constructor() {
		super();
	}

	static getInstance() {
		if (!this.instance) {
			this.instance = new ProjectsState();
		}
		return this.instance;
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

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
	templateEl: HTMLTemplateElement;
	templateRenderEl: T;
	hostEl: U;

	constructor(templateId: string, hostId: string, insertAtFirst: boolean, templateRenderElId?: string) {
		this.templateEl = document.querySelector(`#${templateId}`)! as HTMLTemplateElement;
		this.hostEl = document.querySelector(`#${hostId}`)! as U;
		this.templateRenderEl = document.importNode(this.templateEl.content, true).firstElementChild as T;
		if (templateRenderElId) {
			this.templateRenderEl.id = templateRenderElId;
		}

		this.attach(insertAtFirst);
	}

	private attach(insertAtBeginning: boolean) {
		this.hostEl.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.templateRenderEl);
	}

	abstract renderContent(): void;
	abstract configure(): void;
}

class ProjectItem extends Component<HTMLLIElement, HTMLUListElement> {
	private project: Project;
	constructor(hostId: string, prj: Project) {
		super('single-project', hostId, false, prj.id);
		this.project = prj;

		this.configure();
		this.renderContent();
	}

	configure(): void {}

	renderContent(): void {
		this.templateRenderEl.querySelector('h2')!.textContent = this.project.title;
		this.templateRenderEl.querySelector('h3')!.textContent = this.project.people.toString();
		this.templateRenderEl.querySelector('p')!.textContent = this.project.description;
	}
}

class ProjectList extends Component<HTMLElement, HTMLDivElement> {
	assignedProjects: Project[] = [];

	constructor(private type: 'active' | 'finished') {
		super('project-list', 'app', false, `${type}-projects`);

		projectsState.addListener((projects: Project[]) => {
			this.assignedProjects = projects;
			this.renderProjects();
		});

		this.renderContent();
	}

	renderContent() {
		const listId = `${this.type}-project-list`;
		this.templateRenderEl.querySelector('ul')!.id = listId;
		this.templateRenderEl.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS LIST`;
	}

	configure() {}

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
			new ProjectItem(this.templateRenderEl.querySelector('ul')!.id, project);
		}
	}
}

class ProjectInput extends Component<HTMLFormElement, HTMLDivElement> {
	titleEl: HTMLInputElement;
	descriptionEl: HTMLInputElement;
	peopleEl: HTMLInputElement;

	constructor() {
		super('project-input', 'app', true, 'user-input');
		this.titleEl = this.templateRenderEl.querySelector('#title') as HTMLInputElement;
		this.descriptionEl = this.templateRenderEl.querySelector('#description') as HTMLInputElement;
		this.peopleEl = this.templateRenderEl.querySelector('#people') as HTMLInputElement;

		this.configure();
	}

	configure() {
		this.templateRenderEl.addEventListener('submit', this.submitHandler);
	}

	renderContent() {}

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
}

const prjInput = new ProjectInput();

const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');
