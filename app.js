const { app, BrowserWindow, Menu, nativeImage } = require("electron");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const openExternalURL = (url) => {
  let command = "";

  // Check the platform and set the appropriate command
  if (process.platform === "win32") {
    command = `start ${url}`;
  } else if (process.platform === "darwin") {
    command = `open ${url}`;
  } else {
    command = `xdg-open ${url}`;
  }

  // Execute the command in the shell
  exec(command, (error) => {
    if (error) {
      console.error(`Error opening URL: ${error.message}`);
    }
  });
};

const openApp = (favicon) => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: favicon,
    frame: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.setTitle("Udemy - Desktop App");
  win.loadURL("https://www.udemy.com/home/my-courses");
  win.setIcon(favicon);
  isChecked = true;
  win.webContents.on("did-finish-load", () => {
    if (!isChecked) {
      setupDarkMode(true);
    }
  });

  const setupDarkMode = (state) => {
    // Set the dark mode CSS
    const cssPath = path.join(__dirname, "assets", "app-dark.css");
    fs.readFile(cssPath, "utf-8", (err, cssCode) => {
      if (err) {
        console.error(`Error loading CSS file: ${err.message}`);
        return;
      }

      // Apply the CSS to the window
      if (state) {
        win.webContents.insertCSS(cssCode);
      } else {
        win.webContents.removeInsertedCSS(cssCode);
        win.webContents.reload();
      }
    });
  };

  const menuTemplate = [
    {
      label: "Window",
      submenu: [
        {
          label: "Back",
          accelerator: "CmdOrCtrl+Left",
          click: () => {
            win.webContents.goBack();
          },
        },
        {
          label: "Forward",
          accelerator: "CmdOrCtrl+Right",
          click: () => {
            win.webContents.goForward();
          },
        },
        {
          label: "Refresh",
          accelerator: "F5",
          click: () => {
            win.webContents.reload();
          },
        },
      ],
    },
    {
      label: "Tools",
      submenu: [
        {
          label: "Dark Mode",
          type: "checkbox",
          checked: false,
          click: (menuItem) => {
            isChecked = menuItem.checked;
            if (isChecked) {
              console.log("Checked | Dark Mode enabled");
              setupDarkMode(true);
              isChecked = false;
            } else {
              console.log("Unchecked | Dark Mode disabled");
              setupDarkMode(false);
              isChecked = true;
            }
          },
        },
        {
          label: "Open in External Web Browser",
          accelerator: "CmdOrCtrl+W",
          click: () => {
            openExternalURL(win.webContents.getURL());
          },
        },
        {
          label: "Dev Tools",
          accelerator: "CmdOrCtrl+Shift+I",
          click: () => {
            win.webContents.openDevTools();
          },
        },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: "CmdOrCtrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  win.setMenu(menu);
};

app.whenReady().then(() => {
  const imagePath = path.join(__dirname, "assets/favicon-32x32.png");
  const image = nativeImage.createFromPath(imagePath);
  openApp(image);
  app.on("activate", () => {
    app.commandLine.appendSwitch("enable-features", "WebContentsForceDark");
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
