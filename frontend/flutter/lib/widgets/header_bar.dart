import 'package:flutter/material.dart';

class HeaderBar extends StatelessWidget implements PreferredSizeWidget {
  const HeaderBar({
    super.key,
    this.title,
    this.actions,
    this.showBackButton,
    this.elevation,
    this.bottom,
    this.backgroundColor,
    this.foregroundColor,
    this.centerTitle,
  });

  final String? title;
  final List<Widget>? actions;
  final bool? showBackButton;
  final double? elevation;
  final PreferredSizeWidget? bottom;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final bool? centerTitle;

  static const Color _shieldmateBlue = Color(0xFF0D47A1);
  static const TextStyle _wordmarkStyle = TextStyle(
    color: Colors.white,
    fontSize: 18,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.3,
  );

  @override
  Size get preferredSize {
    final bottomHeight = bottom?.preferredSize.height ?? 0;
    return Size.fromHeight(kToolbarHeight + bottomHeight);
  }

  @override
  Widget build(BuildContext context) {
    final canPop = Navigator.of(context).canPop();
    final shouldShowBack = showBackButton ?? canPop;

    final effectiveForeground = foregroundColor ?? Colors.white;
    final effectiveBackground = backgroundColor ?? _shieldmateBlue;

    final titleStyle = Theme.of(context).textTheme.titleMedium?.copyWith(
              color: effectiveForeground,
              fontWeight: FontWeight.w600,
            ) ??
        TextStyle(
          color: effectiveForeground,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        );

    return AppBar(
      automaticallyImplyLeading: false,
      backgroundColor: effectiveBackground,
      foregroundColor: effectiveForeground,
      elevation: elevation,
      centerTitle: centerTitle,
      bottom: bottom,
      flexibleSpace: Stack(
        fit: StackFit.expand,
        children: [
          Align(
            alignment: Alignment.centerRight,
            child: Opacity(
              opacity: 0.08,
              child: Padding(
                padding: const EdgeInsets.only(right: 24),
                child: Image.asset(
                  'assets/images/marines_logo.png',
                  height: 140,
                  fit: BoxFit.contain,
                ),
              ),
            ),
          ),
        ],
      ),
      leading: shouldShowBack
          ? IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () => Navigator.of(context).maybePop(),
              tooltip: MaterialLocalizations.of(context).backButtonTooltip,
            )
          : null,
      titleSpacing: shouldShowBack ? 0 : 8,
      title: Row(
        mainAxisAlignment: centerTitle == true ? MainAxisAlignment.center : MainAxisAlignment.start,
        mainAxisSize: MainAxisSize.max,
        children: [
          _LogoLockup(
            wordmarkStyle: _wordmarkStyle.copyWith(color: effectiveForeground),
          ),
          if (title != null) ...[
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title!,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: titleStyle,
              ),
            ),
          ],
        ],
      ),
      actions: actions,
    );
  }
}

class _LogoLockup extends StatelessWidget {
  const _LogoLockup({required this.wordmarkStyle});

  final TextStyle wordmarkStyle;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Image.asset(
          'assets/images/shieldmate_logo.png',
          height: 36,
          fit: BoxFit.contain,
        ),
        const SizedBox(width: 8),
        Text('Shieldmate', style: wordmarkStyle),
      ],
    );
  }
}
