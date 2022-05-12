Parse.serverURL = "https://parseapi.back4app.com/";
Parse.initialize(
    "lY8hgd4DKbvsnW0UYxbaa7gktARQFtfGqLbyk8Yh",
    "4UI5ALJgulft95GQQhI1zQ57zzbdk4P5KzvPXVAB"
);

const inNewTask = document.getElementById("new-task");
const btAddTask = document.getElementById("add-task");

inNewTask.onfocus = () => {
    btAddTask.innerHTML = "arrow_circle_right";
}

inNewTask.onblur = () => {
    btAddTask.innerHTML = "add_circle";
}

let toDoTasks = [];
let doneTasks = [];

const addTask = async () => {
    const newTask = new Parse.Object("Task");

    newTask.set("description", inNewTask.value);
    inNewTask.value = "";

    newTask.set("position", toDoTasks.length);

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

        toDoTasks = [];
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
                toDoTasks.push({id, description, done, position});
            }

            console.log(`ID: ${id}, Descrição: ${description}, Concluída: ${done}, Posição: ${position}`);
        }

        console.log(`Fetch executado com sucesso. \nNúmero de tarefas não-concluídas: ${toDoTasks.length} \nNúmero de tarefas concluídas: ${doneTasks.length}`);

        toDoTasks = sortList(toDoTasks);
        doneTasks = sortList(doneTasks);

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

    for (let i = 0; i < toDoTasks.length; i++) {
        const toDoItem = createNewTask (toDoTasks[i]);

        toDoList.appendChild(toDoItem);
    }

    for (let i = 0; i < doneTasks.length; i++) {
        const doneItem = createNewTask (doneTasks[i]);

        doneList.appendChild(doneItem);
    }
}

const createNewTask = (task) => {
        const li = createNewLi(task.id, task.position, task.done);
        const checkBox = createNewCheckBox(task.id, task.description, task.done);
        const editBox = createNewEditBox(task.id);        

        li.appendChild(checkBox);
        li.appendChild(editBox);

        return li;
}

const createNewLi = (id, position, done) => {
    const li = document.createElement("li");

    li.setAttribute("id", "task_" + id);
    li.setAttribute("value", position);

    if (!done) {
        li.setAttribute("draggable", true);
        li.setAttribute("ondragover", "event.preventDefault()");
        li.className = "dropzone";
    }

    return li;
}

const createNewCheckBox = (id, description, done) => {
    const label = document.createElement("label");
    label.className = "checkbox-container";

    const span = document.createElement("span");
    span.setAttribute("id", "text_" + id);

    const text = document.createTextNode(`${description}`);
    span.appendChild(text);

    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.setAttribute("id", "check_" + id);
    checkBox.setAttribute("onchange", "toggleTask(this.id)");

    if (done) {
        checkBox.setAttribute("checked", true);
    }

    const checkMark = document.createElement("span");
    checkMark.className = "checkmark";

    const input = document.createElement("input");
    input.type = "text";
    input.setAttribute("id", "inEdit_" + id);

    label.appendChild(span);
    label.appendChild(checkBox);
    label.appendChild(checkMark);
    label.appendChild(input);

    return label;
}

const createNewEditBox = (id) => {
    const div = document.createElement("div");
    div.className = "task-end";

    const btCancelEdit = document.createElement("span");
    btCancelEdit.setAttribute("id", "cancelEdit_" + id);
    btCancelEdit.className = "material-symbols-sharp";
    btCancelEdit.innerHTML = "";

    const btEdit = document.createElement("span");
    btEdit.setAttribute("id", "btEdit_" + id);
    btEdit.setAttribute("onclick", "editTask(this.id)");
    btEdit.className = "material-symbols-sharp";
    btEdit.innerHTML = "edit";

    const btRemove = document.createElement("span");
    btRemove.setAttribute("id", "delete_" + id);
    btRemove.setAttribute("onclick", "deleteTask(this.id)");
    btRemove.className = "material-symbols-sharp";
    btRemove.innerHTML = "delete";

    div.appendChild(btCancelEdit);
    div.appendChild(btEdit);
    div.appendChild(btRemove);

    return div;
}

const deleteTask = (id) => {
    id = idSplitter(id);

    let deletedTask = document.querySelector("#task_" + id);

    confirmDelete()
        .then ((response) => {
            if (response === true) {
                deletedTask.remove();
                deleteTaskAPI(id);
            }
        }
    );
}

