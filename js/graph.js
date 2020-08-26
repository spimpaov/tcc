function createGraph(agents, propositions) {
    // print(num_of_states = 2**propositions.length);
    // print(num_of_transitions = (num_of_states*(num_of_states -1))/2);
    var states =  calculateGraphStates(propositions);
    var relations = calculateGraphRelations(states.length, agents);
    print(states);
    print(relations);
}

function calculateGraphStates(propositions) {
    const statesCombination = (propositions) => { 
        const results = [[]];
        for (const value of propositions) {
            const copy = [...results];
            for (const prefix of copy) {
                results.push(prefix.concat(value));
            }
        }
        return results;
    };

    var statesList = statesCombination(propositions);
    var graphStates = [];
    for (var i = 0; i < statesList.length; i++) {
        graphStates.push({
            "name": i,
            "variables": statesList[i],
        });
    }
    return graphStates;
}

function calculateGraphRelations (numOfStates, agents) { 
    const graphRelations = [];
    for (var i = 0; i < numOfStates - 1; i++) {
        for (var j = i + 1; j < numOfStates; j++) {
            graphRelations.push({
                "source": i, 
                "target": j, 
                "agents": agents,
            });
        }
    }
    return graphRelations;
};