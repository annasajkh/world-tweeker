# world-tweaker

An Electron application with React and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

### Mod Display Information
You need to have ```mod_config.json``` in each mod directory
it should contains
```bash
{
    "name": "The Mod Name",
    "iconPath": "the/relative/path/to/the/icon.png",
    "author": "The Mod Author"
}
```
if it doesn't have that it will still be able to load the mod
but the display in the mod manager would be limited

you can actually import the mod manually just place it in the mod folder in ```OneshotFolder/Mods```