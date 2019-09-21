class Model{
    //constructor function of a Model object
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || []
    }

    //_commit() is a private method to update the value of localStorage

    _commit(todos){
        this.onTodoListChanged(todos);
        localStorage.setItem('todos', JSON.stringify(todos))
    }

    //We need a way for model to fire back at the controller to let it know that something happened. We do this by
    //binding the controller's onTodoListChanged to model
    bindTodoListChanged(callback){
        this.onTodoListChanged = callback;
    }

    addTodo(todoText){
        const todo = {
            id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1: 1,
            text: todoText,
            complete: false,
        };
        this.todos.push(todo);
        this._commit(this.todos);
        // this.onTodoListChanged(this.todos);
        return todo;
    }

    editTodo(id, updatedText){
        this.todos = this.todos.map(todo=>
        todo.id === id ? {id: todo.id, text: updatedText, complete: todo.complete }: todo);
        this._commit(this.todos);
        // this.onTodoListChanged(this.todos);
    }

    deleteTodo(id){
        this.todos = this.todos.filter(todo=> todo.id !== id);
        this._commit(this.todos);
        // this.onTodoListChanged(this.todos);
    }

    toggleTodo(id){
        this.todos = this.todos.map(todo=>
            todo.id === id ? {id: todo.id, text: todo.text, complete: !todo.complete}: todo);
        this._commit(this.todos);
        // this.onTodoListChanged(this.todos);
    }
}

class View{
    constructor(){
        this.app = this.getElement('#root');

        this.title = this.createElement('h1');
        this.title.textContent = 'Todos';

        this.form = this.createElement('form');

        this.input = this.createElement('input');
        this.input.type = 'text';
        this.input.placeholder = 'Add todo';
        this.input.name = 'todo';

        this.submitButton = this.createElement('button');
        this.submitButton.textContent = 'Submit';

        this.todoList = this.createElement('ul', 'todo-list');

        this.form.append(this.input, this.submitButton);

        this.app.append(this.title, this.form, this.todoList);

        //the temporary state variable that gets updated with the new editing value
        this._temporaryTodoText;
        this._initLocalListeners();
    }

    //update temporary state
    _initLocalListeners(){
        //input event is fired when user types in an contenteditable element, aka user clicked in a box to edit,
        //and focusout fires when you leave a contenteditable element, aka when you click outside of the box you are
        // editing
        this.todoList.addEventListener('input', event=>{
            if(event.target.className === 'editable') {
                this._temporaryTodoText = event.target.innerText;
            }
        })
    }

    //send the completed value to the model
    bindEditTodo(handler){
        this.todoList.addEventListener('focusout', event=> {
            if(this._temporaryTodoText){
                const id = parseInt(event.target.parentElement.id);

                handler(id, this._temporaryTodoText);
                this._temporaryTodoText = '';
            }
            }
        )
    }

    createElement(tag, className){
        const element = document.createElement(tag);
        if(className){
            element.classList.add(className);
        }
        return element
    }

    getElement(selector){
        const element = document.querySelector(selector);
        return element
    }

    displayTodos(todos){
        //note: any this.something accessed in these functions are accessing the object created by its class constructor

        while(this.todoList.firstChild){
            this.todoList.removeChild(this.todoList.firstChild);
        }

        if(todos.length === 0){
            const p = this.createElement('p');
            p.textContent = "Nothing to do! Add a task?";
            this.todoList.append(p);
        }else{
            todos.forEach(todo=>{
                const li = this.createElement('li');
                li.id = todo.id;

                const checkbox = this.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = todo.complete;

                const span = this.createElement('span');
                span.contentEditable = true;
                span.classList.add('editable');

                if(todo.complete){
                    const strike = this.createElement('s');
                    strike.textContent = todo.text;
                    span.append(strike);
                }else{
                    span.textContent = todo.text;
                }

                const deleteButton = this.createElement('button', 'delete');
                deleteButton.textContent = 'Delete';
                li.append(checkbox, span, deleteButton);

                this.todoList.append(li);
            })
        }
    }

    //Listeners for events
    //====================
    bindAddTodo(handler){
        this.form.addEventListener('submit', event=> {
            event.preventDefault();

            if(this._todoText){
                handler(this._todoText);
                this._resetInput();
            }
        })
    }

    bindDeleteTodo(handler){
        this.todoList.addEventListener('click', event =>{
            if(event.target.className === 'delete'){
                const id = parseInt(event.target.parentElement.id);
                handler(id);
            }
        })
    }
    bindToggleTodo(handler){
        this.todoList.addEventListener('change', event=>{
            if(event.target.type === 'checkbox'){
                const id = parseInt(event.target.parentElement.id);
                handler(id);
            }
        })
    }
    //The below two getter methods are private/local methods that won't be used outside of the class
    get _todoText(){
        return this.input.value;
    }

    _resetInput(){
        this.input.value = '';
    }
}

class Controller{
    constructor(model, view){
        this.model = model;
        this.view = view;

        this.onTodoListChanged(this.model.todos);

        //Need to call handler from the view, so we bind the methods that are listening for the events to the view
        //This way when events occur the corresponding handlers will be invoked
        this.view.bindAddTodo(this.handleAddTodo);
        this.view.bindDeleteTodo(this.handleDeleteTodo);
        this.view.bindToggleTodo(this.handleToggleTodo);
        this.view.bindEditTodo(this.handleEditTodo);

        this.model.bindTodoListChanged(this.onTodoListChanged);
    }

    onTodoListChanged = todos =>{
        this.view.displayTodos(todos);
    };

    //Handlers for events
    //======================
    handleAddTodo = todoText => {
        this.model.addTodo(todoText);
    };

    handleEditTodo = (id, todoText)=>{
        this.model.editTodo(id, todoText);
    };

    handleDeleteTodo = id =>{
        this.model.deleteTodo(id);
    };

    handleToggleTodo = id => {
        this.model.toggleTodo(id);
    };
}

const app = new Controller(new Model(), new View());

module.exports = {
    Model,
    View,
    Controller
};