class AppBreakpoints {
  static const double tablet = 720;
  static const double desktop = 1100;

  static bool isCompact(double width) => width < tablet;
  static bool isExpanded(double width) => width >= tablet;
  static bool isDesktop(double width) => width >= desktop;
}