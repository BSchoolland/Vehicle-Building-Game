// a custom progress bar, that will be used to show the progress of the game loading using html and css
export default class ProgressBar {
    constructor(steps, container) {
      this.steps = steps; // an array of steps such as ["loading", "loading sounds", "loading images"]
      this.container = container;
      this.currentStep = 0;
      this.loaded = false;
      this.createProgressBar();
    }
    createProgressBar() {
        // remove the loading text
        this.container.innerHTML = "";
        // log the creation of the progress bar
        console.log("Creating progress bar");

        // Create a container for the progress bar
        this.progressBarContainer = document.createElement("div");
        this.progressBarContainer.classList.add("progress-bar-container");
        this.container.appendChild(this.progressBarContainer);

        // Create the progress bar
        this.progressBar = document.createElement("div");
        this.progressBar.classList.add("progress-bar");
        this.progressBarContainer.appendChild(this.progressBar);
        // start the progress bar at 1%
        this.progressBar.style.width = "1%";

        // Create a container for the text
        this.textContainer = document.createElement("div");
        this.textContainer.classList.add("progress-bar-text-container");
        this.container.appendChild(this.textContainer);

        // Add text inside the text container
        this.text = document.createElement("div");
        this.text.classList.add("progress-bar-text");
        this.text.innerHTML = this.steps[this.currentStep];
        this.textContainer.appendChild(this.text);
    }
    update() {
        this.currentStep++;
        this.progressBar.style.width = (this.currentStep / this.steps.length) * 100 + "%";
        this.text.innerHTML = this.steps[this.currentStep];
        if (this.currentStep === this.steps.length) {
            this.loaded = true;
            this.text.innerHTML = "Click to start!";

        }
    }
}


        