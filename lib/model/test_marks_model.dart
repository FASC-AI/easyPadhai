class TestMarksModel {
  int? code;
  bool? status;
  String? message;
  List<TestMarksModelData>? data;

  TestMarksModel({this.code, this.status, this.message, this.data});

  TestMarksModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    if (json['data'] != null) {
      data = <TestMarksModelData>[];
      json['data'].forEach((v) {
        data!.add(new TestMarksModelData.fromJson(v));
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

class TestMarksModelData {
  String? publishedDate;
  List<Submissions>? submissions;

  TestMarksModelData({this.publishedDate, this.submissions});

  TestMarksModelData.fromJson(Map<String, dynamic> json) {
    publishedDate = json['publishedDate'];
    if (json['submissions'] != null) {
      submissions = <Submissions>[];
      json['submissions'].forEach((v) {
        submissions!.add(new Submissions.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['publishedDate'] = this.publishedDate;
    if (this.submissions != null) {
      data['submissions'] = this.submissions!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class Submissions {
  String? userId;
  String? name;
  String? result;

  Submissions({this.userId, this.name, this.result});

  Submissions.fromJson(Map<String, dynamic> json) {
    userId = json['userId'];
    name = json['name'];
    result = json['result'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['userId'] = this.userId;
    data['name'] = this.name;
    data['result'] = this.result;
    return data;
  }
}
