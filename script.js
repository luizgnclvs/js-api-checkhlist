Parse.serverURL = "https://parseapi.back4app.com/";
Parse.initialize(
    "lY8hgd4DKbvsnW0UYxbaa7gktARQFtfGqLbyk8Yh",
    "4UI5ALJgulft95GQQhI1zQ57zzbdk4P5KzvPXVAB"
);

const inputTask = document.getElementById("task");
const btInsert = document.getElementById("insert");

inputTask.onfocus = () => {
    btInsert.innerHTML = "arrow_circle_right";
}

inputTask.onblur = () => {
    btInsert.innerHTML = "add_circle";
}

let taskList = [];
let doneTasks = [];

const addTask = () => {
    if (inputTask.value === "" || inputTask.value === null) {
        inputTask.focus();
    } else {
        addTaskAPI();
    }
}

const addTaskAPI = async () => {
    const newTask = new Parse.Object("Task");


    newTask.set("description", inputTask.value);
    inputTask.value = "";

    newTask.set("position", taskList.length);

    try {
        let result = await newTask.save();
        console.log("Objeto de ID \'" + result.id + "\' criado com sucesso.")
    } catch (error) {
        console.error("Falha ao criar novo objeto. Erro de código: " + error);
    }

    pullTasks();
};

const pullTasks = async () => {
    const task = Parse.Object.extend("Task");
    const query = new Parse.Query(task);

    try {
        const results = await query.find();
        taskList = [];
        doneTasks = [];

        console.clear();

        for (const object of results) {
            const id = object.id;
            const description = object.get("description");
            const done = object.get("done");
            const position = object.get("position");

            if (done) {
                doneTasks.push({id, description, done, position});
            } else {
                taskList.push({id, description, done, position});
            }

            console.log(`ID: ${id}, Descrição: ${description}, Concluída: ${done}, Posição: ${position}`);
        }

        console.log(`Número de tarefas não-concluídas: ${taskList.length} \nNúmero de tarefas concluídas: ${doneTasks.length}`);

        taskList = sortTasks(taskList);
        doneTasks = sortTasks(doneTasks);

        showTasks();
    } catch (error) {
        console.error("Falha ao execeutar o fetch dos objetos da classe \'Task\'. Erro de código: ", error);
    }
};

const toDoList = document.getElementById("todo-list");
const doneList = document.getElementById("done-list");

const showTasks = () => {
    toDoList.innerHTML = "";
    doneList.innerHTML = "";

    for (let i = 0; i < taskList.length; i++) {
        const toDoItem = createNewTask (taskList[i]);

        toDoList.appendChild(toDoItem);
    }

    for (let i = 0; i < doneTasks.length; i++) {
        const doneItem = createNewTask (doneTasks[i]);

        doneList.appendChild(doneItem);
    }
}

const sortTasks = (tasks) => {
    tasks.sort((a, b) => a.position - b.position);

    return tasks;
}

const createNewTask = (task) => {
        const li = createNewLi(task.id, task.position, task.done);
        const checkbox = createNewCheckBox(task.id, task.description, task.done);

        const btCancelEdit = createNewCancelEditButton(task.id);
        const btEdit = createNewEditButton(task.id);
        const btRemove = createNewRemoveButton(task.id);

        const div1 = document.createElement("div");
        const div2 = document.createElement("div");

        div1.classList.add("item-first");
        div2.classList.add("item-last");

        div1.appendChild(checkbox);

        div2.appendChild(btCancelEdit);
        div2.appendChild(btEdit);
        div2.appendChild(btRemove);

        li.appendChild(div1);
        li.appendChild(div2);

        return li;
}

const createNewLi = (id, position, done) => {
    const li = document.createElement("li");

    li.setAttribute("id", "task_" + id);
    li.setAttribute("value", position);

    if (!done) {
        li.className = "dropzone";
        li.setAttribute("draggable", true);
        li.setAttribute("ondragover", "event.preventDefault()");
    }

    return li;
}

const createNewCheckBox = (id, description, done) => {
    const label = document.createElement("label");
    label.classList.add("container");

    const span = document.createElement("span");
    span.classList.add("editOff");
    span.setAttribute("id", "text_" + id);

    const text = document.createTextNode(`${description}`);

    span.appendChild(text);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.setAttribute("id", "check_" + id);
    checkbox.setAttribute("onchange", "toggleTask(this.id)");

    if (done) {
        checkbox.setAttribute("checked", true);
    }

    const checkmark = document.createElement("span");
    checkmark.classList.add("checkmark");

    const inputEdit = document.createElement("input");
    inputEdit.type = "text";
    inputEdit.classList.add("editOff");
    inputEdit.setAttribute("id", "inEdit_" + id);

    label.appendChild(span);
    label.appendChild(checkbox);
    label.appendChild(checkmark);
    label.appendChild(inputEdit);

    return label;
}

