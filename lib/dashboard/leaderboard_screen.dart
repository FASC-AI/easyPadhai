import 'package:flutter/material.dart';

class LeaderboardScreen extends StatefulWidget {
  const LeaderboardScreen({Key? key}) : super(key: key);

  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> {
  int _selectedTabIndex = 0;
  final List<String> _tabs = ['X', 'XI', 'XII'];

  final List<Map<String, dynamic>> _leaderboardData = [
    {
      'name': 'Archana Sharma',
      'score': 20,
      'date': '27 Dec, 2024',
    },
    {
      'name': 'Rohit Sharma',
      'score': 18,
      'date': '27 Dec, 2024',
    },
    {
      'name': 'Rohit Sharma',
      'score': 17,
      'date': '27 Dec, 2024',
    },
    {
      'name': 'Abhishek Kumar Jha',
      'score': 16,
      'date': '27 Dec, 2024',
    },
    {
      'name': 'Kritika Das',
      'score': 14,
      'date': '27 Dec, 2024',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black87),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Leaderboard',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: Colors.black87,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Tab Bar
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFFF5F5F5),
              borderRadius: BorderRadius.circular(25),
            ),
            child: Row(
              children: List.generate(
                _tabs.length,
                (index) => Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedTabIndex = index),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: _selectedTabIndex == index
                            ? const Color(0xFF1E88E5)
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(25),
                      ),
                      child: Text(
                        _tabs[index],
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: _selectedTabIndex == index
                              ? Colors.white
                              : Colors.black87,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),

          // Leaderboard List
          Expanded(
            child: ListView.builder(
              padding: EdgeInsets.only(
                left: 16,
                right: 16,
                top: 16,
                bottom: MediaQuery.of(context).padding.bottom + 16,
              ),
              itemCount: _leaderboardData.length,
              itemBuilder: (context, index) {
                final data = _leaderboardData[index];
                return Column(
                  children: [
                    LeaderboardItem(
                      rank: index + 1,
                      name: data['name'],
                      score: data['score'],
                      date: data['date'],
                    ),
                    if (index == 2)
                      const SizedBox(height: 12), // Add space after top 3
                  ],
                );
              },
            ),
          ),

          // Date Filter Section
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  offset: const Offset(0, -2),
                  blurRadius: 10,
                ),
              ],
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _buildDateFilterTile('Mon, 17 December 2024'),
                  _buildDateFilterTile('Fri, 16 December 2024'),
                  _buildDateFilterTile('Tue, 13 December 2024'),
                  _buildDateFilterTile('Wed, 8 December 2024'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateFilterTile(String date) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF5F5F5),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            date,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: Colors.black87,
            ),
          ),
          const Icon(Icons.keyboard_arrow_down, color: Colors.black54),
        ],
      ),
    );
  }
}

class LeaderboardItem extends StatelessWidget {
  final int rank;
  final String name;
  final int score;
  final String date;

  const LeaderboardItem({
    Key? key,
    required this.rank,
    required this.name,
    required this.score,
    required this.date,
  }) : super(key: key);

  Color _getBackgroundColor() {
    switch (rank) {
      case 1:
      case 2:
      case 3:
        return const Color(0xFF1E88E5); // Deeper blue for top 3
      default:
        return Colors.white;
    }
  }

  BorderRadius _getBorderRadius() {
    if (rank <= 3) {
      if (rank == 1) {
        // First item: round top corners only
        return const BorderRadius.only(
          topLeft: Radius.circular(12),
          topRight: Radius.circular(12),
        );
      } else if (rank == 3) {
        // Last item in top 3: round bottom corners only
        return const BorderRadius.only(
          bottomLeft: Radius.circular(12),
          bottomRight: Radius.circular(12),
        );
      } else {
        // Middle items: no rounded corners
        return BorderRadius.zero;
      }
    }
    // Non-top-3 items: round all corners
    return BorderRadius.circular(12);
  }

  EdgeInsets _getMargin() {
    if (rank <= 3) {
      return EdgeInsets.zero; // No margin for top 3
    }
    return const EdgeInsets.only(bottom: 12); // Normal margin for others
  }

  @override
  Widget build(BuildContext context) {
    final isTopRank = rank <= 3;

    return Container(
      margin: _getMargin(),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: _getBackgroundColor(),
        borderRadius: _getBorderRadius(),
        boxShadow: [
          if (!isTopRank)
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
        ],
      ),
      child: Row(
        children: [
          // Rank Circle
          Container(
            width: 32,
            height: 32,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isTopRank
                  ? Colors.white.withOpacity(0.2)
                  : const Color(0xFFF5F5F5),
            ),
            child: Text(
              '$rank',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: isTopRank ? Colors.white : Colors.black87,
              ),
            ),
          ),
          const SizedBox(width: 12),

          // Profile Image
          CircleAvatar(
            radius: 20,
            backgroundImage: NetworkImage(
              'https://picsum.photos/seed/$name/100/100', // Placeholder image
            ),
          ),
          const SizedBox(width: 12),

          // Name and Date
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      name,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: isTopRank ? Colors.white : Colors.black87,
                      ),
                    ),
                    if (isTopRank) ...[
                      const SizedBox(width: 4),
                      Icon(
                        Icons.workspace_premium,
                        size: 16,
                        color: Colors.yellow[600],
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  date,
                  style: TextStyle(
                    fontSize: 12,
                    color: isTopRank
                        ? Colors.white.withOpacity(0.7)
                        : Colors.black54,
                  ),
                ),
              ],
            ),
          ),

          // Score
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color:
                  isTopRank ? Colors.white.withOpacity(0.15) : Colors.grey[100],
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '$score',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: isTopRank
                        ? const Color(0xFF40C4FF) // Cyan color for top ranks
                        : const Color(0xFF1E88E5),
                  ),
                ),
                Text(
                  '/20',
                  style: TextStyle(
                    fontSize: 14,
                    color: isTopRank
                        ? Colors.white.withOpacity(0.7)
                        : Colors.black45,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
