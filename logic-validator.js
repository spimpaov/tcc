var operators = {
    "!": 
    {
        name: "not",
        number_of_operands: 1, 
        method: function(operands) { return !operands[0]; }
    },
    "U":
    {
        name: "or",
        number_of_operands: 2,
        method : function(operands) { return operands[0] || operands[1]; }
    },
    "^": 
    {
        name: "and",
        number_of_operands: 2,
        method : function(operands) { return operands[0] && operands[1]; }
    },
}

var executionStack = [];

function validateQuestionOnState(question, database) {
    for (let char of question) {
        pushToStack(char);
        if (isOperator(char)) {
            pushToStack(calculate(database));
        }
    }

    if (executionStack.length === 1) {
        var result = getValue(executionStack[0], database);
    } else {
        //invalid input!
        renderInvalidQuestion();
        return;
    }
    resetStack();
    return result;
}

function isOperator(char) {
    return (char in operators) ? true : false;
}

function getValue(element, database) {
    return (element === true || database.includes(element)) ? true : false;
}

function pushToStack(element) {
    executionStack.push(element);
    console.log(executionStack);
}

function popFromStack() {
    element = executionStack.pop();
    try {
        if (element == undefined) throw new Error("Invalid input!");
    } catch (err) {
        handleInvalidInput(err);
    }
    return element;
}

//TODO: fazer ele sair do iterateInput por inteiro
function handleInvalidInput(errMessage) {
    console.log(errMessage);
    renderInvalidQuestion();
}

function resetStack() {
    executionStack.length = 0;
}

function calculate(database) {
    var operator = operators[executionStack.pop()];
    var operands = [];
    
    console.log(operator.number_of_operands);
    for (var i = 0; i < operator.number_of_operands; i++) {
        operands[i] = getValue(popFromStack(), database);
    }
    return operator.method(operands);
}