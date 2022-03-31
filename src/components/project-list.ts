import Component from './base-component';
import { Droppable } from '../models/drag-drop';
import { Project, ProjectStatus } from '../models/project';
import { AutoBind } from '../decorators/autoBind';
import { projectsState } from '../states/project-state';
import ProjectItem from './project-item';

export default class ProjectList extends Component<HTMLElement, HTMLDivElement> implements Droppable {
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
