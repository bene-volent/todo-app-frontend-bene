const LOCAL_STORAGE_KEY = "frontend-mentor-todo-app"
import { saveInLocalStorage, getFromLocalStorage } from "./utils.js"

class TodoList {
    constructor() {
        this.tasks = []
        this.tasksCount = 0

        let localStorageData = getFromLocalStorage(LOCAL_STORAGE_KEY)
        if (localStorageData) {
            localStorageData.tasks.forEach(task => {
                this.tasks.push(new TodoTask(task.task,task.index,task.completed))
                if (!task.completed) this.tasksCount++
            })
        }
    }
    getAllTasks() {
        return this.tasks
    }
    getCompletedTasks() {
        return this.tasks.filter(task => task.completed)
    }
    getActiveTasks() {
        return this.tasks.filter(task => !task.completed)
    }
    getTaskByIndex(index) {
        return this.tasks.find(task => index === task.index)
    }
    clearCompleted() {
        this.tasks = this.getActiveTasks()
        this.tasks.forEach((task, index) => { task.index = index })
        this.tasksCount = this.tasks.length

        saveInLocalStorage(LOCAL_STORAGE_KEY, { tasks: this.tasks, tasksCount: this.tasksCount })
        return this.tasks
    }
    completeTask(taskIndex) {
        this.tasks[taskIndex].toggleComplete()
        if (this.tasks[taskIndex].completed) {
            this.tasksCount--
        } else {
            this.tasksCount++
        }
        saveInLocalStorage(LOCAL_STORAGE_KEY, { tasks: this.tasks, tasksCount: this.tasksCount })

    }

    sortTasks() {
        this.tasks.sort((task1, task2) => task1.index - task2.index)
        saveInLocalStorage(LOCAL_STORAGE_KEY, { tasks: this.tasks, tasksCount: this.tasksCount })

    }
    removeTask(index) {
        this.tasks = this.tasks.filter(task => task.index !== index)
        this.tasks.forEach((task, index) => { task.index = index })

        this.tasksCount--
        saveInLocalStorage(LOCAL_STORAGE_KEY, { tasks: this.tasks, tasksCount: this.tasksCount })

        return this.tasks

    }
    addNewTask(name, completed = false) {
        this.tasks.push(new TodoTask(name, this.tasks.length,completed))
        this.tasksCount++
        saveInLocalStorage(LOCAL_STORAGE_KEY, { tasks: this.tasks, tasksCount: this.tasksCount })

    }
}
class TodoTask {
    constructor(name, index, completed = false) {
        this.task = name;
        this.index = index
        this.completed = completed
    }
    toggleComplete() {
        this.completed = !this.completed
    }
}

export default TodoList