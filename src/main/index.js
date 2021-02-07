// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
import path from 'path';
import fs from 'fs';
import { app, BrowserWindow } from 'electron'
import PgConnection from './PgConnection';
import respondToRenderer from './respondToRenderer';
import username from 'username';

const createWindow = () => {
  // Create the browser window.
  let win = new BrowserWindow({
    title: CONFIG.name,
    width: CONFIG.width,
    height: CONFIG.height,
    webPreferences: {
      worldSafeExecuteJavaScript: true,
      preload: path.join(app.getAppPath(), 'preload', 'index.js'),
      contextIsolation: true
    }
  })

  // win.webContents.openDevTools();

  // and load the index.html of the app.
  win.loadFile('renderer/index.html')

  // send data to renderer process
  // win.webContents.on('did-finish-load', () => {
  //   win.webContents.send('loaded', {
  //     appName: CONFIG.name,
  //     electronVersion: process.versions.electron,
  //     nodeVersion: process.versions.node,
  //     chromiumVersion: process.versions.chrome
  //   })
  // })

  win.on('closed', () => {
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
});

let favouritesPath = path.join(app.getPath('userData'), 'favourites.json');
console.log(`FAVOURITES PATH: ${favouritesPath}`);

async function getFavourites() {
  let favourites = [];

  try {
    await fs.promises.stat(favouritesPath);
    favourites = JSON.parse(await fs.promises.readFile(favouritesPath));
  } catch {
    await fs.promises.writeFile(favouritesPath, JSON.stringify(favourites));
  }

  return favourites;
}

async function saveFavourites(favourites) {
  return await fs.promises.writeFile(favouritesPath, JSON.stringify(favourites));
}

function withConnection({ connectionId }, cb) {
  let connection = PgConnection.find(connectionId);
  if (!connection) return;

  return cb(connection);
}

function respondToRendererWithConnection(eventName, cb) {
  return respondToRenderer(eventName, data => withConnection(data, connection => cb(data, connection)));
}

respondToRenderer('init', async () => {
  return {
    favourites: await getFavourites(),
    username: await username()
  };
});

respondToRenderer('saveFavourites', async (data) => {
  await fs.promises.writeFile(favouritesPath, JSON.stringify(data));
});

respondToRendererWithConnection('getFavourite', async (_, connection) => {
  let favourites = await getFavourites();
  return favourites.find(x => x.id === connection.favouriteId);
});

respondToRenderer('saveFavourite', async (data) => {
  let favourites = await getFavourites();

  let newFavourites = [...favourites.filter(x => x.id !== data.id), data];
  await saveFavourites(newFavourites);
});

respondToRenderer('connect', async (data) => {
  let connection = new PgConnection({
    favouriteId: data.id,
    host: data.host,
    port: data.port,
    user: data.username,
    password: data.password,
    database: data.database,
  });

  await connection.connect();

  return { id: connection.id, error: false };
});

respondToRendererWithConnection('fetchDatabases', async (_, connection) => {
  return await connection.fetchDatabases();
});

respondToRendererWithConnection('useDatabase', async (data, connection) => {
  await connection.useDatabase(data.database);
  return {};
});

respondToRendererWithConnection('fetchTables', async (data, connection) => {
  return await connection.fetchTables(data.database);
});

respondToRendererWithConnection('fetchData', async (data, connection) => {
  return await connection.fetchData(data.table, data.options || {});
});

respondToRendererWithConnection('fetchStructure', async (data, connection) => {
  return await connection.fetchStructure(data.table);
});

respondToRendererWithConnection('performChanges', async (data, connection) => {
  return await connection.performChanges(data);
});

respondToRendererWithConnection('performTableChanges', async (data, connection) => {
  return await connection.performTableChanges(data);
});

respondToRendererWithConnection('getConnectionInfo', (_, connection) => {
  return {
    host: connection.host,
    database: connection.database,
    version: connection.version
  };
});
