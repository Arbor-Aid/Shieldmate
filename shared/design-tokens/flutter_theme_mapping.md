# ShieldMate Flutter Theme Mapping (v1)

This file maps the shared ShieldMate design tokens to Flutter ThemeData.
It is a reference only and does not create a Flutter app.

## Color Mapping

| Token | Hex | Flutter ColorScheme |
| --- | --- | --- |
| Marine Navy | #0A1C3F | `primary` |
| Freedom Blue | #4D65D5 | `secondary` |
| Prestige Bronze | #A59982 | `tertiary` |
| Dark Ink | #0D1216 | `background` |
| Platinum White | #F1F2F7 | `surface` |
| Steel Gray | #4F5A6D | `outline` |

## Typography

- Headings: Poppins (w600/w700)
- Body: Inter (w400/w500)

## Example ThemeData Snippet

```dart
final theme = ThemeData(
  useMaterial3: true,
  colorScheme: const ColorScheme(
    brightness: Brightness.light,
    primary: Color(0xFF0A1C3F),
    onPrimary: Color(0xFFF1F2F7),
    secondary: Color(0xFF4D65D5),
    onSecondary: Color(0xFFF1F2F7),
    tertiary: Color(0xFFA59982),
    onTertiary: Color(0xFF0D1216),
    background: Color(0xFF0D1216),
    onBackground: Color(0xFFF1F2F7),
    surface: Color(0xFFF1F2F7),
    onSurface: Color(0xFF0D1216),
    outline: Color(0xFF4F5A6D),
    error: Color(0xFFB91C1C),
    onError: Color(0xFFFFFFFF),
  ),
  appBarTheme: const AppBarTheme(
    backgroundColor: Color(0xFF0A1C3F),
    foregroundColor: Color(0xFFF1F2F7),
    elevation: 0,
  ),
  textTheme: const TextTheme(
    headlineLarge: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w700),
    headlineMedium: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w600),
    titleLarge: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w600),
    bodyLarge: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w500),
    bodyMedium: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w400),
  ),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      backgroundColor: const Color(0xFFA59982),
      foregroundColor: const Color(0xFF0D1216),
      textStyle: const TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w600),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    ),
  ),
);
```

