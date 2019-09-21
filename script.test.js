const script = require('./script');
const Model = new script.Model();



describe("Model addTodo", ()=>{


    test('adds a todo for eating breakfast', ()=>{
        const input  = "Eat breakfast";
        const output = {id: 1, text: "Eat breakfast", comeplete: false};
        expect(Model.addTodo(input)).toEqual(output);
    });

    test('adds a todo for eating lunch', ()=>{
        const input = "Eat lunch";
        const output = {id: 2, text: "Eat lunch", comeplete: false};
        expect(Model.addTodo(input)).toEqual(output);
    });

    test('adds an empty todo', ()=>{
        const input = "";
        const output = {};
        expect(Model.addTodo(input)).toEqual(output);
    });

    // test('edit todo with id 1', ()=>{
    //     const input = {id: 1, updatedText: "Feed puppy"};
    //     const output = {id: 4, text: "Eat lunch", comeplete: false};
    //     expect(Model.addTodo(input)).toEqual(output);
    // })
});