class TimeModel {
  String? istTime;

  TimeModel({this.istTime});

  TimeModel.fromJson(Map<String, dynamic> json) {
    istTime = json['ist_time'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['ist_time'] = this.istTime;
    return data;
  }
}
