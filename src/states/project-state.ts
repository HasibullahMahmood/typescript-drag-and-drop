namespace App {
	type Listener<T> = (items: T[]) => void;
	abstract class State<T> {
		protected listeners: Listener<T>[] = [];
		addListener(cb: Listener<T>) {
			this.listeners.push(cb);
		}
	}

	export class ProjectsState extends State<Project> {
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

	export const projectsState = ProjectsState.getInstance();
}
