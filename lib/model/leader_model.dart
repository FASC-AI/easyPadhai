class LeaderModel {
  int? code;
  bool? status;
  String? message;
  List<LeaderModelData>? data;

  LeaderModel({this.code, this.status, this.message, this.data});

  LeaderModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    if (json['data'] != null) {
      data = <LeaderModelData>[];
      json['data'].forEach((v) {
        data!.add(new LeaderModelData.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['code'] = this.code;
    data['status'] = this.status;
    data['message'] = this.message;
    if (this.data != null) {
      data['data'] = this.data!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class LeaderModelData {
  String? publishedDate;
  String? publishedTime;
  List<LeaderModelData1>? data;

  LeaderModelData({this.publishedDate, this.publishedTime, this.data});

  LeaderModelData.fromJson(Map<String, dynamic> json) {
    publishedDate = json['publishedDate'];
    publishedTime = json['publishedTime'];
    if (json['data'] != null) {
      data = <LeaderModelData1>[];
      json['data'].forEach((v) {
        data!.add(new LeaderModelData1.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['publishedDate'] = this.publishedDate;
    data['publishedTime'] = this.publishedTime;
    if (this.data != null) {
      data['data'] = this.data!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class LeaderModelData1 {
  int? rank;
  String? userId;
  String? name;
  String? picture;
  String? totalObtained;
  int? totalPossible;
  String? percentage;

  LeaderModelData1(
      {this.rank,
      this.userId,
      this.name,
      this.picture,
      this.totalObtained,
      this.totalPossible,
      this.percentage});

  LeaderModelData1.fromJson(Map<String, dynamic> json) {
    rank = json['rank'];
    userId = json['userId'];
    name = json['name'];
    picture = json['picture'];
    totalObtained = json['totalObtained'];
    totalPossible = json['totalPossible'];
    percentage = json['percentage'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['rank'] = this.rank;
    data['userId'] = this.userId;
    data['name'] = this.name;
    data['picture'] = this.picture;
    data['totalObtained'] = this.totalObtained;
    data['totalPossible'] = this.totalPossible;
    data['percentage'] = this.percentage;
    return data;
  }
}
