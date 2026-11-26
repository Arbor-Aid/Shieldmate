import 'dart:async';

import 'package:a2ui_core/a2ui_core.dart';
import 'package:a2ui_flutter/a2ui_flutter.dart';
import 'package:flutter/material.dart';
import 'package:json_schema_builder/json_schema_builder.dart';

import 'shieldmate_widgets.dart';

const String shieldMateCatalogId =
    'https://shieldmate.2marines.us/a2ui/catalog/v1.json';

const Set<String> shieldMateOnboardingComponents = {
  'ShieldMatePanel',
  'ShieldMateProgress',
  'ShieldMateSectionHeader',
  'ShieldMateSelect',
  'ShieldMateMultiSelect',
  'ShieldMateTextInput',
  'ShieldMateInfoCard',
  'ShieldMatePrimaryAction',
};

Schema get _actionSchema =>
    Schema.fromMap({r'$ref': r'common_types.json#/$defs/Action'});

CatalogImplementation shieldMateCatalog() => CatalogImplementation(
      id: shieldMateCatalogId,
      protocolVersion: A2uiProtocolVersion.v1_0,
      components: [
        ComponentImplementation(
          name: 'ShieldMatePanel',
          schema: Schema.object(
            properties: {'children': CommonSchemas.childList},
          ),
          builder: (context, node, props, buildChild) => Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              for (final child in props.children('children')) ...[
                KeyedSubtree(
                  key: NodeKey(child.instanceId),
                  child: buildChild(child),
                ),
                const SizedBox(height: 20),
              ],
            ],
          ),
        ),
        ComponentImplementation(
          name: 'ShieldMateProgress',
          schema: Schema.object(
            properties: {
              'step': CommonSchemasV1.dynamicNumber,
              'total': CommonSchemasV1.dynamicNumber,
              'label': CommonSchemasV1.dynamicString,
            },
            required: ['step', 'total', 'label'],
          ),
          builder: (context, node, props, buildChild) => ShieldMateProgress(
            step: (props.number('step') ?? 1).round(),
            total: (props.number('total') ?? 1).round(),
            label: props.string('label') ?? 'Your progress',
          ),
        ),
        ComponentImplementation(
          name: 'ShieldMateSectionHeader',
          schema: Schema.object(
            properties: {
              'title': CommonSchemasV1.dynamicString,
              'description': CommonSchemasV1.dynamicString,
            },
            required: ['title', 'description'],
          ),
          builder: (context, node, props, buildChild) =>
              ShieldMateSectionHeader(
            title: props.string('title') ?? '',
            description: props.string('description') ?? '',
          ),
        ),
        ComponentImplementation(
          name: 'ShieldMateSelect',
          schema: Schema.object(
            properties: {
              'label': CommonSchemasV1.dynamicString,
              'options': Schema.list(items: Schema.string()),
              'value': CommonSchemasV1.dynamicString,
              'errorText': CommonSchemasV1.dynamicString,
            },
            required: ['label', 'options', 'value'],
          ),
          builder: (context, node, props, buildChild) => ShieldMateSelect(
            label: props.string('label') ?? '',
            options: props.list('options').whereType<String>().toList(),
            value: props.string('value') ?? '',
            errorText: _nonEmpty(props.string('errorText')),
            onChanged: props.writable('value')?.set,
          ),
        ),
        ComponentImplementation(
          name: 'ShieldMateMultiSelect',
          schema: Schema.object(
            properties: {
              'label': CommonSchemasV1.dynamicString,
              'options': Schema.list(items: Schema.string()),
              'value': CommonSchemasV1.dynamicStringList,
              'errorText': CommonSchemasV1.dynamicString,
            },
            required: ['label', 'options', 'value'],
          ),
          builder: (context, node, props, buildChild) => ShieldMateMultiSelect(
            label: props.string('label') ?? '',
            options: props.list('options').whereType<String>().toList(),
            values: props.list('value').whereType<String>().toList(),
            errorText: _nonEmpty(props.string('errorText')),
            onChanged: props.writable('value')?.set,
          ),
        ),
        ComponentImplementation(
          name: 'ShieldMateTextInput',
          schema: Schema.object(
            properties: {
              'label': CommonSchemasV1.dynamicString,
              'hint': CommonSchemasV1.dynamicString,
              'value': CommonSchemasV1.dynamicString,
              'maxLines': CommonSchemasV1.dynamicNumber,
            },
            required: ['label', 'value'],
          ),
          builder: (context, node, props, buildChild) => ShieldMateTextInput(
            label: props.string('label') ?? '',
            hint: props.string('hint'),
            value: props.string('value') ?? '',
            maxLines: (props.number('maxLines') ?? 1).round(),
            onChanged: props.writable('value')?.set,
          ),
        ),
        ComponentImplementation(
          name: 'ShieldMateInfoCard',
          schema: Schema.object(
            properties: {
              'title': CommonSchemasV1.dynamicString,
              'body': CommonSchemasV1.dynamicString,
            },
            required: ['title', 'body'],
          ),
          builder: (context, node, props, buildChild) => ShieldMateInfoCard(
            title: props.string('title') ?? '',
            body: props.string('body') ?? '',
          ),
        ),
        ComponentImplementation(
          name: 'ShieldMatePrimaryAction',
          schema: Schema.object(
            properties: {
              'label': CommonSchemasV1.dynamicString,
              'action': _actionSchema,
            },
            required: ['label', 'action'],
          ),
          builder: (context, node, props, buildChild) =>
              ShieldMatePrimaryAction(
            label: props.string('label') ?? 'Continue',
            onPressed: () => unawaited(props.action('action')?.call()),
          ),
        ),
      ],
    );

String? _nonEmpty(String? value) =>
    value == null || value.trim().isEmpty ? null : value;
