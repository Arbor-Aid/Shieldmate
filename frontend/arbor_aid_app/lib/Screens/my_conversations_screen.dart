import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../services/mcp_service.dart' show McpServiceException;
import '../services/conversations_service.dart';

class MyConversationsScreen extends StatefulWidget {
  const MyConversationsScreen({super.key, this.embedded = false});

  final bool embedded;

  @override
  State<MyConversationsScreen> createState() => _MyConversationsScreenState();
}

class _MyConversationsScreenState extends State<MyConversationsScreen> {
  final ConversationsService _conversationsService = ConversationsService();
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  bool _loadingHistory = true;
  bool _sending = false;
  List<_ConversationMessage> _messages = const [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      setState(() {
        _messages = const [];
        _error = 'Sign in to see your conversation history.';
        _loadingHistory = false;
      });
      return;
    }

    try {
      final response = await _conversationsService.fetchHistory(userId: user.uid);
      if (!mounted) {
        return;
      }
      setState(() {
        _messages = _parseMessages(response);
        _error = null;
        _loadingHistory = false;
      });
      _scrollToBottom();
    } on McpServiceException catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _error = error.message;
        _loadingHistory = false;
      });
      _showSnack('Service temporarily unavailable');
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() {
        _error = 'Unable to load conversations right now.';
        _loadingHistory = false;
      });
      _showSnack('Service temporarily unavailable');
    }
  }

  Future<void> _sendMessage() async {
    if (_sending) {
      return;
    }

    final content = _messageController.text.trim();
    if (content.isEmpty) {
      return;
    }

    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      _showSnack('Sign in to chat with the AI assistant.');
      return;
    }

    setState(() {
      _sending = true;
      _messages = [
        ..._messages,
        _ConversationMessage(author: MessageAuthor.user, content: content),
      ];
    });
    _messageController.clear();
    _scrollToBottom();

    try {
      final response = await _conversationsService.sendMessage(content, userId: user.uid);
      if (!mounted) {
        return;
      }
      final incoming = _parseMessages(response);
      setState(() {
        if (incoming.isEmpty) {
          return;
        }
        if (incoming.length == 1 && incoming.first.author == MessageAuthor.ai) {
          _messages = [..._messages, incoming.first];
        } else {
          _messages = incoming;
        }
      });
      _scrollToBottom();
    } on McpServiceException catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _error = error.message;
      });
      _showSnack('Service temporarily unavailable');
    } catch (_) {
      if (!mounted) {
        return;
      }
      _showSnack('Service temporarily unavailable');
    } finally {
      if (mounted) {
        setState(() => _sending = false);
      }
    }
  }

  List<_ConversationMessage> _parseMessages(Map<String, dynamic> response) {
    final data = response['messages'] ?? response['data'];
    if (data is List) {
      return data
          .whereType<Map<String, dynamic>>()
          .map(
            (entry) => _ConversationMessage(
              author: _authorFrom(entry['author']?.toString()),
              content: entry['content']?.toString() ?? entry['message']?.toString() ?? '',
              timestamp: entry['timestamp']?.toString(),
            ),
          )
          .where((msg) => msg.content.isNotEmpty)
          .toList();
    }
    return const [];
  }

  MessageAuthor _authorFrom(String? value) {
    switch (value?.toLowerCase()) {
      case 'ai':
      case 'assistant':
      case 'bot':
        return MessageAuthor.ai;
      default:
        return MessageAuthor.user;
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) {
        return;
      }
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        curve: Curves.easeOut,
        duration: const Duration(milliseconds: 300),
      );
    });
  }

  void _showSnack(String message) {
    if (!mounted) {
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final conversation = Column(
      children: [
        Expanded(
          child: _loadingHistory
              ? const Center(child: CircularProgressIndicator())
              : _messages.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Text(
                          _error ?? 'Start a conversation with the AI assistant.',
                          textAlign: TextAlign.center,
                        ),
                      ),
                    )
                  : ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.all(16),
                      itemCount: _messages.length,
                      itemBuilder: (context, index) {
                        final message = _messages[index];
                        final alignment = message.author == MessageAuthor.user
                            ? Alignment.centerRight
                            : Alignment.centerLeft;
                        final color = message.author == MessageAuthor.user
                            ? Theme.of(context).colorScheme.primary
                            : Theme.of(context).colorScheme.surfaceContainerHighest;
                        final textColor = message.author == MessageAuthor.user
                            ? Theme.of(context).colorScheme.onPrimary
                            : Theme.of(context).colorScheme.onSurface;
                        return Align(
                          alignment: alignment,
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            decoration: BoxDecoration(
                              color: color,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              crossAxisAlignment: message.author == MessageAuthor.user
                                  ? CrossAxisAlignment.end
                                  : CrossAxisAlignment.start,
                              children: [
                                Text(
                                  message.content,
                                  style: TextStyle(color: textColor),
                                ),
                                if (message.timestamp != null) ...[
                                  const SizedBox(height: 4),
                                  Text(
                                    message.timestamp!,
                                    style: TextStyle(
                                        color: textColor.withValues(alpha: 0.7), fontSize: 10),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        );
                      },
                    ),
        ),
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _messageController,
                  minLines: 1,
                  maxLines: 4,
                  decoration: const InputDecoration(
                    hintText: 'Ask the AI assistant...',
                    border: OutlineInputBorder(),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              ElevatedButton.icon(
                onPressed: _sending ? null : _sendMessage,
                icon: _sending
                    ? const SizedBox(
                        height: 16,
                        width: 16,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Icon(Icons.send),
                label: const Text('Send'),
              ),
            ],
          ),
        ),
      ],
    );

    if (widget.embedded) {
      return SafeArea(child: conversation);
    }

    return Scaffold(
      appBar: AppBar(title: const Text('My Conversations')),
      body: conversation,
    );
  }
}

class _ConversationMessage {
  const _ConversationMessage({required this.author, required this.content, this.timestamp});
  final MessageAuthor author;
  final String content;
  final String? timestamp;
}

enum MessageAuthor { user, ai }
