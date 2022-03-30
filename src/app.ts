/// <references path='./drag-drop.interfaces.ts' />
/// <references path='./project-model.ts' />

namespace App {
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
			this.updateListeners();
		}

		moveProject(prjId: string, newStatus: ProjectStatus) {
			const project = this.projects.find((i) => i.id === prjId);
			if (project && project.status !== newStatus) {
				project.status = newStatus;
				this.updateListeners();
			}
		}

		updateListeners() {
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

	class ProjectItem extends Component<HTMLLIElement, HTMLUListElement> implements Draggable {
		private project: Project;

		get persons() {
			if (this.project.people === 1) {
				return '1 person';
			} else {
				return `${this.project.people} persons`;
			}
		}

		constructor(hostId: string, prj: Project) {
			super('single-project', hostId, false, prj.id);
			this.project = prj;

			this.configure();
			this.renderContent();
		}

		@AutoBind
		dragStartHandler(event: DragEvent): void {
			event.dataTransfer!.setData('text/plain', this.project.id);
		}

		@AutoBind
		dragEndHandler(_: DragEvent): void {
			console.log('drag end');
		}

		configure(): void {
			this.templateRenderEl.addEventListener('dragstart', this.dragStartHandler);
			this.templateRenderEl.addEventListener('dragend', this.dragEndHandler);
		}

		renderContent(): void {
			this.templateRenderEl.querySelector('h2')!.textContent = this.project.title;
			this.templateRenderEl.querySelector('h3')!.textContent = this.persons + ` assigned`;
			this.templateRenderEl.querySelector('p')!.textContent = this.project.description;
		}
	}

	class ProjectList extends Component<HTMLElement, HTMLDivElement> implements Droppable {
		assignedProjects: Project[] = [];

		constructor(private type: 'active' | 'finished') {
			super('project-list', 'app', false, `${type}-projects`);

			projectsState.addListener((projects: Project[]) => {
				this.assignedProjects = projects;
				this.renderProjects();
			});

			this.renderContent();
			this.configure();
		}

		@AutoBind
		dragOverHandler(event: DragEvent): void {
			if (event?.dataTransfer?.types[0] === 'text/plain') {
				this.templateRenderEl.querySelector('ul')!.classList.add('droppable');
				event.dataTransfer.effectAllowed = 'move';
				event.preventDefault();
			}
		}

		@AutoBind
		dropHandler(event: DragEvent): void {
			const prjId = event.dataTransfer!.getData('text/plain');
			projectsState.moveProject(prjId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
		}

		@AutoBind
		dragLeaveHandler(_: DragEvent): void {
			this.templateRenderEl.querySelector('ul')!.classList.remove('droppable');
		}

		configure() {
			this.templateRenderEl.addEventListener('dragover', this.dragOverHandler);
			this.templateRenderEl.addEventListener('drop', this.dropHandler);
			this.templateRenderEl.addEventListener('dragleave', this.dragLeaveHandler);
		}

		renderContent() {
			const listId = `${this.type}-project-list`;
			this.templateRenderEl.querySelector('ul')!.id = listId;
			this.templateRenderEl.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS LIST`;
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

	new ProjectInput();
	new ProjectList('active');
	new ProjectList('finished');
}