const confirmDelete = async () => {
    const confirmBox = document.querySelector(".confirmbox-background");
    confirmBox.style.display = "flex";

    const confirmDelete = document.getElementById("delete");
    const cancelDelete = document.getElementById("cancel");

    let confirmation = null;

    confirmDelete.onclick = () => {
        confirmation = true;
    }

    cancelDelete.onclick = () => {
        confirmation = false;
    }

    while (confirmation === null) {
        await sleep(1000);
    }

    confirmBox.style.display = "none";

    console.clear();

    return confirmation;
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

const editTask = (id) => {
    let btEdit = document.getElementById(id);

    id = idSplitter(id);

    let btCancel = document.querySelector("#cancelEdit_" + id);
    let btDelete = document.querySelector("#delete_" + id);
    let text = document.querySelector("#text_" + id);
    let input = document.querySelector("#inEdit_" + id);

    btEdit.classList.toggle("edit-on");
    btCancel.classList.toggle("edit-on");
    btDelete.classList.toggle("edit-on");
    text.classList.toggle("edit-on");
    input.classList.toggle("edit-on");

    btEdit.innerHTML = "check_circle";
    btCancel.innerHTML = "cancel";
    btDelete.innerHTML = "";

    input.value = text.innerHTML;
    input.focus();

    btEdit.onclick = () => {
        if (input.value !== null && input.value !== "") {
            text.innerHTML = input.value;
            editTaskAPI(id, input.value);
            editOver();
        }
    }

    btCancel.onclick = () => {
        editOver();
    }

    let taskBox = document.querySelector("#task_" + id);

    document.addEventListener("click", (event) => {
        let isClickInside = taskBox.contains(event.target);

        if (!isClickInside) {
            editOver();
        }
    });

    const editOver = () => {
        btEdit.classList.toggle("edit-on");
        btCancel.classList.toggle("edit-on");
        btDelete.classList.toggle("edit-on");
        text.classList.toggle("edit-on");
        input.classList.toggle("edit-on");

        btEdit.innerHTML = "edit";
        btCancel.innerHTML = "";
        btDelete.innerHTML = "delete";

        btEdit.setAttribute("onclick", "editTask(this.id)");
    }
}

const editTaskAPI = async (id, description) => {
    const editedTask = new Parse.Object("Task");

    editedTask.set("objectId", id);
    editedTask.set("description", description);

    try {
        let result = await editedTask.save();
        console.log("Descrição do objeto de ID \'" + result.id + "\' atualizada com sucesso.");
    } catch (error) {
        console.error("Falha ao atualizar objeto. Erro de código: " + error);
    }
}

const toggleTask = (id) => {
    let checkBox = document.getElementById(id);
    id = idSplitter(id);

    if (checkBox.checked) {
        completeTask(id);
    } else {
        incompleteTask(id);
    }
}

const completeTask = (id) => {
    let completedTask = document.querySelector("#task_" + id);
    completedTask.setAttribute("value", doneTasks.length);
    completedTask.setAttribute("draggable", false);
    completedTask.removeAttribute("ondragover");
    completedTask.classList.remove("dropzone");

    doneList.appendChild(completedTask);

    let whichList = 1;
    updatePosition(whichList);
    updatePositionAPI(id, doneTasks.length);

    let completedTaskItem = toDoTasks.find(object => object.id == id);
    let index = toDoTasks.findIndex(object => object.id == id);
    toDoTasks.splice(index, 1);
    doneTasks.push(completedTaskItem);

    toggleDoneAPI(id, true);
}

const incompleteTask = (id) => {
    let incompletedTask = document.querySelector("#task_" + id);
    incompletedTask.setAttribute("value", toDoTasks.length);
    incompletedTask.setAttribute("draggable", true);
    incompletedTask.setAttribute("ondragover", "event.preventDefault()");
    incompletedTask.classList.add("dropzone");

    toDoList.appendChild(incompletedTask);

    let whichList = 0;
    updatePosition(whichList);
    updatePositionAPI(id, toDoTasks.length);

    let incompletedTaskItem = doneTasks.find(object => object.id == id);
    let index = doneTasks.findIndex(object => object.id == id);
    doneTasks.splice(index, 1);
    toDoTasks.push(incompletedTaskItem);

    toggleDoneAPI(id, false);
}

const toggleDoneAPI = async (id, boolean) => {
    const toggledTask = new Parse.Object("Task");

    toggledTask.set("objectId", id);
    toggledTask.set("done", boolean);

    try {
        let result = await toggledTask.save();
        console.log("Status de compleição do objeto de ID \'" + result.id + "\' atualizado com sucesso.");
    } catch (error) {
        console.error("Falha ao atualizar objeto. Erro de código: " + error);
    }
}

const updatePosition = (whichList) => {
    let list;

    if (whichList == 1) {
        list = document.getElementById("todo-list").children;
    } else {
        list = document.getElementById("done-list").children;
    }

    console.clear();
    console.log(`Elementos na lista: ${list.length}`);

    for (let i = 0; i < list.length; i++) {
        list[i].setAttribute("value", i);
        let id = idSplitter(list[i].id);
        updatePositionAPI(id, i);
    }
}

const updatePositionAPI = async (id, position) => {
    const movedTask = new Parse.Object("Task");

    movedTask.set("objectId", id);
    movedTask.set("position", position);

    try {
        let result = await movedTask.save();
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
        console.log("Índice de \'dragstart\': " + (index + 1) + ". \nÍndice de \'drop\': " + (indexDrop + 1));

        if (index > indexDrop) {
            target.before(dragged);
        } else {
            target.after(dragged);
        }

        let whichList = 1;
        updatePosition(whichList);
    }
});

const btExpand = document.getElementById("expand-button");
const iconExpand = document.getElementById("expand-icon");

const showDoneTasks = () => {
    if (doneList.style.display == "block") {
        doneList.style.display = "none";
        iconExpand.innerHTML = "expand_more";
    } else {
        doneList.style.display = "block";
        iconExpand.innerHTML = "expand_less";
    }
}

const sortList = (list) => {
    list.sort((a, b) => a.position - b.position);
    return list;
}

const idSplitter = (id) => {
    return id.split("_")[1];
}
const sleep = (ms) => {
    console.log("Aguardando...");
    return new Promise(resolve => setTimeout(resolve, ms));
}

pullTasks();

btAddTask.onclick = addTask;
btExpand.onclick = showDoneTasks;