function submitQuestion() {
    var question = document.getElementById('question').value;
    console.log(question);
    iterateInput(question);
}

function submitGraph() {
    var statesJSON = document.getElementById('states').value;
    var transitionsJSON = document.getElementById('transitions').value;

    var statesOBJ = validateJSON(statesJSON);
    var transitionsOBJ = validateJSON(transitionsJSON);

    console.log(statesOBJ);
    console.log(transitionsOBJ);
}

function renderInvalidQuestion() {
    alert("Invalid question!");
}