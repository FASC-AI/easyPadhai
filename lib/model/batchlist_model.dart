class BatchlistModel {
  int? code;
  bool? status;
  String? message;
  List<BbData>? data;

  BatchlistModel({this.code, this.status, this.message, this.data});

  BatchlistModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    if (json['data'] != null) {
      data = <BbData>[];
      json['data'].forEach((v) {
        data!.add(new BbData.fromJson(v));
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

class BbData {
  String? code;
  String? section;
  String? class1;
  String? institute;
  String? createdAt;
  bool? classTeacher;

  BbData(
      {this.code,
      this.section,
      this.class1,
      this.institute,
      this.createdAt,
      this.classTeacher});

  BbData.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    section = json['section'];
    class1 = json['class'];
    institute = json['institute'];
    createdAt = json['createdAt'];
    classTeacher = json['classTeacher'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['code'] = this.code;
    data['section'] = this.section;
    data['class'] = this.class1;

    data['institute'] = this.institute!;

    data['createdAt'] = this.createdAt;
    data['classTeacher'] = this.classTeacher;
    return data;
  }
}
