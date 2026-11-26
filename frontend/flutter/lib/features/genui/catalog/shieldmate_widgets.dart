import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';

class ShieldMateProgress extends StatelessWidget {
  const ShieldMateProgress({
    required this.step,
    required this.total,
    required this.label,
    super.key,
  });

  final int step;
  final int total;
  final String label;

  @override
  Widget build(BuildContext context) {
    final value = total == 0 ? 0.0 : step / total;
    return Semantics(
      label: '$label. Step $step of $total',
      value: '${(value * 100).round()} percent',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: Theme.of(context).textTheme.labelLarge),
              Text('$step of $total'),
            ],
          ),
          const SizedBox(height: AppSpacing.xs),
          LinearProgressIndicator(value: value, minHeight: 8),
        ],
      ),
    );
  }
}

class ShieldMateSectionHeader extends StatelessWidget {
  const ShieldMateSectionHeader({
    required this.title,
    required this.description,
    super.key,
  });

  final String title;
  final String description;

  @override
  Widget build(BuildContext context) => Semantics(
        header: true,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: AppSpacing.xs),
            Text(description, style: Theme.of(context).textTheme.bodyLarge),
          ],
        ),
      );
}

class ShieldMateSelect extends StatelessWidget {
  const ShieldMateSelect({
    required this.label,
    required this.options,
    required this.value,
    required this.onChanged,
    this.errorText,
    super.key,
  });

  final String label;
  final List<String> options;
  final String value;
  final ValueChanged<String>? onChanged;
  final String? errorText;

  @override
  Widget build(BuildContext context) => Semantics(
        container: true,
        label: label,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: [
                for (final option in options)
                  ChoiceChip(
                    label: Text(option),
                    selected: value == option,
                    onSelected: onChanged == null
                        ? null
                        : (selected) {
                            if (selected) onChanged!(option);
                          },
                  ),
              ],
            ),
            if (errorText != null) ...[
              const SizedBox(height: AppSpacing.xs),
              Text(
                errorText!,
                key: ValueKey('$label-error'),
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
            ],
          ],
        ),
      );
}

class ShieldMateMultiSelect extends StatelessWidget {
  const ShieldMateMultiSelect({
    required this.label,
    required this.options,
    required this.values,
    required this.onChanged,
    this.errorText,
    super.key,
  });

  final String label;
  final List<String> options;
  final List<String> values;
  final ValueChanged<List<String>>? onChanged;
  final String? errorText;

  @override
  Widget build(BuildContext context) => Semantics(
        container: true,
        label: label,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: [
                for (final option in options)
                  FilterChip(
                    label: Text(option),
                    selected: values.contains(option),
                    onSelected: onChanged == null
                        ? null
                        : (selected) {
                            final next = values.toSet();
                            selected ? next.add(option) : next.remove(option);
                            onChanged!(next.toList(growable: false));
                          },
                  ),
              ],
            ),
            if (errorText != null) ...[
              const SizedBox(height: AppSpacing.xs),
              Text(
                errorText!,
                key: ValueKey('$label-error'),
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
            ],
          ],
        ),
      );
}

class ShieldMateTextInput extends StatefulWidget {
  const ShieldMateTextInput({
    required this.label,
    required this.value,
    required this.onChanged,
    this.hint,
    this.maxLines = 1,
    super.key,
  });

  final String label;
  final String value;
  final ValueChanged<String>? onChanged;
  final String? hint;
  final int maxLines;

  @override
  State<ShieldMateTextInput> createState() => _ShieldMateTextInputState();
}

class _ShieldMateTextInputState extends State<ShieldMateTextInput> {
  late final TextEditingController _controller =
      TextEditingController(text: widget.value);

  @override
  void didUpdateWidget(ShieldMateTextInput oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (_controller.text != widget.value) {
      _controller.value = TextEditingValue(
        text: widget.value,
        selection: TextSelection.collapsed(offset: widget.value.length),
      );
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => TextField(
        controller: _controller,
        minLines: 1,
        maxLines: widget.maxLines,
        onChanged: widget.onChanged,
        decoration:
            InputDecoration(labelText: widget.label, hintText: widget.hint),
      );
}

class ShieldMateInfoCard extends StatelessWidget {
  const ShieldMateInfoCard(
      {required this.title, required this.body, super.key});

  final String title;
  final String body;

  @override
  Widget build(BuildContext context) => Card(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: AppSpacing.xs),
              Text(body),
            ],
          ),
        ),
      );
}

class ShieldMatePrimaryAction extends StatelessWidget {
  const ShieldMatePrimaryAction({
    required this.label,
    required this.onPressed,
    this.isLoading = false,
    super.key,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;

  @override
  Widget build(BuildContext context) => SizedBox(
        width: double.infinity,
        height: 52,
        child: FilledButton(
          onPressed: isLoading ? null : onPressed,
          child: isLoading
              ? const SizedBox.square(
                  dimension: 22,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : Text(label),
        ),
      );
}
