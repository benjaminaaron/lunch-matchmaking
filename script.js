const fs = require('fs');
const readlines = require('n-readlines');
// const teams = require('input/teams.json').teams;

people = {};
let line;
let liner = new readlines('input/people.csv');

while (line = liner.next()) {
    let parts = line.toString('utf8').split(',');
    let id = parts[2]; // first name with first char of last name if necessary
    people[id] = {
        "in_team": Number(parts[0]),
        "id": id,
        "name": parts[3],
        "discipline": parts[4].substr(0, parts[4].length - 1), // strip away new line character
        "already_met_with": [],
        "testcount": 0
    };
}

const importBlockers = csvFile => {
    liner = new readlines(csvFile);
    while (lineRaw = liner.next()) {
        line = lineRaw.toString('utf8');
        if (!line || line.length === 0 || line.charAt(0) === '#') {
            continue;
        }
        let parts = line.split(',');
        for (let i = 0; i < parts.length; i ++) {
            let idSelf = parts[i];
            for (let j = i + 1; j < parts.length; j ++) {
                let idOther = parts[j];
                people[idSelf].already_met_with.push(idOther);
                people[idOther].already_met_with.push(idSelf);
            }
        }
    }
};

importBlockers('input/blockers/other.csv');
importBlockers('input/blockers/lunch1.csv');
importBlockers('input/blockers/lunch2.csv');
importBlockers('input/blockers/lunch3.csv');

const randomIntFromInterval = (min, max) => { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
};

let ungroupedPeople = Object.keys(people);
let groups = [];

const findSuitableAdditionToGroup = (peopleAlreadyInGroup) => {
    let suitablePeople = [];
    for (let i = 0; i < ungroupedPeople.length; i++) {
        let candidate = people[ungroupedPeople[i]];
        let candidateIsSuitable = true;
        for (let j = 0; j < peopleAlreadyInGroup; j++) {
            let pInGroup = peopleAlreadyInGroup[j];
            if (candidate.already_met_with.includes(pInGroup) || candidate.in_team === pInGroup.in_team) {
                candidateIsSuitable = false;
            }
        }
        if (candidateIsSuitable) {
            suitablePeople.push(candidate.id);
        }
    }
    return suitablePeople[randomIntFromInterval(0, suitablePeople.length - 1)];
};

for (let j = 0; j < 20; j ++) {
    let p1id = ungroupedPeople[0];
    let suitablePeople = [];
    for (let i = 1; i < ungroupedPeople.length; i++) {
        let p2IdToCheck = ungroupedPeople[i];
        let p1 = people[p1id];
        if (p1.already_met_with.includes(p2IdToCheck)) {
            continue;
        }
        let p2 = people[p2IdToCheck];
        if (p1.in_team === p2.in_team) {
            continue;
        }
        suitablePeople.push(p2IdToCheck);
    }
    let p2id = suitablePeople[randomIntFromInterval(0, suitablePeople.length - 1)];

    // TODO make the loop better so that these undefined-checks are not necessary
    if (p1id !== undefined && p2id !== undefined) {
        groups.push([p1id, p2id]);
    }

    ungroupedPeople.splice(ungroupedPeople.indexOf(p2id), 1);
    ungroupedPeople.splice(0, 1);
}

// pretty print matches
let csvContent = '';
for (let i = 0; i < groups.length; i++) {
    let id1 = groups[i][0];
    let id2 = groups[i][1];
    console.log(people[id1].name + " & " + people[id2].name);
    csvContent += id1 + ',' + id2 + '\n';
}

// write them out as next lunch.csv
fs.writeFile('input/blockers/lunch4.csv', csvContent, err => {});


// TESTS ---------------------------------------------------------

for (let i = 0; i < groups.length; i++) {
    let p1 = people[groups[i][0]];
    let p2 = people[groups[i][1]];
    if (p1.in_team === p2.in_team || p1.already_met_with.includes(p2.id) || p1.already_met_with.includes(p2.id)) {
        console.log("ERROR: ", p1.id, p2.id);
    }
    p1.testcount += 1;
    p2.testcount += 1;
}

let peopleIDs = Object.keys(people);
for (let i = 0; i < peopleIDs.length; i++) {
    let person = people[peopleIDs[i]];
    if (person.testcount !== 1) {
        console.log("Testcount != 1: ", person);
    }
}

// COMBINATORICS ---------------------------------------------------------

let allPairs = [];
for (let i = 0; i < peopleIDs.length; i++) {
    for (let j = i + 1; j < peopleIDs.length; j++) {
        let p1 = people[peopleIDs[i]];
        let p2 = people[peopleIDs[j]];
        allPairs.push([p1.id, p2.id]);
    }
}

console.log(allPairs.length + " groups of 2 with " + peopleIDs.length + " people");
