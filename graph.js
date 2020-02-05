const defaultGraph = [
    {
        state: "x",
        relatedTo: ["y", "z"],
        knowledge: ["a"],
    },
    {
        state: "y",
        relatedTo: ["z"],
        knowledge: ["a", "b"],
    },
    {
        state: "z",
        relatedTo: [],
        knowledge: ["c"],
    }
]

// var inputGraph = {};

function validateQuestionOnGraph(question, root) {
    var result = validateQuestionOnState(question, root.knowledge);
    console.log("CurrentState: " + root.state + ", result: " + result);

    // for (neighbour in root.relatedTo) {
    //     validateQuestionOnGraph(question, neighbour);
    // }
    renderResult(result);
}

function inputGraphIsEmpty() {
    return (defaultGraph.length === 0) ? true : false;
}

function getGraphRoot() {
    return defaultGraph[0];
}

function renderResult(result) {
    console.log(result);
    document.getElementById('result').innerHTML = result;
}