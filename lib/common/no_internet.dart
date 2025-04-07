import 'package:easy_padhai/route/route_name.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';


// ignore: must_be_immutable
class NoInternet extends StatelessWidget {
  NoInternet({Key? key}) : super(key: key);

  dynamic directLogin;
  dynamic onboardingDone;
  dynamic loginData;

  Future<void> navigationPage() async {
  
    Get.offNamed(RouteName.splash);
  }

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
                  const Text('इंटरनेट नहीं है (No Internet) 🌐',
                      style: TextStyle(fontSize: 20)),
                  const Padding(
                    padding: EdgeInsets.all(20.0),
                    child: Text(
                        "कृपया अपनी कनेक्शन जांचें। (Please check your connection)",
                        style: TextStyle(fontSize: 15)),
                  ),
                  const SizedBox(height: 20),
                  GestureDetector(
                    onTap: () {
                      navigationPage();
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
