import 'package:easy_padhai/route/route_name.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class NoService extends StatelessWidget {
  const NoService({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Container(
            height: MediaQuery.of(context).size.height,
            color: Colors.white,
            child: Center(
              child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Image.asset("assets/nointernet.png"),
                  ),
                  const SizedBox(height: 20),
                  const Text('सर्वर डाउन (Server Down) 🌐',
                      style: TextStyle(fontSize: 20)),
                  const SizedBox(height: 20),
                  const Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Text(
                        "कृपया बाद में पुनः प्रयास करें। (Please try again later)",
                        style: TextStyle(fontSize: 20)),
                  ),
                  const SizedBox(height: 20),
                  GestureDetector(
                    onTap: () {
                      Get.offNamed(RouteName.splash);
                    },
                    child: Container(
                      decoration:
                          BoxDecoration(border: Border.all(color: Colors.grey)),
                      height: 30,
                      width: 90,
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.replay_rounded,
                            size: 14,
                          ),
                          SizedBox(
                            width: 5,
                          ),
                          Text('Reload', style: TextStyle(fontSize: 14)),
                        ],
                      ),
                    ),
                  )
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
