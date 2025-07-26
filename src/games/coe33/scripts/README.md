# README

These scripts are used to take data exports via FModel and convert the data to usable info for the COE33 toolkit.

## inputs

The inputs are the data from FModel extracts that will be parsed.

### Game.json

This is a file containing all of the English language text and dialog. This is used to get the item names and descriptions.

1. Open FModel and then Clair Obscur
1. Browse to `Sandfall > Content > Localization > Game > en-US`
1. Export the `Game.Iocres` package

### DT\_{CATEGORY}Icons.json

These files are used to find asset paths and reconcile game data for parsing. Search the file names in FModel to locate them (do not include the `.json`)
