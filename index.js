import TodoList from "./todoList.js";
import { removeAllChildren } from "./utils.js";

// DOM Declarations
const themeToggler = document.querySelector(".app-theme-toggler");
const taskList = document.querySelector(".app-tasks");
const clearCompleted = document.querySelector(
    ".app-tasks-button[data-task='clear']"
);
const showAll = document.querySelectorAll(
    ".app-tasks-button[data-task='show-all']"
);
const showCompleted = document.querySelectorAll(
    ".app-tasks-button[data-task='show-completed']"
);
const showActive = document.querySelectorAll(
    ".app-tasks-button[data-task='show-active']"
);
const stateButtons = document.querySelectorAll(
    ".app-tasks-button[data-active]"
);
const activeItemsCount = document.querySelector(".app-tasks-count");
const todoForm = document.querySelector(".app-task-form")
let taskNameInput = document.querySelector("#app-task-input")

// Variable Declarations
// Enum
const SHOW_STATE = {
    ALL: 0,
    ACTIVE: 1,
    COMPLETED: 2,
};

let todoList = new TodoList();
let showState = SHOW_STATE.ALL;



function handleThemeToggle() {
    const isDark = document.querySelector("html").classList.contains("dark");

    if (isDark) {
        document.querySelector("html").classList.remove("dark");
    } else document.querySelector("html").classList.add("dark");
}

function handleTaskSumbission(event) {
    event.preventDefault()
    let taskName = taskNameInput.value
    taskNameInput.value = ''
    todoList.addNewTask(taskName)
    renderList()
}

function createTodoItem({ task, taskIndex, completed }) {
    const listItem = document.createElement("li");
    listItem.className = "app-task";
    listItem.dataset.complete = completed;
    listItem.dataset.index = taskIndex;
    listItem.draggable = true

    const completedButton = document.createElement("button");
    completedButton.type = "button";
    completedButton.className = "app-task-completed";

    completedButton.innerHTML = `<span class="sr-only">Toggle
    Complete</span>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 9" width="1em" height="1em">
    <path fill="none" stroke="#FFF" stroke-width="2" d="M1 4.304L3.696 7l6-6" />
  </svg>`;

    completedButton.addEventListener("click", () => {
        const taskCompleted = listItem.dataset.complete === "true";
        listItem.dataset.complete = !taskCompleted;
        let index = parseInt(listItem.dataset.index);
        todoList.completeTask(index);

        renderList();
    });

    const taskText = document.createElement("p");
    taskText.className = "app-task-text";
    taskText.textContent = task;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "app-task-remove";

    removeButton.innerHTML = `<span class="sr-only">Remove Task</span>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="1em" height="1em"><path fill="#494C6B" fill-rule="evenodd" d="M16.97 0l.708.707L9.546 8.84l8.132 8.132-.707.707-8.132-8.132-8.132 8.132L0 16.97l8.132-8.132L0 .707.707 0 8.84 8.132 16.971 0z"/></svg>`;

    removeButton.addEventListener("click", () => {
        let index = parseInt(listItem.dataset.index);
        todoList.removeTask(index);

        renderList();
    });
    listItem.append(completedButton, taskText, removeButton);


    listItem.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", JSON.stringify({ task, taskIndex }))
        setTimeout(() => {
            listItem.classList.add("dragging")

        })
    })

    listItem.addEventListener("dragend", (event) => {
        // event.preventDefault()
        listItem.classList.remove("dragging")

    })

    taskList.append(listItem);
}

function renderList() {
    // Clear All Children from list
    removeAllChildren(taskList);
    let tasksList;

    switch (showState) {
        case SHOW_STATE.ALL:
            tasksList = todoList.getAllTasks();
            break;

        case SHOW_STATE.ACTIVE:
            tasksList = todoList.getActiveTasks();
            break;

        case SHOW_STATE.COMPLETED:
            tasksList = todoList.getCompletedTasks();
            break;
    }

    tasksList.forEach((task) => {
        createTodoItem({
            task: task.task,
            taskIndex: task.index,
            completed: task.completed,
        });
    });

    activeItemsCount.textContent = todoList.tasksCount;
}


// Event Listeners
themeToggler.addEventListener("click", handleThemeToggle);
todoForm.addEventListener("submit", handleTaskSumbission)

const initSortableList = (e) => {
    e.preventDefault();
    const draggingItem = document.querySelector(".dragging");
    // Getting all items except currently dragging and making array of them
    let siblings = [...taskList.querySelectorAll(".app-task:not(.dragging)")];

    if (siblings.length === 0) return;
    // Finding the sibling after which the dragging item should be placed
    let nextSibling = siblings.find(sibling => {
        return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
    });
    // Inserting the dragging item before the found sibling
    let prevSibling
    if (nextSibling) {
        prevSibling = siblings.find(
            sibling => {
                return e.clientY >= sibling.offsetTop + sibling.offsetHeight / 2;
            }
        )
    }

    else {
        prevSibling = taskList.lastChild
    }

    if (prevSibling) {
        let prevSiblingIndex = parseInt(prevSibling.dataset.index)
        let currentIndex = parseInt(draggingItem.dataset.index)


        if (prevSiblingIndex > currentIndex) {
            let currentTask = todoList.getTaskByIndex(currentIndex)
            let prevTask = todoList.getTaskByIndex(prevSiblingIndex)

            currentTask.index = draggingItem.dataset.index = prevSiblingIndex
            prevTask.index = prevSibling.dataset.index = currentIndex
            todoList.sortTasks()
        }

    }
    else{
        let nextSiblingIndex = parseInt(nextSibling.dataset.index)
        let currentIndex = parseInt(draggingItem.dataset.index)

        console.log(nextSiblingIndex,currentIndex)

        if (nextSiblingIndex < currentIndex) {
            let currentTask = todoList.getTaskByIndex(currentIndex)
            let nextTask = todoList.getTaskByIndex(nextSiblingIndex)

            currentTask.index = draggingItem.dataset.index = nextSiblingIndex
            nextTask.index = nextSibling.dataset.index = currentIndex
            todoList.sortTasks()
        }
    }

    
    taskList.insertBefore(draggingItem, nextSibling);
}
taskList.addEventListener("dragover", initSortableList);
taskList.addEventListener("dragenter", e => e.preventDefault());
taskList.addEventListener("drop", e => { e.preventDefault(); renderList() })

showAll.forEach((btn) =>
    btn.addEventListener("click", () => {
        stateButtons.forEach((btn) => (btn.dataset.active = false));
        showAll.forEach((btn) => (btn.dataset.active = true));
        showState = SHOW_STATE.ALL;

        renderList();
    })
);
showCompleted.forEach((btn) =>
    btn.addEventListener("click", () => {
        stateButtons.forEach((btn) => (btn.dataset.active = false));
        showCompleted.forEach((btn) => (btn.dataset.active = true));
        showState = SHOW_STATE.COMPLETED;
        renderList();
    })
);
showActive.forEach((btn) =>
    btn.addEventListener("click", () => {
        stateButtons.forEach((btn) => (btn.dataset.active = false));
        showActive.forEach((btn) => (btn.dataset.active = true));
        showState = SHOW_STATE.ACTIVE;
        renderList();
    })
);

clearCompleted.addEventListener("click", () => {
    todoList.clearCompleted();
    renderList();
});

renderList();
