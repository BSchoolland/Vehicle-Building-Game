import Building from './building.js';
import { Camera } from './camera.js';
import { LevelManager } from '../world/level.js';



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
    editorLink.href = 'editor.html';
    editorLink.className = 'button';
    editorLink.textContent = 'Level Editor';
    campaignLink.href = 'campaign.html';
    campaignLink.className = 'button';
    campaignLink.textContent = 'Campaign';

    // Append elements
    container.appendChild(h1);
    container.appendChild(editorLink);
    container.appendChild(campaignLink);

    // Append the container to the body (or another parent element)
    document.body.appendChild(container);
}


createHTML();