const createNewCancelEditButton = (id) => {
    const btCancelEdit = document.createElement("span");

    btCancelEdit.classList.add("editOff");
    btCancelEdit.classList.add("material-symbols-sharp");
    btCancelEdit.setAttribute("id", "cancelEdit_" + id);

    btCancelEdit.innerHTML = "";

    return btCancelEdit;
}

const createNewEditButton = (id) => {
    const btEdit = document.createElement("span");

    btEdit.classList.add("editOff");
    btEdit.classList.add("material-symbols-sharp");
    btEdit.setAttribute("id", "btEdit_" + id);
    btEdit.setAttribute("onclick", "editTask(this.id)");

    btEdit.innerHTML = "edit";

    return btEdit;
}

const createNewRemoveButton = (id) => {
    const btRemove = document.createElement("span");

    btRemove.setAttribute("id", "remove_" + id);
    btRemove.classList.add("editOff");
    btRemove.classList.add("material-symbols-sharp");
    btRemove.setAttribute("onclick", "removeTask(this.id)");

    btRemove.innerHTML = "delete";

    return btRemove;
}

const idSplitter = (id) => {
    return id.split("_")[1];
}

const toggleTask = (id) => {
    let checkBox = document.getElementById(id);

    if (checkBox.checked) {
        completeTask(id);
    } else {
        incompleteTask(id);
    }
}

const completeTask = (id) => {
    id = idSplitter(id);

    let completedTask = document.querySelector("#task_" + id);

    doneList.appendChild(completedTask);

    completedTask.classList.remove("dropzone");
    completedTask.setAttribute("draggable", false);
    completedTask.removeAttribute("ondragover");
    completedTask.setAttribute("value", doneTasks.length);

    updatePositionAPI(id, doneTasks.length);

    let whichList = 1;
    updatePosition(whichList);

    let completedTaskItem = taskList.find(object => object.id == id);
    let index = taskList.findIndex(object => object.id == id);

    console.clear();

    console.log(`Objetos no array \'doneTasks\': ${doneTasks.length}`)

    taskList.splice(index, 1);
    doneTasks.push(completedTaskItem);

    console.log(`Objetos no array \'doneTasks\': ${doneTasks.length}`);

    toggleDoneAPI(id, true);
}

const incompleteTask = (id) => {
    id = id.split("_")[1];

    let incompletedTask = document.querySelector("#task_" + id);

    toDoList.appendChild(incompletedTask);

    incompletedTask.classList.add("dropzone");
    incompletedTask.setAttribute("draggable", true);
    incompletedTask.setAttribute("ondragover", "event.preventDefault()");
    incompletedTask.setAttribute("value", taskList.length);

    updatePositionAPI(id, taskList.length);

    let whichList = 0;
    updatePosition(whichList);

    let incompletedTaskItem = doneTasks.find(object => object.id == id);
    let index = doneTasks.findIndex(object => object.id == id);

    console.clear();

    console.log(`Objetos no array \'taskList\': ${taskList.length}`);

    doneTasks.splice(index, 1);
    taskList.push(incompletedTaskItem);

    console.log(`Objetos no array \'taskList\': ${taskList.length}`);

    toggleDoneAPI(id, false);
}

const toggleDoneAPI = async (id, boolean) => {
    const toggledTask = new Parse.Object("Task");

    toggledTask.set("objectId", id);
    toggledTask.set("done", boolean);

    try {
        let result = await toggledTask.save();
        console.log("Objeto de ID \'" + result.id + "\' atualizado com sucesso.");
    } catch (error) {
        console.error("Falha ao atualizar objeto. Erro de código: " + error);
    }
}

const editTask = (id) => {
    let button = document.getElementById(id);

    id = idSplitter(id);

    let btCancel = document.querySelector("#cancelEdit_" + id);
    let input = document.querySelector("#inEdit_" + id);
    let text = document.querySelector("#text_" + id);
    let btRemove = document.querySelector("#remove_" + id);

    button.classList.remove("editOff");
    button.classList.add("editOn");
    button.innerHTML = "check_circle";

    btCancel.classList.add("editOn");
    btRemove.classList.add("editOn");
    btCancel.classList.remove("editOff");
    btRemove.classList.remove("editOff");
    btCancel.innerHTML = "cancel";
    input.className = "editOn";
    text.className = "editOn";
    btRemove.innerHTML = "";

    input.value = text.innerHTML;
    input.focus();

    button.onclick = () => {
        if (input.value !== null && input.value !== "") {
            text.innerHTML = input.value;

            editOver();

            editTaskAPI(id, input.value);
        }
    }

    btCancel.onclick = () => {
        editOver();
    }

    const editOver = () => {
        button.classList.remove("editOn");
        button.classList.add("editOff");
        button.innerHTML = "edit";

        btCancel.classList.remove("editOn");
        btRemove.classList.remove("editOn");
        btCancel.classList.add("editOff");
        btRemove.classList.add("editOff");
        button.setAttribute("onclick", "editTask(this.id)");

        btCancel.innerHTML = "";
        input.className = "editOff";
        text.className = "editOff";
        btRemove.innerHTML = "delete";
    }

    let item = document.querySelector("#task_" + id);

    document.addEventListener("click", (event) => {
        let isClickInside = item.contains(event.target);

        if (!isClickInside) {
            editOver();
        }
    });
}

