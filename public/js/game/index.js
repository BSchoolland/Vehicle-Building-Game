import Building from './building.js';
import { Camera } from './camera.js';
import { LevelManager } from '../world/level.js';

const noEditor = true; // since the editor is not implemented yet, use a greyed out button that says "coming soon"

function createHTML() {
    const container = document.getElementById('container');
    // clear the container
    container.innerHTML = '';
    // Create elements
    const h1 = document.createElement('h1');
    const editorLink = document.createElement('a');
    const campaignLink = document.createElement('a');

    // Set attributes and content
    container.className = 'container';
    h1.textContent = 'Welcome to Wrecking Wheels!';
    if (noEditor) {
        editorLink.className = 'button disabled';
        editorLink.textContent = 'Editor (coming soon)';
    }
    else {
        editorLink.href = 'editor.html';
        editorLink.className = 'button';
        editorLink.textContent = 'Editor';
    }
    campaignLink.href = 'levels.html';
    campaignLink.className = 'button';
    campaignLink.textContent = 'Levels';

    // Append elements
    container.appendChild(h1);
    container.appendChild(campaignLink);
    container.appendChild(editorLink);
    

    // Append the container to the body (or another parent element)
    document.body.appendChild(container);
}


createHTML();