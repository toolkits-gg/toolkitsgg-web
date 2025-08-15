# Themes

**Note: This is a work in progress.**

## Resources

[tweakcn](https://tweakcn.com) - Generate themes
[tints.dev](https://www.tints.dev/?output=hex) - Convert single color into 10-color palette
[tailcolor](https://tailcolor.com) - Convert single color into 10-color palette

## Custom colors

Mantine offers virtualColors, a convenient way to specify the class name of a dark CSS class and
a light CSS class to a single class name.

Due to this, for each custom color we must define a dark and light class, and then set the class
name to the virtual color offered by Mantine.

In the below example, the `.primary` class will appropriately select the dark or light class based
on the user's selected theme.

Ex.

```typescript
{
  primaryDark: [
      '#f1e6fb',
      '#e3ccf6',
      '#c799ed',
      '#aa67e5',
      '#8e34dc',
      '#7201d3',
      '#5b01a9',
      '#44017f',
      '#2e0054',
      '#17002a',
    ],
    primaryLight: [
      '#f1e6fb',
      '#e3ccf6',
      '#c799ed',
      '#aa67e5',
      '#8e34dc',
      '#7201d3',
      '#5b01a9',
      '#44017f',
      '#2e0054',
      '#17002a',
    ],
    primary: virtualColor({
      name: 'primary',
      dark: 'primaryDark',
      light: 'primaryLight',
    })
}
```