const removeTask = (id) => {
    id = idSplitter(id);

    let removedTask = document.querySelector("#task_" + id);

    confirmDelete().then (
        (response) => {
            if (response === true) {
                removedTask.remove();
                deleteTaskAPI(id);
            }
        }
    );
}


const confirmDelete = async () => {
    const confirmBox = document.querySelector(".confirm-box-background");
    confirmBox.style.display = "block";

    const confirmDelete = document.querySelector(".delete");
    const cancelDelete = document.querySelector(".close");

    let confirm = null;

    confirmDelete.onclick = () => {
        confirm = true;
    }

    cancelDelete.onclick = () => {
        confirm = false;
    }

    while (confirm === null) {
        await sleep(1000);
    }

    confirmBox.style.display = "none";

    console.clear();

    return confirm;
}

const sleep = (ms) => {
    console.log("Aguardando...");
    return new Promise(resolve => setTimeout(resolve, ms));
}

const deleteTaskAPI = async (id) => {
    const deletedTask = new Parse.Object("Task");

    deletedTask.set("objectId", id);

    try {
        let result = await deletedTask.destroy();
        console.log("Objeto de ID \'" + result.id + "\' destruído com sucesso.");
    } catch (error) {
        console.error("Falha ao destruir objeto. Erro de código: " + error);
    }
}

const editTaskAPI = async (id, description) => {
    const editedTask = new Parse.Object("Task");

    editedTask.set("objectId", id);
    editedTask.set("description", description);

    try {
        let result = await editedTask.save();
        console.log("Objeto de ID \'" + result.id + "\' atualizado com sucesso.");
    } catch (error) {
        console.error("Falha ao atualizar objeto. Erro de código: " + error);
    }
}

const updatePosition = (whichList) => {
    let tasks;

    if (whichList == 1) {
        tasks = document.getElementById("todo-list").children;
    } else {
        tasks = document.getElementById("done-list").children;
    }

    console.log(`Elemetos na lista: ${tasks.length}`);

    for (let i = 0; i < tasks.length; i++) {
        tasks[i].setAttribute("value", i);

        let id = idSplitter(tasks[i].id);

        updatePositionAPI(id, i);
    }
}

const updatePositionAPI = async (id, position) => {
    const updatedTask = new Parse.Object("Task");

    updatedTask.set("objectId", id);
    updatedTask.set("position", position);

    try {
        let result = await updatedTask.save();
        console.log("Posição do objeto de ID \'" + result.id + "\' atualizada com sucesso.");
    } catch (error) {
        console.error("Falha ao atualizar objeto. Erro de código: " + error);
    }
}

let dragged;
let position;
let index;
let indexDrop;
let list;

document.addEventListener("dragstart", ({target}) => {
    dragged = target;
    position = target.value;
    list = target.parentNode.children;

    for (let i = 0; i < list.length; i++) {
        if (list[i] === dragged) {
            index = i;
        }
    }
});

document.addEventListener("dragover", (event) => {
    event.preventDefault();
});

document.addEventListener("drop", ({target}) => {
    if (target.className == "dropzone" && target.value !== position) {
        dragged.remove(dragged);

        for (let i = 0; i < list.length; i++) {
            if (list[i] === target) {
                indexDrop = i;
            }
        }

        console.clear();
        console.log("Índice de \'drag\': " + (index + 1) + ". Índice de \'drop\': " + (indexDrop + 1));

        if (index > indexDrop) {
            target.before(dragged);
        } else {
            target.after(dragged);
        }

        let whichList = 1;
        updatePosition(whichList);
    }
});

const btShow = document.getElementById("show");
const iconShow = document.getElementById("expand-icon");

const showDoneTasks = () => {
    if (doneList.style.display == "block") {
        doneList.style.display = "none";
        iconShow.innerHTML = "expand_more";
    } else {
        doneList.style.display = "block";
        iconShow.innerHTML = "expand_less";
    }
}

pullTasks();
btInsert.onclick = addTask;
btShow.onclick = showDoneTasks;