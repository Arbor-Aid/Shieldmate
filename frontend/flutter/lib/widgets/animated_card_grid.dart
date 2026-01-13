import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class AnimatedCardItem {
  const AnimatedCardItem({
    required this.title,
    required this.subtitle,
    required this.icon,
    this.onTap,
    this.trailing,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback? onTap;
  final Widget? trailing;
}

class AnimatedCardGrid extends StatelessWidget {
  const AnimatedCardGrid({
    super.key,
    required this.items,
    this.crossAxisCount = 2,
    this.aspectRatio = 1.2,
  });

  final List<AnimatedCardItem> items;
  final int crossAxisCount;
  final double aspectRatio;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const SizedBox.shrink();
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final effectiveCrossAxis = width < 600 ? 1 : crossAxisCount;
        return GridView.builder(
          physics: const NeverScrollableScrollPhysics(),
          shrinkWrap: true,
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: effectiveCrossAxis,
            mainAxisSpacing: 16,
            crossAxisSpacing: 16,
            childAspectRatio: aspectRatio,
          ),
          itemCount: items.length,
          itemBuilder: (context, index) {
            final item = items[index];
            return _AnimatedCard(item: item, index: index);
          },
        );
      },
    );
  }
}

class _AnimatedCard extends StatefulWidget {
  const _AnimatedCard({required this.item, required this.index});

  final AnimatedCardItem item;
  final int index;

  @override
  State<_AnimatedCard> createState() => _AnimatedCardState();
}

class _AnimatedCardState extends State<_AnimatedCard> with SingleTickerProviderStateMixin {
  bool _isHovered = false;

  void _setHover(bool value) {
    if (_isHovered == value) {
      return;
    }
    setState(() => _isHovered = value);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    final card = MouseRegion(
      onEnter: (_) => _setHover(true),
      onExit: (_) => _setHover(false),
      child: AnimatedScale(
        scale: _isHovered ? 1.03 : 1.0,
        duration: const Duration(milliseconds: 180),
        curve: Curves.easeOut,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          curve: Curves.easeOut,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: _isHovered
                  ? [colorScheme.primary.withValues(alpha: 0.12), Colors.white]
                  : [Colors.white, Colors.white],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: _isHovered ? 0.12 : 0.06),
                blurRadius: _isHovered ? 18 : 10,
                offset: const Offset(0, 8),
              ),
            ],
            border: Border.all(
              color: colorScheme.primary.withValues(alpha: _isHovered ? 0.35 : 0.12),
            ),
          ),
          child: Material(
            type: MaterialType.transparency,
            child: InkWell(
              onTap: widget.item.onTap,
              borderRadius: BorderRadius.circular(18),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Icon(
                      widget.item.icon,
                      size: 36,
                      color: colorScheme.primary,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      widget.item.title,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: colorScheme.primary,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      widget.item.subtitle,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: colorScheme.onSurface.withValues(alpha: 0.7),
                      ),
                    ),
                    if (widget.item.trailing != null) ...[
                      const Spacer(),
                      Align(
                        alignment: Alignment.bottomRight,
                        child: widget.item.trailing!,
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );

    return card
        .animate(delay: Duration(milliseconds: widget.index * 80))
        .fadeIn(duration: const Duration(milliseconds: 260), curve: Curves.easeOut)
        .moveY(begin: 12, end: 0, curve: Curves.easeOut);
  }
}
