
class ObjectivesMenu { // creates objectives for the level
    constructor(building) {
        this.building = building;
        // create the menu
        this.menu = document.createElement('div');
        this.menu.classList.add('objectives-menu');
        this.menu.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        // create a selector for each objective 
        this.objectiveTypes = [ // different types of levels have different objectives
            { name: 'Destroy', value: 0 }, // destroy x enemies
            { name: 'Collect', value: 0 }, // collect x coins
            { name: 'Survive', value: 0 }, // survive for x seconds
            { name: 'BeforeTime', value: 0 }, // reach the end before x seconds
        ];
        this.createObjectivesSelectors();
    }
    createObjectivesSelectors() {
        this.objectivesSelectors = {};
        this.objectiveTypes.forEach(objectiveType => {
            // add a label for the objective type
            let label = document.createElement('label');
            // in uppercase
            label.innerText = objectiveType.name.toUpperCase();
            this.menu.appendChild(label);
            // selectors that allow for the numbers 0-15
            let selector = document.createElement('select');
            selector.classList.add('menu-button', 'build-menu-button');
            // add the options
            for (let i = 0; i < 31; i++) {
                // add the option
                let option = document.createElement('option');
                option.value = i;
                option.innerText = i;
                selector.appendChild(option);
                // set the default value
                if (i === objectiveType.value) {
                    selector.value = i;
                }
            }
            // when the selector changes, update the objective value
            selector.onchange = () => {
                objectiveType.value = Number(selector.value);
            }
            this.menu.appendChild(selector);
            this.objectivesSelectors[objectiveType.name] = selector;
        });
        // get the container
        let gameContainer = document.getElementById('container');
        //add the menu to the container
        gameContainer.appendChild(this.menu);
    }
    setObjectiveTypes(objectiveTypes) {
        this.objectiveTypes = objectiveTypes;
        // clear the menu
        this.menu.innerHTML = '';
        // create the objective selectors
        this.createObjectivesSelectors();
    }
}