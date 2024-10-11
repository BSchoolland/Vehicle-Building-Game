// functionality for upgrading the user's game version if they don't have an account on the backend
import ResourceHandler from "./resourceHandler.js";

const currentVersion = '1.3.0';

async function migrateVersion(levelHandler){
    let version = localStorage.getItem('version');
    if (version === null) {
        localStorage.setItem('version', '1.2.1');
        version = '1.2.1';
        console.log('user had no version, must not have played since versioning was added or be a new user')
    }
    if (version === '1.2.1') {
        localStorage.setItem('version', '1.3.0');

        console.log('User was on version 1.2.1, updating to 1.3.0');
    }
    // perform additional migrations as needed here

    // set the current version
    localStorage.setItem('version', currentVersion);
    console.log('Fully updated to', currentVersion);
}

export default migrateVersion;